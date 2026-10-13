<script setup lang="ts">
import { ref } from 'vue';
import { Lock, User, AlertCircle, ArrowLeft, Shield } from 'lucide-vue-next';

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
    <div class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-lg bg-[#E67E22] text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-3">
          TP
        </div>
        <h1 class="text-xl font-black text-slate-900">TipOffPh Editorial CMS</h1>
        <p class="text-xs text-slate-500 mt-1">Authorized editorial staff &amp; contributors only</p>
      </div>

      <!-- Error Notice -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Username / Email
          </label>
          <div class="relative">
            <input 
              v-model="username" 
              type="text" 
              required
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-[#E67E22]"
            />
            <User class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <div class="relative">
            <input 
              v-model="password" 
              type="password" 
              required
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:border-[#E67E22]"
            />
            <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full py-2.5 bg-[#E67E22] hover:bg-amber-600 text-white font-bold text-sm rounded transition-colors shadow-sm disabled:opacity-50"
        >
          {{ isSubmitting ? 'Verifying...' : 'Sign In to Editorial Desk' }}
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-slate-100 text-center">
        <NuxtLink to="/" class="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
          <ArrowLeft class="w-3.5 h-3.5" /> Return to Public Website
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
