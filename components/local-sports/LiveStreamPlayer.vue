<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  candidateUrls: string[];
}>();

const emit = defineEmits<{
  (e: 'state-change', payload: { isPlaying: boolean; activeUrl: string }): void;
}>();

const playerContainerRef = ref<HTMLElement | null>(null);
const playerIframeRef = ref<HTMLIFrameElement | null>(null);
const isPlaying = ref(false);
const isFullscreen = ref(false);
const pendingCandidateUrls = ref<string[]>(props.candidateUrls || []);

const iframePlayerSrcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="referrer" content="no-referrer">
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js"><\/script>
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; user-select: none; }
  video { width: 100%; height: 100%; object-fit: contain; background: #000; display: block; cursor: pointer; }
</style>
</head>
<body>
  <video id="tipoff-iframe-video" autoplay muted playsinline preload="auto"></video>
  <script>
    (function() {
      window.open = function() { return null; };
      var video = document.getElementById('tipoff-iframe-video');
      var state = {
        candidates: [],
        idx: 0,
        activeUrl: '',
        flvPlayer: null,
        hlsPlayer: null,
        stallTimer: null
      };

      function notifyParent() {
        try {
          window.parent.postMessage({
            type: 'TIPOFF_IFRAME_STATE',
            isPlaying: !video.paused,
            activeUrl: state.activeUrl
          }, '*');
        } catch (e) {}
      }

      video.addEventListener('play', notifyParent);
      video.addEventListener('playing', function() {
        if (state.stallTimer) {
          clearTimeout(state.stallTimer);
          state.stallTimer = null;
        }
        notifyParent();
      });
      video.addEventListener('pause', notifyParent);

      function silenceFlv() {
        if (window.flvjs && window.flvjs.LoggingControl) {
          window.flvjs.LoggingControl.enableAll = false;
          window.flvjs.LoggingControl.enableDebug = false;
          window.flvjs.LoggingControl.enableVerbose = false;
          window.flvjs.LoggingControl.enableInfo = false;
          window.flvjs.LoggingControl.enableWarn = false;
          window.flvjs.LoggingControl.enableError = false;
        }
      }

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

      function playFallback() {
        destroyPlayers();
        state.activeUrl = '/videos/basketball-live.webm';
        video.src = state.activeUrl;
        video.loop = true;
        video.play().catch(function() {});
      }

      function tryNext() {
        state.idx += 1;
        if (state.idx < state.candidates.length) {
          playSingleUrl(state.candidates[state.idx]);
        } else {
          playFallback();
        }
      }

      function playSingleUrl(rawUrl) {
        silenceFlv();
        var url = String(rawUrl || '').trim();
        if (!url || url === '/videos/basketball-live.webm') {
          playFallback();
          return;
        }
        if (state.activeUrl === url && !video.paused && video.readyState >= 2) {
          return;
        }
        destroyPlayers();
        state.activeUrl = url;
        video.loop = false;
        var lower = url.toLowerCase();

        state.stallTimer = setTimeout(function() {
          if (video.readyState < 2) {
            tryNext();
          }
        }, 8000);

        if (lower.indexOf('.m3u8') !== -1) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            state.hlsPlayer = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
              video.play().catch(function() {});
            });
            hls.on(window.Hls.Events.ERROR, function(_ev, data) {
              if (data && data.fatal) {
                tryNext();
              }
            });
            return;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(function() { tryNext(); });
            return;
          }
        }

        if (lower.indexOf('.flv') !== -1 || lower.indexOf('/api/live88/stream-proxy') !== -1) {
          if (!window.flvjs) {
            setTimeout(function() {
              state.activeUrl = '';
              playSingleUrl(url);
            }, 120);
            return;
          }
          if (window.flvjs.isSupported()) {
            try {
              video.removeAttribute('src');
              video.load();
              var player = window.flvjs.createPlayer(
                { type: 'flv', isLive: true, cors: true, url: url },
                { enableStashBuffer: false, stashInitialSize: 128, lazyLoad: false, autoCleanupSourceBuffer: true }
              );
              state.flvPlayer = player;
              player.attachMediaElement(video);
              player.load();
              player.on(window.flvjs.Events.ERROR, function() {
                if (state.flvPlayer === player) {
                  tryNext();
                }
              });
              var p = player.play();
              if (p && p.catch) p.catch(function() {});
              return;
            } catch (e) {
              tryNext();
              return;
            }
          }
        }

        video.src = url;
        video.play().catch(function() {
          tryNext();
        });
      }

      function loadCandidates(urls) {
        var expanded = [];
        var seen = {};
        var proxyFlvCount = 0;
        for (var i = 0; i < (urls || []).length; i++) {
          var u = String(urls[i] || '').trim();
          if (!u || seen[u]) continue;
          seen[u] = true;
          if (u.indexOf('http://') === 0 || u.indexOf('yarncdn.live') !== -1 || u.indexOf('live88.eu.cc') !== -1 || u.indexOf('.flv') !== -1) {
            if (proxyFlvCount < 1) {
              expanded.push('/api/live88/stream-proxy?url=' + encodeURIComponent(u));
              proxyFlvCount++;
            }
          } else if (u.indexOf('https://') === 0) {
            expanded.push(u);
          } else {
            expanded.push(u);
          }
        }
        if (expanded.length === 0) {
          playFallback();
          return;
        }
        if (state.activeUrl && state.activeUrl !== '/videos/basketball-live.webm' && !video.paused && expanded.indexOf(state.activeUrl) !== -1 && expanded[0] === state.activeUrl) {
          return;
        }
        state.candidates = expanded;
        state.idx = 0;
        playSingleUrl(state.candidates[0]);
      }

      function togglePlayPause() {
        if (video.paused) {
          if (video.muted) video.muted = false;
          video.play().catch(function() {
            video.muted = true;
            video.play().catch(function() {});
          });
        } else {
          video.pause();
        }
      }

      video.addEventListener('click', togglePlayPause);

      window.__tipoffPlayer = {
        loadCandidates: loadCandidates,
        togglePlayPause: togglePlayPause,
        destroyPlayers: destroyPlayers
      };

      window.addEventListener('message', function(e) {
        if (!e.data) return;
        if (e.data.type === 'TIPOFF_LOAD_CANDIDATES') {
          loadCandidates(e.data.urls || []);
        } else if (e.data.type === 'TIPOFF_TOGGLE_PLAY') {
          togglePlayPause();
        }
      });

      window.parent.postMessage({ type: 'TIPOFF_IFRAME_READY' }, '*');
    })();
  <\/script>
</body>
</html>`;

function sendCandidatesToIframe(urls: string[]) {
  pendingCandidateUrls.value = urls;
  const win = playerIframeRef.value?.contentWindow as any;
  if (!win) return;
  try {
    if (win.__tipoffPlayer && typeof win.__tipoffPlayer.loadCandidates === 'function') {
      win.__tipoffPlayer.loadCandidates(urls);
    } else {
      win.postMessage({ type: 'TIPOFF_LOAD_CANDIDATES', urls }, '*');
    }
  } catch {
    try {
      win.postMessage({ type: 'TIPOFF_LOAD_CANDIDATES', urls }, '*');
    } catch {}
  }
}

function onIframePlayerLoaded() {
  if (pendingCandidateUrls.value.length > 0) {
    sendCandidatesToIframe(pendingCandidateUrls.value);
  }
}

function handleIframeMessage(e: MessageEvent) {
  if (!e?.data || typeof e.data !== 'object') return;
  if (e.data.type === 'TIPOFF_IFRAME_STATE') {
    isPlaying.value = Boolean(e.data.isPlaying);
    emit('state-change', {
      isPlaying: isPlaying.value,
      activeUrl: String(e.data.activeUrl || '')
    });
  } else if (e.data.type === 'TIPOFF_IFRAME_READY') {
    if (pendingCandidateUrls.value.length > 0) {
      sendCandidatesToIframe(pendingCandidateUrls.value);
    }
  }
}

function togglePlayPause() {
  const win = playerIframeRef.value?.contentWindow as any;
  if (!win) return;
  try {
    if (win.__tipoffPlayer && typeof win.__tipoffPlayer.togglePlayPause === 'function') {
      win.__tipoffPlayer.togglePlayPause();
    } else {
      win.postMessage({ type: 'TIPOFF_TOGGLE_PLAY' }, '*');
    }
  } catch {
    try {
      win.postMessage({ type: 'TIPOFF_TOGGLE_PLAY' }, '*');
    } catch {}
  }
}

function toggleFullscreen() {
  const container = playerContainerRef.value;
  if (!container || typeof document === 'undefined') return;
  if (!document.fullscreenElement) {
    container.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

function handleFullscreenChange() {
  if (typeof document !== 'undefined') {
    isFullscreen.value = Boolean(document.fullscreenElement);
  }
}

watch(
  () => props.candidateUrls,
  (newUrls) => {
    if (Array.isArray(newUrls) && newUrls.length > 0) {
      sendCandidatesToIframe(newUrls);
    }
  },
  { deep: true }
);

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleIframeMessage);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  }
});

onUnmounted(() => {
  try {
    const win = playerIframeRef.value?.contentWindow as any;
    win?.__tipoffPlayer?.destroyPlayers?.();
  } catch {}
  if (typeof window !== 'undefined') {
    window.removeEventListener('message', handleIframeMessage);
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }
});

defineExpose({
  loadCandidates: sendCandidatesToIframe,
  togglePlayPause,
  scrollIntoView: () => {
    playerContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
</script>

<template>
  <div
    ref="playerContainerRef"
    class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg group select-none"
  >
    <iframe
      ref="playerIframeRef"
      sandbox="allow-scripts allow-same-origin"
      referrerpolicy="no-referrer"
      allow="autoplay; fullscreen"
      title="TipOff PH Sandboxed Live Basketball Stream"
      :srcdoc="iframePlayerSrcDoc"
      @load="onIframePlayerLoaded"
      class="w-full h-full border-0 bg-black block"
    ></iframe>

    <!-- ONLY TWO CUSTOM OVERLAY BUTTONS: Pause/Play and Fullscreen -->
    <div
      class="absolute inset-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"
      :class="{ 'opacity-100': !isPlaying }"
    >
      <button
        type="button"
        @click.stop="togglePlayPause"
        class="pointer-events-auto w-10 h-10 rounded-lg bg-slate-900/85 hover:bg-red-600 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
      >
        <svg v-if="!isPlaying" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      </button>

      <button
        type="button"
        @click.stop="toggleFullscreen"
        class="pointer-events-auto w-10 h-10 rounded-lg bg-slate-900/85 hover:bg-red-600 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
        aria-label="Toggle Fullscreen"
      >
        <svg v-if="!isFullscreen" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </svg>
        <svg v-else class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
        </svg>
      </button>
    </div>
  </div>
</template>
