<script setup lang="ts">
import { ShieldCheck, BookOpen, AlertCircle } from 'lucide-vue-next';

useHead({
  title: 'Editorial Policy & Verification Standards | TipOffPh',
  meta: [
    { name: 'description', content: 'TipOffPh journalistic standards, rumor attribution criteria, fact-checking workflows, and conflicts of interest guidelines.' }
  ]
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 space-y-6">
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
      <div class="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[#D35400]">
        <ShieldCheck class="w-4 h-4" />
        <span>Journalistic Integrity</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        TipOffPh Editorial Policy
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        Our principles of truthfulness, news verification, and transparent attribution in Philippine sports journalism.
      </p>
    </header>

    <div class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
      <section class="space-y-2">
        <h2 class="text-lg font-bold text-slate-900">1. Verification and Sourcing</h2>
        <p>
          TipOffPh insists on direct verification for all factual claims, injury reports, game results, and roster decisions. Official announcements from the PBA, MPBL, SBP, UAAP, NCAA, or FIBA are cross-referenced with on-the-record or trusted background sources before publishing.
        </p>
      </section>

      <section class="space-y-2 pt-4 border-t border-slate-100">
        <h2 class="text-lg font-bold text-slate-900">2. Clear Distinction of Content Types</h2>
        <p>
          To avoid misleading readers, every piece of content published on TipOffPh carries an explicit content-type classification:
        </p>
        <ul class="list-disc pl-5 space-y-1 text-slate-600 text-sm">
          <li><strong>Reported News:</strong> Verified, fact-checked reporting with confirmed sources.</li>
          <li><strong>Attributed Rumors:</strong> Trade discussions and contract talks sourced from league insiders, clearly labeled with appropriate disclaimers that paperwork is not yet final.</li>
          <li><strong>Editorial / Opinion:</strong> Subjective analysis, tactical columns, and debate essays representing the writer's perspective.</li>
          <li><strong>Interviews:</strong> Direct, verbatim or recorded Q&amp;A sessions with athletes and coaches.</li>
        </ul>
      </section>

      <section class="space-y-2 pt-4 border-t border-slate-100">
        <h2 class="text-lg font-bold text-slate-900">3. Independence from Commercial Interests</h2>
        <p>
          Our reporters do not accept gifts, financial inducements, or editorial direction from basketball franchises, player agencies, or commercial sponsors that compromise independent reporting. Sponsored content, when present, is prominently designated as such.
        </p>
      </section>
    </div>
  </div>
</template>
