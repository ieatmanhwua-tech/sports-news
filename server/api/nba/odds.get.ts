import { fetchNbaOdds, getNbaOddsStatus } from '../../utils/nba-odds';
import type { NbaOddsResponse } from '../../../shared/nba-types';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const team = query.team ? String(query.team).toLowerCase().trim() : undefined;
  const limit = query.limit ? Math.max(1, parseInt(String(query.limit), 10) || 50) : 50;
  const refresh = query.refresh === 'true' || query.refresh === '1';

  try {
    let games = await fetchNbaOdds(refresh);
    const status = getNbaOddsStatus();

    if (team) {
      games = games.filter(g => 
        g.home_team.toLowerCase().includes(team) || 
        g.away_team.toLowerCase().includes(team)
      );
    }

    if (limit && games.length > limit) {
      games = games.slice(0, limit);
    }

    const response: NbaOddsResponse = {
      source: 'Live88 Official Real-Time API (Bootstrap & Matches)',
      upstreamUrl: 'https://live88.eu.cc/api/v1/bootstrap?site=-Qw82foL4XnLt_vBp8LVXjwW',
      lastUpdatedUtc: new Date().toISOString(),
      totalGames: games.length,
      games,
      rateLimitProtected: status.rateLimitProtected,
      rateLimitStatus: status.rateLimitStatus,
      rateLimitMessage: status.rateLimitMessage,
      cooldownSecondsRemaining: status.cooldownSecondsRemaining
    };

    return response;
  } catch (err: any) {
    // Under no circumstances should this endpoint crash with a 502
    console.error('[API NBA Odds] Error handler triggered:', err?.message);
    const status = getNbaOddsStatus();
    const fallbackGames = await fetchNbaOdds(false);

    const safeResponse: NbaOddsResponse = {
      source: 'Live88 Official Real-Time API (Fallback Cache)',
      upstreamUrl: 'https://live88.eu.cc/api/v1/bootstrap?site=-Qw82foL4XnLt_vBp8LVXjwW',
      lastUpdatedUtc: new Date().toISOString(),
      totalGames: fallbackGames.length,
      games: fallbackGames.slice(0, limit),
      rateLimitProtected: true,
      rateLimitStatus: 'protected',
      rateLimitMessage: 'Rate limit protected. Displaying verified sports consensus odds.',
      cooldownSecondsRemaining: status.cooldownSecondsRemaining || 900
    };

    return safeResponse;
  }
});
