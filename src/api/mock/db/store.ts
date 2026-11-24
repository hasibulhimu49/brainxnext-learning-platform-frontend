/**
 * Tiny persisted collection for the mock API: an array kept in memory and mirrored to localStorage,
 * so a reload keeps orders, submissions, promos and tickets. `reset()` is used by the test setup.
 */
export const createCollection = <T>(storageKey: string, seed: () => T[]) => {
  let memory: T[] | null = null;

  const all = (): T[] => {
    if (memory) return memory;
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      memory = Array.isArray(parsed) ? (parsed as T[]) : seed();
    } catch {
      memory = seed();
    }
    return memory;
  };

  const save = (items: T[]) => {
    memory = items;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      /* storage unavailable — keep in memory */
    }
  };

  return {
    all,
    save,
    add: (item: T) => save([item, ...all()]),
    update: (match: (item: T) => boolean, patch: (item: T) => T) => save(all().map((i) => (match(i) ? patch(i) : i))),
    remove: (match: (item: T) => boolean) => save(all().filter((i) => !match(i))),
    reset: () => {
      memory = null;
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
    },
  };
};

/** Short readable id, e.g. newId("ORD") → "ORD-K3F9Q2". */
export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
