<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import type { Article, Author, ContentType, ArticleStatus } from '~/shared/types';
import { CATEGORIES_REGISTRY } from '~/shared/categories';
import { 
  PenSquare, 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Globe, 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  ExternalLink,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  HelpCircle,
  FileText,
  RotateCcw,
  Lock,
  TrendingUp,
  Flame,
  Check,
  Tv
} from 'lucide-vue-next';
import type { FormattedNbaOddsGame } from '~/shared/nba-types';
import type { PhSportsMatch } from '~/shared/ph-sports-types';

const router = useRouter();
const route = useRoute();

// Route editing state
const articleId = computed(() => String(route.params.id || route.query.id || ''));
const isEditing = computed(() => Boolean(articleId.value && articleId.value !== 'new'));
const isLoadingArticle = ref(false);

// Auth state
const isAuthenticated = ref(false);
const authLoading = ref(true);
const currentUser = ref<any>(null);

// Form State
const form = ref<Partial<Article> & { targetKeyword?: string }>({
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  primaryCategoryId: 'mpbl-news',
  topicIds: [],
  authorId: 'author-carlo-mendoza',
  contentType: 'news',
  sourceName: '',
  sourceUrl: '',
  featuredImageUrl: '/img/mpbl-latest-playoff-bracket-oct-10.webp',
  imageAlt: '2026 MPBL Playoff Bracket Standings Update',
  imageCredit: 'TipOffPh / Sports Desk',
  targetKeyword: 'MPBL Playoffs 2026 bracket',
  seoTitle: '2026 MPBL Playoff Bracket: Top Seeds Dominate Quarterfinals',
  seoDescription: 'Get the latest 2026 MPBL Playoff bracket updates for October 10. Top seeds in both the North and South divisions secure early 1-0 Quarterfinal leads.',
  isFeatured: true,
  isBreaking: false,
  status: 'published',
  publishedAt: new Date().toISOString()
});

// Authors list
const authors = ref<Author[]>([
  { id: 'author-joaquin-santos', slug: 'joaquin-santos', name: 'Joaquin Santos', role: 'Senior PBA Reporter', bio: '', email: '', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'author-maria-reyes', slug: 'maria-reyes', name: 'Maria Reyes', role: 'Collegiate & Gilas Correspondent', bio: '', email: '', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { id: 'author-carlo-mendoza', slug: 'carlo-mendoza', name: 'Carlo Mendoza', role: 'Grassroots & MPBL Analyst', bio: '', email: '', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'author-rafael-dizon', slug: 'rafael-dizon', name: 'Rafael Dizon', role: 'Tactical Columnist', bio: '', email: '', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' }
]);

// League shortcuts with logos
const leagues = [
  { id: 'pba-news', name: 'PBA', logo: '/img/pba.png', desc: 'Philippine Basketball Association' },
  { id: 'mpbl-news', name: 'MPBL', logo: '/img/mpbl.png', desc: 'Maharlika Pilipinas Basketball League' },
  { id: 'uaap-basketball', name: 'UAAP', logo: '/img/uaap.webp', desc: 'University Athletic Association' },
  { id: 'ncaa-philippines', name: 'NCAA', logo: '/img/ncaa.png', desc: 'National Collegiate Athletic Association' },
  { id: 'gilas-pilipinas', name: 'Gilas Pilipinas', logo: '/img/gilas-pilipinas.png', desc: 'National Men’s Team' },
  { id: 'psl-news', name: 'PSL', logo: '/img/PSL_Logo.png', desc: 'Pilipinas Super League' },
  { id: 'd-league', name: 'D-League', logo: '/img/PBA_D-League_logo.png', desc: 'PBA D-League' },
  { id: 'vismin', name: 'VisMin Cup', logo: '/img/vismin-cup.png', desc: 'VisMin Super Cup' },
  { id: 'nbl', name: 'NBL', logo: '/img/nbl.jpg', desc: 'National Basketball League' },
  { id: 'easl', name: 'EASL', logo: '/img/easl-logo.svg', desc: 'East Asia Super League' },
  { id: 'nba', name: 'NBA', logo: '/img/nba-logo.webp', desc: 'National Basketball Association' },
  { id: 'fiba', name: 'FIBA', logo: '/img/FIBA.webp', desc: 'International Basketball' }
];

// UI states
const activeTab = ref<'editor' | 'serp' | 'preview'>('editor');
const imageSourceMode = ref<'media' | 'upload' | 'url'>('media');
const mediaList = ref<{ name: string; url: string; size: number }[]>([]);
const isUploading = ref(false);
const isSubmitting = ref(false);
const feedback = ref<{ type: 'success' | 'error'; message: string; publishedSlug?: string } | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const serpDevice = ref<'mobile' | 'desktop'>('mobile');

// NBA Odds Modal state for content writing
const isOddsModalOpen = ref(false);
const liveNbaGames = ref<FormattedNbaOddsGame[]>([]);
const isFetchingOdds = ref(false);
const oddsSearch = ref('');

// Local PH Sports (PBA / MPBL / Collegiate) Modal state
const isPhSportsModalOpen = ref(false);
const livePhMatches = ref<PhSportsMatch[]>([]);
const isFetchingPhSports = ref(false);
const phSportsSearch = ref('');

// Editor textarea ref for inserting markdown
const bodyTextareaRef = ref<HTMLTextAreaElement | null>(null);

// Character counts & stats
const titleLength = computed(() => (form.value.seoTitle || form.value.title || '').length);
const descLength = computed(() => (form.value.seoDescription || form.value.excerpt || '').length);
const wordCount = computed(() => {
  const text = (form.value.body || '').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
});
const readTimeMinutes = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)));

// Check authentication on mount
onMounted(async () => {
  try {
    const authRes = await $fetch<{ authenticated: boolean; user: any }>('/api/admin/me');
    if (authRes.authenticated) {
      isAuthenticated.value = true;
      currentUser.value = authRes.user;
    } else {
      isAuthenticated.value = false;
      router.push('/admin/login?redirect=' + encodeURIComponent(route.fullPath));
      return;
    }
  } catch {
    isAuthenticated.value = false;
    router.push('/admin/login?redirect=' + encodeURIComponent(route.fullPath));
    return;
  } finally {
    authLoading.value = false;
  }

  // Fetch available media
  loadMediaLibrary();

  // If editing an existing article, fetch and populate
  if (isEditing.value) {
    loadArticleForEdit(articleId.value);
  } else if (route.query.template === 'mpbl') {
    loadMPBLTemplate();
  } else if (route.query.template === 'pba') {
    loadPBATemplate();
  } else if (route.query.template === 'trade') {
    loadTradeTemplate();
  } else if (route.query.template === 'blank') {
    clearForm();
  }
});

async function loadArticleForEdit(targetId: string) {
  isLoadingArticle.value = true;
  try {
    const res = await $fetch<{ articles: Article[] }>('/api/admin/articles');
    const existing = res.articles.find(a => a.id === targetId || a.slug === targetId);
    if (existing) {
      form.value = {
        ...existing,
        targetKeyword: (existing as any).targetKeyword || existing.title
      };
    }
  } catch (err) {
    console.error('Failed to load article for editing', err);
  } finally {
    isLoadingArticle.value = false;
  }
}

async function loadMediaLibrary() {
  try {
    const res = await $fetch<{ media: { name: string; url: string; size: number }[] }>('/api/admin/media');
    if (res && res.media) {
      mediaList.value = res.media;
    }
  } catch (err) {
    console.error('Failed to load media list', err);
  }
}

function selectMediaImage(url: string, name: string) {
  form.value.featuredImageUrl = url;
  if (!form.value.imageAlt) {
    form.value.imageAlt = name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
  }
}

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploading.value = true;
  feedback.value = null;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await $fetch<{ success: boolean; url: string; filename: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    });

    if (res.success) {
      form.value.featuredImageUrl = res.url;
      if (!form.value.imageAlt) {
        form.value.imageAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      }
      await loadMediaLibrary();
      imageSourceMode.value = 'media';
    }
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: 'Failed to upload image: ' + (err?.data?.message || err?.message || 'Server error')
    };
  } finally {
    isUploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

function generateSlugFromTitle() {
  if (form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

function autoSyncSEO() {
  if (!form.value.seoTitle && form.value.title) {
    form.value.seoTitle = form.value.title.slice(0, 60);
  }
  if (!form.value.seoDescription && form.value.excerpt) {
    form.value.seoDescription = form.value.excerpt.slice(0, 155);
  }
}

// Markdown formatting helper
function insertMarkdown(prefix: string, suffix: string = '') {
  const textarea = bodyTextareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = form.value.body || '';
  const selected = text.substring(start, end);

  const replacement = `${prefix}${selected || 'text'}${suffix}`;
  form.value.body = text.substring(0, start) + replacement + text.substring(end);

  // Restore cursor
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
  }, 50);
}

// Template loader for fast MPBL / PBA posting
function loadMPBLTemplate() {
  form.value = {
    title: '2026 MPBL Playoffs: Bracket Standings as of October 10',
    slug: 'mpbl-playoffs-2026-bracket-update-oct-10',
    excerpt: 'Top seeds in both the North and South divisions take early 1-0 leads as the 2026 MPBL Playoffs kick off with fierce Best-of-3 Quarterfinal intensity.',
    body: `The 2026 MPBL Playoffs have officially tipped off, and the top contenders are already proving why they earned home-court advantage. Based on the latest updated bracket for the Best-of-3 Quarterfinals, the heavyweights in both the North and South Divisions have successfully drawn first blood.

### North Division Quarterfinals Update
The upper echelon of the North Division took care of business in their opening matches. The #1, #2, and #3 seeds have all jumped to a 1-0 lead in their respective Best-of-3 series. The only series yet to record a result is the highly anticipated #4 vs. #5 seed matchup, which remains deadlocked at 0-0.

### South Division Quarterfinals Update
The South Division bracket perfectly mirrors the action up North. The #1, #2, and #3 seeds successfully defended their home turf to secure 1-0 advantages. Similar to the North, the #4 vs. #5 seed battle in the South has yet to notch a win for either side, sitting at 0-0.

### The Road to the National Finals
Teams are currently battling through the Quarterfinals and Semifinals, both of which are sudden-death Best-of-3 series. The survivors will advance to the grueling Best-of-5 Division Finals to crown the kings of the North and South. Ultimately, the two division champions will collide in the 2026 National Finals.

Stay tuned for more updates as the Best-of-3 Quarterfinals continue.`,
    primaryCategoryId: 'mpbl-news',
    topicIds: ['mpbl-news'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'MPBL Media Bureau',
    sourceUrl: 'https://mpbl.ph',
    featuredImageUrl: '/img/mpbl-latest-playoff-bracket-oct-10.webp',
    imageAlt: '2026 MPBL Playoff Bracket Standings Update October 10',
    imageCredit: 'TipOffPh / Sports Desk',
    targetKeyword: 'MPBL Playoffs 2026 bracket',
    seoTitle: '2026 MPBL Playoff Bracket: Top Seeds Dominate Quarterfinals',
    seoDescription: 'Get the latest 2026 MPBL Playoff bracket updates for October 10. Top seeds in both the North and South divisions secure early 1-0 Quarterfinal leads.',
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: new Date().toISOString()
  };
}

function loadPBATemplate() {
  form.value = {
    title: "2026 PBA Governors' Cup: Beermen Hold Off Bolts in Dramatic Game 1 Opener",
    slug: 'pba-governors-cup-beermen-hold-off-bolts-game-1-opener',
    excerpt: 'San Miguel survived a frantic fourth-quarter comeback by Meralco behind clutch shotmaking down the stretch to seize a 108-103 victory at the Smart Araneta Coliseum.',
    body: `The San Miguel Beermen drew first blood in the 2026 PBA Governors' Cup Quarterfinals, fending off a spirited fourth-quarter rally by the Meralco Bolts to register a pulsating 108-103 victory on Wednesday night at the Smart Araneta Coliseum.

### High-Octane First Half Surge
San Miguel established their offensive rhythm early, executing crisp ball movement and dominating the offensive glass. The Beermen built a commanding 14-point cushion by halftime, capitalizing on second-chance opportunities and stifling perimeter rotations.

### Bolts Mount Fourth-Quarter Comeback
Meralco refused to go quietly into the night, unleashing an aggressive 16-4 run midway through the final frame to trim the deficit to just two points with under two minutes remaining. High-pressure trapping defense forced crucial turnovers, keeping the Big Dome crowd on the edge of their seats.

### Clutch Execution Seals the Deal
In the game's closing moments, veteran poise prevailed. Key defensive stops and ice-cold free throws in the final thirty seconds ensured San Miguel preserved their hard-fought advantage.

Game 2 of this Best-of-5 Quarterfinal series tips off on Friday night at the Mall of Asia Arena.`,
    primaryCategoryId: 'pba-news',
    topicIds: ['pba-news'],
    authorId: 'author-joaquin-santos',
    contentType: 'news',
    sourceName: 'PBA Media Bureau',
    sourceUrl: 'https://pba.ph',
    featuredImageUrl: '/img/articles/san-miguel-beermen-dominance.webp',
    imageAlt: "San Miguel Beermen vs Meralco Bolts 2026 PBA Governors' Cup Game 1",
    imageCredit: 'TipOffPh / Sports Desk',
    targetKeyword: "PBA Governors' Cup 2026 Beermen vs Bolts",
    seoTitle: "2026 PBA Governors' Cup: Beermen Hold Off Bolts in Game 1 Thriller",
    seoDescription: "San Miguel holds off a fierce fourth-quarter rally by Meralco to capture a 108-103 victory in Game 1 of the 2026 PBA Governors' Cup Quarterfinals.",
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: new Date().toISOString()
  };
}

function loadTradeTemplate() {
  form.value = {
    title: 'PBA Trade Wire: NorthPort and Magnolia Finalize Five-Player Blockbuster',
    slug: 'pba-trade-wire-northport-magnolia-finalize-blockbuster-swap',
    excerpt: 'The PBA Commissioner’s Office has approved a major multi-player trade involving key rotation pieces and future draft considerations between NorthPort and Magnolia.',
    body: `In a blockbuster transaction approved by the PBA Commissioner's Office on Friday afternoon, the NorthPort Batang Pier and Magnolia Hotshots finalized a major five-player trade reshaping both franchises' rotation ahead of the postseason push.

### Trade Breakdown
- **Magnolia receives:** Starting veteran forward and 2027 second-round draft pick
- **NorthPort receives:** Two combo guards, athletic wing defender, and cash considerations

### Analytical Rationale & Team Fit
Insiders note that Magnolia sought immediate rim protection and offensive rebounding to bolster their interior depth, while NorthPort acquires much-needed perimeter shooting and youthful transition tempo.

Both organizations confirmed that all acquired players have successfully passed medical clearances and are eligible to suit up immediately.`,
    primaryCategoryId: 'rumors-and-trades',
    topicIds: ['pba-news', 'rumors-and-trades'],
    authorId: 'author-rafael-dizon',
    contentType: 'rumor',
    sourceName: 'PBA Commissioner Office Bulletin',
    sourceUrl: 'https://pba.ph',
    featuredImageUrl: '/img/articles/pba-trade-rumors-blockbuster.webp',
    imageAlt: 'PBA Trade Wire Transaction Bulletin',
    imageCredit: 'TipOffPh Trade Desk',
    targetKeyword: 'PBA trade rumors 2026 NorthPort Magnolia',
    seoTitle: 'PBA Trade Wire: NorthPort and Magnolia Finalize Blockbuster Swap',
    seoDescription: 'The PBA Commissioner’s Office approves a major multi-player trade between NorthPort and Magnolia ahead of the 2026 playoff stretch.',
    isFeatured: false,
    isBreaking: true,
    status: 'published',
    publishedAt: new Date().toISOString()
  };
}

function loadNbaOddsTemplate(game?: FormattedNbaOddsGame) {
  const targetGame = game || liveNbaGames.value[0];
  const away = targetGame ? targetGame.away_team : 'Boston Celtics';
  const home = targetGame ? targetGame.home_team : 'Detroit Pistons';
  const spreadPt = targetGame?.consensus?.spread?.point ?? 2.5;
  const totalPt = targetGame?.consensus?.total?.point ?? 221.5;

  form.value = {
    title: `NBA Betting Preview: ${away} vs. ${home} Odds, Spread & Projected Totals`,
    slug: `nba-odds-preview-${away.toLowerCase().replace(/\s+/g, '-')}-vs-${home.toLowerCase().replace(/\s+/g, '-')}`,
    excerpt: `Complete betting lines, opening spreads, and consensus moneyline pricing for the upcoming clash between the ${away} and ${home}.`,
    body: `### Marquee Matchup: ${away} @ ${home}

As the NBA regular season schedule heats up, oddsmakers across major sportsbooks have posted opening consensus lines for the upcoming showdown between the **${away}** and the **${home}**.

### 📊 Verified Sportsbook Betting Lines
- **Point Spread:** ${home} ${spreadPt > 0 ? '+' : ''}${spreadPt} (Handicap)
- **Over/Under Total:** ${totalPt} Points
- **Consensus Source:** NBA Sports API (Live Aggregator)

### Key Tactical Matchup Factors
1. **Pace & Possessions:** Both squads rank among the most dynamic fast-break offenses in the league, making the projected ${totalPt} total a critical threshold for live bettors.
2. **Defensive Rotations:** Interior rim protection and perimeter closeouts will dictate whether the ${home} can cover the projected spread on home court.

*Lines are subject to movement ahead of opening tip-off. Follow TipOffPh for real-time basketball updates and verified scores.*`,
    primaryCategoryId: 'nba',
    topicIds: ['nba-news'],
    authorId: authors.value[0]?.id || 'author-rafael-dizon',
    contentType: 'editorial',
    sourceName: 'NBA Sports API (Worker Feed)',
    sourceUrl: 'https://nba-sports-api.ieatmanhwua.workers.dev/',
    featuredImageUrl: '/img/articles/warriors-lakers-curry-bronny.webp',
    imageAlt: `NBA Odds ${away} vs ${home}`,
    imageCredit: 'TipOffPh / Sports Desk',
    targetKeyword: `NBA odds ${away} ${home}`,
    seoTitle: `NBA Odds: ${away} vs. ${home} Spread & Predictions`,
    seoDescription: `Live betting lines, point spread, and odds analysis for ${away} vs ${home} on TipOffPh.`,
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: new Date().toISOString()
  };
}

async function openOddsModal() {
  isOddsModalOpen.value = true;
  if (liveNbaGames.value.length === 0) {
    await fetchLiveNbaOdds();
  }
}

async function fetchLiveNbaOdds() {
  isFetchingOdds.value = true;
  try {
    const res = await $fetch<any>('/api/nba/odds', { query: { limit: 50 } });
    liveNbaGames.value = res.games || [];
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: 'Failed to pull live NBA odds: ' + (err.message || 'Error')
    };
  } finally {
    isFetchingOdds.value = false;
  }
}

function insertOddsSnippet(game: FormattedNbaOddsGame) {
  const dateStr = new Date(game.commence_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila'
  });

  const bm = game.bookmakers?.[0];
  const spread = game.consensus?.spread;
  const total = game.consensus?.total;
  const h2h = game.consensus?.h2h;

  const snippet = `
> ### 📊 NBA Odds Insight: ${game.away_team} at ${game.home_team}
> **Tip-off:** ${dateStr} (Manila Time)  
> **Market Consensus (${bm?.title || 'Consensus'}):**  
> • **Spread:** ${game.home_team} ${spread?.point !== undefined && spread.point > 0 ? '+' : ''}${spread?.point ?? 'PK'}  
> • **Moneyline:** ${game.away_team} (${h2h?.awayBestPrice ?? '—'}) | ${game.home_team} (${h2h?.homeBestPrice ?? '—'})  
> • **Over/Under Total:** ${total?.point ?? '—'} points  
\n`;

  const textarea = bodyTextareaRef.value;
  if (!textarea) {
    form.value.body = (form.value.body || '') + '\n' + snippet;
  } else {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.value.body || '';
    form.value.body = text.substring(0, start) + snippet + text.substring(end);
  }
  isOddsModalOpen.value = false;
}

async function openPhSportsModal() {
  isPhSportsModalOpen.value = true;
  if (livePhMatches.value.length === 0) {
    await fetchLivePhSports();
  }
}

async function fetchLivePhSports() {
  isFetchingPhSports.value = true;
  try {
    const res = await $fetch<any>('/api/ph-sports');
    livePhMatches.value = res.allMatches || [];
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: 'Failed to retrieve local PH sports data: ' + (err.message || 'Error')
    };
  } finally {
    isFetchingPhSports.value = false;
  }
}

function insertPhSportsSnippet(match: PhSportsMatch) {
  const comp = match.competition || match.streamLabel || 'Philippine Basketball';
  const statusStr = match.status === 'live' 
    ? `🔴 **LIVE** (${match.clock || 'In Play'}) — Score: ${match.homeScore} - ${match.awayScore}`
    : match.status === 'finished'
      ? `🏁 **Final Score:** ${match.homeScore} - ${match.awayScore}`
      : `📅 **Tip-off:** ${match.manilaTimeFormatted || 'Scheduled'}`;

  const signalText = match.signals && match.signals.length > 0 && match.signals[0]
    ? `\n> • **Match Intelligence:** Pick ${match.signals[0].pickLabel} (${match.signals[0].confidence}% Confidence)`
    : '';

  const snippet = `
> ### 🇵🇭 ${match.home.name} vs. ${match.away.name}
> **Tournament:** ${comp}  
> **Status:** ${statusStr}  
> **Broadcast / Relay:** ${match.hasStream ? 'Live Digital Stream (One Sports / Pilipinas Live)' : 'RPTV / PBA Rush / Pilipinas Live'}  
> **Venue:** ${match.venue || 'Smart Araneta Coliseum / PhilSports Arena'}${signalText}
\n`;

  const textarea = bodyTextareaRef.value;
  if (!textarea) {
    form.value.body = (form.value.body || '') + '\n' + snippet;
  } else {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.value.body || '';
    form.value.body = text.substring(0, start) + snippet + text.substring(end);
  }
  isPhSportsModalOpen.value = false;
}

function loadPbaGameTemplate(match?: PhSportsMatch) {
  const target = match || livePhMatches.value.find(m => /pba/i.test(m.competition || m.streamLabel || '')) || livePhMatches.value[0];
  const home = target ? target.home.name : 'Barangay Ginebra San Miguel';
  const away = target ? target.away.name : 'San Miguel Beermen';
  const comp = target ? (target.competition || target.streamLabel) : 'PBA Governors\' Cup';

  form.value = {
    title: `PBA Governors' Cup Climax: ${away} vs. ${home} Match Preview & Strategic Analysis`,
    slug: `pba-governors-cup-${away.toLowerCase().replace(/\s+/g, '-')}-vs-${home.toLowerCase().replace(/\s+/g, '-')}`,
    excerpt: `Crucial hardwood showdown in the ${comp} as ${away} takes on ${home} in a battle of championship contenders.`,
    body: `### Marquee Matchup: ${away} vs. ${home}

The energy at the arena reaches fever pitch as the **${away}** square off against the **${home}** in this high-stakes fixture in the **${comp}**.

### 🏀 Live Match Details & Broadcast
- **Event:** ${comp}
- **Tip-off Schedule:** ${target?.manilaTimeFormatted || 'Tonight 7:30 PM PHT'}
- **Venue:** ${target?.venue || 'Smart Araneta Coliseum / PhilSports Arena'}
- **Official Broadcast:** One Sports, PBA Rush & Pilipinas Live

### Tactical Matchup Keys
1. **Pace and Half-Court Execution:** Controlling the transition tempo and limiting turnovers will decide who commands the tempo down the stretch.
2. **Paint Presence & Rebounding:** Second-chance points off the offensive glass will be decisive against aggressive interior defensive schemes.
3. **Closing Lineup Execution:** Clutch shot-making in the final two minutes will dictate the outcome of this clash.

*Catch the latest PBA updates, verified scores, and local sports coverage right here on TipOffPh.*`,
    primaryCategoryId: 'pba-news',
    topicIds: ['pba-news'],
    authorId: authors.value[0]?.id || 'author-rafael-dizon',
    contentType: 'news',
    sourceName: 'TipOffPh Sports Intelligence',
    sourceUrl: 'https://live88.eu.cc/api/v1/matches?site=-Qw82foL4XnLt_vBp8LVXjwW&sport=pba',
    featuredImageUrl: target?.home.logo || '/img/pba-logo.webp',
    imageAlt: `PBA ${away} vs ${home}`,
    imageCredit: 'TipOffPh / Sports Desk',
    targetKeyword: `PBA ${away} ${home}`,
    seoTitle: `PBA Governors' Cup: ${away} vs. ${home} Preview | TipOffPh`,
    seoDescription: `Comprehensive game preview, key tactical matchups, and broadcast details for ${away} vs ${home}.`,
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: new Date().toISOString()
  };
}

function clearForm() {
  form.value = {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    primaryCategoryId: 'pba-news',
    topicIds: [],
    authorId: authors.value[0]?.id || '',
    contentType: 'news',
    sourceName: '',
    sourceUrl: '',
    featuredImageUrl: '/img/mpbl-latest-playoff-bracket-oct-10.webp',
    imageAlt: '',
    imageCredit: 'TipOffPh Desk',
    targetKeyword: '',
    seoTitle: '',
    seoDescription: '',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: new Date().toISOString()
  };
}

// Submission handler
async function handlePublish(statusOverride?: ArticleStatus) {
  if (statusOverride) {
    form.value.status = statusOverride;
  }

  if (!form.value.title?.trim()) {
    feedback.value = { type: 'error', message: 'Article headline (H1 Title) is required.' };
    return;
  }

  if (!form.value.slug?.trim()) {
    generateSlugFromTitle();
  }

  if (!form.value.excerpt?.trim()) {
    feedback.value = { type: 'error', message: 'Lead Excerpt / Summary is required.' };
    return;
  }

  if (!form.value.body?.trim()) {
    feedback.value = { type: 'error', message: 'Article body content is required.' };
    return;
  }

  isSubmitting.value = true;
  feedback.value = null;

  try {
    if (isEditing.value && articleId.value) {
      const res = await $fetch<{ success: boolean; article: Article }>(`/api/admin/articles/${articleId.value}`, {
        method: 'PUT',
        body: form.value
      });

      if (res.success && res.article) {
        feedback.value = {
          type: 'success',
          message: `Article "${res.article.title}" updated successfully!`,
          publishedSlug: res.article.slug
        };
      }
    } else {
      const res = await $fetch<{ success: boolean; article: Article }>('/api/admin/articles', {
        method: 'POST',
        body: form.value
      });

      if (res.success && res.article) {
        feedback.value = {
          type: 'success',
          message: `Article "${res.article.title}" published successfully!`,
          publishedSlug: res.article.slug
        };
      }
    }
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: err?.data?.message || err?.message || 'Failed to publish post. Please check fields.'
    };
  } finally {
    isSubmitting.value = false;
  }
}

useHead({
  title: 'Publish Story & News Posting Studio | TipOffPh CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});
</script>

<template>
  <!-- Loading state -->
  <div v-if="authLoading" class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
    <div class="flex items-center gap-2 text-sm text-slate-400">
      <span class="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
      <span>Verifying Editorial Access...</span>
    </div>
  </div>

  <!-- Locked state for unauthorized viewers -->
  <div v-else-if="!isAuthenticated" class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
    <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center space-y-4 shadow-xl">
      <div class="w-12 h-12 bg-amber-500/10 text-[#E67E22] rounded-full flex items-center justify-center mx-auto">
        <Lock class="w-6 h-6" />
      </div>
      <h2 class="text-lg font-bold text-white">Administrator Access Only</h2>
      <p class="text-xs text-slate-400 leading-relaxed">
        This blog posting studio is reserved for authenticated TipOffPh administrators and editors. Public viewers do not have permission to view or post content here.
      </p>
      <NuxtLink 
        :to="'/admin/login?redirect=' + encodeURIComponent(route.fullPath)"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E67E22] hover:bg-amber-600 text-slate-950 font-black text-xs rounded-md transition-colors"
      >
        Sign in to Admin Console
      </NuxtLink>
    </div>
  </div>

  <!-- Authenticated Admin Studio -->
  <div v-else class="min-h-screen bg-slate-100/70 pb-16">
    <!-- Admin Universal Top Bar -->
    <div class="bg-[#1e293b] text-slate-300 border-b border-slate-700 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="flex items-center gap-2 font-bold text-white hover:text-[#E67E22] transition-colors">
            <img src="/img/TipOffPh_logo.png" alt="TipOffPh" class="h-5 w-auto object-contain" />
            <span>CMS</span>
          </NuxtLink>
          <span class="text-slate-600">/</span>
          <nav class="flex items-center gap-3">
            <NuxtLink to="/admin" class="hover:text-white transition-colors">Dashboard</NuxtLink>
            <NuxtLink to="/admin/post" class="text-amber-400 font-bold transition-colors">Story Publisher</NuxtLink>
            <NuxtLink to="/admin/articles" class="hover:text-white transition-colors">All Articles</NuxtLink>
            <NuxtLink to="/admin/settings" class="hover:text-white transition-colors">DB &amp; Hostinger</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/" target="_blank" class="hover:text-amber-400 text-slate-400 flex items-center gap-1 text-[11px] transition-colors">
            <span>View Public Site</span>
            <ExternalLink class="w-3 h-3" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Top Studio Header -->
    <header class="sticky top-0 z-40 bg-[#0f172a] text-white border-b border-slate-800 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <NuxtLink 
            to="/admin" 
            class="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Return to Admin"
          >
            <ArrowLeft class="w-5 h-5" />
          </NuxtLink>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <h1 class="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                TipOff<span class="text-[#E67E22]">Ph</span> {{ isEditing ? 'Edit Story' : 'Story Publisher' }}
                <span v-if="isEditing" class="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono">
                  ID: {{ articleId }}
                </span>
              </h1>
              <p class="text-[11px] text-slate-400 hidden sm:block">
                {{ isEditing ? 'Modify content, tags, SEO metadata, and syndicate updates' : 'Create & syndicate basketball news, bracket updates, and analysis' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Mode Tabs & Action Buttons -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- View Tabs -->
          <div class="bg-slate-800/90 p-1 rounded-lg flex items-center text-xs">
            <button 
              type="button"
              @click="activeTab = 'editor'"
              class="px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5"
              :class="activeTab === 'editor' ? 'bg-[#E67E22] text-white shadow-sm' : 'text-slate-300 hover:text-white'"
            >
              <FileText class="w-3.5 h-3.5" /> Editor
            </button>
            <button 
              type="button"
              @click="activeTab = 'serp'"
              class="px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5"
              :class="activeTab === 'serp' ? 'bg-[#E67E22] text-white shadow-sm' : 'text-slate-300 hover:text-white'"
            >
              <Globe class="w-3.5 h-3.5" /> Google SERP
            </button>
            <button 
              type="button"
              @click="activeTab = 'preview'"
              class="px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5"
              :class="activeTab === 'preview' ? 'bg-[#E67E22] text-white shadow-sm' : 'text-slate-300 hover:text-white'"
            >
              <Eye class="w-3.5 h-3.5" /> Live Preview
            </button>
          </div>

          <!-- Draft Button -->
          <button 
            type="button"
            @click="handlePublish('draft')"
            :disabled="isSubmitting"
            class="px-3 py-1.5 border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>

          <!-- Publish Action -->
          <button 
            type="button"
            @click="handlePublish('published')"
            :disabled="isSubmitting"
            class="px-4 py-1.5 bg-[#E67E22] hover:bg-amber-600 text-white text-xs font-black rounded shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>{{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Story' : 'Publish Post') }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Loading Indicator if editing -->
    <div v-if="isLoadingArticle" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-center gap-2 animate-pulse">
        <RotateCcw class="w-4 h-4 animate-spin text-amber-600" />
        <span>Loading existing article data...</span>
      </div>
    </div>

    <!-- Feedback Notice Bar -->
    <div v-if="feedback" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div 
        class="p-4 rounded-lg text-xs flex items-center justify-between gap-3 shadow-sm border"
        :class="feedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'"
      >
        <div class="flex items-center gap-2.5">
          <CheckCircle v-if="feedback.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0" />
          <AlertCircle v-else class="w-5 h-5 text-red-600 shrink-0" />
          <span class="font-medium">{{ feedback.message }}</span>
        </div>
        <div v-if="feedback.publishedSlug" class="flex items-center gap-2">
          <NuxtLink 
            :to="`/news/${feedback.publishedSlug}`"
            target="_blank"
            class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1"
          >
            View Live Article <ExternalLink class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quick Tool Ribbon -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
      <!-- Word Count & Goals -->
      <div class="flex items-center gap-3 bg-white px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 shadow-sm">
        <span>Word Count: <strong class="text-slate-900">{{ wordCount }}</strong> words</span>
        <span class="text-slate-300">|</span>
        <span>Est. Read: <strong class="text-slate-900">{{ readTimeMinutes }} min</strong></span>
        <span class="text-slate-300">|</span>
        <span class="inline-flex items-center gap-1">
          <span 
            class="w-2 h-2 rounded-full" 
            :class="wordCount >= 280 && wordCount <= 350 ? 'bg-emerald-500' : 'bg-amber-400'"
          ></span>
          <span class="text-[11px] text-slate-500">300-word Quick Update Indexing goal</span>
        </span>
      </div>

      <!-- Quick Template Shortcuts -->
      <div class="flex items-center flex-wrap gap-2">
        <span class="text-slate-400 text-[11px]">Quick Templates:</span>
        <button 
          type="button" 
          @click="loadMPBLTemplate"
          class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-bold transition-colors"
        >
          MPBL Playoff Bracket
        </button>
        <button 
          type="button" 
          @click="loadPBATemplate"
          class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 rounded text-[11px] font-bold transition-colors"
        >
          PBA Game Report
        </button>
        <button 
          type="button" 
          @click="loadTradeTemplate"
          class="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded text-[11px] font-bold transition-colors"
        >
          Trade Wire
        </button>
        <button 
          type="button" 
          @click="loadNbaOddsTemplate()"
          class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
        >
          <TrendingUp class="w-3 h-3 text-emerald-600" />
          <span>NBA Odds Story</span>
        </button>
        <button 
          type="button" 
          @click="loadPbaGameTemplate()"
          class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-900 border border-red-300 rounded text-[11px] font-bold transition-colors flex items-center gap-1"
        >
          <Tv class="w-3 h-3 text-red-600" />
          <span>PBA Game Story</span>
        </button>
        <button 
          type="button" 
          @click="openPhSportsModal"
          class="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
        >
          <Tv class="w-3 h-3 text-amber-300" />
          <span>Insert PBA &amp; PH Scores</span>
        </button>
        <button 
          type="button" 
          @click="openOddsModal"
          class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
        >
          <TrendingUp class="w-3 h-3 text-amber-400" />
          <span>Insert NBA Odds</span>
        </button>
        <button 
          type="button" 
          @click="clearForm"
          class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] transition-colors"
        >
          <RotateCcw class="w-3 h-3 inline mr-0.5" /> Reset Blank
        </button>
      </div>
    </div>

    <!-- Main Workspace Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      <!-- TAB 1: MAIN EDITOR -->
      <div v-show="activeTab === 'editor'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 2 Columns: Core Content, Body, SEO Suite -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Box 1: Core Story Fields -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <PenSquare class="w-4 h-4 text-[#E67E22]" /> Story Headline &amp; Lead
            </h2>

            <!-- Title Tag / Headline -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Article Headline (H1 Title) *
                </label>
                <span class="text-[11px] text-slate-400">{{ (form.title || '').length }} chars</span>
              </div>
              <input 
                v-model="form.title" 
                type="text" 
                @blur="generateSlugFromTitle(); autoSyncSEO()"
                placeholder="e.g. 2026 MPBL Playoffs: Bracket Standings as of October 10"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:border-[#E67E22] focus:bg-white transition-colors"
              />
            </div>

            <!-- Slug -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  URL Slug *
                </label>
                <button 
                  type="button" 
                  @click="generateSlugFromTitle" 
                  class="text-[11px] text-[#E67E22] hover:underline font-medium"
                >
                  Generate from Headline
                </button>
              </div>
              <div class="flex items-center">
                <span class="bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg px-3 py-2 text-xs font-mono text-slate-500 select-none">
                  tipoffph.com/news/
                </span>
                <input 
                  v-model="form.slug" 
                  type="text" 
                  placeholder="mpbl-playoffs-2026-bracket-update-oct-10"
                  class="w-full bg-slate-50 border border-slate-300 rounded-r-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#E67E22] focus:bg-white"
                />
              </div>
            </div>

            <!-- Excerpt -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Lead Excerpt (Summary for Cards &amp; Indexing) *
                </label>
                <span class="text-[11px] text-slate-400">{{ (form.excerpt || '').length }} chars</span>
              </div>
              <textarea 
                v-model="form.excerpt"
                rows="2"
                placeholder="Brief 1-2 sentence lead summarizing the primary game outcome, bracket standings, or breaking bulletin..."
                class="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-[#E67E22] focus:bg-white leading-relaxed"
              ></textarea>
            </div>
          </div>

          <!-- Box 2: Article Body with Formatting Toolbar -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 class="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FileText class="w-4 h-4 text-[#E67E22]" /> Article Body Content *
              </h2>
              <span class="text-xs text-slate-500 font-mono">{{ wordCount }} words</span>
            </div>

            <!-- Markdown Toolbar -->
            <div class="flex flex-wrap items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-slate-700">
              <button 
                type="button" 
                @click="insertMarkdown('### ')" 
                class="px-2 py-1 hover:bg-white rounded text-xs font-bold flex items-center gap-0.5" 
                title="Subheading H3 (###)"
              >
                <Heading3 class="w-3.5 h-3.5" /> H3
              </button>
              <button 
                type="button" 
                @click="insertMarkdown('## ')" 
                class="px-2 py-1 hover:bg-white rounded text-xs font-bold flex items-center gap-0.5" 
                title="Section Heading H2 (##)"
              >
                <Heading2 class="w-3.5 h-3.5" /> H2
              </button>
              <div class="w-px h-4 bg-slate-300 mx-0.5"></div>
              <button 
                type="button" 
                @click="insertMarkdown('**', '**')" 
                class="p-1 hover:bg-white rounded" 
                title="Bold (**text**)"
              >
                <Bold class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                @click="insertMarkdown('*', '*')" 
                class="p-1 hover:bg-white rounded" 
                title="Italic (*text*)"
              >
                <Italic class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                @click="insertMarkdown('> ')" 
                class="p-1 hover:bg-white rounded" 
                title="Blockquote (> quote)"
              >
                <Quote class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                @click="insertMarkdown('- ')" 
                class="p-1 hover:bg-white rounded" 
                title="Bullet List (- item)"
              >
                <List class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                @click="insertMarkdown('1. ')" 
                class="p-1 hover:bg-white rounded" 
                title="Numbered List (1. item)"
              >
                <ListOrdered class="w-3.5 h-3.5" />
              </button>
              <div class="w-px h-4 bg-slate-300 mx-0.5"></div>
              <button 
                type="button" 
                @click="insertMarkdown('[Link Text](', ')')" 
                class="p-1 hover:bg-white rounded" 
                title="Insert Link"
              >
                <LinkIcon class="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                @click="insertMarkdown('![Image Alt](', ')')" 
                class="p-1 hover:bg-white rounded" 
                title="Insert Image"
              >
                <ImageIcon class="w-3.5 h-3.5" />
              </button>
              <div class="w-px h-4 bg-slate-300 mx-0.5"></div>
              <button 
                type="button" 
                @click="openPhSportsModal" 
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-900 rounded font-bold text-[11px]" 
                title="Insert PBA / MPBL / Local PH Sports Match Snippet"
              >
                <Tv class="w-3 h-3 text-red-600" />
                <span>+ PBA / PH Sports</span>
              </button>
              <button 
                type="button" 
                @click="openOddsModal" 
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-[11px]" 
                title="Insert NBA Live Odds & Scores Snippet"
              >
                <TrendingUp class="w-3 h-3 text-[#E67E22]" />
                <span>+ NBA Odds</span>
              </button>
            </div>

            <!-- Content Area -->
            <textarea 
              ref="bodyTextareaRef"
              v-model="form.body"
              rows="15"
              placeholder="Write the full report here... Use ### for subheadings like 'North Division Quarterfinals Update' and double line breaks for paragraphs."
              class="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 font-mono leading-relaxed focus:outline-none focus:border-[#E67E22] focus:bg-white"
            ></textarea>
          </div>

          <!-- Box 3: Dedicated SEO Metadata Suite (Google Indexing) -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 class="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Globe class="w-4 h-4 text-[#E67E22]" /> Search Engine Optimization (SEO Metadata)
              </h2>
              <button 
                type="button" 
                @click="activeTab = 'serp'"
                class="text-[11px] text-[#E67E22] hover:underline font-bold"
              >
                Preview Google Snippet &rarr;
              </button>
            </div>

            <!-- Target Keyword -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Target Keyword (Primary Focus Keyphrase) *
                </label>
                <span class="text-[11px] text-slate-400">e.g. MPBL Playoffs 2026 bracket</span>
              </div>
              <div class="relative">
                <input 
                  v-model="form.targetKeyword"
                  type="text" 
                  placeholder="MPBL Playoffs 2026 bracket"
                  class="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#E67E22] focus:bg-white"
                />
                <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <!-- SEO Title Tag -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  SEO Title Tag (HTML &lt;title&gt;) *
                </label>
                <div class="flex items-center gap-1.5">
                  <span 
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    :class="titleLength >= 50 && titleLength <= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ titleLength }} / 60 chars
                  </span>
                  <span class="text-[10px] text-slate-400">Ideal: 50-60</span>
                </div>
              </div>
              <input 
                v-model="form.seoTitle"
                type="text" 
                placeholder="2026 MPBL Playoff Bracket: Top Seeds Dominate Quarterfinals"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#E67E22] focus:bg-white"
              />
            </div>

            <!-- Meta Description -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  SEO Meta Description *
                </label>
                <div class="flex items-center gap-1.5">
                  <span 
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    :class="descLength >= 140 && descLength <= 160 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ descLength }} / 160 chars
                  </span>
                  <span class="text-[10px] text-slate-400">Ideal: 140-160</span>
                </div>
              </div>
              <textarea 
                v-model="form.seoDescription"
                rows="2"
                placeholder="Get the latest 2026 MPBL Playoff bracket updates for October 10. Top seeds in both the North and South divisions secure early 1-0 Quarterfinal leads."
                class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#E67E22] focus:bg-white leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Right 1 Column: League Picker, Image Manager, Publishing Controls -->
        <div class="space-y-6">
          
          <!-- Box A: League & Category Selector with Badges -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Primary League / Category</span>
              <span class="text-[10px] text-[#E67E22] font-bold uppercase">{{ form.primaryCategoryId }}</span>
            </h3>

            <!-- Clickable League Grid -->
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="lg in leagues" 
                :key="lg.id"
                type="button"
                @click="form.primaryCategoryId = lg.id"
                class="p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition-all"
                :class="form.primaryCategoryId === lg.id ? 'border-[#E67E22] bg-amber-50/70 shadow-sm ring-1 ring-[#E67E22]' : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <span class="w-7 h-7 rounded bg-white p-0.5 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <img :src="lg.logo" :alt="lg.name" class="w-full h-full object-contain" />
                </span>
                <span class="text-[11px] font-bold" :class="form.primaryCategoryId === lg.id ? 'text-[#E67E22]' : 'text-slate-800'">
                  {{ lg.name }}
                </span>
              </button>
            </div>

            <!-- Content Type -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Content Format
              </label>
              <select 
                v-model="form.contentType"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="news">News / Game Report</option>
                <option value="editorial">Bracket / Standings Update</option>
                <option value="rumor">Trade Rumor / Transaction</option>
                <option value="interview">Player / Coach Interview</option>
              </select>
            </div>

            <!-- Author Selector -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Author Byline
              </label>
              <select 
                v-model="form.authorId"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
              >
                <option v-for="ath in authors" :key="ath.id" :value="ath.id">
                  {{ ath.name }} ({{ ath.role }})
                </option>
              </select>
            </div>
          </div>

          <!-- Box B: Featured Image & Media Library Picker -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-800">
                Featured Image &amp; Media
              </h3>
              <!-- Source mode buttons -->
              <div class="flex items-center gap-1 text-[10px]">
                <button 
                  type="button" 
                  @click="imageSourceMode = 'media'"
                  class="px-2 py-0.5 rounded font-bold"
                  :class="imageSourceMode === 'media' ? 'bg-[#E67E22] text-white' : 'bg-slate-100 text-slate-600'"
                >
                  Library
                </button>
                <button 
                  type="button" 
                  @click="imageSourceMode = 'upload'"
                  class="px-2 py-0.5 rounded font-bold"
                  :class="imageSourceMode === 'upload' ? 'bg-[#E67E22] text-white' : 'bg-slate-100 text-slate-600'"
                >
                  Upload
                </button>
                <button 
                  type="button" 
                  @click="imageSourceMode = 'url'"
                  class="px-2 py-0.5 rounded font-bold"
                  :class="imageSourceMode === 'url' ? 'bg-[#E67E22] text-white' : 'bg-slate-100 text-slate-600'"
                >
                  URL
                </button>
              </div>
            </div>

            <!-- Current Image Preview -->
            <div v-if="form.featuredImageUrl" class="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img 
                :src="form.featuredImageUrl" 
                alt="Selected featured preview"
                class="w-full h-36 object-cover"
              />
              <div class="p-2 text-[10px] text-slate-500 truncate bg-white border-t border-slate-100">
                {{ form.featuredImageUrl }}
              </div>
            </div>

            <!-- Media Library Browser -->
            <div v-if="imageSourceMode === 'media'" class="space-y-2">
              <div class="text-[11px] font-semibold text-slate-600">Click an image to select:</div>
              <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50">
                <button 
                  v-for="img in mediaList" 
                  :key="img.url"
                  type="button"
                  @click="selectMediaImage(img.url, img.name)"
                  class="relative rounded border overflow-hidden transition-all hover:scale-105"
                  :class="form.featuredImageUrl === img.url ? 'ring-2 ring-[#E67E22] border-amber-500' : 'border-slate-200'"
                >
                  <img :src="img.url" :alt="img.name" class="w-full h-14 object-cover" />
                  <span class="block text-[9px] text-slate-700 truncate px-1 bg-white">{{ img.name }}</span>
                </button>
              </div>
            </div>

            <!-- Upload New Image Box -->
            <div v-else-if="imageSourceMode === 'upload'" class="space-y-2">
              <label 
                class="border-2 border-dashed border-slate-300 hover:border-[#E67E22] rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 transition-colors"
              >
                <Upload class="w-6 h-6 text-slate-400" />
                <span class="text-xs font-bold text-slate-700">Choose image file (.webp, .png, .jpg)</span>
                <span class="text-[10px] text-slate-400">File is saved directly to /public/img/</span>
                <input 
                  ref="fileInputRef" 
                  type="file" 
                  accept="image/*" 
                  @change="handleFileUpload" 
                  class="hidden" 
                />
              </label>
              <div v-if="isUploading" class="text-xs text-center text-amber-600 font-semibold animate-pulse">
                Uploading image...
              </div>
            </div>

            <!-- Custom URL Input -->
            <div v-else class="space-y-2">
              <label class="block text-xs font-semibold text-slate-700">Image Web Address</label>
              <input 
                v-model="form.featuredImageUrl"
                type="text" 
                placeholder="https://... or /img/..."
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
              />
            </div>

            <!-- Alt Text & Credit -->
            <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label class="block text-slate-600 font-semibold mb-1">Image Alt Text (SEO)</label>
                <input 
                  v-model="form.imageAlt"
                  type="text" 
                  placeholder="e.g. 2026 MPBL Playoff Bracket Standings Update"
                  class="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label class="block text-slate-600 font-semibold mb-1">Photo Credit</label>
                <input 
                  v-model="form.imageCredit"
                  type="text" 
                  placeholder="e.g. TipOffPh / Sports Desk"
                  class="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Box C: Publishing Controls -->
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
              Publishing Status
            </h3>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select 
                v-model="form.status"
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
              >
                <option value="published">Published Immediately</option>
                <option value="draft">Draft (Unlisted)</option>
                <option value="scheduled">Scheduled for Later</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Publication Timestamp (UTC)
              </label>
              <input 
                v-model="form.publishedAt"
                type="text" 
                class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800"
              />
            </div>

            <!-- Badges & Toggles -->
            <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input v-model="form.isFeatured" type="checkbox" class="w-4 h-4 rounded text-[#E67E22]" />
                <span class="font-bold text-slate-800">Pin as Featured Lead Story</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input v-model="form.isBreaking" type="checkbox" class="w-4 h-4 rounded text-[#E67E22]" />
                <span class="font-bold text-slate-800">Show on Breaking News Ticker</span>
              </label>
            </div>

            <!-- Big Bottom Publish Button -->
            <button 
              type="button"
              @click="handlePublish('published')"
              :disabled="isSubmitting"
              class="w-full py-2.5 bg-[#E67E22] hover:bg-amber-600 text-white font-black text-sm rounded-lg shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles class="w-4 h-4" />
              <span>{{ isSubmitting ? 'Publishing Story...' : 'Publish Post Now' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 2: GOOGLE SEARCH (SERP) LIVE PREVIEW -->
      <div v-show="activeTab === 'serp'" class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base font-black text-slate-900">Google Search Result Snippet Preview</h2>
              <p class="text-xs text-slate-500">Live preview of how this basketball story appears in Google Search and Google Discover</p>
            </div>

            <!-- Mobile / Desktop Switch -->
            <div class="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
              <button 
                type="button" 
                @click="serpDevice = 'mobile'"
                class="px-3 py-1 rounded font-bold"
                :class="serpDevice === 'mobile' ? 'bg-white shadow text-slate-900' : 'text-slate-500'"
              >
                Mobile View
              </button>
              <button 
                type="button" 
                @click="serpDevice = 'desktop'"
                class="px-3 py-1 rounded font-bold"
                :class="serpDevice === 'desktop' ? 'bg-white shadow text-slate-900' : 'text-slate-500'"
              >
                Desktop View
              </button>
            </div>
          </div>

          <!-- Realistic Google SERP Card -->
          <div 
            class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 transition-all font-sans"
            :class="serpDevice === 'mobile' ? 'max-w-md mx-auto ring-1 ring-slate-300' : 'max-w-2xl'"
          >
            <!-- Breadcrumbs / Site Favicon -->
            <div class="flex items-center gap-2 text-xs text-slate-800">
              <div class="w-6 h-6 rounded-full bg-[#E67E22] text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                TP
              </div>
              <div class="flex flex-col leading-tight">
                <span class="text-xs font-medium text-slate-900">TipOffPh</span>
                <span class="text-[11px] text-slate-500 truncate">
                  https://tipoffph.com › news › {{ form.slug || 'story-slug' }}
                </span>
              </div>
            </div>

            <!-- Blue Title Link -->
            <h3 class="text-lg text-[#1a0dab] hover:underline cursor-pointer font-normal leading-snug pt-1">
              {{ form.seoTitle || form.title || '2026 MPBL Playoff Bracket: Top Seeds Dominate Quarterfinals' }}
            </h3>

            <!-- Snippet Description -->
            <p class="text-xs text-[#4d5156] leading-relaxed">
              <span class="text-[#70757a]">Oct 10, 2026 — </span>
              {{ form.seoDescription || form.excerpt || 'Get the latest 2026 MPBL Playoff bracket updates for October 10. Top seeds in both the North and South divisions secure early 1-0 Quarterfinal leads.' }}
            </p>
          </div>

          <!-- SEO Checklist Card -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="space-y-1">
              <span class="text-slate-500 block font-semibold">Target Keyword</span>
              <span class="font-bold text-slate-900">{{ form.targetKeyword || 'None specified' }}</span>
              <span class="text-[10px] text-emerald-600 block">✓ Included in title and meta</span>
            </div>
            <div class="space-y-1">
              <span class="text-slate-500 block font-semibold">Title Tag Length</span>
              <span class="font-bold text-slate-900">{{ titleLength }} characters</span>
              <span class="text-[10px] block" :class="titleLength >= 50 && titleLength <= 60 ? 'text-emerald-600' : 'text-amber-600'">
                {{ titleLength >= 50 && titleLength <= 60 ? '✓ Optimal (50-60 chars)' : 'Needs attention' }}
              </span>
            </div>
            <div class="space-y-1">
              <span class="text-slate-500 block font-semibold">Meta Description Length</span>
              <span class="font-bold text-slate-900">{{ descLength }} characters</span>
              <span class="text-[10px] block" :class="descLength >= 140 && descLength <= 160 ? 'text-emerald-600' : 'text-amber-600'">
                {{ descLength >= 140 && descLength <= 160 ? '✓ Optimal (140-160 chars)' : 'Needs attention' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: FULL LIVE ARTICLE PREVIEW -->
      <div v-show="activeTab === 'preview'" class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-sm space-y-6">
          <!-- Category & Time -->
          <div class="flex items-center gap-3 text-xs">
            <span class="px-2.5 py-1 bg-[#E67E22] text-white font-black uppercase tracking-wider rounded">
              {{ form.primaryCategoryId }}
            </span>
            <span class="text-slate-500">October 10, 2026 • 2 min read</span>
          </div>

          <!-- Headline -->
          <h1 class="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
            {{ form.title || 'Untitled Story Headline' }}
          </h1>

          <!-- Lead Summary -->
          <p class="text-lg text-slate-700 italic border-l-4 border-[#E67E22] pl-4 py-1 leading-relaxed bg-amber-50/40 rounded-r">
            {{ form.excerpt || 'Lead excerpt summarizing the primary game outcome or tournament bracket.' }}
          </p>

          <!-- Byline -->
          <div class="flex items-center gap-3 py-3 border-y border-slate-100 text-xs">
            <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <img :src="authors.find(a => a.id === form.authorId)?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'" class="w-full h-full object-cover" />
            </div>
            <div>
              <div class="font-bold text-slate-900">{{ authors.find(a => a.id === form.authorId)?.name || 'Carlo Mendoza' }}</div>
              <div class="text-slate-500">{{ authors.find(a => a.id === form.authorId)?.role || 'Sports Desk Analyst' }}</div>
            </div>
          </div>

          <!-- Featured Image -->
          <div v-if="form.featuredImageUrl" class="space-y-1.5">
            <img 
              :src="form.featuredImageUrl" 
              :alt="form.imageAlt || form.title"
              class="w-full max-h-[480px] object-cover rounded-xl shadow-sm"
            />
            <div class="text-[11px] text-slate-400 text-right italic">
              Photo: {{ form.imageCredit || 'TipOffPh Staff' }}
            </div>
          </div>

          <!-- Rendered Markdown Body -->
          <div class="prose max-w-none text-slate-800 space-y-4 pt-4 text-base leading-relaxed">
            <template v-for="(block, idx) in (form.body || '').split('\n\n')" :key="idx">
              <h2 v-if="block.startsWith('## ')" class="text-2xl font-black text-slate-900 mt-6 pt-2 border-t border-slate-100">
                {{ block.replace('## ', '') }}
              </h2>
              <h3 v-else-if="block.startsWith('### ')" class="text-xl font-bold text-slate-900 mt-5 text-[#D35400]">
                {{ block.replace('### ', '') }}
              </h3>
              <blockquote v-else-if="block.startsWith('> ')" class="border-l-4 border-slate-300 pl-4 py-1 italic text-slate-600">
                {{ block.replace('> ', '') }}
              </blockquote>
              <p v-else class="text-slate-800">
                {{ block }}
              </p>
            </template>
          </div>
        </div>
      </div>

    </main>

    <!-- NBA Live Odds & Scores Insertion Modal for Article Authoring -->
    <div 
      v-if="isOddsModalOpen" 
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div class="flex items-center gap-2.5">
            <TrendingUp class="w-5 h-5 text-amber-400" />
            <div>
              <h3 class="font-black text-sm uppercase tracking-wider text-white">
                NBA Odds &amp; Scores Feed
              </h3>
              <p class="text-[11px] text-slate-300">
                Pulls live odds &amp; lines from <code class="text-amber-300 font-mono">nba-sports-api.ieatmanhwua.workers.dev</code>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              @click="fetchLiveNbaOdds" 
              :disabled="isFetchingOdds"
              class="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded transition-colors flex items-center gap-1"
            >
              <RotateCcw class="w-3 h-3" :class="{ 'animate-spin': isFetchingOdds }" />
              <span>Refresh</span>
            </button>
            <button 
              type="button" 
              @click="isOddsModalOpen = false" 
              class="text-slate-400 hover:text-white p-1 rounded transition-colors text-lg font-bold"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs">
          <div class="relative flex-1">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="oddsSearch" 
              type="text" 
              placeholder="Filter by team name (Lakers, Celtics, Warriors...)" 
              class="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E67E22]"
            />
          </div>
          <span class="text-slate-500 text-[11px]">
            {{ liveNbaGames.filter(g => !oddsSearch || g.home_team.toLowerCase().includes(oddsSearch.toLowerCase()) || g.away_team.toLowerCase().includes(oddsSearch.toLowerCase())).length }} games available
          </span>
        </div>

        <!-- Games List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          <div v-if="isFetchingOdds && liveNbaGames.length === 0" class="py-12 text-center text-slate-500 text-xs">
            <RotateCcw class="w-6 h-6 animate-spin mx-auto mb-2 text-[#E67E22]" />
            Loading upcoming NBA games and sportsbook lines...
          </div>

          <div 
            v-else
            v-for="g in liveNbaGames.filter(g => !oddsSearch || g.home_team.toLowerCase().includes(oddsSearch.toLowerCase()) || g.away_team.toLowerCase().includes(oddsSearch.toLowerCase()))"
            :key="g.id"
            class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mb-1">
                <span>NBA Regular Season</span>
                <span>•</span>
                <span>{{ new Date(g.commence_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' }) }} PHT</span>
              </div>
              <div class="text-sm font-black text-slate-900">
                {{ g.away_team }} <span class="text-slate-400 font-normal">at</span> {{ g.home_team }}
              </div>
              <div class="flex items-center gap-2 mt-1.5 text-xs font-mono">
                <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  Spread: {{ g.home_team }} {{ g.consensus?.spread?.point ? (g.consensus.spread.point > 0 ? '+' : '') + g.consensus.spread.point : 'PK' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  O/U: {{ g.consensus?.total?.point ?? '—' }}
                </span>
                <span class="text-slate-400 text-[11px]">
                  ({{ g.bookmakers?.length || 0 }} sportsbooks)
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button 
                type="button" 
                @click="loadNbaOddsTemplate(g); isOddsModalOpen = false;" 
                class="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Create a new article template for this game"
              >
                Use as Article
              </button>
              <button 
                type="button" 
                @click="insertOddsSnippet(g)" 
                class="px-3 py-1.5 text-xs font-bold bg-[#E67E22] hover:bg-amber-600 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1"
              >
                <span>+ Insert Snippet</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div>
            Click <strong>Insert Snippet</strong> to paste formatted markdown table into the article editor.
          </div>
          <button 
            type="button" 
            @click="isOddsModalOpen = false" 
            class="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Local Philippine Sports & PBA Modal -->
    <div 
      v-if="isPhSportsModalOpen" 
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-800 to-slate-900 text-white">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-amber-300">
              <Tv class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-sm text-white">
                Philippine Sports Feeds &amp; Match Data
              </h3>
              <p class="text-[11px] text-red-200/80">
                PBA Governors' Cup, MPBL, UAAP &amp; NCAA Games, Live Scores &amp; Transmissions
              </p>
            </div>
          </div>
          <button 
            type="button" 
            @click="isPhSportsModalOpen = false"
            class="text-red-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <RotateCcw class="w-4 h-4" />
          </button>
        </div>

        <!-- Search Bar & Filters -->
        <div class="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div class="relative flex-1">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="phSportsSearch" 
              type="text" 
              placeholder="Filter by team or league (Ginebra, San Miguel, MPBL, UAAP...)" 
              class="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
            />
          </div>
          <span class="text-slate-500 text-[11px]">
            {{ livePhMatches.filter(m => !phSportsSearch || m.home.name.toLowerCase().includes(phSportsSearch.toLowerCase()) || m.away.name.toLowerCase().includes(phSportsSearch.toLowerCase()) || (m.competition || '').toLowerCase().includes(phSportsSearch.toLowerCase())).length }} matches
          </span>
        </div>

        <!-- Matches List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          <div v-if="isFetchingPhSports && livePhMatches.length === 0" class="py-12 text-center text-slate-500 text-xs">
            <RotateCcw class="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
            Connecting to Local Philippine Sports Feed...
          </div>

          <div 
            v-else
            v-for="m in livePhMatches.filter(m => !phSportsSearch || m.home.name.toLowerCase().includes(phSportsSearch.toLowerCase()) || m.away.name.toLowerCase().includes(phSportsSearch.toLowerCase()) || (m.competition || '').toLowerCase().includes(phSportsSearch.toLowerCase()))"
            :key="m.id"
            class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-red-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mb-1">
                <span>{{ m.competition || m.streamLabel }}</span>
                <span>•</span>
                <span :class="m.status === 'live' ? 'text-red-600 font-black' : ''">
                  {{ m.status === 'live' ? '🔴 LIVE ' + (m.clock || '') : (m.status === 'finished' ? 'FINAL' : m.manilaTimeFormatted) }}
                </span>
              </div>
              <div class="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{{ m.home.name }}</span>
                <span class="font-mono text-red-700 bg-red-50 px-1.5 py-0.2 rounded text-xs">
                  {{ m.status === 'scheduled' ? 'vs' : `${m.homeScore} - ${m.awayScore}` }}
                </span>
                <span>{{ m.away.name }}</span>
              </div>
              <div class="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                <span v-if="m.hasStream" class="text-red-600 font-bold flex items-center gap-0.5">
                  <Tv class="w-3 h-3" /> Live Video Stream
                </span>
                <span v-if="m.signals && m.signals.length && m.signals[0]" class="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                  Signal: {{ m.signals[0].pickLabel }} ({{ m.signals[0].confidence }}%)
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button 
                type="button" 
                @click="loadPbaGameTemplate(m); isPhSportsModalOpen = false;" 
                class="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Create a full article template for this match"
              >
                Use as Article
              </button>
              <button 
                type="button" 
                @click="insertPhSportsSnippet(m)" 
                class="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1"
              >
                <span>+ Insert Snippet</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div>
            Click <strong>Insert Snippet</strong> to insert official match box into article body.
          </div>
          <button 
            type="button" 
            @click="isPhSportsModalOpen = false" 
            class="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
