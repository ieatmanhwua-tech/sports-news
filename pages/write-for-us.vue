<script setup lang="ts">
import { ref } from 'vue';
import { PenTool, CheckCircle2, AlertCircle, Send } from 'lucide-vue-next';

const form = ref({
  name: '',
  email: '',
  portfolioUrl: '',
  beatInterest: 'PBA',
  pitch: ''
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: {
        name: form.value.name,
        email: form.value.email,
        subject: `Contributor Application: ${form.value.beatInterest} (${form.value.name})`,
        message: form.value.pitch,
        portfolioUrl: form.value.portfolioUrl,
        type: 'contributor_application'
      }
    });

    if (res.success) {
      successMessage.value = res.message;
      form.value = {
        name: '',
        email: '',
        portfolioUrl: '',
        beatInterest: 'PBA',
        pitch: ''
      };
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'An error occurred while submitting your application.';
  } finally {
    isSubmitting.value = false;
  }
}

useHead({
  title: 'Write for Us | Become a TipOffPh Contributor',
  meta: [
    { name: 'description', content: 'Passionate about Philippine hoops? Apply to join the TipOffPh sports journalism and beat writing network.' }
  ]
});
</script>

<template>
  <div class="max-w-3xl mx-auto py-4 space-y-6">
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />
      <div class="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-sm">
        <PenTool class="w-4 h-4 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        <span>Join Our Beat Network</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
        Write for TipOffPh
      </h1>
      <p class="mt-2 text-sm text-slate-300 leading-relaxed">
        We are looking for dedicated sports reporters, collegiate correspondents, and tactical analysts across the Philippines. Submit your writing portfolio and sample pitch below.
      </p>
    </header>

    <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] ring-1 ring-cyan-500/20">
      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm flex items-start gap-3">
        <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold text-white">Application Received</h4>
          <p class="mt-0.5 text-xs text-emerald-300">{{ successMessage }}</p>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold text-white">Submission Failed</h4>
          <p class="mt-0.5 text-xs text-red-300">{{ errorMessage }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input 
              v-model="form.name"
              type="text" 
              required
              placeholder="e.g. Roberto Rivera"
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input 
              v-model="form.email"
              type="email" 
              required
              placeholder="roberto@example.com"
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Primary Beat Interest *
            </label>
            <select 
              v-model="form.beatInterest"
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            >
              <option value="PBA" class="bg-slate-900 text-white">PBA (Professional League)</option>
              <option value="MPBL / Regional" class="bg-slate-900 text-white">MPBL &amp; Regional Leagues</option>
              <option value="UAAP / NCAA" class="bg-slate-900 text-white">Collegiate (UAAP &amp; NCAA)</option>
              <option value="Gilas Pilipinas" class="bg-slate-900 text-white">Gilas Pilipinas &amp; FIBA</option>
              <option value="Grassroots & High School" class="bg-slate-900 text-white">Grassroots &amp; High School Hoops</option>
              <option value="Tactical Analysis" class="bg-slate-900 text-white">Tactical Film Breakdown &amp; Advanced Stats</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Portfolio Link / Published Clips *
            </label>
            <input 
              v-model="form.portfolioUrl"
              type="url" 
              required
              placeholder="https://yourportfolio.com or Substack / Drive"
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Brief Bio &amp; Story Pitch *
          </label>
          <textarea 
            v-model="form.pitch"
            rows="6"
            required
            placeholder="Tell us about your reporting background and pitch 2-3 specific article ideas you want to write for TipOffPh..."
            class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors leading-relaxed"
          ></textarea>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send class="w-4 h-4" />
          <span>{{ isSubmitting ? 'Submitting Application...' : 'Submit Contributor Application' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
