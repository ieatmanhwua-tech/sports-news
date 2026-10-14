<script setup lang="ts">
import { ref } from 'vue';
import { Mail, CheckCircle2, AlertCircle, Send } from 'lucide-vue-next';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  phone: ''
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
        ...form.value,
        type: 'contact'
      }
    });

    if (res.success) {
      successMessage.value = res.message;
      form.value = {
        name: '',
        email: '',
        subject: '',
        message: '',
        phone: ''
      };
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'An error occurred while submitting. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

useHead({
  title: 'Contact TipOffPh | Get in Touch With Our Team',
  meta: [
    { name: 'description', content: 'Contact the TipOffPh sports editorial desk for press releases, partnership inquiries, and tips.' }
  ]
});
</script>

<template>
  <div class="max-w-3xl mx-auto py-4 space-y-6">
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_35px_rgba(0,0,0,0.7)] ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
      <div class="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-sm">
        <Mail class="w-4 h-4 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
        <span>Connect With Us</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
        Contact TipOffPh
      </h1>
      <p class="mt-2 text-sm text-slate-300">
        Have a news tip, press release, official score sheet, or advertising inquiry? Fill out the form below or reach our Manila newsroom.
      </p>
    </header>

    <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] ring-1 ring-cyan-500/20">
      <!-- Success Feedback Alert -->
      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm flex items-start gap-3">
        <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold text-white">Message Delivered</h4>
          <p class="mt-0.5 text-xs text-emerald-300">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Error Feedback Alert -->
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
              placeholder="e.g. Juan dela Cruz"
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
              placeholder="juan@example.com"
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <input 
              v-model="form.subject"
              type="text" 
              required
              placeholder="e.g. News Scoop / Press Release"
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contact Phone (Optional)
            </label>
            <input 
              v-model="form.phone"
              type="tel" 
              placeholder="+63 9XX XXX XXXX"
              class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Message or Press Details *
          </label>
          <textarea 
            v-model="form.message"
            rows="5"
            required
            placeholder="Provide context, verifiable links, or press announcement details..."
            class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors leading-relaxed"
          ></textarea>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send class="w-4 h-4" />
          <span>{{ isSubmitting ? 'Sending Message...' : 'Send Message' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
