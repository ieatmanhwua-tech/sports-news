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
  <div class="max-w-3xl mx-auto py-4">
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-6 shadow-sm">
      <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#D35400]">
        <PenTool class="w-4 h-4" />
        <span>Join Our Beat Network</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        Write for TipOffPh
      </h1>
      <p class="mt-2 text-sm text-slate-600 leading-relaxed">
        We are looking for dedicated sports reporters, collegiate correspondents, and tactical analysts across the Philippines. Submit your writing portfolio and sample pitch below.
      </p>
    </header>

    <div class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm flex items-start gap-3">
        <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold">Application Received</h4>
          <p class="mt-0.5">{{ successMessage }}</p>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold">Submission Failed</h4>
          <p class="mt-0.5">{{ errorMessage }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input 
              v-model="form.name"
              type="text" 
              required
              placeholder="e.g. Roberto Rivera"
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input 
              v-model="form.email"
              type="email" 
              required
              placeholder="roberto@example.com"
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Beat Interest *
            </label>
            <select 
              v-model="form.beatInterest"
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white"
            >
              <option value="PBA">PBA (Professional League)</option>
              <option value="MPBL / Regional">MPBL &amp; Regional Leagues</option>
              <option value="UAAP / NCAA">Collegiate (UAAP &amp; NCAA)</option>
              <option value="Gilas Pilipinas">Gilas Pilipinas &amp; FIBA</option>
              <option value="Grassroots & High School">Grassroots &amp; High School Hoops</option>
              <option value="Tactical Analysis">Tactical Film Breakdown &amp; Advanced Stats</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Portfolio Link / Published Clips *
            </label>
            <input 
              v-model="form.portfolioUrl"
              type="url" 
              required
              placeholder="https://yourportfolio.com or Substack / Drive"
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Brief Bio &amp; Story Pitch *
          </label>
          <textarea 
            v-model="form.pitch"
            rows="6"
            required
            placeholder="Tell us about your reporting background and pitch 2-3 specific article ideas you want to write for TipOffPh..."
            class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white leading-relaxed"
          ></textarea>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full sm:w-auto px-6 py-2.5 bg-[#E67E22] hover:bg-amber-600 text-white font-bold text-sm rounded shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send class="w-4 h-4" />
          <span>{{ isSubmitting ? 'Submitting Application...' : 'Submit Contributor Application' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
