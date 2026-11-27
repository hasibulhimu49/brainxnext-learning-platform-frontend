import { flattenLessons, formatDuration, type FlatLesson } from "@/lib/lessons";
import type { CourseModule, Lesson } from "@/types/course";
import { COURSES, COURSE_OUTCOMES, CURRICULUM, JAVA_GENERICS_DESCRIPTION } from "./courses";

/**
 * Per-course content for the mock API (PROVISIONAL — real curricula come from the backend):
 * description, outcomes, requirements and the module / lesson outline. Java Generics keeps the
 * curriculum from the designs; every other course is generated from the outline below so that it
 * has exactly `course.lessons` classes adding up to roughly `course.hours`.
 */

interface CourseOutline {
  description: string;
  outcomes: string[];
  requirements: string[];
  /** module title → lesson topics (extra classes become practice sessions on these topics) */
  modules: [string, string[]][];
}

const OUTLINES: Record<string, CourseOutline> = {
  "code-smells": {
    description:
      "A practical introduction to code smells in Bangla — learn to spot the patterns that make Java code hard to change, and refactor them safely with tests.",
    outcomes: [
      "Recognise the classic smells: long methods, large classes, duplication",
      "Refactor step by step without breaking behaviour",
      "Use tests as a safety net while you clean up",
      "Explain to a reviewer why a change makes code easier to change",
    ],
    requirements: ["Comfortable writing basic Java classes", "Any IDE with refactoring support", "No prior refactoring experience needed"],
    modules: [
      ["What Smells Mean", ["What is a code smell?", "Smells vs. bugs vs. style", "Tests as a safety net"]],
      ["Bloaters", ["Long methods", "Large classes", "Long parameter lists"]],
      ["Change Preventers", ["Duplicated code", "Shotgun surgery", "Divergent change"]],
      ["Couplers & Cleanup", ["Feature envy", "Message chains", "Project: refactor a legacy class"]],
    ],
  },
  "python-data-analysis": {
    description:
      "Learn data analysis in Python from zero: notebooks, pandas, cleaning messy data, joins and group-bys, ending with a full analysis of a real dataset.",
    outcomes: [
      "Load, inspect and clean real-world CSV and Excel data",
      "Filter, group and aggregate with pandas",
      "Join tables and reshape data with pivot and melt",
      "Plot findings with matplotlib and seaborn",
      "Write up an analysis others can trust and reproduce",
    ],
    requirements: ["No programming experience needed", "A laptop that can run Python 3 and Jupyter", "Basic spreadsheet skills help"],
    modules: [
      [
        "Python Essentials",
        ["Setting up Jupyter", "Variables and types", "Lists and dictionaries", "Loops and conditions", "Functions", "Reading files"],
      ],
      [
        "Pandas Basics",
        ["Series and DataFrames", "Selecting rows and columns", "Filtering with conditions", "Sorting and ranking", "Adding new columns"],
      ],
      [
        "Cleaning Messy Data",
        ["Missing values", "Fixing data types", "Text cleanup with .str", "Duplicates and outliers", "Working with dates"],
      ],
      ["Combining & Reshaping", ["groupby and aggregation", "Merging tables", "Concatenating data", "Pivot tables", "melt and tidy data"]],
      ["Visualising Results", ["Plotting with matplotlib", "seaborn for statistics", "Choosing the right chart", "Styling for reports"]],
      ["Capstone Analysis", ["Framing the questions", "Cleaning the dataset", "Exploring patterns", "Writing up the findings"]],
    ],
  },
  "modern-javascript": {
    description:
      "The JavaScript underneath every framework — scope, closures, prototypes, async code and modules — taught with small programs you build and break yourself.",
    outcomes: [
      "Understand scope, hoisting and closures for real",
      "Use objects, prototypes and classes with confidence",
      "Write async code with promises and async/await",
      "Organise code into ES modules",
      "Debug and test JavaScript like a professional",
    ],
    requirements: ["Basic HTML and CSS", "Have written a little JavaScript before", "A modern browser and VS Code"],
    modules: [
      [
        "Language Core",
        ["Values and types", "let, const and scope", "Operators and coercion", "Control flow", "Functions in depth", "Arrays and methods"],
      ],
      [
        "Functions & Closures",
        ["First-class functions", "Closures explained", "this and call/apply/bind", "Arrow functions", "Higher-order functions"],
      ],
      [
        "Objects & Prototypes",
        ["Object literals", "Destructuring and spread", "Prototypes", "Classes", "Getters, setters and private fields", "Maps and Sets"],
      ],
      [
        "Async JavaScript",
        [
          "The event loop",
          "Callbacks",
          "Promises",
          "async / await",
          "Error handling in async code",
          "fetch and APIs",
          "Timers and debouncing",
        ],
      ],
      ["Modules & Tooling", ["ES modules", "npm and packages", "Bundlers in brief", "Linting and formatting", "Debugging in DevTools"]],
      ["Testing & Project", ["Unit testing basics", "Testing async code", "Project: a weather dashboard", "Project: polish and deploy"]],
    ],
  },
  "interface-design-systems": {
    description:
      "Build a token-driven design system in Figma — foundations, components and documentation — and hand it off so developers build exactly what you designed.",
    outcomes: [
      "Define colour, type and spacing tokens",
      "Build flexible components with variants and auto layout",
      "Document usage so a team applies the system consistently",
      "Hand off to developers with tokens and specs",
    ],
    requirements: ["Basic Figma skills", "Interest in UI design", "A free Figma account"],
    modules: [
      ["Foundations", ["What a design system is", "Auditing an existing UI", "Colour tokens", "Typography scale", "Spacing and grids"]],
      ["Components", ["Auto layout deep dive", "Buttons and variants", "Form controls", "Cards and lists", "Navigation patterns"]],
      ["Patterns & Theming", ["Light and dark themes", "Responsive patterns", "Accessibility checks", "Icons and illustration"]],
      ["Documentation", ["Writing usage guidelines", "Do and don't examples", "Versioning the library"]],
      ["Handoff", ["Tokens to code", "Specs developers trust", "Project: ship a mini system"]],
    ],
  },
  "sql-query-to-model": {
    description:
      "From your first SELECT to window functions, indexes and a clean analytics model — SQL taught on a realistic sales database.",
    outcomes: [
      "Write correct SELECT, JOIN and GROUP BY queries",
      "Use window functions for running totals and rankings",
      "Understand indexes and read a query plan",
      "Model data into facts and dimensions for analytics",
    ],
    requirements: ["No SQL experience needed", "Install PostgreSQL or use the browser sandbox", "Basic spreadsheet skills help"],
    modules: [
      ["Querying Basics", ["Tables, rows and columns", "SELECT and WHERE", "Sorting and limiting", "NULL and its traps"]],
      ["Joins & Aggregation", ["INNER and LEFT JOIN", "GROUP BY and HAVING", "Subqueries", "Common table expressions"]],
      ["Window Functions", ["OVER and PARTITION BY", "Running totals", "Ranking rows", "LAG and LEAD"]],
      ["Performance", ["How indexes work", "Reading EXPLAIN", "Fixing slow queries"]],
      ["Modelling for Analytics", ["Facts and dimensions", "Star schemas", "Project: model a sales mart"]],
    ],
  },
  "applied-ml": {
    description:
      "Applied machine learning end to end: frame the problem, prepare the data, choose and tune a model, evaluate it honestly and ship a pipeline.",
    outcomes: [
      "Turn a business question into an ML problem",
      "Engineer features and avoid data leakage",
      "Train, tune and compare models with scikit-learn",
      "Evaluate with the right metrics and validation",
      "Package a model as a reproducible pipeline",
    ],
    requirements: ["Comfortable with Python and pandas", "High-school maths (algebra, basic statistics)", "A laptop that runs Jupyter"],
    modules: [
      [
        "Framing Problems",
        ["What ML can and can't do", "Supervised vs unsupervised", "Defining the target", "Baselines first", "The ML workflow"],
      ],
      [
        "Data Preparation",
        ["Exploring the dataset", "Train/test splits", "Handling missing data", "Encoding categories", "Scaling features", "Data leakage"],
      ],
      [
        "Core Models",
        ["Linear regression", "Logistic regression", "Decision trees", "Random forests", "Gradient boosting", "k-nearest neighbours"],
      ],
      ["Evaluation", ["Accuracy and its limits", "Precision and recall", "ROC and AUC", "Regression metrics", "Cross-validation"]],
      ["Tuning & Features", ["Hyperparameter search", "Feature engineering", "Feature importance", "Regularisation", "Imbalanced data"]],
      ["Shipping Models", ["Pipelines in scikit-learn", "Saving and loading models", "Serving predictions", "Monitoring drift"]],
    ],
  },
  "react-architecture": {
    description:
      "Architecture for React apps that keep growing: component boundaries, state ownership, server data, performance and testing — on a real codebase.",
    outcomes: [
      "Split an app into features with clear boundaries",
      "Decide where each piece of state belongs",
      "Fetch and cache server data with TanStack Query",
      "Find and fix real performance problems",
      "Test components and flows with confidence",
    ],
    requirements: ["Solid React fundamentals (hooks, props, state)", "Modern JavaScript", "Node.js installed"],
    modules: [
      [
        "Structure",
        ["Feature folders vs layers", "Component boundaries", "Composition patterns", "Design tokens in code", "TypeScript at scale"],
      ],
      ["State Ownership", ["Local vs global state", "Lifting state up", "Context, used well", "Zustand for client state", "URL as state"]],
      [
        "Server Data",
        ["Server state is different", "TanStack Query basics", "Mutations and invalidation", "Optimistic updates", "Error handling"],
      ],
      ["Performance", ["Measuring with the profiler", "Memoisation that matters", "Code splitting", "Lists and virtualisation"]],
      ["Testing", ["Testing Library basics", "Mocking the network", "End-to-end with Playwright", "What not to test"]],
      ["Capstone", ["Refactoring the legacy app", "Review and wrap-up"]],
    ],
  },
  "product-analytics": {
    description:
      "Learn how product teams use data: instrument events, define metrics that matter, read funnels and retention, and avoid fooling yourself.",
    outcomes: [
      "Design an event tracking plan",
      "Define north-star and input metrics",
      "Read funnels, cohorts and retention curves",
      "Run and read simple A/B tests honestly",
    ],
    requirements: ["No technical background needed", "Basic spreadsheet skills", "Curiosity about how products grow"],
    modules: [
      ["Why Analytics", ["Questions before dashboards", "Metrics that matter", "The north-star metric"]],
      ["Instrumentation", ["Events and properties", "Writing a tracking plan", "Data quality checks", "Privacy basics"]],
      ["Funnels & Retention", ["Building a funnel", "Cohort analysis", "Retention curves", "Activation moments"]],
      ["Experiments", ["A/B testing basics", "Sample size and power", "Reading results honestly"]],
      ["Reporting", ["Dashboards people use", "Telling the story", "Project: analyse a product launch"]],
    ],
  },
  "ux-research": {
    description:
      "A five-day crash course in UX research: plan a study, recruit participants, run interviews and usability tests, and turn findings into decisions.",
    outcomes: [
      "Write a research plan with clear questions",
      "Run interviews without leading the participant",
      "Moderate usability tests and capture findings",
      "Synthesise insights that change the roadmap",
    ],
    requirements: ["No research experience needed", "A product or idea to study", "A notebook or Figma/FigJam"],
    modules: [
      ["Day 1 · Plan", ["What research answers", "Writing research questions", "Choosing a method"]],
      ["Day 2 · Recruit", ["Finding participants", "Screeners", "Consent and ethics"]],
      ["Day 3 · Interview", ["Interview guides", "Asking without leading", "Taking good notes"]],
      ["Day 4 · Test", ["Usability test tasks", "Moderating a session", "Remote testing"]],
      ["Day 5 · Synthesise", ["Affinity mapping", "Writing insights", "Presenting findings"]],
    ],
  },
  "building-with-llms": {
    description:
      "Build real features on large language models: prompting, retrieval-augmented generation, tools, evaluation and the failure modes nobody warns you about.",
    outcomes: [
      "Call LLM APIs and structure prompts reliably",
      "Build retrieval-augmented generation over your documents",
      "Let models call tools safely",
      "Evaluate outputs and catch regressions",
      "Handle cost, latency and failure modes in production",
    ],
    requirements: ["Comfortable with Python or JavaScript", "Basic HTTP / API knowledge", "An API key for an LLM provider"],
    modules: [
      ["How LLMs Work", ["Tokens and context windows", "Sampling and temperature", "Choosing a model", "Calling the API"]],
      ["Prompting", ["Prompt structure", "Few-shot examples", "Structured output", "System prompts"]],
      ["Retrieval (RAG)", ["Embeddings explained", "Chunking documents", "Vector search", "Grounded answers", "Citations"]],
      ["Tools & Agents", ["Function calling", "Multi-step workflows", "Guardrails", "Human in the loop"]],
      ["Evaluation", ["Building an eval set", "Automatic grading", "Regression testing"]],
      ["Production", ["Cost and latency", "Caching and streaming", "Failure modes", "Project: a support assistant"]],
    ],
  },
  "data-visualization": {
    description:
      "Make charts people understand: pick the right chart, remove the noise, use colour with purpose and tell the story the data actually supports.",
    outcomes: [
      "Pick the right chart for the question",
      "Declutter charts so the message stands out",
      "Use colour and annotation with purpose",
      "Build a small dashboard that tells a story",
    ],
    requirements: ["No design background needed", "Excel, Google Sheets or Python", "A dataset you care about (optional)"],
    modules: [
      ["Seeing Data", ["Why visualise", "How we read charts", "Chart types at a glance"]],
      ["Choosing Charts", ["Comparisons", "Trends over time", "Parts of a whole", "Distributions"]],
      ["Design", ["Decluttering", "Colour with purpose", "Annotation and labels", "Accessible charts"]],
      ["Storytelling", ["Finding the story", "Dashboards that work", "Project: a one-page report"]],
    ],
  },
  "git-collaboration": {
    description:
      "Git for working on a team without fear: commits, branches, merges, rebases, pull requests and fixing mistakes when they happen.",
    outcomes: [
      "Commit, branch and merge with confidence",
      "Rebase and resolve conflicts calmly",
      "Open and review pull requests on GitHub",
      "Undo mistakes without losing work",
    ],
    requirements: ["Basic command-line use", "Git installed", "A free GitHub account"],
    modules: [
      ["Git Basics", ["Why version control", "Your first repository", "Commits that tell a story", "Viewing history"]],
      ["Branching", ["Branches explained", "Merging", "Resolving conflicts", "Rebasing"]],
      ["Working with GitHub", ["Remotes and pushing", "Pull requests", "Code review etiquette", "Forks and open source"]],
      ["Fixing Mistakes", ["Undoing changes", "reflog to the rescue", "Team workflow: wrap-up"]],
    ],
  },
  "marketing-analytics": {
    description:
      "Measure marketing that actually moves revenue: tracking, attribution, funnels, campaign ROI and reports leadership can act on.",
    outcomes: [
      "Set up campaign tracking with UTMs and analytics",
      "Compare attribution models and their trade-offs",
      "Analyse funnels and customer acquisition cost",
      "Report ROI so budgets follow results",
    ],
    requirements: ["Basic marketing knowledge", "Spreadsheet skills", "Access to an analytics tool helps"],
    modules: [
      ["Measurement Basics", ["What to measure", "UTM tracking", "Analytics setup", "Goals and conversions"]],
      ["Attribution", ["Last-click vs multi-touch", "Data-driven attribution", "Attribution pitfalls", "Incrementality"]],
      ["Funnels & Customers", ["Marketing funnels", "CAC and LTV", "Cohorts for marketers", "Segmentation"]],
      ["Campaigns", ["Paid social metrics", "Search ads metrics", "Email performance", "Testing creatives"]],
      ["Reporting", ["ROI and ROAS", "Dashboards for leadership", "Project: a quarterly report"]],
    ],
  },
  "prompt-engineering": {
    description:
      "Practical prompt engineering: structure prompts, give examples, get reliable structured output and evaluate results before you ship an AI feature.",
    outcomes: [
      "Write clear, structured prompts",
      "Use examples and step-by-step reasoning",
      "Get reliable JSON and structured output",
      "Evaluate and improve prompts systematically",
    ],
    requirements: ["No coding needed for most classes", "Access to any AI chat assistant", "Basic Python helps for the last module"],
    modules: [
      ["Prompt Basics", ["How models read prompts", "Clear instructions", "Role and context", "Iterating on prompts"]],
      ["Techniques", ["Few-shot examples", "Step-by-step reasoning", "Breaking tasks down", "Prompt templates"]],
      ["Reliable Output", ["Structured output", "Handling edge cases", "Reducing hallucinations"]],
      ["Evaluation", ["Test sets for prompts", "Comparing prompt versions", "Project: a reliable summariser"]],
    ],
  },
  "motion-design": {
    description:
      "Motion for interfaces that feels right: timing, easing, choreography and micro-interactions — prototyped in Figma and handed off for development.",
    outcomes: [
      "Use timing and easing to make motion feel natural",
      "Choreograph transitions between screens",
      "Design micro-interactions that give feedback",
      "Hand off motion specs developers can build",
    ],
    requirements: ["Comfortable with Figma", "Basic UI design knowledge", "No animation experience needed"],
    modules: [
      ["Motion Principles", ["Why motion matters", "Timing and duration", "Easing curves", "Motion and accessibility"]],
      ["Transitions", ["Screen transitions", "Shared elements", "Choreography", "Smart Animate in Figma"]],
      ["Micro-interactions", ["Feedback states", "Loading and progress", "Buttons and toggles", "Delightful details"]],
      ["Handoff", ["Motion specs", "Lottie and code", "Project: animate an onboarding flow"]],
    ],
  },
};

const JAVA_OUTLINE = {
  description: JAVA_GENERICS_DESCRIPTION,
  outcomes: COURSE_OUTCOMES,
  requirements: ["Core Java basics — classes, objects, methods", "Any IDE (IntelliJ or VS Code)", "No prior generics knowledge needed"],
};

/** "18h" → seconds */
const hoursToSeconds = (hours: string) => Math.round((Number.parseFloat(hours) || 1) * 3600);

const mmss = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Deterministic ±20% spread so lessons don't all last the same. */
const jitter = (i: number) => 0.8 + ((((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1) * 0.4;

/** Split `total` lessons over the modules: as even as possible, earlier modules take the remainder. */
const splitLessons = (total: number, modules: number) =>
  Array.from({ length: modules }, (_, i) => Math.floor(total / modules) + (i < total % modules ? 1 : 0));

const buildCurriculum = (lessonCount: number, hours: string, outline: CourseOutline): CourseModule[] => {
  const counts = splitLessons(lessonCount, outline.modules.length);
  const weights = Array.from({ length: lessonCount }, (_, i) => jitter(i + 1));
  const scale = hoursToSeconds(hours) / weights.reduce((a, b) => a + b, 0);
  let n = 0;
  return outline.modules.map(([title, topics], mi) => {
    const lessons: Lesson[] = Array.from({ length: counts[mi] ?? 0 }, (_, li) => {
      const topic = li < topics.length ? topics[li] : `Practice — ${topics[(li - topics.length) % topics.length] ?? title}`;
      const seconds = Math.max(240, Math.round((weights[n] ?? 1) * scale));
      n += 1;
      return { title: `Class ${n} — ${topic}`, dur: mmss(seconds), ...(n <= 2 ? { preview: true } : {}) };
    });
    const moduleSeconds = lessons.reduce((sum, l) => {
      const [m = 0, s = 0] = l.dur.split(":").map(Number);
      return sum + m * 60 + s;
    }, 0);
    return { title, meta: `${lessons.length} classes · ${formatDuration(moduleSeconds)}`, lessons };
  });
};

const cache = new Map<string, CourseModule[]>();

/** The course's modules and lessons; an unknown id gets an empty curriculum. */
export const curriculumOf = (courseId: string): CourseModule[] => {
  if (courseId === "java-generics") return CURRICULUM;
  const cached = cache.get(courseId);
  if (cached) return cached;
  const course = COURSES.find((c) => c.id === courseId);
  const outline = OUTLINES[courseId];
  const built = course && outline ? buildCurriculum(course.lessons, course.hours, outline) : [];
  cache.set(courseId, built);
  return built;
};

export const lessonsOf = (courseId: string): FlatLesson[] => flattenLessons(curriculumOf(courseId));

export const lessonIdsOf = (courseId: string): string[] => lessonsOf(courseId).map((l) => l.id);

export const totalLessonsOf = (courseId: string) => lessonIdsOf(courseId).length;

/** The free handbook (slug, see HANDBOOKS in ./courses) that goes with a course, if there is one. */
const HANDBOOK_OF: Record<string, string> = {
  "java-generics": "java",
  "code-smells": "java",
  "python-data-analysis": "python",
  "applied-ml": "python",
  "modern-javascript": "javascript",
  "react-architecture": "javascript",
  "sql-query-to-model": "mysql",
  "git-collaboration": "git",
};

/** Description, outcomes, requirements and handbook for the course page. */
export const courseContentOf = (courseId: string, fallbackBlurb: string) => {
  const outline = courseId === "java-generics" ? JAVA_OUTLINE : OUTLINES[courseId];
  return {
    description: outline?.description ?? fallbackBlurb,
    outcomes: outline?.outcomes ?? [],
    requirements: outline?.requirements ?? [],
    handbook: HANDBOOK_OF[courseId] ?? null,
  };
};
