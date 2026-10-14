<script setup lang="ts">
import { ref } from 'vue';
import { Lock, User, AlertCircle, ArrowLeft, Shield } from 'lucide-vue-next';
import tipoffLogo from '~/assets/img/TipOffPh_logo.png';

const username = ref('admin');
const password = ref('TipOffPh2026!');
const isSubmitting = ref(false);
const errorMessage = ref('');
const router = useRouter();
const route = useRoute();

async function handleLogin() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    const res = await $fetch<{ success: boolean; user: any }>('/api/admin/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    });

    if (res.success) {
      const target = route.query.redirect ? String(route.query.redirect) : '/admin';
      router.push(target);
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Login failed. Please verify credentials.';
  } finally {
    isSubmitting.value = false;
  }
}

useHead({
  title: 'Editorial Desk Login | TipOffPh Admin',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});
</script>

<template>
  <div class="max-w-md mx-auto py-12">
    <div class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-500/10 blur-[80px] pointer-events-none" />
      <div class="text-center mb-6 relative z-10">
        <NuxtLink to="/" class="inline-block mb-3 group">
          <img 
            :src="tipoffLogo" 
            alt="TipOffPh" 
            class="h-14 sm:h-16 w-auto max-w-[260px] object-contain mx-auto group-hover:scale-105 transition-transform drop-shadow-sm"
            width="2172"
            height="724" 
          />
        </NuxtLink>
        <h1 class="text-lg font-black text-white tracking-tight drop-shadow-sm">TipOffPh Editorial CMS</h1>
        <p class="text-xs text-slate-400 mt-1">Authorized editorial staff &amp; contributors only</p>
      </div>

      <!-- Error Notice -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4 relative z-10">
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Username / Email
          </label>
          <div class="relative">
            <input 
              v-model="username" 
              type="text" 
              required
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
            <User class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div class="relative">
            <input 
              v-model="password" 
              type="password" 
              required
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
            <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Verifying...' : 'Sign In to Editorial Desk' }}
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-slate-800 text-center relative z-10">
        <NuxtLink to="/" class="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors">
          <ArrowLeft class="w-3.5 h-3.5 text-orange-400" /> Return to Public Website
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
