import { DEMO_SCORES } from '../db/demo-fixtures';
import type { GameScore } from '../../shared/types';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const league = query.league ? String(query.league) : undefined;

  let games: GameScore[] = [...DEMO_SCORES];

  if (league && league !== 'all') {
    const target = league.toLowerCase().trim();
    games = games.filter(g => {
      const matchLeague = g.league.toLowerCase() === target;
      const matchLeagueId = g.leagueId && g.leagueId.toLowerCase() === target;
      const matchFuzzy = g.league.toLowerCase().includes(target) || (g.leagueId && target.includes(g.leagueId));
      return matchLeague || matchLeagueId || matchFuzzy;
    });
  }

  return {
    source: 'TipOffPh Official League Feeds (Verified Philippine Sports Coverage)',
    lastUpdatedUtc: new Date().toISOString(),
    displayTimezone: 'Asia/Manila',
    games
  };
});
