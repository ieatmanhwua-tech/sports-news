<script setup lang="ts">
import { Shield, Target, Users, Award, BookOpen } from 'lucide-vue-next';

useHead({
  title: 'About TipOffPh | Independent Philippine Basketball Publication',
  meta: [
    { name: 'description', content: 'TipOffPh is an independent digital sports publication dedicated to authentic Philippine basketball news, tactical analysis, and grassroots storytelling.' },
    { property: 'og:title', content: 'About TipOffPh | Independent Philippine Basketball Publication' }
  ]
});
</script>

<template>
  <div class="max-w-4xl mx-auto py-4 space-y-8">
    <header class="bg-white border border-slate-200 rounded-lg p-6 sm:p-10 shadow-sm text-center">
      <div class="w-12 h-12 rounded bg-[#E67E22] text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-4">
        TP
      </div>
      <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        About TipOffPh
      </h1>
      <p class="mt-3 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
        An independent Philippine basketball publication dedicated to factual beat reporting, deep tactical breakdowns, and comprehensive coverage from barangay courts to international arenas.
      </p>
    </header>

    <div class="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
      <section class="space-y-3">
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Target class="w-5 h-5 text-[#E67E22]" />
          Our Mission
        </h2>
        <p>
          Basketball is more than a sport in the Philippines — it is a cultural pulse found on every street corner, provincial gym, and packed coliseum. <strong>TipOffPh</strong> was founded to provide sports enthusiasts with honest, non-sensationalized journalism that respects the intelligence of fans and the integrity of athletes.
        </p>
        <p>
          Unlike algorithm-driven aggregators that prioritize clickbait headlines, TipOffPh distinguishes between verified reported facts, attributed transfer rumors, and opinion analysis.
        </p>
      </section>

      <section class="space-y-3 pt-4 border-t border-slate-100">
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award class="w-5 h-5 text-[#E67E22]" />
          Editorial Scope
        </h2>
        <p>
          Our continuous wire covers all major tiers of the Philippine basketball ecosystem:
        </p>
        <ul class="list-disc pl-5 space-y-1.5 text-slate-600">
          <li><strong>Professional Leagues:</strong> PBA (Philippine Cup, Commissioner’s Cup, Governors’ Cup), PBA D-League, and EASL East Asia Super League.</li>
          <li><strong>Regional &amp; Grassroots:</strong> Maharlika Pilipinas Basketball League (MPBL), Pilipinas Super League (PSL), VisMin Super Cup, NBL Pilipinas, and NBTC high school showcases.</li>
          <li><strong>Collegiate Pride:</strong> UAAP and NCAA men's and women's tournaments.</li>
          <li><strong>National Programs:</strong> Gilas Pilipinas men's, women's, and youth squads in FIBA competitions.</li>
          <li><strong>Overseas Pinoys:</strong> Tracking Filipino professionals in the Japan B.League, Korean KBL, Taiwan, and US NCAA.</li>
        </ul>
      </section>

      <section class="space-y-3 pt-4 border-t border-slate-100">
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield class="w-5 h-5 text-[#E67E22]" />
          Standards &amp; Integrity
        </h2>
        <p>
          We adhere to strict verification standards. We do not invent quotes, fake transfer rumors, or exaggerate scores. If we make an error, we correct it openly in accordance with our transparent corrections policy.
        </p>
      </section>

      <div class="pt-6 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-semibold">
        <NuxtLink to="/editorial-policy" class="text-[#D35400] underline">Read Editorial Policy &rarr;</NuxtLink>
        <NuxtLink to="/corrections-policy" class="text-[#D35400] underline">View Corrections Policy &rarr;</NuxtLink>
        <NuxtLink to="/contact" class="text-slate-600 underline">Contact Editorial Desk &rarr;</NuxtLink>
      </div>
    </div>
  </div>
</template>
