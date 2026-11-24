/* Help centre / FAQ content for /help. UI copy, not server data. */

export const HELP_CATEGORIES = [
  { id: "account", label: "Account", icon: "manage_accounts" },
  { id: "learning", label: "Courses & learning", icon: "school" },
  { id: "payments", label: "Payments & refunds", icon: "payments" },
  { id: "certificates", label: "Certificates", icon: "workspace_premium" },
  { id: "mentor-review", label: "Mentor review", icon: "rate_review" },
] as const;

export type HelpCategoryId = (typeof HELP_CATEGORIES)[number]["id"];

export interface HelpQuestion {
  category: HelpCategoryId;
  q: string;
  a: string;
}

export const HELP_QUESTIONS: HelpQuestion[] = [
  // Account
  {
    category: "account",
    q: "How do I create an account?",
    a: "Click “Sign up”, enter your name, email and a password, then type the 6-digit code we email you. It's free and needs no card.",
  },
  {
    category: "account",
    q: "I forgot my password. What now?",
    a: "On the login page choose “Forgot password?”, enter your email and follow the reset link we send. The link expires after a short time, so use it soon.",
  },
  {
    category: "account",
    q: "I didn't get the verification email.",
    a: "Check your spam or promotions folder, then use “Resend code” on the verification screen. If it still doesn't arrive, contact us and we'll verify you manually.",
  },
  {
    category: "account",
    q: "How do I change my name or email?",
    a: "Open Settings from your dashboard. You can update your name straight away; changing your email asks you to confirm the new address.",
  },
  // Courses & learning
  {
    category: "learning",
    q: "Which courses are free?",
    a: "Every course marked Free is complete — all lessons, exercise files and handbooks — with no trial timer. A free account gets every free course; Pro unlocks the rest.",
  },
  {
    category: "learning",
    q: "What language are the courses in?",
    a: "Courses are taught in Bangla, with code, slides and technical terms kept in industry-standard English.",
  },
  {
    category: "learning",
    q: "Do I keep access after I finish a course?",
    a: "Yes. A course you bought stays in your dashboard. Pro courses stay open for as long as your Pro plan is active.",
  },
  {
    category: "learning",
    q: "Are the handbooks really free?",
    a: "Yes — every handbook on the Notes page is free and needs no account. You can choose to support the platform before downloading, but it is optional.",
  },
  // Payments & refunds
  {
    category: "payments",
    q: "How can I pay?",
    a: "We accept bKash, Nagad and debit or credit cards. All prices are in Taka (৳) and already include VAT.",
  },
  {
    category: "payments",
    q: "What do I get with Pro?",
    a: "Pro unlocks every course on BrainXNext, mentor review of your project submissions and certificates. Free accounts get free courses only.",
  },
  {
    category: "payments",
    q: "Can I get a refund?",
    a: "Yes. Paid courses and plans have a 30-day money-back guarantee. Email us or use the contact form with the Billing topic, and we review requests within 2 business days.",
  },
  {
    category: "payments",
    q: "How do I cancel my Pro plan?",
    a: "Cancel any time from Settings. You keep Pro until the end of the period you already paid for, and it won't renew after that.",
  },
  // Certificates
  {
    category: "certificates",
    q: "How do I earn a certificate?",
    a: "Finish every lesson in a course and get your final project approved by a mentor. Certificates come with Pro or with a paid course.",
  },
  {
    category: "certificates",
    q: "Can employers check my certificate?",
    a: "Every certificate has a unique ID printed on it. Employers can email us the ID and we'll confirm it's genuine.",
  },
  {
    category: "certificates",
    q: "My name is wrong on the certificate.",
    a: "Update your name in Settings, then contact us with the certificate ID and we'll reissue it with the correct name.",
  },
  // Mentor review
  {
    category: "mentor-review",
    q: "What is mentor review?",
    a: "When you submit a course project, a working practitioner reviews your code or design and leaves written feedback — what's good, what to fix and what to learn next.",
  },
  {
    category: "mentor-review",
    q: "How long does a review take?",
    a: "Most reviews come back within 48 hours. You'll see the feedback on your dashboard as soon as it's ready.",
  },
  {
    category: "mentor-review",
    q: "Can I resubmit after feedback?",
    a: "Yes. Fix the points your mentor raised and submit again — there's no limit on resubmissions while your plan is active.",
  },
];

/** Case-insensitive match on question and answer, optionally limited to one category. */
export const filterHelpQuestions = (questions: HelpQuestion[], query: string, category: HelpCategoryId | "all" = "all") => {
  const needle = query.trim().toLowerCase();
  return questions.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (!needle || item.q.toLowerCase().includes(needle) || item.a.toLowerCase().includes(needle))
  );
};
