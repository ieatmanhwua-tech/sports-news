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
  <div class="max-w-4xl mx-auto py-4 space-y-6">
    <header class="bg-gradient-to-br from-[#0c1222]/95 via-[#0e172c]/90 to-[#090e1c]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-10 shadow-[0_4px_35px_rgba(0,0,0,0.7)] text-center ring-1 ring-cyan-500/20 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
        TP
      </div>
      <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
        About TipOffPh
      </h1>
      <p class="mt-3 text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
        An independent Philippine basketball publication dedicated to factual beat reporting, deep tactical breakdowns, and comprehensive coverage from barangay courts to international arenas.
      </p>
    </header>

    <div class="bg-gradient-to-br from-[#0c1222]/90 via-[#0e172c]/85 to-[#090e1c]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base ring-1 ring-cyan-500/20">
      <section class="space-y-3">
        <h2 class="text-xl font-black text-white flex items-center gap-2 drop-shadow-sm">
          <Target class="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          <span>Our Mission</span>
        </h2>
        <p>
          Basketball is more than a sport in the Philippines — it is a cultural pulse found on every street corner, provincial gym, and packed coliseum. <strong class="text-white font-bold">TipOffPh</strong> was founded to provide sports enthusiasts with honest, non-sensationalized journalism that respects the intelligence of fans and the integrity of athletes.
        </p>
        <p>
          Unlike algorithm-driven aggregators that prioritize clickbait headlines, TipOffPh distinguishes between verified reported facts, attributed transfer rumors, and opinion analysis.
        </p>
      </section>

      <section class="space-y-3 pt-4 border-t border-slate-800">
        <h2 class="text-xl font-black text-white flex items-center gap-2 drop-shadow-sm">
          <Award class="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          <span>Editorial Scope</span>
        </h2>
        <p>
          Our continuous wire covers all major tiers of the Philippine basketball ecosystem:
        </p>
        <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
          <li><strong class="text-white">Professional Leagues:</strong> PBA (Philippine Cup, Commissioner’s Cup, Governors’ Cup), PBA D-League, and EASL East Asia Super League.</li>
          <li><strong class="text-white">Regional &amp; Grassroots:</strong> Maharlika Pilipinas Basketball League (MPBL), Pilipinas Super League (PSL), VisMin Super Cup, NBL Pilipinas, and NBTC high school showcases.</li>
          <li><strong class="text-white">Collegiate Pride:</strong> UAAP and NCAA men's and women's tournaments.</li>
          <li><strong class="text-white">National Programs:</strong> Gilas Pilipinas men's, women's, and youth squads in FIBA competitions.</li>
          <li><strong class="text-white">Overseas Pinoys:</strong> Tracking Filipino professionals in the Japan B.League, Korean KBL, Taiwan, and US NCAA.</li>
        </ul>
      </section>

      <section class="space-y-3 pt-4 border-t border-slate-800">
        <h2 class="text-xl font-black text-white flex items-center gap-2 drop-shadow-sm">
          <Shield class="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          <span>Standards &amp; Integrity</span>
        </h2>
        <p>
          We adhere to strict verification standards. We do not invent quotes, fake transfer rumors, or exaggerate scores. If we make an error, we correct it openly in accordance with our transparent corrections policy.
        </p>
      </section>

      <div class="pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-bold">
        <NuxtLink to="/editorial-policy" class="text-orange-400 hover:text-orange-300 underline">Read Editorial Policy &rarr;</NuxtLink>
        <NuxtLink to="/corrections-policy" class="text-orange-400 hover:text-orange-300 underline">View Corrections Policy &rarr;</NuxtLink>
        <NuxtLink to="/contact" class="text-slate-400 hover:text-white underline">Contact Editorial Desk &rarr;</NuxtLink>
      </div>
    </div>
  </div>
</template>
