export type ContentType = 'news' | 'rumor' | 'editorial' | 'interview';

export type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface Author {
  id: string;
  slug: string;
  name: string;
  bio: string;
  role: string;
  email: string;
  avatarUrl: string;
  twitterHandle?: string;
  createdAt?: string;
}

export interface CategoryInfo {
  id: string;
  slug: string;
  name: string;
  sectionGroup: 'local-leagues' | 'collegiate-grassroots' | 'national-international' | 'tournaments-events' | 'media-features' | 'corporate';
  path: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  badgeText: string;
  isCore?: boolean;
  logoUrl?: string;
  childSlugs?: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  primaryCategoryId: string;
  topicIds?: string[];
  authorId: string;
  contentType: ContentType;
  sourceUrl?: string;
  sourceName?: string;
  featuredImageUrl: string;
  imageAlt: string;
  imageCredit: string;
  seoTitle?: string;
  seoDescription?: string;
  targetKeyword?: string;
  isFeatured: boolean;
  isBreaking: boolean;
  status: ArticleStatus;
  publishedAt: string; // ISO 8601 UTC string
  updatedAt?: string;   // ISO 8601 UTC string for substantive updates
  createdAt: string;

  // Joined fields
  category?: CategoryInfo;
  author?: Author;
  topics?: CategoryInfo[];
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'contact' | 'contributor_application';
  phone?: string;
  portfolioUrl?: string;
  createdAt: string;
}

export interface GameScore {
  id: string;
  league: string; // 'PBA' | 'MPBL' | 'UAAP' | 'NCAA' | 'Gilas Pilipinas' | 'PSL' | 'PBA D-League' | 'VisMin Cup' | 'NBL' | 'EASL' | 'NBA' | 'FIBA'
  leagueFullName?: string; // Full league title, e.g. "Philippine Basketball Association"
  leagueId?: string; // slug format: 'pba' | 'mpbl' | 'uaap' | 'ncaa' | 'gilas' | 'psl' | 'd-league' | 'vismin' | 'nbl' | 'easl' | 'nba' | 'fiba'
  leagueLogo?: string;
  eventName?: string; // Complete league tournament / event name, e.g. "PBA Governors' Cup 2026 - Quarterfinals Game 2"
  stage?: string; // e.g. "North Quarterfinals", "Elimination Round", "Group Stage"
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  homeScore?: number;
  awayScore?: number;
  status: 'upcoming' | 'live' | 'final';
  statusDetail: string; // e.g. "Final", "Q3 4:21", "7:30 PM PHT"
  gameTimeUtc: string;
  venue: string;
  broadcast: string;
  sourceName: string;
  updatedAt: string;
}
