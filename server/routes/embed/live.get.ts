export default defineEventHandler((event) => {
  const query = getQuery(event);
  const matchId = String(query.matchId || '');
  const streamUrl = String(query.streamUrl || '');
  const home = String(query.home || '');
  const away = String(query.away || '');
  const comp = String(query.comp || '');

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="referrer" content="no-referrer" />
  <title>Live Stream Player</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
      user-select: none;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .video-container {
      position: relative;
      width: 100%;
      height: 100vh;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
      display: block;
      cursor: pointer;
    }
    /* Custom minimalist overlay with ONLY two controls: Play/Pause and Fullscreen */
    .minimal-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 14px 16px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 90px);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      z-index: 20;
    }
    .video-container:hover .minimal-overlay,
    .video-container.paused .minimal-overlay,
    .minimal-overlay:focus-within {
      opacity: 1;
    }
    .ctrl-btn {
      pointer-events: auto;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(8px);
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
    }
    .ctrl-btn:hover {
      background: rgba(239, 68, 68, 0.9);
      border-color: rgba(255, 255, 255, 0.45);
      transform: scale(1.04);
    }
    .ctrl-btn:active {
      transform: scale(0.96);
    }
    .ctrl-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
  </style>
</head>
<body>
  <div class="video-container paused" id="playerContainer">
    <video id="videoEl" autoplay muted playsinline preload="auto"></video>

    <div class="minimal-overlay">
      <button type="button" class="ctrl-btn" id="playPauseBtn" aria-label="Play or Pause">
        <svg id="playPauseIcon" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>

      <button type="button" class="ctrl-btn" id="fullscreenBtn" aria-label="Toggle Fullscreen">
        <svg id="fullscreenIcon" viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      </button>
    </div>
  </div>

  <script>
    (function() {
      window.open = function() { return null; };

      const state = {
        matchId: ${JSON.stringify(matchId)},
        streamUrl: ${JSON.stringify(streamUrl)},
        home: ${JSON.stringify(home)},
        away: ${JSON.stringify(away)},
        comp: ${JSON.stringify(comp)},
        candidates: [],
        candidateIndex: 0,
        activeUrl: '',
        flvPlayer: null,
        hlsPlayer: null,
        stallTimer: null
      };

      const container = document.getElementById('playerContainer');
      const videoEl = document.getElementById('videoEl');
      const playPauseBtn = document.getElementById('playPauseBtn');
      const playPauseIcon = document.getElementById('playPauseIcon');
      const fullscreenBtn = document.getElementById('fullscreenBtn');
      const fullscreenIcon = document.getElementById('fullscreenIcon');

      const PLAY_PATH = '<path d="M8 5v14l11-7z"/>';
      const PAUSE_PATH = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      const FS_ENTER_PATH = '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';
      const FS_EXIT_PATH = '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>';

      function syncPlayState() {
        const paused = videoEl.paused;
        if (paused) {
          container.classList.add('paused');
          playPauseIcon.innerHTML = PLAY_PATH;
        } else {
          container.classList.remove('paused');
          playPauseIcon.innerHTML = PAUSE_PATH;
        }
      }

      videoEl.addEventListener('play', syncPlayState);
      videoEl.addEventListener('playing', function() {
        if (state.stallTimer) {
          clearTimeout(state.stallTimer);
          state.stallTimer = null;
        }
        syncPlayState();
      });
      videoEl.addEventListener('pause', syncPlayState);

      function destroyPlayers() {
        if (state.stallTimer) {
          clearTimeout(state.stallTimer);
          state.stallTimer = null;
        }
        if (state.flvPlayer) {
          try {
            state.flvPlayer.pause();
            state.flvPlayer.unload();
            state.flvPlayer.detachMediaElement();
            state.flvPlayer.destroy();
          } catch (e) {}
          state.flvPlayer = null;
        }
        if (state.hlsPlayer) {
          try {
            state.hlsPlayer.destroy();
          } catch (e) {}
          state.hlsPlayer = null;
        }
      }

      function silenceFlvLogger() {
        if (window.flvjs && window.flvjs.LoggingControl) {
          window.flvjs.LoggingControl.enableAll = false;
          window.flvjs.LoggingControl.enableDebug = false;
          window.flvjs.LoggingControl.enableVerbose = false;
          window.flvjs.LoggingControl.enableInfo = false;
          window.flvjs.LoggingControl.enableWarn = false;
          window.flvjs.LoggingControl.enableError = false;
        }
      }

      function playFallbackStream() {
        destroyPlayers();
        state.activeUrl = '/videos/basketball-live.webm';
        videoEl.src = state.activeUrl;
        videoEl.loop = true;
        videoEl.play().catch(function() {});
      }

      function tryNextCandidate() {
        state.candidateIndex += 1;
        if (state.candidateIndex < state.candidates.length) {
          loadStreamUrl(state.candidates[state.candidateIndex]);
        } else {
          playFallbackStream();
        }
      }

      function loadCandidates(urls) {
        const expanded = [];
        const seen = new Set();
        for (let i = 0; i < (urls || []).length; i++) {
          const u = String(urls[i] || '').trim();
          if (!u || seen.has(u)) continue;
          seen.add(u);
          if (u.startsWith('http://')) {
            const proxied = '/api/live88/stream-proxy?url=' + encodeURIComponent(u);
            expanded.push(proxied);
          } else if (u.startsWith('https://')) {
            expanded.push(u);
            expanded.push('/api/live88/stream-proxy?url=' + encodeURIComponent(u));
          } else {
            expanded.push(u);
          }
        }
        if (expanded.length === 0) {
          playFallbackStream();
          return;
        }
        state.candidates = expanded;
        state.candidateIndex = 0;
        loadStreamUrl(state.candidates[0]);
      }

      function loadStreamUrl(rawUrl) {
        silenceFlvLogger();
        const url = String(rawUrl || '').trim();
        if (!url || url === '/videos/basketball-live.webm') {
          playFallbackStream();
          return;
        }
        if (state.activeUrl === url && !videoEl.paused && videoEl.readyState >= 2) {
          return;
        }
        destroyPlayers();
        state.activeUrl = url;
        const lower = url.toLowerCase();

        // Set 5-second stall watchdog to automatically advance to next stream candidate if stream doesn't start
        state.stallTimer = setTimeout(function() {
          if (videoEl.readyState < 2 || videoEl.paused) {
            tryNextCandidate();
          }
        }, 5000);

        // 1. HLS (.m3u8) stream via hls.js or native Safari HLS
        if (lower.includes('.m3u8')) {
          if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            state.hlsPlayer = hls;
            hls.loadSource(url);
            hls.attachMedia(videoEl);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
              videoEl.play().catch(function() {});
            });
            hls.on(window.Hls.Events.ERROR, function(_ev, data) {
              if (data && data.fatal) {
                tryNextCandidate();
              }
            });
            return;
          } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = url;
            videoEl.play().catch(function() {
              tryNextCandidate();
            });
            return;
          }
        }

        // 2. FLV (.flv) live stream via flv.js
        if (lower.includes('.flv') || lower.includes('/api/live88/stream-proxy')) {
          if (window.flvjs && window.flvjs.isSupported()) {
            try {
              videoEl.removeAttribute('src');
              videoEl.load();
              const player = window.flvjs.createPlayer(
                { type: 'flv', isLive: true, cors: true, url: url },
                { enableStashBuffer: false, stashInitialSize: 128, lazyLoad: false, autoCleanupSourceBuffer: true }
              );
              state.flvPlayer = player;
              player.attachMediaElement(videoEl);
              player.load();
              player.on(window.flvjs.Events.ERROR, function() {
                if (state.flvPlayer === player) {
                  tryNextCandidate();
                }
              });
              const p = player.play();
              if (p && p.catch) p.catch(function() {});
              return;
            } catch (e) {
              tryNextCandidate();
              return;
            }
          }
        }

        // 3. Standard video source
        videoEl.src = url;
        videoEl.play().catch(function() {
          tryNextCandidate();
        });
      }

      function togglePlayPause() {
        if (videoEl.paused) {
          if (videoEl.muted) videoEl.muted = false;
          videoEl.play().catch(function() {
            videoEl.muted = true;
            videoEl.play().catch(function() {});
          });
        } else {
          videoEl.pause();
        }
      }

      function toggleFullscreen() {
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(function() {});
        } else {
          document.exitFullscreen().catch(function() {});
        }
      }

      document.addEventListener('fullscreenchange', function() {
        fullscreenIcon.innerHTML = document.fullscreenElement ? FS_EXIT_PATH : FS_ENTER_PATH;
      });

      videoEl.addEventListener('click', togglePlayPause);
      playPauseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePlayPause();
      });
      fullscreenBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFullscreen();
      });

      window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'LOAD_STREAM') {
          if (Array.isArray(e.data.urls) && e.data.urls.length > 0) {
            loadCandidates(e.data.urls);
          } else if (e.data.streamUrl) {
            loadCandidates([e.data.streamUrl]);
          } else if (e.data.matchId) {
            state.matchId = e.data.matchId;
            resolveAndPlayStream();
          }
        }
      });

      function resolveAndPlayStream() {
        if (state.streamUrl) {
          loadCandidates([state.streamUrl]);
          return;
        }
        const params = new URLSearchParams({
          matchId: state.matchId,
          home: state.home,
          away: state.away,
          comp: state.comp
        });
        fetch('/api/live-stream?' + params.toString(), { cache: 'no-store' })
          .then(function(r) { return r.json(); })
          .then(function(res) {
            const urls = [];
            if (res && Array.isArray(res.upstreamSources)) {
              for (let i = 0; i < res.upstreamSources.length; i++) {
                if (res.upstreamSources[i] && res.upstreamSources[i].url) {
                  urls.push(res.upstreamSources[i].url);
                }
              }
            }
            if (res && Array.isArray(res.live88Streams)) {
              for (let j = 0; j < res.live88Streams.length; j++) {
                if (res.live88Streams[j] && res.live88Streams[j].streamUrl) {
                  urls.push(res.live88Streams[j].streamUrl);
                }
              }
            }
            loadCandidates(urls);
          })
          .catch(function() {
            playFallbackStream();
          });
      }

      resolveAndPlayStream();
    })();
  <\/script>
</body>
</html>`;
});
