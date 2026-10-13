<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ArrowLeft, Database, Server, Key, CheckCircle, AlertTriangle, Terminal, ExternalLink } from 'lucide-vue-next';

const status = ref<any>(null);
const isLoading = ref(true);

// Database connection form
const dbConfig = ref({
  host: '',
  port: 3306,
  user: 'u697549935_tipoff',
  password: 'Kw~b!$#n4/U',
  database: 'u697549935_tipoffph'
});
const dbFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const isSavingDb = ref(false);

// Bootstrap form
const setupToken = ref('');
const setupUsername = ref('');
const setupEmail = ref('');
const setupPassword = ref('');
const setupFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const isSettingUp = ref(false);

const router = useRouter();

onMounted(async () => {
  try {
    const authRes = await $fetch<{ authenticated: boolean }>('/api/admin/me');
    if (!authRes.authenticated) {
      router.push('/admin/login');
      return;
    }

    const [stat, currentDb] = await Promise.all([
      $fetch('/api/status'),
      $fetch<any>('/api/admin/database')
    ]);
    status.value = stat;
    if (currentDb) {
      dbConfig.value.host = currentDb.host || '';
      dbConfig.value.port = currentDb.port || 3306;
      dbConfig.value.user = currentDb.user || 'u697549935_tipoff';
      dbConfig.value.database = currentDb.database || 'u697549935_tipoffph';
    }
  } catch (err) {
    router.push('/admin/login');
  } finally {
    isLoading.value = false;
  }
});

async function handleSaveDb() {
  dbFeedback.value = null;
  isSavingDb.value = true;
  try {
    const res = await $fetch<{ success: boolean; message: string; status: any }>('/api/admin/database', {
      method: 'POST',
      body: dbConfig.value
    });
    if (res.success) {
      dbFeedback.value = { type: 'success', message: res.message };
      status.value = await $fetch('/api/status');
    } else {
      dbFeedback.value = { type: 'error', message: res.message };
      status.value = await $fetch('/api/status');
    }
  } catch (err: any) {
    dbFeedback.value = {
      type: 'error',
      message: err?.data?.message || err?.message || 'Failed to connect to MySQL database.'
    };
  } finally {
    isSavingDb.value = false;
  }
}

async function handleBootstrap() {
  setupFeedback.value = null;
  isSettingUp.value = true;

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/setup', {
      method: 'POST',
      body: {
        token: setupToken.value,
        username: setupUsername.value,
        email: setupEmail.value,
        password: setupPassword.value
      }
    });

    setupFeedback.value = { type: 'success', message: res.message };
    setupPassword.value = '';
  } catch (err: any) {
    setupFeedback.value = {
      type: 'error',
      message: err?.data?.message || err?.message || 'Bootstrap failed.'
    };
  } finally {
    isSettingUp.value = false;
  }
}

useHead({
  title: 'Hostinger & Database Settings | TipOffPh Admin',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 space-y-6">
    <!-- Admin Top Nav Bar -->
    <div class="bg-[#1e293b] text-slate-300 rounded-lg px-4 sm:px-6 h-12 flex items-center justify-between text-xs shadow-sm">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="flex items-center gap-1.5 font-bold text-white hover:text-[#E67E22] transition-colors">
          <span class="w-5 h-5 rounded bg-[#E67E22] text-slate-950 font-black text-[10px] flex items-center justify-center">TP</span>
          <span>TipOffPh CMS</span>
        </NuxtLink>
        <span class="text-slate-600">/</span>
        <nav class="flex items-center gap-3">
          <NuxtLink to="/admin" class="hover:text-white font-medium transition-colors">Dashboard</NuxtLink>
          <NuxtLink to="/admin/post" class="hover:text-white font-medium transition-colors">Story Publisher</NuxtLink>
          <NuxtLink to="/admin/articles" class="hover:text-white font-medium transition-colors">All Articles</NuxtLink>
          <NuxtLink to="/admin/settings" class="text-amber-400 font-bold transition-colors">DB &amp; Hostinger</NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink to="/" target="_blank" class="hover:text-amber-400 text-slate-400 flex items-center gap-1 text-[11px] transition-colors">
          <span>View Public Site</span>
          <ExternalLink class="w-3 h-3" />
        </NuxtLink>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <NuxtLink to="/admin" class="p-2 hover:bg-slate-200 rounded text-slate-600 transition-colors">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-xl font-black text-slate-900">Settings &amp; Hostinger Node.js Runtime</h1>
        <p class="text-xs text-slate-500">Database connectivity and deployment configuration</p>
      </div>
    </div>

    <!-- Live Connection Status -->
    <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database class="w-4 h-4 text-[#E67E22]" />
          Current Database Connection
        </h2>
        <span 
          class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded"
          :class="status?.mode === 'MYSQL' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'"
        >
          {{ status?.mode === 'MYSQL' ? 'MYSQL LIVE' : 'STANDALONE PRODUCTION' }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-slate-400 block mb-0.5">Host Target:</span>
          <span class="font-mono font-semibold text-slate-800">{{ status?.host }}</span>
        </div>
        <div>
          <span class="text-slate-400 block mb-0.5">Database Store:</span>
          <span class="font-mono font-semibold text-slate-800">{{ status?.database }}</span>
        </div>
        <div>
          <span class="text-slate-400 block mb-0.5">Runtime Timezone:</span>
          <span class="font-semibold text-slate-800">Asia/Manila (UTC+8)</span>
        </div>
        <div>
          <span class="text-slate-400 block mb-0.5">Node.js Engine:</span>
          <span class="font-mono text-slate-800">{{ status?.nodeVersion }}</span>
        </div>
      </div>

      <div class="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 leading-relaxed">
        <strong>Diagnostic Status:</strong> {{ status?.message }}
        <div v-if="status?.errorDetails" class="mt-1 text-red-600 font-mono text-[11px]">
          {{ status.errorDetails }}
        </div>
      </div>
    </div>

    <!-- Database Connection & Configuration Card -->
    <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database class="w-4 h-4 text-[#E67E22]" />
            MySQL Database Connection
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Configure your remote Hostinger MySQL database to store blog articles, categories, and authors permanently.
          </p>
        </div>
      </div>

      <div 
        v-if="dbFeedback" 
        class="p-3 rounded text-xs flex items-center gap-2"
        :class="dbFeedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'"
      >
        <CheckCircle v-if="dbFeedback.type === 'success'" class="w-4 h-4 text-emerald-600 shrink-0" />
        <AlertTriangle v-else class="w-4 h-4 text-red-600 shrink-0" />
        <span>{{ dbFeedback.message }}</span>
      </div>

      <form @submit.prevent="handleSaveDb" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Host / Server IP *
            </label>
            <input 
              v-model="dbConfig.host" 
              type="text" 
              placeholder="e.g. 195.35.x.x or srv123.main-hosting.eu" 
              required
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#E67E22]"
            />
            <p class="text-[10px] text-slate-400 mt-1">
              From Hostinger hPanel &rarr; Databases &rarr; Remote MySQL (IP / Hostname)
            </p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Port
            </label>
            <input 
              v-model.number="dbConfig.port" 
              type="number" 
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#E67E22]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Database Name *
            </label>
            <input 
              v-model="dbConfig.database" 
              type="text" 
              required
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#E67E22]"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Database User *
            </label>
            <input 
              v-model="dbConfig.user" 
              type="text" 
              required
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#E67E22]"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Database Password *
            </label>
            <input 
              v-model="dbConfig.password" 
              type="password" 
              required
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#E67E22]"
            />
          </div>
        </div>

        <div class="flex items-center justify-between pt-2">
          <p class="text-[11px] text-slate-500">
            Articles and stories posted in the blog studio will be persisted in this database.
          </p>
          <button 
            type="submit" 
            :disabled="isSavingDb"
            class="px-5 py-2.5 bg-[#E67E22] hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Database class="w-3.5 h-3.5" />
            <span>{{ isSavingDb ? 'Testing & Connecting...' : 'Connect & Save Database' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Hostinger Deployment Specifications -->
    <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Server class="w-4 h-4 text-sky-600" />
        Hostinger Managed Node.js Web Apps Configuration
      </h2>

      <div class="space-y-2 text-xs text-slate-700">
        <p>Use the following parameters when provisioning or verifying the application in Hostinger hPanel:</p>
        <div class="bg-slate-900 text-slate-200 p-4 rounded-md font-mono text-[11px] space-y-1.5 overflow-x-auto">
          <div><strong class="text-amber-400">Application Type / Framework:</strong> Nuxt</div>
          <div><strong class="text-amber-400">Node.js Version:</strong> Compatible current 22.x patch</div>
          <div><strong class="text-amber-400">Package Manager:</strong> npm</div>
          <div><strong class="text-amber-400">Build Command:</strong> npm run build</div>
          <div><strong class="text-amber-400">Output Directory:</strong> .output</div>
          <div><strong class="text-amber-400">Entry File:</strong> server/index.mjs</div>
          <div><strong class="text-amber-400">CLI Production Start:</strong> node .output/server/index.mjs</div>
        </div>
      </div>

      <div class="text-xs text-slate-600 space-y-1">
        <h4 class="font-bold text-slate-800">Required Hostinger Private Environment Variables:</h4>
        <ul class="list-disc pl-5 space-y-1 font-mono text-[11px]">
          <li><strong>DB_HOST:</strong> Hostinger MySQL server hostname (e.g. srv123.main-hosting.eu or 127.0.0.1)</li>
          <li><strong>DB_PORT:</strong> 3306</li>
          <li><strong>DB_USER:</strong> Hostinger MySQL database user</li>
          <li><strong>DB_PASSWORD:</strong> Hostinger MySQL database password</li>
          <li><strong>DB_NAME:</strong> Hostinger MySQL database name</li>
          <li><strong>NUXT_PUBLIC_SITE_URL:</strong> Full production website URL for canonicals and sitemaps</li>
          <li><strong>JWT_SECRET:</strong> Cryptographically random string for session cookie signing</li>
          <li><strong>ADMIN_SETUP_TOKEN:</strong> Secret token used for initial admin provisioning</li>
        </ul>
      </div>
    </div>

    <!-- Production Admin Bootstrap Form -->
    <div class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
      <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Key class="w-4 h-4 text-emerald-600" />
        Bootstrap First Production Admin Account
      </h2>
      <p class="text-xs text-slate-600">
        Requires matching <code class="font-mono font-bold bg-slate-100 px-1 rounded">ADMIN_SETUP_TOKEN</code> configured in your environment variables.
      </p>

      <div 
        v-if="setupFeedback" 
        class="p-3 rounded text-xs flex items-center gap-2"
        :class="setupFeedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'"
      >
        <CheckCircle v-if="setupFeedback.type === 'success'" class="w-4 h-4 text-emerald-600" />
        <AlertTriangle v-else class="w-4 h-4 text-red-600" />
        <span>{{ setupFeedback.message }}</span>
      </div>

      <form @submit.prevent="handleBootstrap" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Setup Secret Token *
          </label>
          <input 
            v-model="setupToken" 
            type="password" 
            required
            placeholder="Matches ADMIN_SETUP_TOKEN"
            class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#E67E22]"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            New Admin Username *
          </label>
          <input 
            v-model="setupUsername" 
            type="text" 
            required
            placeholder="e.g. editor_in_chief"
            class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#E67E22]"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Admin Email *
          </label>
          <input 
            v-model="setupEmail" 
            type="email" 
            required
            placeholder="editor@tipoffph.com"
            class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#E67E22]"
          />
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Secure Password (min 8 chars) *
          </label>
          <input 
            v-model="setupPassword" 
            type="password" 
            required
            placeholder="••••••••••••"
            class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#E67E22]"
          />
        </div>

        <div class="sm:col-span-2 pt-2">
          <button 
            type="submit" 
            :disabled="isSettingUp"
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-colors shadow-sm disabled:opacity-50"
          >
            {{ isSettingUp ? 'Provisioning Account...' : 'Provision Production Administrator' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
