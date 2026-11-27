import { COURSES } from "./courses";
import { curriculumOf } from "./curricula";
import { createCollection } from "./store";

/**
 * Module quiz bank (F-007). One quiz per curriculum module. Generics in Java has hand-written
 * questions (QUIZ_BANK); every other course gets a simple generated quiz per module, built from
 * its own curriculum (see quizFor). PROVISIONAL until real quizzes come from the backend.
 */

export interface BankQuestion {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const QUIZ_PASS_PCT = 70;

export const QUIZ_BANK: BankQuestion[][] = [
  [
    {
      id: "m1-q1",
      prompt: "What is the main benefit of generics?",
      options: ["Faster code at runtime", "Type errors are caught at compile time", "Smaller .class files", "They replace interfaces"],
      answer: 1,
      explanation:
        "Generics move type checks to compile time, so a wrong type is a compile error instead of a ClassCastException at runtime.",
    },
    {
      id: "m1-q2",
      prompt: "Which line declares a generic class correctly?",
      options: ["class Box(T) { }", "class Box<T> { }", "class <T>Box { }", "generic class Box { }"],
      answer: 1,
      explanation: "The type parameter list goes in angle brackets right after the class name: class Box<T>.",
    },
    {
      id: "m1-q3",
      prompt: "Where does the type parameter go in a generic method?",
      code: "____ T first(List<T> items)",
      options: ["After the return type", "Before the return type: <T>", "After the method name", "Generic methods can't have one"],
      answer: 1,
      explanation: "A generic method declares its own type parameter before the return type: public static <T> T first(List<T> items).",
    },
    {
      id: "m1-q4",
      prompt: "What does List<String> list = new ArrayList<>(); use?",
      options: ["A raw type", "The diamond operator", "A wildcard", "Type erasure"],
      answer: 1,
      explanation: "<> is the diamond: the compiler infers ArrayList<String> from the declared type.",
    },
  ],
  [
    {
      id: "m2-q1",
      prompt: "What does <T extends Number> allow T to be?",
      options: ["Only Number", "Number or any subclass of it", "Any type except Number", "Only primitive numbers"],
      answer: 1,
      explanation: "An upper bound accepts the bound type and every subtype — Integer, Double, Long…",
    },
    {
      id: "m2-q2",
      prompt: "How do you write multiple bounds?",
      options: ["<T extends A, B>", "<T extends A & B>", "<T extends A | B>", "<T implements A, B>"],
      answer: 1,
      explanation: "Multiple bounds are joined with &, and a class bound (if any) must come first: <T extends Number & Comparable<T>>.",
    },
    {
      id: "m2-q3",
      prompt: "Why bound a type parameter at all?",
      options: [
        "To make it faster",
        "So you can call the bound's methods on T",
        "To allow primitives",
        "Bounds are required for every generic",
      ],
      answer: 1,
      explanation:
        "With <T extends Comparable<T>> you can call compareTo on a T — without the bound the compiler only knows Object's methods.",
    },
    {
      id: "m2-q4",
      prompt: "In a bounded type parameter, `extends` is also used for…",
      options: ["Classes only", "Interfaces too", "Enums only", "Nothing else"],
      answer: 1,
      explanation: "In type parameters, extends covers both classes and interfaces — there is no implements keyword there.",
    },
  ],
  [
    {
      id: "m3-q1",
      prompt: "PECS stands for…",
      options: [
        "Public Extends, Class Super",
        "Producer Extends, Consumer Super",
        "Parameter Extends, Collection Super",
        "Primary Extends, Child Super",
      ],
      answer: 1,
      explanation: "Producer Extends, Consumer Super: read from ? extends T, write into ? super T.",
    },
    {
      id: "m3-q2",
      prompt: "Which list can you safely add an Integer to?",
      options: ["List<? extends Number>", "List<? super Integer>", "List<?>", "None of them"],
      answer: 1,
      explanation: "? super Integer is a consumer: it's a list of Integer or a supertype, so adding an Integer is always safe.",
    },
    {
      id: "m3-q3",
      prompt: "What type do you get when reading from a List<? extends Number>?",
      options: ["Integer", "Number", "Object only", "Nothing — reading isn't allowed"],
      answer: 1,
      explanation: "Every element is some subtype of Number, so reading gives you a Number.",
    },
    {
      id: "m3-q4",
      prompt: "In Collections.copy, which list consumes and which produces?",
      code: "static <T> void copy(List<? super T> dest, List<? extends T> src)",
      options: ["dest consumes, src produces", "dest produces, src consumes", "Both produce", "Both consume"],
      answer: 0,
      explanation: "dest receives elements (super → consumer) and src supplies them (extends → producer) — PECS in one signature.",
    },
  ],
  [
    {
      id: "m4-q1",
      prompt: "What is type erasure?",
      options: [
        "Deleting unused types",
        "The compiler removes generic type info, so at runtime List<String> is just List",
        "Garbage-collecting generic objects",
        "Converting generics to arrays",
      ],
      answer: 1,
      explanation: "Generic types exist only at compile time; the bytecode uses the raw type (or the bound) with casts inserted.",
    },
    {
      id: "m4-q2",
      prompt: "Which is NOT allowed because of erasure?",
      options: ["new T()", "List<T> items", "T value", "<T> void print(T t)"],
      answer: 0,
      explanation: "At runtime T is unknown, so new T() (and new T[], instanceof T) can't compile.",
    },
    {
      id: "m4-q3",
      prompt: "Is List<Integer> a subtype of List<Number>?",
      options: ["Yes", "No — generics are invariant", "Only at runtime", "Only for final classes"],
      answer: 1,
      explanation:
        "Generics are invariant: if they were covariant you could add a Double into a List<Integer> through the List<Number> reference.",
    },
    {
      id: "m4-q4",
      prompt: "A typed cache Cache<K, V> should most likely declare get as…",
      options: ["Object get(Object key)", "V get(K key)", "<T> T get(String key)", "K get(V value)"],
      answer: 1,
      explanation: "Using the class's own type parameters keeps the cache type-safe: callers get a V back with no cast.",
    },
  ],
];

/** "Class 5 — Upper bounds with extends" → "Upper bounds with extends" */
const topicOf = (title: string) => title.replace(/^Class \d+ — /, "").replace(/^Practice — /, "");

/** Put the right answer at `at` among three distinct distractors. */
const withAnswerAt = (answer: string, distractors: string[], at: number) => {
  const options = [...new Set(distractors.filter((d) => d !== answer))].slice(0, 3);
  const index = Math.min(at, options.length);
  options.splice(index, 0, answer);
  return { options, answer: index };
};

/**
 * A four-question practice quiz for one module of a course without a hand-written bank: which
 * topics belong to this module, how it opens, and two study-habit questions about its topics.
 */
const generatedQuiz = (courseId: string, module: number): BankQuestion[] | undefined => {
  const curriculum = curriculumOf(courseId);
  const m = curriculum[module];
  if (!m) return undefined;
  const topics = [...new Set(m.lessons.map((l) => topicOf(l.title)))];
  const elsewhere = [
    ...new Set(
      curriculum
        .filter((_, i) => i !== module)
        .flatMap((x) => x.lessons.map((l) => topicOf(l.title)))
        .filter((t) => !topics.includes(t))
    ),
  ];
  // fall back to other courses' topics when the course is too small to have enough distractors
  const others = [
    ...elsewhere,
    ...COURSES.filter((c) => c.id !== courseId).flatMap((c) => curriculumOf(c.id).flatMap((x) => x.lessons.map((l) => topicOf(l.title)))),
  ];
  const pick = (offset: number) => [0, 1, 2, 3, 4, 5].map((i) => others[(offset + i * 3) % Math.max(1, others.length)] ?? `Topic ${i + 1}`);
  const first = topics[0] ?? m.title;
  const second = topics[1] ?? first;
  const id = (n: number) => `${courseId}-m${module + 1}-q${n}`;

  const q1 = withAnswerAt(second, pick(module), (module + 1) % 4);
  const q2 = withAnswerAt(first, pick(module + 5), (module + 2) % 4);
  const q3 = withAnswerAt(
    `Rebuild the “${first}” example yourself, without the video`,
    ["Watch the class again at 2× speed", "Skip straight to the next module", "Copy the finished code from the resources"],
    (module + 3) % 4
  );
  const q4 = withAnswerAt(
    String(m.lessons.length),
    [m.lessons.length + 2, m.lessons.length - 1, m.lessons.length + 1, m.lessons.length + 3].filter((n) => n > 0).map(String),
    module % 4
  );

  return [
    {
      id: id(1),
      prompt: `Which of these topics is covered in “${m.title}”?`,
      ...q1,
      explanation: `“${second}” is one of the classes in this module — the other options belong elsewhere.`,
    },
    {
      id: id(2),
      prompt: `Which class opens the “${m.title}” module?`,
      ...q2,
      explanation: `The module starts with “${first}”, which the rest of the module builds on.`,
    },
    {
      id: id(3),
      prompt: `What is the best way to check you really understood “${first}”?`,
      ...q3,
      explanation: "Rebuilding an example from memory shows what you can do on your own — re-watching only feels like learning.",
    },
    {
      id: id(4),
      prompt: `How many classes does “${m.title}” have?`,
      ...q4,
      explanation: `This module has ${m.lessons.length} classes — the sidebar shows your progress through each one.`,
    },
  ];
};

/** The question bank for a module of a course, or undefined when the module doesn't exist. */
export const quizFor = (courseId: string, module: number): BankQuestion[] | undefined => {
  if (!Number.isInteger(module) || module < 0) return undefined;
  if (courseId === "java-generics") return QUIZ_BANK[module];
  return generatedQuiz(courseId, module);
};

export interface StoredQuizScore {
  email: string;
  courseId: string;
  module: number;
  best: number;
  total: number;
  passed: boolean;
  attempts: number;
  lastAt: string;
}

export const quizScores = createCollection<StoredQuizScore>("bxn-mock-quiz-scores", () => [
  // the demo student already passed the first module quiz of Generics in Java
  {
    email: "hasibulx26@gmail.com",
    courseId: "java-generics",
    module: 0,
    best: 4,
    total: 4,
    passed: true,
    attempts: 1,
    lastAt: "2026-11-20T10:00:00.000Z",
  },
]);

export const resetMockQuizzes = () => quizScores.reset();
