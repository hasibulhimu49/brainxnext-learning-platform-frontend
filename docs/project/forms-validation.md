# Forms and validation

Every form uses React Hook Form with a Zod schema:

```tsx
const form = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues });
const send = useSendContactMessage();
const onSubmit = form.handleSubmit((values) => send.mutate(values));
```

- Schemas live in `src/schemas` and export their value type (`z.infer`). The mock API validates request bodies with the same schemas.
- Labelled forms use the shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` components (see Settings).
- Auth cards follow the design (placeholders, no labels): `AuthInput` with `aria-label` plus `FieldError` under the field.
- The submit button is dimmed (55% opacity) until the schema passes, as in the designs, but stays clickable so errors can show.
- Server errors: show `errorMessage(mutation.error)` in an `Alert`; branch on `error.code` for special cases (e.g. `EMAIL_TAKEN`).
- Inputs that reformat as you type (card number, expiry) are controlled through `setValue` so the stored and displayed values match.
- Dynamic lists use `useFieldArray` (course modules and classes in `AdminNewCourse`).
