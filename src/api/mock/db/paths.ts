import type { LearningPath } from "@/types/path";

const g = (a: string, b: string) => `linear-gradient(135deg,${a},${b})`;

/** Learning paths (F-008): ordered course sequences built from the catalog. */
export const PATHS: LearningPath[] = [
  {
    id: "backend-developer",
    title: "Backend Developer",
    tagline: "From Java fundamentals to databases and clean, reviewable code.",
    description:
      "Learn to write type-safe Java, keep a codebase clean, model and query data with SQL, and collaborate with Git like a professional team. Ends with projects you can show in an interview.",
    icon: "dns",
    grad: g("#1B6FD0", "#0E97B0"),
    level: "Beginner",
    outcomes: [
      "Write type-safe, reusable Java",
      "Spot and refactor code smells",
      "Design schemas and write real SQL",
      "Work in a team with Git and pull requests",
    ],
    steps: [
      { courseId: "java-generics", why: "Type-safe Java is the base every backend service is built on." },
      { courseId: "code-smells", why: "Learn to keep that code readable before it grows." },
      { courseId: "sql-query-to-model", why: "Every backend stores data — model it and query it well." },
      { courseId: "git-collaboration", why: "Ship like a team: branches, reviews and clean history." },
      { courseId: "modern-javascript", why: "Understand the frontend that calls your APIs." },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    tagline: "Clean data, query it, chart it and turn it into decisions.",
    description:
      "Go from spreadsheets to a real analyst toolkit: Python and pandas for cleaning, SQL for querying, charts that tell a story, and product and marketing analytics to answer business questions.",
    icon: "insights",
    grad: g("#3FA457", "#0E97B0"),
    level: "Beginner",
    outcomes: [
      "Clean and analyse data with pandas",
      "Answer questions with SQL",
      "Build clear, honest charts",
      "Measure products and campaigns",
    ],
    steps: [
      { courseId: "python-data-analysis", why: "Python and pandas are the analyst's daily tools." },
      { courseId: "sql-query-to-model", why: "Most company data lives in a database — query it yourself." },
      { courseId: "data-visualization", why: "A good chart is how your analysis gets read." },
      { courseId: "product-analytics", why: "Turn numbers into product decisions." },
      { courseId: "marketing-analytics", why: "Measure what campaigns really bring in." },
    ],
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    tagline: "Build with machine learning and large language models.",
    description:
      "Start with Python data skills, learn to prompt models well, then train and evaluate classic ML models and finish by building real applications on top of LLMs.",
    icon: "smart_toy",
    grad: g("#7A4FD0", "#1B6FD0"),
    level: "Intermediate",
    outcomes: ["Prepare data for models", "Write prompts that work reliably", "Train and evaluate ML models", "Ship an LLM-powered app"],
    steps: [
      { courseId: "python-data-analysis", why: "Models are only as good as the data you prepare." },
      { courseId: "prompt-engineering", why: "Get reliable results from language models fast." },
      { courseId: "applied-ml", why: "Frame problems, pick models and evaluate them properly." },
      { courseId: "building-with-llms", why: "Put it together in a real LLM application." },
    ],
  },
  {
    id: "product-designer",
    title: "Product Designer",
    tagline: "Research users, design systems and bring interfaces to life.",
    description:
      "Learn to understand users through research, build consistent interfaces with a design system, and add motion that makes products feel polished.",
    icon: "palette",
    grad: g("#E9A21B", "#D9534F"),
    level: "Beginner",
    outcomes: ["Plan and run user research", "Build a token-based design system", "Design meaningful motion"],
    steps: [
      { courseId: "ux-research", why: "Good design starts with knowing your users." },
      { courseId: "interface-design-systems", why: "Design consistent screens that hand off cleanly." },
      { courseId: "motion-design", why: "Motion makes an interface feel alive and clear." },
    ],
  },
];
