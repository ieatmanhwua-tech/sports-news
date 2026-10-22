import type { Article } from '../../shared/types';
import type { PhSportsMatch } from '../../shared/ph-sports-types';
import { fetchLocalSportsData, isLive88BasketballMatch } from './local-sports';
import { classifyMatchLeague, isVerifiedNbaTeam, isVerifiedPbaTeam, getCanonicalTeamName } from '../../shared/team-logos';
import { slugifyTeam } from '../../shared/seo-routing';
import {
  getUniqueMatchImage,
  findExactMatchupOrTeamPhoto,
  getSvgBlogArticleCover,
  normalizeLive88ImageUrl
} from '../../shared/image-resolver';
import { inMemoryStore } from '../db/client';
import {
  getCurrentManilaDateParts,
  formatGameDateLabelPht,
  computeAccurateMatchBlogPublishIso
} from '../../shared/ph-date';
import { queueAutomatedBlogsForIndexing } from './gsc-indexing';

let lastBlogSyncTime = 0;
let lastBlogSyncYmd = '';
let inFlightSyncPromise: Promise<void> | null = null;
const BLOG_SYNC_TTL_MS = 30 * 1000;
let onArticlesUpdatedHook: (() => void) | null = null;

export function registerArticlesUpdatedHook(fn: () => void) {
  onArticlesUpdatedHook = fn;
}

function pickFeaturedImageForMatch(
  match: PhSportsMatch,
  classified: ReturnType<typeof classifyMatchLeague>,
  usedImages?: Set<string>
): { url: string; isRealPhoto: boolean } {
  const away = match.away?.name || 'Away Team';
  const home = match.home?.name || 'Home Team';

  const uniqueImg = getUniqueMatchImage(
    {
      id: match.id,
      away_team: away,
      home_team: home,
      league: classified.leagueId === 'pba' ? 'PBA' : 'NBA',
      leagueId: classified.leagueId,
      bannerUrl: match.bannerUrl,
      status: match.status,
      awayScore: Number(match.awayScore || 0),
      homeScore: Number(match.homeScore || 0),
      clockOrTime:
        match.status === 'live'
          ? match.clock || 'LIVE'
          : match.manilaTimeFormatted || 'Today PHT',
      venue: match.venue || classified.defaultVenue
    },
    usedImages
  );

  return {
    url: uniqueImg,
    isRealPhoto: !uniqueImg.startsWith('data:image/svg+xml')
  };
}

function getCategoryAndAuthorForLeague(leagueId: string): {
  primaryCategoryId: string;
  topicIds: string[];
  authorId: string;
  sourceName: string;
  sourceUrl: string;
} {
  switch (leagueId) {
    case 'pba':
      return {
        primaryCategoryId: 'pba-news',
        topicIds: ['pba-news', 'pba', 'pba-governors-cup', 'game-previews-and-predictions'],
        authorId: 'author-joaquin-santos',
        sourceName: 'PBA Official Media Bureau',
        sourceUrl: 'https://pba.ph'
      };
    case 'mpbl':
      return {
        primaryCategoryId: 'mpbl-news',
        topicIds: ['mpbl-news', 'mpbl', 'game-previews-and-predictions'],
        authorId: 'author-carlo-mendoza',
        sourceName: 'MPBL Official Press Office',
        sourceUrl: 'https://mpbl.ph'
      };
    case 'uaap':
      return {
        primaryCategoryId: 'uaap-basketball',
        topicIds: ['uaap-basketball', 'uaap', 'collegiate-basketball'],
        authorId: 'author-maria-reyes',
        sourceName: 'UAAP Press Corps',
        sourceUrl: 'https://uaap.org.ph'
      };
    case 'ncaa':
      return {
        primaryCategoryId: 'ncaa-basketball',
        topicIds: ['ncaa-basketball', 'ncaa', 'collegiate-basketball', 'uaap-basketball'],
        authorId: 'author-maria-reyes',
        sourceName: 'NCAA Management Committee',
        sourceUrl: 'https://ncaa.org.ph'
      };
    case 'gilas':
    case 'fiba':
      return {
        primaryCategoryId: 'gilas-pilipinas',
        topicIds: ['gilas-pilipinas', 'gilas', 'fiba'],
        authorId: 'author-maria-reyes',
        sourceName: 'FIBA Asia & Gilas Media Desk',
        sourceUrl: 'https://fiba.basketball'
      };
    default:
      return {
        primaryCategoryId: 'nba-news',
        topicIds: ['nba-news', 'nba', 'game-previews-and-predictions'],
        authorId: 'author-rafael-dizon',
        sourceName: 'Official NBA Scoreboard Desk',
        sourceUrl: 'https://nba.com'
      };
  }
}

export function buildMatchBlogSlug(match: PhSportsMatch): string {
  const awaySlug = slugifyTeam(match.away?.name || 'away');
  const homeSlug = slugifyTeam(match.home?.name || 'home');
  return `${awaySlug}-vs-${homeSlug}-match-blog-today`;
}

export function convertMatchToBlogArticle(
  match: PhSportsMatch,
  index: number,
  usedImages?: Set<string>
): Article {
  const classified = classifyMatchLeague({
    homeTeam: match.home?.name,
    awayTeam: match.away?.name,
    competition: match.competition,
    streamLabel: match.streamLabel,
    sport: match.sport,
    leagueId: match.leagueId
  });

  const home = match.home?.name || 'Home Team';
  const away = match.away?.name || 'Away Team';
  const hScore = Number(match.homeScore || 0);
  const aScore = Number(match.awayScore || 0);
  const leagueName = classified.league;
  const competition = match.competition || classified.leagueFullName;
  const venue = match.venue || classified.defaultVenue;
  const gameDate = formatGameDateLabelPht(match.startTime || match.startTimeIso);
  const manilaTime = gameDate.shortDateTimePht;
  const meta = getCategoryAndAuthorForLeague(classified.leagueId);
  const { url: featuredImageUrl, isRealPhoto } = pickFeaturedImageForMatch(match, classified, usedImages);
  const slug = buildMatchBlogSlug(match);

  let title = '';
  let excerpt = '';
  let body = '';
  let automationFormat: 'breaking-news' | 'game-recap' | 'investigative-analysis' = 'game-recap';
  let seoStrategyBadge = '';

  const seed = (home + away).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const isNba = classified.leagueId === 'nba';

  if (match.status === 'live') {
    // =========================================================================
    // FORMAT 1: BREAKING NEWS / QUICK UPDATES (Optimal: 300 – 500 words)
    // SEO Purpose & Strategy: Designed for rapid indexing and hitting the
    // "Top Stories" carousel. Focus strictly on the 5 Ws (Who, What, When,
    // Where, Why) and getting published quickly.
    // =========================================================================
    automationFormat = 'breaking-news';
    seoStrategyBadge = 'Breaking News / Quick Updates (300–500 Words • 5 Ws Top Stories)';

    const scoreTag = hScore > 0 || aScore > 0 ? `${aScore}–${hScore}` : 'LIVE IN-PLAY';
    const clockTag = match.clock && match.clock !== 'LIVE' ? match.clock : 'In Progress';
    const leader = hScore >= aScore ? home : away;
    const trailer = hScore >= aScore ? away : home;
    const margin = Math.abs(hScore - aScore);
    const broadcastLabel = match.streamLabel || classified.defaultBroadcast;

    title = `BREAKING LIVE (${gameDate.shortDate}): ${away} vs. ${home} (${scoreTag}, ${clockTag}) — ${leagueName} Quick Update & 5 Ws Report`;
    excerpt = `Breaking ${competition} live update on ${gameDate.fullDate}: ${away} and ${home} are locked in real-time action (${scoreTag}, ${clockTag}) at ${venue}. Fast 5 Ws breakdown, live box score telemetry, and in-play rotation news.`;
    body = [
      `MANILA / BREAKING NEWS DESK (${gameDate.fullDate}) — Live ${competition} basketball action is officially underway at ${venue} as **${away}** faces **${home}** (${scoreTag}, ${clockTag}). Published for rapid Google Top Stories indexing, this quick update delivers the essential **5 Ws (Who, What, When, Where, Why)** and real-time courtside telemetry as possessions unfold in Philippine Standard Time (PHT).`,
      `### The 5 Ws: Breaking Matchup Snapshot`,
      `- **WHO:** **${away}** vs. **${home}** (${leagueName} active rosters and starting five units).`,
      `- **WHAT:** Official ${competition} live matchup currently in progress (${clockTag}) with the live scoreboard reading **${away} ${aScore} – ${home} ${hScore}**${margin > 0 ? ` (${leader} leading by ${margin} points)` : ' (tied ballgame)'}.`,
      `- **WHEN:** ${gameDate.fullDate} (${gameDate.timePht}) — real-time in-play coverage updated in Manila Time (Asia/Manila, UTC+8).`,
      `- **WHERE:** ${venue} — broadcast live across the Philippines via ${broadcastLabel} and the TipOff PH Live Hub.`,
      `- **WHY IT MATTERS:** High-leverage ${competition} standings positioning, head-to-head tiebreaker implications, and live in-play momentum as both contenders battle for playoff seeding.`,
      `### Rapid In-Play Tactical Telemetry (${clockTag})`,
      `${leader} has dictated the early pace at ${venue} by combining disciplined half-court spacing with aggressive point-of-attack perimeter pressure against ${trailer}. Through the opening stretches leading into ${clockTag}, ${leader} has prioritized paint touches and quick weak-side kick-out passes to generate high-percentage corner three-point opportunities before ${trailer}'s transition defense can set.`,
      `On the other end of the hardwood, ${trailer}’s coaching staff has countered by tightening weak-side tag rotations on high ball screens and crashing the offensive glass to manufacture second-chance points. Both benches have already deployed key two-way wing stoppers to disrupt primary ball-handlers and limit live-ball turnovers.`,
      `### Key Live Factors to Watch Right Now`,
      `- **Possession Tempo & Transition Defense:** Whichever backcourt controls defensive rebounds and pushes early-clock pace over the next five minutes of game action will command the scoreboard heading into the next break.`,
      `- **Bonus Penalty & Foul Trouble:** Interior physicality inside the restricted area is escalating; early team fouls could force rotation adjustments and early bonus free throws.`,
      `- **Live Stream & Instant Scoreboard:** Click **Watch Live** on the TipOff PH scoreboard hub to stream ${away} vs. ${home} in real time and track updated ${leagueName} box score splits.`
    ].join('\n\n');
  } else if (match.status === 'finished') {
    // =========================================================================
    // FORMAT 2: STANDARD GAME RECAPS & REPORTS (Optimal: 600 – 900 words)
    // SEO Purpose & Strategy: The standard for daily sports journalism.
    // Provides enough room for player quotes, statistical context, and
    // natural integration of secondary keywords without fluff.
    // =========================================================================
    automationFormat = 'game-recap';
    seoStrategyBadge = 'Standard Game Recaps & Reports (600–900 Words • Quotes & Box Score Context)';

    const finalH = hScore > 0 || aScore > 0 ? hScore : (isNba ? 114 : 98) + (seed % 7);
    const finalA = hScore > 0 || aScore > 0 ? aScore : (isNba ? 107 : 92) + ((seed * 3) % 6);
    const winner = finalH >= finalA ? home : away;
    const loser = finalH >= finalA ? away : home;
    const winScore = Math.max(finalH, finalA);
    const loseScore = Math.min(finalH, finalA);
    const margin = Math.max(1, winScore - loseScore);

    const q1W = Math.round(winScore * 0.24);
    const q2W = Math.round(winScore * 0.26);
    const q3W = Math.round(winScore * 0.25);
    const q4W = Math.max(10, winScore - (q1W + q2W + q3W));

    const q1L = Math.round(loseScore * 0.25);
    const q2L = Math.round(loseScore * 0.24);
    const q3L = Math.round(loseScore * 0.26);
    const q4L = Math.max(10, loseScore - (q1L + q2L + q3L));

    const halfW = q1W + q2W;
    const halfL = q1L + q2L;
    const starPts = Math.max(24, Math.round(winScore * 0.27));
    const starReb = 6 + (seed % 6);
    const starAst = 5 + ((seed * 2) % 6);
    const secondPts = Math.max(18, Math.round(winScore * 0.21));
    const loserPts = Math.max(21, Math.round(loseScore * 0.26));
    const winFgPct = (47.2 + (seed % 5) * 0.8).toFixed(1);
    const loseFgPct = (42.8 + (seed % 4) * 0.7).toFixed(1);
    const win3PtPct = (37.5 + (seed % 6) * 0.9).toFixed(1);
    const rebEdge = 4 + (seed % 7);
    const paintPtsW = isNba ? 52 + (seed % 8) : 42 + (seed % 6);
    const paintPtsL = isNba ? 44 + (seed % 6) : 36 + (seed % 6);
    const benchPtsW = isNba ? 36 + (seed % 9) : 28 + (seed % 7);
    const starLabel = match.topPlayerName || `${winner} All-Star Guard`;

    title = `${winner} Defeat ${loser} ${winScore}–${loseScore} (${gameDate.shortDate}): ${leagueName} Full Box Score, Player Quotes & Game Recap`;
    excerpt = `On ${gameDate.fullDate}, ${winner} defeated ${loser} ${winScore}–${loseScore} in ${competition} action at ${venue}. Read our standard 600–900 word daily sports journalism game recap featuring quarter-by-quarter box scores, statistical context, and post-game locker room quotes.`;
    body = [
      `MANILA / POST-GAME REPORT DESK (${gameDate.fullDate}) — **${winner}** delivered a poised two-way masterclass to defeat **${loser}**, **${winScore}–${loseScore}**, in official ${competition} action at ${venue} (${manilaTime}). Powered by crisp fourth-quarter half-court execution (${q4W}–${q4L}) and a decisive +${rebEdge} rebounding edge, ${winner} secured a statement ${margin}-point victory that strengthens their positioning in the ${leagueName} standings.`,
      `For Filipino basketball fans tracking the **${away} vs ${home} box score**, **${leagueName} game recap today**, and **official post-game highlights**, this complete report breaks down the quarter-by-quarter scoring progression, advanced shooting splits, and direct reactions from the post-game press conference.`,
      `### Official Final Score & Quarter-by-Quarter Box Score Breakdown`,
      `- **Fixture:** ${away} at ${home} (${competition})`,
      `- **Game Date & Time (PHT):** ${gameDate.fullDate} · ${gameDate.timePht} (Asia/Manila)`,
      `- **Final Score:** **${away} ${finalA} – ${home} ${finalH}** (${winner} win by ${margin} points)`,
      `- **${winner} Quarter Scoring:** Q1: ${q1W} | Q2: ${q2W} (Halftime: ${halfW}) | Q3: ${q3W} | Q4: ${q4W} — **Final: ${winScore}**`,
      `- **${loser} Quarter Scoring:** Q1: ${q1L} | Q2: ${q2L} (Halftime: ${halfL}) | Q3: ${q3L} | Q4: ${q4L} — **Final: ${loseScore}**`,
      `- **Arena:** ${venue}`,
      `### How ${winner} Built the Winning Margin`,
      `The opening two quarters featured high-tempo shot-making from both starting units as ${winner} carried a ${halfW}–${halfL} edge into intermission. Rather than settling for early-clock contested jumpers, ${winner} systematically attacked the paint through high pick-and-roll sets and dribble handoffs, generating ${paintPtsW} points in the paint compared to ${paintPtsL} for ${loser}.`,
      `The tactical turning point arrived midway through the third quarter (${q3W}–${q3L}). ${winner} adjusted their defensive pick-and-roll coverage by blitzing ${loser}’s primary ball-handlers above the three-point arc and rotating weak-side help defenders to wall off the restricted area. That defensive surge triggered a string of live-ball stops and transition buckets that stretched the cushion heading into the fourth frame.`,
      `In the closing twelve minutes (${q4W}–${q4L}), ${loser} attempted a late perimeter rally, led by a ${loserPts}-point effort from their primary scorer. However, ${winner}’s closing five responded with textbook poise—converting high-percentage corner triples, securing contested defensive rebounds, and sinking clutch free throws in the final two minutes to seal the ${winScore}–${loseScore} final result.`,
      `### Post-Game Locker Room Quotes & Reactions`,
      `Speaking to reporters at ${venue} following the final buzzer, ${winner}’s coaching staff emphasized defensive communication and second-half rebounding discipline as the foundation of the victory:`,
      `> "In a competitive ${competition} environment, you cannot rely solely on jump shooting to close out quality opponents like ${loser}. Our guys committed to multiple defensive efforts in the third and fourth quarters, protected the defensive glass (+${rebEdge} rebounding margin), and trusted the pass when ${loser} sent extra bodies at the ball. Winning the fourth quarter ${q4W}–${q4L} shows the maturity of this group."`,
      `${starLabel}, who paced ${winner} with ${starPts} points, ${starReb} rebounds, and ${starAst} assists, credited the team’s spacing and second-unit energy for keeping the offense humming during crunch time:`,
      `> "Our bench unit came in and immediately raised the defensive intensity, accounting for ${benchPtsW} bench points tonight. When we get stops and run the floor with discipline, the court opens up for everyone. We knew ${loser} would make a run in the second half, so our focus was staying composed, hunting paint touches, and knocking down open rhythm shots."`,
      `From the visiting locker room, ${loser}’s bench boss acknowledged that second-chance points and third-quarter turnovers proved costly:`,
      `> "Give credit to ${winner}—they punished every defensive breakdown we had in the second half. When you allow ${winFgPct}% shooting from the floor and ${win3PtPct}% from three-point range, you put enormous pressure on your half-court offense. We will review the game film, clean up our weak-side box-outs, and bounce back stronger in our next ${leagueName} outing."`,
      `### Statistical Context & Secondary Matchup Metrics`,
      `- **Team Shooting Efficiency:** ${winner} connected on **${winFgPct}%** from the field and **${win3PtPct}%** from beyond the arc, while holding ${loser} to **${loseFgPct}%** overall shooting.`,
      `- **Interior & Rebounding Battle:** ${winner} finished with a **+${rebEdge} rebounding advantage** and outscored ${loser} **${paintPtsW}–${paintPtsL}** inside the paint.`,
      `- **Top Individual Performers:** ${starLabel} led all scorers with **${starPts} PTS, ${starReb} REB, and ${starAst} AST**, supported by a secondary scoring punch of **${secondPts} PTS** and **${benchPtsW} bench points** from ${winner}’s reserve rotation.`,
      `- **What’s Next on the ${leagueName} Schedule:** Both ${winner} and ${loser} now turn their attention to their upcoming ${competition} fixtures. Follow TipOff PH for updated **${leagueName} standings**, **live basketball scores in PHT**, and daily pre-game predictions.`
    ].join('\n\n');
  } else {
    // =========================================================================
    // FORMAT 3: INVESTIGATIVE FEATURES & ANALYSIS (Optimal: 1,200 – 2,500+ words)
    // SEO Purpose & Strategy: Designed for evergreen search traffic. These rank
    // highly by deeply covering a topic, satisfying E-E-A-T (Experience,
    // Expertise, Authoritativeness, Trustworthiness), and capturing long-tail
    // search queries.
    // =========================================================================
    automationFormat = 'investigative-analysis';
    seoStrategyBadge = 'Investigative Features & Analysis (1,200–2,500+ Words • E-E-A-T Deep Dive)';

    const projHome = (isNba ? 114 : 96) + (seed % 9);
    const projAway = (isNba ? 109 : 91) + ((seed * 3) % 9 === seed % 9 ? ((seed * 3) % 9) + 2 : (seed * 3) % 9);
    const projWinner = projHome >= projAway ? home : away;
    const projLoser = projHome >= projAway ? away : home;
    const spreadVal = ((Math.abs(projHome - projAway) || 3) + 0.5).toFixed(1);
    const totalVal = (projHome + projAway - 0.5).toFixed(1);
    const winProb = Math.min(72, 54 + (seed % 16));
    const loseProb = 100 - winProb;
    const whenPhrase = gameDate.isToday
      ? `today, ${gameDate.fullDate} (${gameDate.timePht})`
      : `on ${gameDate.fullDate} (${gameDate.timePht})`;

    const homeOffRtg = (isNba ? 115.4 : 106.8) + (seed % 5) * 0.6;
    const awayOffRtg = (isNba ? 113.9 : 104.9) + ((seed * 2) % 5) * 0.6;
    const homeDefRtg = (isNba ? 110.8 : 101.4) + (seed % 4) * 0.5;
    const awayDefRtg = (isNba ? 112.1 : 102.9) + ((seed * 3) % 4) * 0.5;
    const paceProj = (isNba ? 99.4 : 91.2) + (seed % 4) * 0.7;
    const efgHome = (isNba ? 55.8 : 49.4) + (seed % 4) * 0.5;
    const efgAway = (isNba ? 54.2 : 48.1) + ((seed * 2) % 4) * 0.5;
    const orbHome = (26.4 + (seed % 5) * 0.7).toFixed(1);
    const orbAway = (24.8 + ((seed * 2) % 5) * 0.7).toFixed(1);
    const tovHome = (12.6 + (seed % 3) * 0.4).toFixed(1);
    const tovAway = (13.4 + ((seed * 2) % 3) * 0.4).toFixed(1);

    title = `${away} vs. ${home} Deep Tactical Analysis, Four Factors Telemetry & Prediction (${gameDate.shortDate} · ${gameDate.timePht})`;
    excerpt = `Comprehensive 1,200+ word E-E-A-T investigative feature and pre-game tactical analysis as ${away} faces ${home} ${whenPhrase} in ${competition} action at ${venue}. Includes Four Factors telemetry, coaching schemes, rotation depth charts, and betting line projections.`;
    body = [
      `MANILA / INVESTIGATIVE ANALYTICS & PREVIEW DESK (${gameDate.fullDate}) — High-stakes ${competition} basketball takes center stage at ${venue} as **${away}** prepares to clash with **${home}** ${whenPhrase}. Built to satisfy Google’s **E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)** editorial standards and capture long-tail search queries for Filipino basketball fans and quantitative analysts, this in-depth investigative feature examines every tactical, statistical, and rotational dimension of the **${away} vs. ${home}** matchup.`,
      `Whether you are researching **${away} vs ${home} prediction and odds**, **${leagueName} starting lineups and depth chart adjustments**, **half-court pick-and-roll schemes**, or **Philippine Time (PHT) broadcast telemetry**, our comprehensive pre-game dossier provides verified data-driven analysis ahead of opening tip-off.`,
      `### 1. Executive Matchup Dossier & Manila Time (PHT) Schedule Guide`,
      `- **Official Fixture:** ${away} (Away) at ${home} (Home)`,
      `- **League & Competition:** ${competition} (${leagueName} Official Season Slate)`,
      `- **Date & Tip-Off Time (PHT):** ${gameDate.fullDate} · ${gameDate.timePht} (Asia/Manila, UTC+8)`,
      `- **Host Venue:** ${venue}`,
      `- **Broadcast & Live Stream Relay:** ${match.streamLabel || classified.defaultBroadcast} (Live telemetry on TipOff PH)`,
      `- **Opening Market Consensus:** ${projWinner} -${spreadVal} | Over/Under Total: ${totalVal} | Win Probability: **${projWinner} (${winProb}%) vs. ${projLoser} (${loseProb}%)**`,
      `- **Projected Final Score:** **${away} ${projAway} – ${home} ${projHome}**`,
      `From a macro scheduling standpoint, this ${gameDate.shortDate} contest represents a pivotal measuring stick for both ${leagueName} locker rooms. Teams competing at ${venue} face unique pace and shot-selection dynamics, where early first-quarter defensive rebounding and transition discipline historically dictate which coaching staff controls substitution patterns through the middle frames.`,
      `### 2. Quantitative Four Factors & Advanced Efficiency Telemetry`,
      `Modern basketball analytics—pioneered by Dean Oliver’s **Four Factors of Basketball Success**—demonstrate that game outcomes are governed by four primary possession metrics: **Effective Field Goal Percentage (eFG%)**, **Turnover Percentage (TOV%)**, **Offensive Rebounding Percentage (ORB%)**, and **Free Throw Rate (FTR)**. Evaluating ${away} and ${home} across these four pillars reveals why our quantitative projection model favors **${projWinner}** by a projected margin of ${Math.abs(projHome - projAway)} points:`,
      `- **Offensive & Defensive Net Efficiency:** **${home}** enters this matchup posting an adjusted Offensive Rating of **${homeOffRtg.toFixed(1)} points per 100 possessions** against a Defensive Rating of **${homeDefRtg.toFixed(1)}**. By comparison, **${away}** registers an Offensive Rating of **${awayOffRtg.toFixed(1)}** and a Defensive Rating of **${awayDefRtg.toFixed(1)}** per 100 possessions.`,
      `- **Effective Field Goal Percentage (eFG% — 40% Weight):** ${home} currently holds a **${efgHome.toFixed(1)}% eFG%** profile driven by high-efficiency rim finishing and catch-and-shoot corner three-pointers, whereas ${away} operates at **${efgAway.toFixed(1)}% eFG%**. In half-court possessions that extend past 14 seconds on the shot clock, ${projWinner}’s ability to create paint touches before kicking out to weak-side shooters generates an extra 0.11 points per possession.`,
      `- **Turnover Rate & Live-Ball Security (TOV% — 25% Weight):** Ball security will be paramount against aggressive perimeter point-of-attack pressure. ${home} commits turnovers on **${tovHome}%** of its offensive possessions, while ${away} sits at **${tovAway}%**. Live-ball steals are substantially more damaging than dead-ball out-of-bounds turnovers because they fuel uncontested transition run-outs that bypass set half-court rim protection.`,
      `- **Glass Control & Second-Chance Creation (ORB% — 20% Weight):** On the offensive boards, ${home} captures **${orbHome}%** of available missed shots compared to **${orbAway}%** for ${away}. Securing long rebounds off missed three-point attempts will be a critical swing factor, particularly when both teams deploy smaller, switch-heavy wing lineups in the second and third quarters.`,
      `- **Free Throw Rate & Bonus Penalty (FTR — 15% Weight):** Drawing early personal fouls on opposing rim protectors not only generates high-efficiency points at the charity stripe (nearly 1.58 points per trip) but also forces opposing head coaches to bench their primary interior anchors ahead of schedule.`,
      `### 3. Half-Court Tactical Schemes, Pick-and-Roll Coverages & Spacing Geometry`,
      `When examining the X’s and O’s film study between **${away}** and **${home}**, the primary tactical battleground centers on **high ball-screen navigation** and **weak-side low-man rotations**.`,
      `**How ${home} Attacks in the Half-Court:** Expect ${home} to initiate early offense through horns sets, pistol action on the wing, and Spain pick-and-roll variations (where a perimeter shooter sets a back-screen on the rolling big man’s defender). By placing two elite catch-and-shoot threats in the deep corners, ${home} forces ${away}’s weak-side help defender into an impossible bind: either tag the rolling center in the paint and surrender an open corner triple, or stay attached to the shooter and concede a high-percentage lob or floater in the lane.`,
      `**How ${away} Counters Offensively:** ${away} excels when pushing the pace off defensive rebounds and attacking in early drag screens before ${home} can match up in cross-matches. In settled half-court possessions, ${away} frequently utilizes inverted pick-and-rolls and split-cut actions off the high post. If ${home}’s big man plays a conservative drop coverage near the restricted area, ${away}’s primary ball-handler will hunt pull-up jumpers from the nail and top of the key.`,
      `**Defensive Adjustments to Watch:** Watch closely how both coaching staffs adjust their pick-and-roll coverages between the first and third quarters. If ${projWinner} switches screens 1-through-4 across the perimeter, ${projLoser} will need to punish mismatches on the low block swiftly without allowing the ball to stagnate on the wing. Conversely, if either defense sends hard two-on-the-ball traps (blitzing the ball-handler), the short-roll playmaker at the free-throw line must make crisp 4-on-3 reads to the weak-side dunker spot or corner shooter.`,
      `### 4. Starting Lineup Synergy, Bench Rotation Depth Charts & Fatigue Management`,
      `In high-intensity ${competition} games, starting lineups set the tone in the opening six minutes, but **second-unit net rating** during the non-starter bridges (late Q1 to early Q2, and late Q3 to early Q4) frequently decides who covers the point spread.`,
      `- **First-Unit Two-Way Balance:** ${projWinner}’s starting five boasts superior positional size and defensive versatility across the wing slots, allowing their primary point-of-attack defender to fight over screens while keeping their rim protector anchored near the paint.`,
      `- **Second-Unit Scoring & Staggered Rotations:** Both coaching staffs stagger their top two offensive creators so at least one elite playmaker remains on the hardwood for all 48 minutes. ${home}’s reserve unit thrives on energetic defensive ball pressure and transition three-pointers, whereas ${away}’s bench leans on midrange shot creation and offensive rebounding energy.`,
      `- **Closing Five (Crunch-Time Lineup):** With under five minutes remaining in the fourth quarter and the score within single digits, expect both teams to downsize into their highest-spacing closing lineups—prioritizing two-way wings who can switch ball screens, box out in traffic, and shoot above 37% from beyond the three-point arc.`,
      `### 5. Quantitative Betting Market Breakdown: Spread, Over/Under Total & Pace Model`,
      `For sports bettors and analytical enthusiasts evaluating the **${away} vs. ${home} odds and betting lines**, our pace-and-efficiency simulation model projects **${paceProj.toFixed(1)} possessions per 48 minutes**:`,
      `- **Point Spread Analysis (${projWinner} -${spreadVal}):** Our multi-factor regression model prices the fair spread at **${projWinner} -${(Number(spreadVal) + 0.8).toFixed(1)}**, giving measurable value to **${projWinner} -${spreadVal}** (${winProb}% projected win probability). ${projWinner}’s edge in half-court effective field goal percentage (+${Math.abs(efgHome - efgAway).toFixed(1)}%) and lower turnover propensity provides a reliable floor in late-game free-throw situations.`,
      `- **Over/Under Total Projection (O/U ${totalVal}):** With projected scoring set at **${away} ${projAway} – ${home} ${projHome}** (combined **${projAway + projHome} points**), the total hinges on first-half transition frequency and three-point volume. If both teams exceed 38% on catch-and-shoot triples in the opening half, live in-play pace heavily favors the Over.`,
      `- **In-Play Live Betting Strategy:** Monitor third-quarter run dynamics. Historically in ${leagueName} action at ${venue}, teams trailing by 6 to 9 points at halftime make an aggressive opening 4-minute push in Q3—creating middle opportunities for disciplined live-market observers.`,
      `### 6. Long-Tail Search FAQ: Key Questions Answered for ${away} vs. ${home}`,
      `**Q: What time is the ${away} vs. ${home} game today in Philippine Time (PHT)?**`,
      `A: The official ${competition} matchup between ${away} and ${home} tips off ${whenPhrase} at ${venue}. Live scores, quarter clocks, and streaming links are updated in real time on TipOff PH.`,
      `**Q: Who is favored to win between ${away} and ${home}?**`,
      `A: Based on consensus sportsbook lines and our Four Factors quantitative model, **${projWinner}** is favored by **-${spreadVal} points** with a **${winProb}% win probability** and a projected final score of **${away} ${projAway} – ${home} ${projHome}**.`,
      `**Q: What is the single biggest tactical key in ${away} vs. ${home}?**`,
      `A: Controlling the defensive glass and limiting live-ball turnovers. Whichever team holds its opponent to one-and-done half-court possessions while converting above 36% on weak-side catch-and-shoot three-pointers will control the fourth-quarter tempo at ${venue}.`,
      `### 7. Official TipOff PH E-E-A-T Editorial Verdict`,
      `- **Official Matchup Pick:** **${projWinner} -${spreadVal}** (${winProb}% Confidence Rating)`,
      `- **Projected Final Scoreline:** **${away} ${projAway} – ${home} ${projHome}**`,
      `- **Decisive Tactical Edge:** Superior half-court spacing, disciplined pick-and-roll drop/switch execution, and fourth-quarter rebounding control at ${venue}.`
    ].join('\n\n');
  }

  const computedWordCount = body
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;

  // Accurate publish timestamp matching the game's actual Manila date and status
  const publishedIso = computeAccurateMatchBlogPublishIso(
    match.startTime || match.startTimeIso,
    match.status,
    index
  );

  return {
    id: `art-match-today-${slug}`,
    slug,
    title,
    excerpt,
    body,
    primaryCategoryId: meta.primaryCategoryId,
    topicIds: meta.topicIds,
    authorId: meta.authorId,
    contentType: match.status === 'scheduled' ? 'analysis' : 'news',
    sourceName: meta.sourceName,
    sourceUrl: meta.sourceUrl,
    featuredImageUrl,
    imageAlt: `${away} vs ${home} (${gameDate.shortDate}) — ${competition} Match Blog`,
    imageCredit: `TipOff PH / ${leagueName} Official Coverage`,
    seoTitle: title.length > 65 ? `${away} vs ${home} (${gameDate.monthDay}) ${leagueName} Blog | TipOff PH` : title,
    seoDescription: excerpt.length > 160 ? `${excerpt.slice(0, 157)}...` : excerpt,
    isFeatured: isRealPhoto && gameDate.isToday && index < 6,
    isBreaking: isRealPhoto && (match.status === 'live' || (gameDate.isToday && index === 0)),
    status: 'published',
    publishedAt: publishedIso,
    updatedAt: publishedIso,
    createdAt: publishedIso,
    automationFormat,
    wordCount: computedWordCount,
    seoStrategyBadge
  };
}

async function performMatchBlogSync(force: boolean): Promise<void> {
  try {
    const sportsData = await fetchLocalSportsData(force);
    if (!sportsData || !Array.isArray(sportsData.allMatches) || sportsData.allMatches.length === 0) {
      return;
    }

    // Strictly include only verified NBA games and verified PBA games (excluding WNBA, Slovenia Cup, FIBA WBLA, MPBL, UAAP, or 2024/old matches)
    const validMatches = sportsData.allMatches.filter(m => {
      if (!isLive88BasketballMatch(m)) return false;
      const hName = m.home?.name || '';
      const aName = m.away?.name || '';
      const comp = `${m.competition || ''} ${m.streamLabel || ''} ${hName} ${aName}`;
      if (/\b(wnba|slovenia|fiba\s*wbla|wbla|women|2024|2023|mpbl|maharlika|uaap|ncaa)\b/i.test(comp)) {
        return false;
      }
      if (isVerifiedNbaTeam(hName) && isVerifiedNbaTeam(aName)) return true;
      if (isVerifiedPbaTeam(hName) && isVerifiedPbaTeam(aName)) return true;
      return false;
    });

    // Sort: 1. Live matches, 2. Today's Manila date matches, 3. Yesterday/Tomorrow Manila date matches, 4. Other matches
    const snap = getCurrentManilaDateParts();
    const sortedMatches = [...validMatches].sort((a, b) => {
      const rankStatus = (m: PhSportsMatch) => {
        if (m.status === 'live') return 0;
        const d = formatGameDateLabelPht(m.startTime || m.startTimeIso);
        if (d.isToday) return 1;
        if (d.isYesterday || d.isTomorrow) return 2;
        return 3;
      };
      const rA = rankStatus(a);
      const rB = rankStatus(b);
      if (rA !== rB) return rA - rB;

      const leagueOrder = (m: PhSportsMatch) => {
        if (m.leagueId === 'pba') return 0;
        if (m.leagueId === 'nba') return 1;
        if (m.leagueId === 'mpbl') return 2;
        if (m.leagueId === 'uaap' || m.leagueId === 'ncaa') return 3;
        return 4;
      };
      return leagueOrder(a) - leagueOrder(b);
    });

    // Track all images already used by static editorial & NBA preseason prediction articles so zero images are ever duplicated
    const nonMatchArticles = inMemoryStore.articles.filter(a => !String(a.id).startsWith('art-match-today-'));
    const usedImages = new Set<string>(
      nonMatchArticles.map(a => String(a.featuredImageUrl || '').trim()).filter(Boolean)
    );

    const generatedArticles = sortedMatches.map((m, idx) =>
      convertMatchToBlogArticle(m, idx, usedImages)
    );

    // Merge into inMemoryStore.articles
    inMemoryStore.articles = [...nonMatchArticles, ...generatedArticles];
    inMemoryStore.refreshRelations();
    lastBlogSyncTime = Date.now();
    lastBlogSyncYmd = snap.ymd;
    if (onArticlesUpdatedHook) onArticlesUpdatedHook();

    // Automatically index new Pre-Game Prediction blogs & Post-Game ("after ng game") Recap blogs via Google Indexing API
    queueAutomatedBlogsForIndexing(sortedMatches, inMemoryStore.articles, force);
  } catch (err: any) {
    console.warn('[Match Blogs] Sync warning:', err?.message);
  }
}

export async function ensureTodaysMatchBlogsSynced(force = false): Promise<void> {
  const now = Date.now();
  const currentYmd = getCurrentManilaDateParts().ymd;
  const dateChanged = lastBlogSyncYmd !== '' && lastBlogSyncYmd !== currentYmd;

  if (!force && !dateChanged && lastBlogSyncTime > 0) {
    if (now - lastBlogSyncTime >= BLOG_SYNC_TTL_MS && !inFlightSyncPromise) {
      // Trigger non-blocking background refresh so user requests never wait
      inFlightSyncPromise = performMatchBlogSync(false).finally(() => {
        inFlightSyncPromise = null;
      });
    }
    return;
  }

  if (inFlightSyncPromise) {
    if (!force && lastBlogSyncTime > 0) return;
    await inFlightSyncPromise;
    return;
  }

  inFlightSyncPromise = performMatchBlogSync(force).finally(() => {
    inFlightSyncPromise = null;
  });

  await inFlightSyncPromise;
}

function unslugifyTeamName(rawSlug: string): string {
  const words = rawSlug
    .split('-')
    .filter(Boolean)
    .map(w => (w.length <= 3 && /^(up|ust|nu|ue|jru|lpu|csb|eac|ssc|sbu|tnt|nlex|smb|gsw|lal|lac|okc|nyk|bkn|nop|phx|sas|bos|cha|chi|mil|den|dal|mia|cle|orl|ind|tor|por|sac)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)));
  return getCanonicalTeamName(words.join(' ')) || words.join(' ') || 'Team';
}

export function buildFallbackMatchBlogForSlug(slug: string): Article | null {
  const cleaned = String(slug || '').trim().toLowerCase();
  const m = cleaned.match(/^(.+?)-vs-(.+?)(?:-(?:match-blog-today|highlights-box-score|prediction-odds-picks|live|preview|recap))?$/i);
  if (!m) return null;

  const awayTeamName = unslugifyTeamName(m[1] || 'Away Team');
  const homeTeamName = unslugifyTeamName(m[2] || 'Home Team');
  const isPostGameSlug = /-(?:highlights-box-score|recap)$/i.test(cleaned);

  const classified = classifyMatchLeague({
    homeTeam: homeTeamName,
    awayTeam: awayTeamName
  });

  const snap = getCurrentManilaDateParts();
  const syntheticMatch: PhSportsMatch = {
    id: `fallback-${cleaned}`,
    sport: 'basketball',
    leagueId: classified.leagueId,
    competition: classified.leagueFullName,
    status: isPostGameSlug ? 'finished' : 'scheduled',
    clock: isPostGameSlug ? 'Final' : 'Today PHT',
    startTime: snap.verifiedPublishIso,
    startTimeIso: snap.verifiedPublishIso,
    manilaTimeFormatted: `${snap.shortLabel}, 7:00 PM PHT`,
    venue: classified.defaultVenue,
    home: {
      name: homeTeamName,
      shortName: homeTeamName,
      logo: ''
    },
    away: {
      name: awayTeamName,
      shortName: awayTeamName,
      logo: ''
    },
    homeScore: isPostGameSlug ? 108 : 0,
    awayScore: isPostGameSlug ? 102 : 0,
    sources: [],
    hasVideoStream: false,
    streamLabel: classified.defaultBroadcast
  };

  const usedImages = new Set<string>(
    inMemoryStore.articles.map(a => String(a.featuredImageUrl || '').trim()).filter(Boolean)
  );
  const article = convertMatchToBlogArticle(syntheticMatch, 15, usedImages);
  article.slug = cleaned;
  article.id = `art-match-today-${cleaned}`;

  inMemoryStore.articles.push(article);
  inMemoryStore.refreshRelations();
  if (onArticlesUpdatedHook) onArticlesUpdatedHook();
  return inMemoryStore.articles.find(a => a.slug === cleaned) || article;
}
