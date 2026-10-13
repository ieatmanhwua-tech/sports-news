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
  <div class="max-w-3xl mx-auto py-4">
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 mb-6 shadow-sm">
      <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#D35400]">
        <Mail class="w-4 h-4" />
        <span>Connect With Us</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        Contact TipOffPh
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        Have a news tip, press release, official score sheet, or advertising inquiry? Fill out the form below or reach our Manila newsroom.
      </p>
    </header>

    <div class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
      <!-- Success Feedback Alert (Only rendered if backend returned genuine success) -->
      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-sm flex items-start gap-3">
        <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold">Message Delivered</h4>
          <p class="mt-0.5">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Error Feedback Alert -->
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
              placeholder="e.g. Juan dela Cruz"
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
              placeholder="juan@example.com"
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <input 
              v-model="form.subject"
              type="text" 
              required
              placeholder="e.g. News Scoop / Press Release"
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Phone (Optional)
            </label>
            <input 
              v-model="form.phone"
              type="tel" 
              placeholder="+63 9XX XXX XXXX"
              class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Message or Press Details *
          </label>
          <textarea 
            v-model="form.message"
            rows="5"
            required
            placeholder="Provide context, verifiable links, or press announcement details..."
            class="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#E67E22] focus:bg-white leading-relaxed"
          ></textarea>
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full sm:w-auto px-6 py-2.5 bg-[#E67E22] hover:bg-amber-600 text-white font-bold text-sm rounded shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send class="w-4 h-4" />
          <span>{{ isSubmitting ? 'Sending Message...' : 'Send Message' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
