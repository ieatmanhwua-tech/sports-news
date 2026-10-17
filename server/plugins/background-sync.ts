import { triggerBackgroundSportsRefresh } from '../utils/local-sports';
import { ensureTodaysMatchBlogsSynced } from '../utils/match-blogs';

export default defineNitroPlugin(() => {
  // Skip persistent background timers during static build phase
  if (process.env.prerender || process.env.NITRO_PRERENDER) {
    return;
  }

  // Defer initial background warm-up slightly so server port binding is immediate
  const startupTimer = setTimeout(() => {
    void triggerBackgroundSportsRefresh('full', false)
      .then(() => ensureTodaysMatchBlogsSynced(false))
      .catch(() => {});
  }, 300);

  if (typeof startupTimer.unref === 'function') {
    startupTimer.unref();
  }

  // Keep Live88 + ESPN scores and today's Manila-dated match blogs warm in the background every 30s
  const pollInterval = setInterval(() => {
    void triggerBackgroundSportsRefresh('scores', false)
      .then(() => ensureTodaysMatchBlogsSynced(false))
      .catch(() => {});
  }, 30 * 1000);

  if (typeof pollInterval.unref === 'function') {
    pollInterval.unref();
  }
});
