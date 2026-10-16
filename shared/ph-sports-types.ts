export interface PhSportsTeam {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  accent?: string;
  logo?: string;
}

export interface PhSportsOdds {
  home: number;
  draw?: number | null;
  away: number;
  over?: number;
  under?: number;
  line?: number;
  homeTrend?: string;
  awayTrend?: string;
}

export interface PhSportsProbability {
  home: number;
  draw: number;
  away: number;
}

export interface PhSportsStreamSource {
  id: string;
  label: string;
  type: string;
  url: string;
}

export interface PhSportsMatch {
  id: string;
  leagueId: string;
  home: PhSportsTeam;
  away: PhSportsTeam;
  status: 'scheduled' | 'live' | 'finished' | string;
  clock: string;
  homeScore: number;
  awayScore: number;
  startTime: string;
  venue?: string;
  streamLabel?: string;
  competition?: string;
  sport: string;
  featured?: boolean;
  premium?: boolean;
  odds?: PhSportsOdds;
  probability?: PhSportsProbability;
  hasStream?: boolean;
  hasVideoStream?: boolean;
  sources?: PhSportsStreamSource[];
  isFavorite?: boolean;
  scoreAvailable?: boolean;
  signals?: PhSportsSignal[];
  manilaTimeFormatted?: string;
  startTimeIso?: string;
  bannerUrl?: string;
  espnSpread?: string;
  espnOverUnder?: string;
  topPlayerName?: string;
  topPlayerStat?: string;
  topPlayerHeadshot?: string;
}

export interface PhSportsSignal {
  id: string;
  matchId: string;
  kadarioMatchId?: string;
  market: string;
  pick: string;
  pickLabel: string;
  odds: number;
  confidence: number;
  strength: 'low' | 'medium' | 'high' | string;
  rationale: string;
  formHome?: string;
  formAway?: string;
  matchSummary?: {
    id: string;
    homeTeam: string;
    homeTeamLogo?: string;
    awayTeam: string;
    awayTeamLogo?: string;
    status: string;
    score: string;
    competition?: string;
  };
}

export interface PhSportsResponse {
  source: string;
  timezone: string;
  generatedAt: string;
  counts: {
    totalMatches: number;
    pba: number;
    mpbl: number;
    collegiate: number;
    nba: number;
    activeLive: number;
    streams: number;
    signals: number;
  };
  liveMatches: PhSportsMatch[];
  upcomingMatches: PhSportsMatch[];
  recentMatches: PhSportsMatch[];
  allMatches: PhSportsMatch[];
  livestreams: PhSportsMatch[];
  signals: PhSportsSignal[];
}
