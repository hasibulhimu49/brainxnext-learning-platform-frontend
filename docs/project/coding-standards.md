# Coding standards

- **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`). `npm run typecheck` must pass.
- **No `any`.** Use `unknown` and narrow. A justified exception needs `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>`.
- **Type imports** use `import type` / inline `type` (enforced).
- **ESLint** (`npm run lint`) and **Prettier** (`npm run format`, 140 columns, Tailwind classes sorted) must be clean.
- **Imports** use the `@/` alias (`@/components/...`), not long relative paths.
- **Components**: function components, props typed with an interface or inline type; one default-exported page per file in `src/pages`.
- **Styling**: Tailwind utilities with the design tokens; reuse `src/components/ui` (shadcn) and the `.btn`, `.card`, `.field`, `.pill` component classes. Match the Figma values exactly — arbitrary values like `px-[22px]` are fine when the design calls for them.
- **Network** only through services + query hooks (see `api-guidelines.md`).
- **Names**: components `PascalCase.tsx`, hooks `useThing`, stores `thingStore.ts`, services `thingService.ts`, schemas `thing.ts` exporting `thingSchema` and `ThingValues`.
