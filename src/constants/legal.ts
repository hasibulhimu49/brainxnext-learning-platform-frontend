import { SUPPORT_EMAIL } from "./social";

/*
 * Draft legal copy for the owner (or a lawyer) to review before launch.
 * Grounded in what the site already promises; edit the text here, not in the pages.
 */

export const LEGAL_LAST_UPDATED = "24 November 2026";

export interface LegalSection {
  /** anchor id, used by the "On this page" list */
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalDoc {
  title: string;
  eyebrow: string;
  icon: string;
  subtitle: string;
  sections: LegalSection[];
}

export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  eyebrow: "YOUR DATA, PLAINLY EXPLAINED",
  icon: "shield_person",
  subtitle: "What we collect, why we collect it, and the choices you have. No ads, no selling your data — ever.",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      paragraphs: [
        `BrainXNext is an online learning platform based in Bangladesh. When this policy says "we" or "us", it means the BrainXNext team. You can reach us any time at ${SUPPORT_EMAIL}.`,
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      paragraphs: ["We only collect what we need to run your account and your courses:"],
      list: [
        "Account details — your name, email address and a securely hashed password.",
        "Learning activity — courses you enroll in, lessons completed, project submissions and mentor feedback.",
        "Payment records — what you bought, the amount and the payment method type. Card, bKash and Nagad details are handled by those payment processors; we never see or store your full card number or PIN.",
        "Messages you send us through the contact form or by email.",
      ],
    },
    {
      id: "how-we-use",
      heading: "How we use it",
      paragraphs: ["We use your information to:"],
      list: [
        "Give you access to the courses and plans you signed up for and save your progress.",
        "Send account emails such as verification codes, receipts and password resets.",
        "Let mentors review your submissions and issue certificates in your name.",
        "Answer your questions and improve our courses based on how they are used.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and local storage",
      paragraphs: [
        "We use your browser's local storage to keep you signed in and to remember your light or dark theme. We do not use advertising cookies or third-party trackers, and we never show ads.",
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      paragraphs: [
        "We do not sell your personal data. We share it only with the services that help us run the platform — payment processors (bKash, Nagad and card processors), email delivery and hosting — and only as much as they need to do that job. We may disclose information if Bangladeshi law requires it.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      paragraphs: [
        "We keep your account data while your account is open. If you delete your account we remove your personal details within 30 days, except payment records we must keep for tax and accounting purposes.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your choices and rights",
      paragraphs: [
        `You can view and update your name and email in Settings at any time. To get a copy of your data or delete your account, email ${SUPPORT_EMAIL} and we will reply within 2 business days.`,
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      paragraphs: [
        "If we change this policy in a way that affects you, we will update the date at the top and let you know by email or with a notice on the site before the change takes effect.",
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: "Terms of Service",
  eyebrow: "THE RULES OF THE CLASSROOM",
  icon: "gavel",
  subtitle: "The agreement between you and BrainXNext when you create an account, take a course or buy a plan.",
  sections: [
    {
      id: "agreement",
      heading: "Using BrainXNext",
      paragraphs: [
        "By creating an account or using the site you agree to these terms. If you do not agree, please do not use BrainXNext. You must give accurate details when you sign up and keep your password private — you are responsible for activity on your account.",
      ],
    },
    {
      id: "free-and-pro",
      heading: "Free and Pro accounts",
      paragraphs: [
        "A free account gives you every free course, all free notes and handbooks, and every career roadmap. A Pro plan unlocks every course, mentor review of your project submissions and certificates. You can also buy a single paid course on its own; it includes that course's certificate and mentor review.",
      ],
    },
    {
      id: "payments",
      heading: "Prices and payments",
      paragraphs: [
        "All prices are shown in Bangladeshi Taka (৳) and include VAT. Payments are processed by bKash, Nagad or card processors. A Pro plan renews at the end of each billing period until you cancel it; you keep access until the end of the period you paid for.",
      ],
    },
    {
      id: "refunds",
      heading: "Refunds",
      paragraphs: ["Paid courses and plans come with a 30-day money-back guarantee. The full rules are in our Refund Policy."],
    },
    {
      id: "your-content",
      heading: "Your work",
      paragraphs: [
        "Projects you submit stay yours. You give us permission to store them and show them to the mentors reviewing your work. We will not publish your work without asking you first.",
      ],
    },
    {
      id: "our-content",
      heading: "Our content",
      paragraphs: [
        "Course videos, notes and handbooks are for your own learning. Please do not resell, re-upload or share paid course material or your account with others. Free notes may be shared with friends as long as you credit BrainXNext.",
      ],
    },
    {
      id: "conduct",
      heading: "Community conduct",
      paragraphs: ["Be respectful to other learners and mentors. We may suspend accounts that:"],
      list: [
        "Harass, threaten or spam other people.",
        "Submit plagiarised work for review or a certificate.",
        "Try to break, overload or get around the security of the platform.",
      ],
    },
    {
      id: "liability",
      heading: "Our responsibility",
      paragraphs: [
        "We work hard to keep courses accurate and the site running, but we provide BrainXNext as it is and cannot promise it will always be available or error-free. A certificate shows you completed a course; it is not a guarantee of a job. These terms are governed by the laws of Bangladesh.",
      ],
    },
    {
      id: "contact",
      heading: "Questions",
      paragraphs: [`If anything here is unclear, email ${SUPPORT_EMAIL} and we will explain.`],
    },
  ],
};

export const REFUNDS: LegalDoc = {
  title: "Refund Policy",
  eyebrow: "30-DAY MONEY-BACK GUARANTEE",
  icon: "currency_exchange",
  subtitle: "If a paid course or plan isn't right for you, ask within 30 days and we'll give your money back.",
  sections: [
    {
      id: "guarantee",
      heading: "The 30-day guarantee",
      paragraphs: [
        "Every paid course and every Pro plan payment is covered. If you are not happy for any reason, request a refund within 30 days of the payment and we will return the full amount — no long forms, no arguments.",
      ],
    },
    {
      id: "how-to-request",
      heading: "How to request a refund",
      paragraphs: ["Contact us from the email address on your account:"],
      list: [
        `Email ${SUPPORT_EMAIL}, or use the contact form and choose the Billing topic.`,
        "Tell us which course or plan, and the payment date or receipt number if you have it.",
        "A short reason helps us improve, but it is optional.",
      ],
    },
    {
      id: "processing",
      heading: "Processing time",
      paragraphs: [
        "We review requests within 2 business days. Once approved, the money goes back to the method you paid with — bKash and Nagad refunds usually arrive the same day, card refunds can take 5–10 business days depending on your bank.",
      ],
    },
    {
      id: "what-happens",
      heading: "What happens to your access",
      paragraphs: [
        "When a refund is issued, access to that course or plan ends. Your progress is kept, so if you buy it again later you continue where you left off. Certificates issued from a refunded purchase are withdrawn.",
      ],
    },
    {
      id: "exclusions",
      heading: "What isn't covered",
      paragraphs: ["The guarantee does not cover:"],
      list: [
        "Requests made more than 30 days after the payment.",
        "Contributions made on the Support page — these are voluntary donations.",
        "Accounts suspended for breaking our Terms of Service, such as sharing an account or reselling content.",
        "Repeated purchase-and-refund of the same course.",
      ],
    },
    {
      id: "renewals",
      heading: "Plan renewals",
      paragraphs: [
        "Each Pro renewal payment gets its own 30 days. If you forgot to cancel, ask within 30 days of the renewal and we will refund it.",
      ],
    },
  ],
};
