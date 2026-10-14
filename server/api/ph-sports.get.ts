import { fetchLocalSportsData } from '../utils/local-sports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const league = query.league ? String(query.league).toLowerCase() : undefined;
  const status = query.status ? String(query.status).toLowerCase() : undefined;
  const refresh = query.refresh === 'true' || query.refresh === '1';

  try {
    const data = await fetchLocalSportsData(refresh);

    let filteredMatches = data.allMatches;

    if (league) {
      if (league === 'pba') {
        filteredMatches = filteredMatches.filter(m => /pba/i.test(m.competition || m.streamLabel || ''));
      } else if (league === 'mpbl') {
        filteredMatches = filteredMatches.filter(m => /mpbl/i.test(m.competition || m.streamLabel || ''));
      } else if (league === 'collegiate' || league === 'uaap' || league === 'ncaa') {
        filteredMatches = filteredMatches.filter(m => /uaap|ncaa/i.test(m.competition || m.streamLabel || ''));
      }
    }

    if (status) {
      filteredMatches = filteredMatches.filter(m => m.status.toLowerCase() === status);
    }

    return {
      success: true,
      ...data,
      matches: filteredMatches
    };
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: `Failed to retrieve local PH sports data: ${err.message}`
    });
  }
});
