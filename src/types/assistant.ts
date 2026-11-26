/**
 * Next AI chat (F-005). Provisional shapes for the mock endpoint POST /assistant/chat —
 * replace with the backend contract when it documents its AI chat endpoint.
 */

export interface AssistantMessage {
  role: "user" | "assistant";
  text: string;
}

/** Where the learner is, so answers can refer to it (e.g. the lesson open in the player). */
export interface AssistantContext {
  path: string;
  courseId?: string;
  lessonId?: string;
}

export interface AssistantLink {
  label: string;
  to: string;
}

export interface AssistantCourseCard {
  id: string;
  title: string;
  /** whole taka; 0 when free */
  price: number;
  free: boolean;
  level: string;
}

export interface AssistantReply {
  text: string;
  links?: AssistantLink[];
  courses?: AssistantCourseCard[];
}
