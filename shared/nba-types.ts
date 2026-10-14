export interface NbaMarketOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface NbaMarket {
  key: 'h2h' | 'spreads' | 'totals' | string;
  last_update: string;
  outcomes: NbaMarketOutcome[];
}

export interface NbaBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: NbaMarket[];
}

export interface NbaOddsGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: NbaBookmaker[];
}

export interface FormattedNbaOddsGame extends NbaOddsGame {
  manilaTimeFormatted?: string;
  status?: 'upcoming' | 'live' | 'final';
  consensus?: {
    h2h?: {
      homeTeam: string;
      awayTeam: string;
      homeAvgPrice: number;
      awayAvgPrice: number;
      homeBestPrice: number;
      awayBestPrice: number;
      homeBestBookie: string;
      awayBestBookie: string;
    };
    spread?: {
      homeTeam: string;
      awayTeam: string;
      point: number;
      homePrice: number;
      awayPrice: number;
      bookmaker: string;
    };
    total?: {
      point: number;
      overPrice: number;
      underPrice: number;
      bookmaker: string;
    };
  };
}

export interface NbaOddsResponse {
  source: string;
  upstreamUrl: string;
  lastUpdatedUtc: string;
  totalGames: number;
  games: FormattedNbaOddsGame[];
  rateLimitProtected?: boolean;
  rateLimitStatus?: 'normal' | 'cooldown' | 'protected';
  rateLimitMessage?: string;
  cooldownSecondsRemaining?: number;
}
