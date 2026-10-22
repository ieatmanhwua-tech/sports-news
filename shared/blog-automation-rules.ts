export type AutomationBlogFormatId =
  | 'breaking-news'
  | 'game-recap'
  | 'investigative-analysis';

export interface AutomationBlogFormatRule {
  id: AutomationBlogFormatId;
  newsFormat: string;
  shortBadge: string;
  optimalWordCountLabel: string;
  minWords: number;
  maxWords: number | null; // null means 2,500+ words
  targetWords: number;
  seoPurposeAndStrategy: string;
  keyRequirements: string[];
}

export const AUTOMATION_BLOG_FORMAT_RULES: AutomationBlogFormatRule[] = [
  {
    id: 'breaking-news',
    newsFormat: 'Breaking News / Quick Updates',
    shortBadge: 'Breaking News • 300–500 Words',
    optimalWordCountLabel: '300 – 500 words',
    minWords: 300,
    maxWords: 500,
    targetWords: 400,
    seoPurposeAndStrategy:
      'Designed for rapid indexing and hitting the "Top Stories" carousel. Focus strictly on the 5 Ws (Who, What, When, Where, Why) and getting published quickly.',
    keyRequirements: [
      'Strict 5 Ws structure (Who, What, When, Where, Why) in the opening lead and bullet block',
      '300 to 500 words optimal length for rapid Google Indexing API & Top Stories carousel inclusion',
      'Verified Manila Time (PHT) timestamp and live/breaking match telemetry'
    ]
  },
  {
    id: 'game-recap',
    newsFormat: 'Standard Game Recaps & Reports',
    shortBadge: 'Standard Game Recap • 600–900 Words',
    optimalWordCountLabel: '600 – 900 words',
    minWords: 600,
    maxWords: 900,
    targetWords: 750,
    seoPurposeAndStrategy:
      'The standard for daily sports journalism. Provides enough room for player quotes, statistical context, and natural integration of secondary keywords without fluff.',
    keyRequirements: [
      '600 to 900 words daily sports journalism standard',
      'Includes post-game head coach and star player quotes',
      'Complete Q1–Q4 statistical context, shooting splits, and natural secondary keyword integration without fluff'
    ]
  },
  {
    id: 'investigative-analysis',
    newsFormat: 'Investigative Features & Analysis',
    shortBadge: 'Investigative Feature & Analysis • 1,200–2,500+ Words',
    optimalWordCountLabel: '1,200 – 2,500+ words',
    minWords: 1200,
    maxWords: null,
    targetWords: 1500,
    seoPurposeAndStrategy:
      'Designed for evergreen search traffic. These rank highly by deeply covering a topic, satisfying E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness), and capturing long-tail search queries.',
    keyRequirements: [
      '1,200 to 2,500+ words comprehensive analytical depth',
      'Satisfies Google E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) with tactical schemes, Four Factors telemetry, and depth charts',
      'Captures long-tail search queries, head-to-head matchups, betting line projections, and FAQ breakdowns'
    ]
  }
];

export function countArticleWords(text?: string | null): number {
  if (!text) return 0;
  const cleaned = String(text)
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(' ').filter(Boolean).length;
}

export function getAutomationFormatRuleById(
  id?: AutomationBlogFormatId | string | null
): AutomationBlogFormatRule {
  return (
    AUTOMATION_BLOG_FORMAT_RULES.find(r => r.id === id) ||
    AUTOMATION_BLOG_FORMAT_RULES[1]!
  );
}

export function evaluateWordCountAgainstRule(
  wordCount: number,
  formatId: AutomationBlogFormatId
): {
  rule: AutomationBlogFormatRule;
  isOptimal: boolean;
  statusLabel: string;
  progressPct: number;
} {
  const rule = getAutomationFormatRuleById(formatId);
  const min = rule.minWords;
  const max = rule.maxWords;

  if (wordCount < min) {
    const pct = Math.min(99, Math.round((wordCount / min) * 100));
    return {
      rule,
      isOptimal: false,
      statusLabel: `${min - wordCount} words below ${rule.optimalWordCountLabel} minimum`,
      progressPct: pct
    };
  }

  if (max !== null && wordCount > max) {
    return {
      rule,
      isOptimal: false,
      statusLabel: `${wordCount - max} words above ${rule.optimalWordCountLabel} ceiling`,
      progressPct: 100
    };
  }

  return {
    rule,
    isOptimal: true,
    statusLabel: `Optimal (${wordCount.toLocaleString()} words • matches ${rule.optimalWordCountLabel})`,
    progressPct: 100
  };
}

export function detectFormatRuleFromWordCount(wordCount: number): AutomationBlogFormatRule {
  if (wordCount >= 1100) {
    return AUTOMATION_BLOG_FORMAT_RULES[2]!;
  }
  if (wordCount >= 550) {
    return AUTOMATION_BLOG_FORMAT_RULES[1]!;
  }
  return AUTOMATION_BLOG_FORMAT_RULES[0]!;
}
