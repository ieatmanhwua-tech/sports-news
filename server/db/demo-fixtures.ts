import type { Article, Author, GameScore } from '../../shared/types';
import { CATEGORIES_REGISTRY } from '../../shared/categories';

export const DEMO_AUTHORS: Author[] = [
  {
    id: 'author-joaquin-santos',
    slug: 'joaquin-santos',
    name: 'Joaquin Santos',
    role: 'Senior PBA & Trade Beat Reporter',
    bio: 'Joaquin has covered Philippine professional basketball for over a decade, reporting from the sidelines of the Araneta Coliseum and MOA Arena.',
    email: 'joaquin.santos@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@JoaquinSantosPH'
  },
  {
    id: 'author-maria-reyes',
    slug: 'maria-reyes',
    name: 'Maria Reyes',
    role: 'Collegiate & Gilas Pilipinas Correspondent',
    bio: 'Former collegiate varsity athlete turned sports investigative writer. Maria specializes in UAAP, NCAA, and international FIBA tournament cycles.',
    email: 'maria.reyes@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@MariaReyesHoops'
  },
  {
    id: 'author-carlo-mendoza',
    slug: 'carlo-mendoza',
    name: 'Carlo Mendoza',
    role: 'Grassroots, MPBL & Regional Hoops Analyst',
    bio: 'Carlo travels across Luzon, Visayas, and Mindanao capturing the heartbeat of regional basketball leagues and grassroots prospects.',
    email: 'carlo.mendoza@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@CarloMendozaPH'
  },
  {
    id: 'author-rafael-dizon',
    slug: 'rafael-dizon',
    name: 'Rafael Dizon',
    role: 'Tactical Analyst & Columnist',
    bio: 'Rafael breaks down half-court sets, pick-and-roll defensive schemes, and advanced metrics across local and international competitions.',
    email: 'rafael.dizon@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@CoachRafDizon'
  }
];

export const DEMO_ARTICLES: Article[] = [
  {
    id: 'art-001',
    slug: 'san-miguel-beermen-clinch-semifinal-berth-philippine-cup-thriller',
    title: 'San Miguel Beermen Clinch Semifinal Berth in 108-103 Philippine Cup Thriller',
    excerpt: 'June Mar Fajardo anchored a decisive 14-2 fourth-quarter run as the Beermen withstood a furious rally from Meralco to advance to the final four at the Smart Araneta Coliseum.',
    body: `QUEZON CITY — In an electric atmosphere at the Smart Araneta Coliseum, the San Miguel Beermen demonstrated why their frontline remains the standard in Philippine basketball, outlasting the Meralco Bolts 108-103 to punch their ticket to the PBA Philippine Cup semifinals.

Seven-time Most Valuable Player June Mar Fajardo delivered another masterclass inside the painted area, tallying 26 points, 17 rebounds, and 4 blocks. When the Bolts mounted a spirited comeback in the third quarter behind Chris Newsome’s perimeter marksmanship, it was Fajardo and veteran guard CJ Perez who took control down the stretch.

### A Decisive Fourth Quarter Surge

Trailing 88-85 with 7:42 remaining in regulation, San Miguel head coach Jorge Gallent called a tactical timeout that altered the game's complexion. The Beermen transitioned into an aggressive high-low post action, neutralizing Meralco’s frontline rotation and forcing key fouls on Cliff Hodge.

"We knew Meralco would throw multiple defensive looks at June Mar," Gallent said during the post-game press conference. "Our guards made the right reads, spaced the floor, and didn't panic when they cut into our lead."

CJ Perez contributed 22 points, 6 assists, and 3 steals, including a step-back three-pointer with 1:12 on the game clock that extended San Miguel’s cushion to six. Marcio Lassiter added 15 points on 4-of-7 shooting from beyond the arc, moving closer to the league’s all-time three-point record.

### Meralco's Resilient Effort

For the Bolts, Newsome led all scorers with 28 points, while Aaron Black added 16 points in his second game back from a minor ankle sprain. Despite forcing 16 turnovers, Meralco was undone on the glass, as San Miguel secured an overwhelming 52-37 rebounding advantage.

With the victory, the Beermen await the winner of the Barangay Ginebra vs. Magnolia Hotshots quarterfinal showdown, setting up another chapter in the storied Manila Clasico or an explosive sister-team semifinal battle.`,
    primaryCategoryId: 'pba-news',
    topicIds: ['pba-news', 'pba-philippine-cup'],
    authorId: 'author-joaquin-santos',
    contentType: 'news',
    sourceName: 'PBA Official Media Bureau',
    sourceUrl: 'https://pba.ph',
    featuredImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Basketball going through net during high-stakes PBA quarterfinal match',
    imageCredit: 'TipOffPh / Sports Action Media',
    seoTitle: 'San Miguel Advances to PBA Semifinals in 108-103 Thriller | TipOffPh',
    seoDescription: 'June Mar Fajardo posts 26 points and 17 rebounds as the San Miguel Beermen defeat Meralco 108-103 to advance to the PBA Philippine Cup semifinals.',
    isFeatured: true,
    isBreaking: true,
    status: 'published',
    publishedAt: '2026-10-09T08:30:00Z',
    createdAt: '2026-10-09T08:00:00Z'
  },
  {
    id: 'art-002',
    slug: 'gilas-pilipinas-names-14-man-pool-fiba-asia-cup-qualifiers',
    title: 'Gilas Pilipinas Names Formidable 14-Man Pool for FIBA Asia Cup Window',
    excerpt: 'Coach Tim Cone reinforces continuity and size, retaining core standouts Dwight Ramos, Kai Sotto, and Justin Brownlee alongside versatile collegiate invitees.',
    body: `PASIG CITY — The Samahang Basketbol ng Pilipinas (SBP) and Gilas Pilipinas head coach Tim Cone have officially announced the 14-man training pool for the upcoming FIBA Asia Cup Qualifiers window, emphasizing lineup stability and defensive discipline.

Naturalized resident forward Justin Brownlee once again headlines the squad, joined by 7-foot-3 center Kai Sotto, who arrives directly following a dominant campaign in the Japan B.League. Cone emphasized that keeping the core unit intact is essential for sustained tactical growth.

### Lineup Stability Over Overhauls

"Our approach is simple: we believe in continuous chemistry rather than assembling a completely new group every window," Cone explained. "These players know each other’s tendencies, understand our triangle sets, and take immense pride in wearing the national tricolor."

The pool features:
- **Guards**: Scottie Thompson, Chris Newsome, CJ Perez, Dwight Ramos
- **Wings & Forwards**: Justin Brownlee, Calvin Oftana, Carl Tamayo, Kevin Quiambao
- **Bigs**: Kai Sotto, June Mar Fajardo, Japeth Aguilar, AJ Edu

The inclusion of UAAP standout Kevin Quiambao highlights the coaching staff’s confidence in the reigning collegiate MVP's versatility and playmaking at the forward position. AJ Edu also returns to full contact practice after recovering from a knee rehabilitation program.

### Road to the Continental Championship

Gilas will hold an intensive four-day training camp at the Inspire Sports Academy in Calamba, Laguna before hosting New Zealand and Hong Kong at the Mall of Asia Arena. With basketball fans rallying behind the team, expectations are high for the squad to solidify its standing at the top of Group B.`,
    primaryCategoryId: 'gilas-pilipinas',
    topicIds: ['gilas-pilipinas', 'fiba-world-cup', 'overseas-filipino-players'],
    authorId: 'author-maria-reyes',
    contentType: 'news',
    sourceName: 'SBP Media Release',
    featuredImageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'National basketball court ready for international tournament action',
    imageCredit: 'TipOffPh / National Team Archive',
    seoTitle: 'Gilas Pilipinas 14-Man Roster Announced for FIBA Qualifiers | TipOffPh',
    seoDescription: 'Tim Cone names 14-man Gilas Pilipinas pool featuring Kai Sotto, Justin Brownlee, and Dwight Ramos for the FIBA Asia Cup qualifiers window.',
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-08-24T06:15:00Z',
    createdAt: '2026-08-24T05:45:00Z'
  },
  {
    id: 'art-003',
    slug: 'pampanga-giant-lanterns-edge-san-juan-knights-mpbl-playoff-showdown',
    title: 'Pampanga Giant Lanterns Edge San Juan Knights 84-81 in Gritty MPBL Battle',
    excerpt: 'Encho Serrano converted a difficult driving layup in the final 18 seconds to push the defending champion Lanterns past the Knights in a high-intensity North Division clash.',
    body: `SAN FERNANDO, PAMPANGA — Before a raucous hometown crowd at the Bren Z. Guiao Convention Center, the Pampanga Giant Lanterns weathered a furious fourth-quarter charge from the San Juan Knights to secure an 84-81 victory in the MPBL North Division playoffs.

Dynamic guard Encho Serrano proved unstoppable down the stretch, driving into the teeth of the San Juan defense to convert an acrobatic reverse layup with 18.4 seconds left on the clock. San Juan had an opportunity to tie, but Orlan Wamar’s contested step-back triple bounced off the back iron as time expired.

### Defending the Home Floor

Pampanga established control early with relentless full-court trapping, forcing San Juan into 19 turnovers that translated into 24 fast-break points. Big man Justine Baltazar posted an imposing double-double with 18 points, 15 rebounds, and 5 assists, while anchoring Pampanga's interior defense.

"In the MPBL playoffs, every possession feels like life or death," said Pampanga head coach Gov. Dennis Pineda. "San Juan is a championship-tested organization with veteran leadership, but our boys stayed composed under pressure."

### San Juan's Late Push Falls Short

San Juan fought back from an 11-point deficit in the third quarter behind Michael Calisaan’s tough scoring in the paint and AC Soberano’s timely outside shooting. Calisaan finished with 21 points and 9 boards, while Wamar tallied 14 points and 8 assists.

Game 2 shifts to the Filoil EcoOil Centre in San Juan, where the Knights must win to extend the series to a decisive Game 3.`,
    primaryCategoryId: 'mpbl-news',
    topicIds: ['mpbl-news'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'MPBL Operations Desk',
    featuredImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Basketball arena court under warm stadium floodlights',
    imageCredit: 'TipOffPh / Regional Basketball Lens',
    seoTitle: 'Pampanga Giant Lanterns Beat San Juan 84-81 in MPBL Thriller | TipOffPh',
    seoDescription: 'Encho Serrano delivers late-game heroics as Pampanga outlasts San Juan 84-81 in an intense MPBL North Division playoff duel.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-09T03:45:00Z',
    createdAt: '2026-10-09T03:00:00Z'
  },
  {
    id: 'art-004',
    slug: 'uaap-season-87-up-fighting-maroons-stay-unbeaten-over-dlsu-green-archers',
    title: 'UAAP Season 87: UP Fighting Maroons Stay Unbeaten With Clutch Win Over DLSU',
    excerpt: 'JD Cagulangan orchestrated a dazzling fourth quarter as UP outdueled Kevin Quiambao and the Green Archers 76-72 in a finals rematch at the Mall of Asia Arena.',
    body: `PASAY CITY — In a finals rematch that lived up to every ounce of its immense billing, the University of the Philippines Fighting Maroons maintained their pristine record in UAAP Season 87, holding off the De La Salle Green Archers 76-72 on Sunday evening.

Floor general JD Cagulangan orchestrated the closing four minutes with surgical precision, scoring seven of his team-high 17 points in crunch time, while dishing out 5 assists with zero turnovers.

### Clash of Heavyweights

The matchup pitted the league's top two championship favorites against each other in front of 14,800 spectators at the Mall of Asia Arena. Both programs traded blows through three quarters of physical, defensively disciplined basketball.

UP head coach Goldwin Monteverde lauded his unit's collective resolve when La Salle rallied behind reigning MVP Kevin Quiambao:

"Playing against La Salle always demands 40 minutes of absolute concentration," Monteverde said. "They are exceptionally well-coached and aggressive. Our guys embraced the physicality on the defensive boards."

Quiambao paced La Salle with a stellar all-around line of 23 points, 11 rebounds, and 4 assists, but La Salle shot just 6-of-24 from three-point range against UP’s active closeout defense. Francis Lopez and Harold Alarcon combined for 26 points for UP, providing the scoring punch to complement Cagulangan’s leadership.

With the victory, the Fighting Maroons improve to 7-0 at the conclusion of the first round, establishing themselves as the team to beat in collegiate hoops.`,
    primaryCategoryId: 'uaap-basketball',
    topicIds: ['uaap-basketball', 'high-school-hoops'],
    authorId: 'author-maria-reyes',
    contentType: 'news',
    sourceName: 'UAAP Press Corps',
    featuredImageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Collegiate basketball players battling for possession under the rim',
    imageCredit: 'TipOffPh / Collegiate Media Bureau',
    seoTitle: 'UP Maroons Edge DLSU Archers 76-72 in UAAP Finals Rematch | TipOffPh',
    seoDescription: 'JD Cagulangan steers UP to a 76-72 victory over Kevin Quiambao and La Salle in an electric UAAP Season 87 round one encounter.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-08T22:30:00Z',
    createdAt: '2026-10-08T21:45:00Z'
  },
  {
    id: 'art-005',
    slug: 'rumor-two-rival-pba-franchises-exploring-blockbuster-three-team-trade',
    title: 'Trade Rumor: Two Rival PBA Franchises Exploring Blockbuster Three-Team Deal',
    excerpt: 'Multiple league insiders confirm preliminary trade discussions centered on an All-Star shooting guard and future draft capital, awaiting trade committee vetting.',
    body: `MANILA — As the PBA trade window approaches its mid-conference deadline, whispers from team boardrooms indicate that a high-profile multi-team transaction is currently being explored by at least two prominent franchises, with a third team positioned as a salary and draft pick facilitator.

*Disclaimer: TipOffPh classifies this report as an Attributed Rumor based on multiple verified league sources. No formal trade papers have been submitted to the PBA Commissioner's Office as of Tuesday morning.*

### The Moving Pieces

According to three independent team officials speaking on the condition of anonymity, discussions involve a former All-Star guard who has seen his rotational minutes decrease following recent lineup adjustments.

The proposed framework would see:
1. **Franchise A**: Acquires an established two-way perimeter creator and a 2027 second-round draft asset.
2. **Franchise B**: Adds frontcourt depth and rim protection to counter San Miguel's interior dominance.
3. **Franchise C (Facilitator)**: Receives an unprotected first-round draft selection and cash considerations.

### Vetting Process and Commissioner Review

Any transaction of this magnitude must clear the PBA Trade Committee, led by technical officials tasked with evaluating roster parity and competitive balance. League insiders expect formal paperwork to be finalized only after this weekend's critical conference fixtures.

TipOffPh will continue to track developments as official confirmations emerge.`,
    primaryCategoryId: 'rumors-and-trades',
    topicIds: ['rumors-and-trades', 'pba-news'],
    authorId: 'author-joaquin-santos',
    contentType: 'rumor',
    sourceName: 'PBA League Sources',
    featuredImageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Basketball court clipboard and tactical gameplan notes',
    imageCredit: 'TipOffPh / Insider Desk',
    seoTitle: 'PBA Blockbuster Three-Team Trade Rumors Heat Up | TipOffPh',
    seoDescription: 'Multiple league insiders report advanced preliminary discussions on a major three-team PBA trade involving an All-Star guard and draft capital.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-08T16:00:00Z',
    createdAt: '2026-10-08T15:00:00Z'
  },
  {
    id: 'art-006',
    slug: 'editorial-why-the-rise-of-filipinos-in-the-japan-bleague-is-elevating-gilas',
    title: 'Editorial: Why the Rise of Filipinos in the Japan B.League Is Elevating Philippine Hoops',
    excerpt: 'Far from draining local talent, the overseas diaspora of Filipino athletes into Japan and Korea has accelerated tactical maturity and physical readiness on the international stage.',
    body: `When Kiefer Ravena and Thirdy Ravena first departed Philippine shores to embark on professional careers in the Japan B.League, skeptics warned that the country risked losing its domestic stars to foreign leagues.

Five years later, the evidence on the court tells a dramatically different story: overseas competition has served as the greatest development catalyst the Philippine national program has experienced in modern history.

### The Speed and Spacing Revolution

Basketball in the Japanese B.League is predicated on rapid ball movement, relentless transition pace, and high-level perimeter spacing. When Filipino athletes such as Kai Sotto, Dwight Ramos, and Carl Tamayo spend 60 games a year competing against European imports, athletic Americans, and sharpshooting Japanese guards, their basketball instincts undergo rapid refinement.

In previous decades, Philippine basketball often relied heavily on isolation scoring and individual brilliance. Today, watching Gilas Pilipinas execute Tim Cone’s sets reveals players who make instantaneous 0.5-second decisions, read weak-side rotations, and defend multiple positions without conceding foolish fouls.

### Financial Empowerment and Professional Standards

Beyond tactical growth, foreign leagues have introduced Filipino professionals to rigorous sports science programs, cutting-edge conditioning facilities, and strict recovery protocols. Players return to national team duty in peak physical shape, with extended career horizons and heightened discipline.

Rather than viewing the overseas exodus with apprehension, Philippine basketball stakeholders should embrace it. The modern Filipino hooper is no longer confined to local borders — they are a globally valued athlete competing at the frontier of Asian basketball.`,
    primaryCategoryId: 'basketball-editorials',
    topicIds: ['basketball-editorials', 'overseas-filipino-players', 'gilas-pilipinas'],
    authorId: 'rafael-dizon',
    contentType: 'editorial',
    featuredImageUrl: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Empty modern basketball arena reflecting professional sports evolution',
    imageCredit: 'TipOffPh / Editorial Analysis',
    seoTitle: 'Editorial: How the Japan B.League Diaspora Elevates Philippine Hoops',
    seoDescription: 'TipOffPh editorial analysis on how Filipino basketball players thriving in Japan and Korea are accelerating tactical growth for Gilas Pilipinas.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-08T10:00:00Z',
    createdAt: '2026-10-08T09:15:00Z'
  },
  {
    id: 'art-007',
    slug: 'pilipinas-super-league-quezon-city-stars-edge-manila-double-overtime-thriller',
    title: 'Pilipinas Super League: Quezon City Stars Edge Manila in Double-Overtime Thriller',
    excerpt: 'A clutch corner triple with 4.8 seconds remaining in the second extra period seals a dramatic 104-101 victory in the PSL National Tournament quarterfinals.',
    body: `QUEZON CITY, Philippines — In one of the most grueling playoff battles in Pilipinas Super League (PSL) history, the Quezon City Stars outlasted the Manila Stars in a double-overtime 104-101 slugfest at the Amoranto Sports Complex on Wednesday evening.

Trailing by two with under ten seconds left in the second overtime, QC veteran floor general Mark Cruz executed a crisp pick-and-roll before kicking out to an open shooting guard on the wing, who sank the game-winning three-pointer as the arena erupted.

### Defensive Grit Down the Stretch

Both squads traded body blows through forty minutes of regulation and two exhausting five-minute extensions. The contest featured 18 lead changes and 14 deadlocks, highlighting the parity and grassroots passion defining the current PSL season.

"Our boys simply refused to pack it in," said Quezon City head coach in the post-game press conference. "Playing back-to-back overtimes demands absolute discipline and heart. Credit to Manila for pushing us to the brink, but our transition defense saved us in the final minute."

With the hard-fought quarterfinal triumph, Quezon City books their ticket to the PSL National Semifinals, where they will face the top-seeded Davao Occidental Tigers in a best-of-three series next week.`,
    primaryCategoryId: 'psl-news',
    topicIds: ['psl-news', 'vismin-super-cup'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'Pilipinas Super League Media Bureau',
    sourceUrl: 'https://tipoffph.com/psl-news',
    featuredImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Indoor local basketball court action during intense competition',
    imageCredit: 'TipOffPh / Regional Hoops Desk',
    seoTitle: 'PSL: Quezon City Stars Edge Manila in Double-Overtime Thriller | TipOffPh',
    seoDescription: 'Quezon City Stars advance to the Pilipinas Super League National Semifinals after a gripping 104-101 double-overtime victory over Manila.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-07T14:30:00Z',
    createdAt: '2026-10-07T13:40:00Z'
  },
  {
    id: 'art-008',
    slug: 'sneakers-and-gear-review-anta-kai-1-performance-analysis-court-testing',
    title: 'Sneakers & Gear: On-Court Performance Review of the ANTA KAI 1 in Philippine Conditions',
    excerpt: 'We tested Kyrie Irving’s signature ANTA KAI 1 across 10 outdoor and indoor hardwood sessions in Manila to evaluate traction, containment, and tropical breathability.',
    body: `MANILA — Few signature sneaker arrivals have generated as much anticipation in local shoe circles as the debut of Kyrie Irving’s signature line with ANTA. The KAI 1 promises elite multidirectional traction, low-profile cushioning, and cultural design motifs.

To provide an authentic evaluation for Filipino hoopers, our gear review team tested the ANTA KAI 1 over a rigorous three-week period across both climate-controlled indoor hardwood courts and high-abrasion outdoor concrete courts in Metro Manila.

### Traction & Court Feel (Rating: 9.5/10)

The herringbone-inspired outsole pattern is aggressive and sticky. On dusty indoor gym surfaces, the compound wiped cleanly and provided immediate bite without squeak degradation. Outdoor players will appreciate the rubber depth, though we recommend reserving specialized colorways for indoor hardwood to prolong compound life.

### Cushioning & Impact Protection (Rating: 8.5/10)

Utilizing ANTA's proprietary NitroEdge foam, the setup delivers an exceptionally responsive ride tailored for shifty ballhandlers who prioritize court feel and rapid first-step acceleration over max-cushion plunge.

### Tropical Durability & Ventilation (Rating: 8.0/10)

The woven upper is reinforced with TPU synthetic overlays and embroidered tribal motifs. While breathability is moderate under typical humid Philippine gymnasium conditions, the lockdown through the midfoot strap is among the best in the current market.

**Verdict**: At its accessible retail price point in Philippine flagship stores, the ANTA KAI 1 stands as one of the best guard shoes of the year for local players seeking elite lateral containment and sharp deceleration.`,
    primaryCategoryId: 'sneakers-and-gear',
    topicIds: ['sneakers-and-gear'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    featuredImageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'High-performance basketball sneakers ready for court testing',
    imageCredit: 'TipOffPh / Kicks & Gear Desk',
    seoTitle: 'ANTA KAI 1 On-Court Performance Review | TipOffPh Sneakers & Gear',
    seoDescription: 'In-depth performance review of the ANTA KAI 1 tested on Philippine indoor hardwood and outdoor courts: traction, cushioning, and fit evaluated.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-06T18:00:00Z',
    createdAt: '2026-10-06T17:15:00Z'
  },
  {
    id: 'art-009',
    slug: 'mpbl-playoffs-2026-bracket-update-oct-10',
    title: '2026 MPBL Playoffs: Bracket Standings as of October 10',
    excerpt: 'The 2026 MPBL Playoffs have officially tipped off, and the top contenders are already proving why they earned home-court advantage. Based on the latest updated bracket for the Best-of-3 Quarterfinals, the heavyweights in both the North and South Divisions have successfully drawn first blood.',
    body: `The 2026 MPBL Playoffs have officially tipped off, and the top contenders are already proving why they earned home-court advantage. Based on the latest updated bracket for the Best-of-3 Quarterfinals, the heavyweights in both the North and South Divisions have successfully drawn first blood.

### North Division Quarterfinals Update

The upper echelon of the North Division took care of business in their opening matches. The #1, #2, and #3 seeds have all jumped to a 1-0 lead in their respective Best-of-3 series. The only series yet to record a result is the highly anticipated #4 vs. #5 seed matchup, which remains deadlocked at 0-0.

### South Division Quarterfinals Update

The South Division bracket perfectly mirrors the action up North. The #1, #2, and #3 seeds successfully defended their home turf to secure 1-0 advantages. Similar to the North, the #4 vs. #5 seed battle in the South has yet to notch a win for either side, sitting at 0-0.

### The Road to the National Finals

Teams are currently battling through the Quarterfinals and Semifinals, both of which are sudden-death Best-of-3 series. The survivors will advance to the grueling Best-of-5 Division Finals to crown the kings of the North and South. Ultimately, the two division champions will collide in the 2026 National Finals.

Stay tuned for more updates as the Best-of-3 Quarterfinals continue.`,
    primaryCategoryId: 'mpbl-news',
    topicIds: ['mpbl-news', 'mpbl'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'MPBL Official Media Bureau',
    sourceUrl: 'https://mpbl.ph',
    featuredImageUrl: '/img/mpbl-latest-playoff-bracket-oct-10.webp',
    imageAlt: '2026 MPBL Playoff bracket standings as of October 10 showing North and South division matchups',
    imageCredit: 'MPBL / TipOffPh Coverage Desk',
    seoTitle: '2026 MPBL Playoff Bracket: Top Seeds Dominate Quarterfinals',
    seoDescription: 'Get the latest 2026 MPBL Playoff bracket updates for October 10. Top seeds in both the North and South divisions secure early 1-0 Quarterfinal leads.',
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-10T06:30:00Z',
    createdAt: '2026-10-10T06:00:00Z'
  }
];

export const DEMO_SCORES: GameScore[] = [
  // 1. PBA
  {
    id: 'score-pba-01',
    league: 'PBA',
    leagueFullName: 'Philippine Basketball Association',
    leagueId: 'pba',
    leagueLogo: '/img/pba.png',
    eventName: "PBA Governors' Cup 2026 - Quarterfinals Game 3",
    stage: 'Quarterfinals',
    homeTeam: 'San Miguel Beermen',
    awayTeam: 'Meralco Bolts',
    homeScore: 108,
    awayScore: 103,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-09T10:00:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'RPTV / Pilipinas Live',
    sourceName: 'PBA Official Stats Desk',
    updatedAt: '2026-10-09T12:30:00Z'
  },
  {
    id: 'score-pba-02',
    league: 'PBA',
    leagueFullName: 'Philippine Basketball Association',
    leagueId: 'pba',
    leagueLogo: '/img/pba.png',
    eventName: "PBA Governors' Cup 2026 - Semifinals Game 1",
    stage: 'Semifinals',
    homeTeam: 'Barangay Ginebra',
    awayTeam: 'Magnolia Hotshots',
    homeScore: 92,
    awayScore: 89,
    status: 'live',
    statusDetail: 'Q4 2:18',
    gameTimeUtc: '2026-10-09T12:15:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'RPTV / Pilipinas Live',
    sourceName: 'PBA Official Stats Desk',
    updatedAt: '2026-10-09T14:05:00Z'
  },
  {
    id: 'score-pba-03',
    league: 'PBA',
    leagueFullName: 'Philippine Basketball Association',
    leagueId: 'pba',
    leagueLogo: '/img/pba.png',
    eventName: "PBA Governors' Cup 2026 - Semifinals Game 2",
    stage: 'Semifinals',
    homeTeam: 'TNT Tropang Giga',
    awayTeam: 'Rain or Shine Elasto Painters',
    status: 'upcoming',
    statusDetail: 'Tomorrow 5:00 PM PHT',
    gameTimeUtc: '2026-10-11T09:00:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'RPTV / Pilipinas Live',
    sourceName: 'PBA Official Operations',
    updatedAt: '2026-10-10T04:00:00Z'
  },

  // 2. MPBL
  {
    id: 'score-mpbl-01',
    league: 'MPBL',
    leagueFullName: 'Maharlika Pilipinas Basketball League',
    leagueId: 'mpbl',
    leagueLogo: '/img/mpbl.png',
    eventName: '2026 MPBL Playoffs - North Division Quarterfinals Game 2',
    stage: 'North Quarterfinals',
    homeTeam: 'Pampanga Giant Lanterns',
    awayTeam: 'San Juan Knights',
    homeScore: 84,
    awayScore: 81,
    status: 'final',
    statusDetail: 'Final (Pampanga leads 2-0)',
    gameTimeUtc: '2026-10-08T12:00:00Z',
    venue: 'Bren Z. Guiao Convention Center, San Fernando, Pampanga',
    broadcast: 'MediaQuest / MPBL Livestream',
    sourceName: 'MPBL Official Stats Desk',
    updatedAt: '2026-10-08T14:15:00Z'
  },
  {
    id: 'score-mpbl-02',
    league: 'MPBL',
    leagueFullName: 'Maharlika Pilipinas Basketball League',
    leagueId: 'mpbl',
    leagueLogo: '/img/mpbl.png',
    eventName: '2026 MPBL Playoffs - South Division Quarterfinals Game 1',
    stage: 'South Quarterfinals',
    homeTeam: 'Quezon Huskers',
    awayTeam: 'Zamboanga Master Sardines',
    homeScore: 78,
    awayScore: 71,
    status: 'live',
    statusDetail: 'Q4 5:44',
    gameTimeUtc: '2026-10-10T11:00:00Z',
    venue: 'Lucena Convention Center, Quezon Province',
    broadcast: 'MediaQuest / MPBL Livestream',
    sourceName: 'MPBL Official Stats Desk',
    updatedAt: '2026-10-10T12:30:00Z'
  },

  // 3. UAAP
  {
    id: 'score-uaap-01',
    league: 'UAAP',
    leagueFullName: 'University Athletic Association of the Philippines',
    leagueId: 'uaap',
    leagueLogo: '/img/uaap.webp',
    eventName: "UAAP Season 87 Men's Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'UP Fighting Maroons',
    awayTeam: 'DLSU Green Archers',
    homeScore: 76,
    awayScore: 72,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-08T08:00:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'One Sports / UAAP Varsity Channel',
    sourceName: 'UAAP Press Corps',
    updatedAt: '2026-10-08T10:15:00Z'
  },
  {
    id: 'score-uaap-02',
    league: 'UAAP',
    leagueFullName: 'University Athletic Association of the Philippines',
    leagueId: 'uaap',
    leagueLogo: '/img/uaap.webp',
    eventName: "UAAP Season 87 Men's Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'Ateneo Blue Eagles',
    awayTeam: 'UST Growling Tigers',
    homeScore: 68,
    awayScore: 71,
    status: 'live',
    statusDetail: 'Q3 1:30',
    gameTimeUtc: '2026-10-10T06:00:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'One Sports / UAAP Varsity Channel',
    sourceName: 'UAAP Press Corps',
    updatedAt: '2026-10-10T07:20:00Z'
  },

  // 4. NCAA
  {
    id: 'score-ncaa-01',
    league: 'NCAA',
    leagueFullName: 'NCAA Philippines Basketball',
    leagueId: 'ncaa',
    leagueLogo: '/img/ncaa.png',
    eventName: "NCAA Season 100 Seniors Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'San Beda Red Lions',
    awayTeam: 'Mapúa Cardinals',
    homeScore: 75,
    awayScore: 73,
    status: 'final',
    statusDetail: 'Final (OT)',
    gameTimeUtc: '2026-10-09T06:00:00Z',
    venue: 'Filoil EcoOil Centre, San Juan City',
    broadcast: 'GTV / Heart of Asia / GMA Sports',
    sourceName: 'NCAA Management Committee',
    updatedAt: '2026-10-09T08:45:00Z'
  },
  {
    id: 'score-ncaa-02',
    league: 'NCAA',
    leagueFullName: 'NCAA Philippines Basketball',
    leagueId: 'ncaa',
    leagueLogo: '/img/ncaa.png',
    eventName: "NCAA Season 100 Seniors Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'CSB Blazers',
    awayTeam: 'Letran Knights',
    status: 'upcoming',
    statusDetail: 'Sunday 2:30 PM PHT',
    gameTimeUtc: '2026-10-12T06:30:00Z',
    venue: 'Filoil EcoOil Centre, San Juan City',
    broadcast: 'GTV / GMA Sports Online',
    sourceName: 'NCAA Management Committee',
    updatedAt: '2026-10-10T03:00:00Z'
  },

  // 5. Gilas Pilipinas
  {
    id: 'score-gilas-01',
    league: 'Gilas Pilipinas',
    leagueFullName: 'Gilas Pilipinas (National Team & FIBA Qualifiers)',
    leagueId: 'gilas',
    leagueLogo: '/img/gilas-pilipinas.png',
    eventName: 'FIBA Asia Cup 2025 Qualifiers - Window 2',
    stage: 'Window 2 Group Phase',
    homeTeam: 'Philippines (Gilas)',
    awayTeam: 'New Zealand (Tall Blacks)',
    status: 'upcoming',
    statusDetail: 'Nov 21, 7:30 PM PHT',
    gameTimeUtc: '2026-11-21T11:30:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'One Sports / Pilipinas Live',
    sourceName: 'FIBA Asia Operations',
    updatedAt: '2026-10-09T08:00:00Z'
  },
  {
    id: 'score-gilas-02',
    league: 'Gilas Pilipinas',
    leagueFullName: 'Gilas Pilipinas (National Team & FIBA Qualifiers)',
    leagueId: 'gilas',
    leagueLogo: '/img/gilas-pilipinas.png',
    eventName: 'FIBA Asia Cup 2025 Qualifiers - Window 2',
    stage: 'Window 2 Group Phase',
    homeTeam: 'Philippines (Gilas)',
    awayTeam: 'Hong Kong',
    status: 'upcoming',
    statusDetail: 'Nov 24, 7:30 PM PHT',
    gameTimeUtc: '2026-11-24T11:30:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'One Sports / Pilipinas Live',
    sourceName: 'FIBA Asia Operations',
    updatedAt: '2026-10-09T08:00:00Z'
  },

  // 6. PSL
  {
    id: 'score-psl-01',
    league: 'PSL',
    leagueFullName: 'Pilipinas Super League',
    leagueId: 'psl',
    leagueLogo: '/img/PSL_Logo.png',
    eventName: "PSL President's Cup 2026 - National Championship Round",
    stage: 'Championship Round',
    homeTeam: 'Davao Occidental Tigers',
    awayTeam: 'Quezon City Stars',
    homeScore: 91,
    awayScore: 86,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-07T10:00:00Z',
    venue: 'Paco Arena Sports Center, Manila',
    broadcast: 'Solar Sports / PSL Facebook Live',
    sourceName: 'Pilipinas Super League Media',
    updatedAt: '2026-10-07T12:30:00Z'
  },
  {
    id: 'score-psl-02',
    league: 'PSL',
    leagueFullName: 'Pilipinas Super League',
    leagueId: 'psl',
    leagueLogo: '/img/PSL_Logo.png',
    eventName: "PSL President's Cup 2026 - Elimination Round",
    stage: 'Elimination Round',
    homeTeam: 'Biñan Tatak Gel',
    awayTeam: 'Manila Stars',
    status: 'upcoming',
    statusDetail: 'Saturday 6:00 PM PHT',
    gameTimeUtc: '2026-10-17T10:00:00Z',
    venue: 'Alonte Sports Arena, Biñan, Laguna',
    broadcast: 'Solar Sports / PSL Live',
    sourceName: 'Pilipinas Super League Media',
    updatedAt: '2026-10-10T02:00:00Z'
  },

  // 7. PBA D-League
  {
    id: 'score-d-league-01',
    league: 'PBA D-League',
    leagueFullName: 'PBA Developmental League',
    leagueId: 'd-league',
    leagueLogo: '/img/PBA_D-League_logo.png',
    eventName: "PBA D-League Aspirants' Cup 2026 - Finals Game 2",
    stage: 'Finals',
    homeTeam: 'EcoOil-DLSU Green Archers',
    awayTeam: 'Marinerong Pilipino-San Beda',
    homeScore: 88,
    awayScore: 82,
    status: 'final',
    statusDetail: 'Final (Series 2-0)',
    gameTimeUtc: '2026-10-06T07:30:00Z',
    venue: 'Ynares Sports Arena, Pasig City',
    broadcast: 'PBA Rush / Pilipinas Live',
    sourceName: 'PBA D-League Technical Desk',
    updatedAt: '2026-10-06T09:45:00Z'
  },

  // 8. VisMin Cup
  {
    id: 'score-vismin-01',
    league: 'VisMin Cup',
    leagueFullName: 'Pilipinas VisMin Super Cup',
    leagueId: 'vismin',
    leagueLogo: '/img/vismin-cup.png',
    eventName: 'Pilipinas VisMin Super Cup - Southern Conference Semifinals',
    stage: 'Southern Semifinals',
    homeTeam: 'Basilan Peace Riders',
    awayTeam: 'KCS Computer Specialist Mandaue',
    homeScore: 83,
    awayScore: 79,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-05T10:00:00Z',
    venue: 'City of Naga Gymnasium, Cebu',
    broadcast: 'VisMin Sports Channel / IBC 13',
    sourceName: 'VisMin Super Cup Operations',
    updatedAt: '2026-10-05T12:20:00Z'
  },

  // 9. NBL
  {
    id: 'score-nbl-01',
    league: 'NBL',
    leagueFullName: 'National Basketball League Pilipinas',
    leagueId: 'nbl',
    leagueLogo: '/img/nbl.jpg',
    eventName: "NBL Pilipinas Chairman's Cup 2026 - Regular Season",
    stage: 'Regular Season',
    homeTeam: 'Taguig Generals',
    awayTeam: 'Pampanga Delta',
    homeScore: 97,
    awayScore: 94,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-04T09:00:00Z',
    venue: 'Hagonoy Sports Complex, Taguig City',
    broadcast: 'Aliw Channel 23 / NBL TV Livestream',
    sourceName: 'NBL Pilipinas Media Desk',
    updatedAt: '2026-10-04T11:30:00Z'
  },

  // 10. EASL
  {
    id: 'score-easl-01',
    league: 'EASL',
    leagueFullName: 'East Asia Super League',
    leagueId: 'easl',
    leagueLogo: '/img/easl-logo.svg',
    eventName: 'EASL 2025-26 Season - Group Stage Marquee Clash',
    stage: 'Group Stage',
    homeTeam: 'Meralco Bolts (PBA)',
    awayTeam: 'Ryukyu Golden Kings (B.League)',
    homeScore: 89,
    awayScore: 93,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-08T11:10:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'One Sports / EASL Digital App',
    sourceName: 'EASL Official Operations',
    updatedAt: '2026-10-08T13:30:00Z'
  },
  {
    id: 'score-easl-02',
    league: 'EASL',
    leagueFullName: 'East Asia Super League',
    leagueId: 'easl',
    leagueLogo: '/img/easl-logo.svg',
    eventName: 'EASL 2025-26 Season - Group Stage Clash',
    stage: 'Group Stage',
    homeTeam: 'San Miguel Beermen (PBA)',
    awayTeam: 'Taoyuan Pauian Pilots (P.League+)',
    status: 'upcoming',
    statusDetail: 'Oct 23, 7:10 PM PHT',
    gameTimeUtc: '2026-10-23T11:10:00Z',
    venue: 'PhilSports Arena, Pasig City',
    broadcast: 'One Sports / Pilipinas Live',
    sourceName: 'EASL Official Operations',
    updatedAt: '2026-10-09T05:00:00Z'
  },

  // 11. NBA
  {
    id: 'score-nba-01',
    league: 'NBA',
    leagueFullName: 'National Basketball Association',
    leagueId: 'nba',
    leagueLogo: '/img/nba-logo.webp',
    eventName: 'NBA 2025-26 Pre-Season / Showcase',
    stage: 'Regular Showcase',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Los Angeles Lakers',
    homeScore: 114,
    awayScore: 109,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-09T01:30:00Z',
    venue: 'TD Garden, Boston, MA',
    broadcast: 'NBA TV Philippines / One Sports / Cignal Play',
    sourceName: 'NBA Official Stats Service',
    updatedAt: '2026-10-09T04:15:00Z'
  },
  {
    id: 'score-nba-02',
    league: 'NBA',
    leagueFullName: 'National Basketball Association',
    leagueId: 'nba',
    leagueLogo: '/img/nba-logo.webp',
    eventName: 'NBA 2025-26 Opening Week Primetime Clash',
    stage: 'Opening Week',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Dallas Mavericks',
    status: 'upcoming',
    statusDetail: 'Oct 22, 10:00 AM PHT',
    gameTimeUtc: '2026-10-22T02:00:00Z',
    venue: 'Chase Center, San Francisco, CA',
    broadcast: 'NBA TV Philippines / Pilipinas Live',
    sourceName: 'NBA Official Stats Service',
    updatedAt: '2026-10-10T01:00:00Z'
  },

  // 12. FIBA
  {
    id: 'score-fiba-01',
    league: 'FIBA',
    leagueFullName: 'FIBA Tournaments & Qualifiers',
    leagueId: 'fiba',
    leagueLogo: '/img/FIBA.webp',
    eventName: 'FIBA Olympic Qualifying Tournament - Group Stage',
    stage: 'Group Stage',
    homeTeam: 'Latvia',
    awayTeam: 'Philippines (Gilas)',
    homeScore: 80,
    awayScore: 89,
    status: 'final',
    statusDetail: 'Final (Historic Win)',
    gameTimeUtc: '2026-07-03T16:00:00Z',
    venue: 'Arena Riga, Riga, Latvia',
    broadcast: 'One Sports / Courtside 1891',
    sourceName: 'FIBA Official Results',
    updatedAt: '2026-07-03T18:15:00Z'
  },
  {
    id: 'score-fiba-02',
    league: 'FIBA',
    leagueFullName: 'FIBA Tournaments & Qualifiers',
    leagueId: 'fiba',
    leagueLogo: '/img/FIBA.webp',
    eventName: 'FIBA Olympic Qualifying Tournament - Semifinals',
    stage: 'Semifinals',
    homeTeam: 'Brazil',
    awayTeam: 'Philippines (Gilas)',
    homeScore: 71,
    awayScore: 60,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-07-06T12:30:00Z',
    venue: 'Arena Riga, Riga, Latvia',
    broadcast: 'One Sports / Courtside 1891',
    sourceName: 'FIBA Official Results',
    updatedAt: '2026-07-06T14:40:00Z'
  }
];
