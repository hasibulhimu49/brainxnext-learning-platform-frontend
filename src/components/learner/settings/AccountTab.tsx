import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { errorMessage } from "@/api/envelope";
import { Alert } from "@/components/common/FormFeedback";
import { GitHubIcon } from "@/components/auth/AuthInputs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "@/queries/account";
import { changePasswordSchema, type ChangePasswordValues } from "@/schemas/account";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { SavedNote, SettingsCard } from "./SettingsBlocks";

const PasswordCard = () => {
  const change = useChangePassword();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });
  const onSubmit = form.handleSubmit((values) => change.mutate(values, { onSuccess: () => form.reset() }));

  const field = (name: keyof ChangePasswordValues, label: string, placeholder: string, autoComplete: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field: f }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={placeholder}
              autoComplete={autoComplete}
              {...f}
              onChange={(e) => (change.reset(), f.onChange(e))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <SettingsCard title="Password">
      <Form {...form}>
        <form className="flex flex-col gap-4.5" onSubmit={onSubmit} noValidate>
          {field("current", "Current password", "••••••••", "current-password")}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {field("next", "New password", "8+ characters", "new-password")}
            {field("confirm", "Confirm new password", "Repeat the new password", "new-password")}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="outline" size="none" disabled={change.isPending} className="w-max px-6 py-3 text-[13.5px]">
              Update password
            </Button>
            {change.isSuccess && <SavedNote>Password updated</SavedNote>}
          </div>
          {change.isError && <Alert>{errorMessage(change.error)}</Alert>}
        </form>
      </Form>
    </SettingsCard>
  );
};

const AccountTab = ({ email }: { email: string }) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <>
      <PasswordCard />

      <SettingsCard title="Connected accounts" className="gap-4!">
        <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-[14px] border border-line bg-surface2 px-4 py-3.5">
          <span className="flex min-w-0 items-center gap-2.75">
            <span className="font-display text-lg font-extrabold text-[#4285F4]">G</span>
            <span className="text-sm font-bold text-ink">Google</span>
            <span className="truncate text-xs font-semibold text-soft">{email.replace(/@.*/, "@gmail.com")}</span>
          </span>
          <span className="text-xs font-extrabold text-success">CONNECTED</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-[14px] border border-line bg-surface2 px-4 py-3.5">
          <span className="flex items-center gap-2.75 text-ink">
            <GitHubIcon size={18} />
            <span className="text-sm font-bold">GitHub</span>
          </span>
          <Button variant="outline" size="sm" className="text-muted! hover:text-brand!">
            Connect
          </Button>
        </div>
      </SettingsCard>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-danger/35 bg-surface p-5.5 sm:p-7.5">
        <span className="flex flex-col gap-1">
          <span className="font-display text-[15px] font-extrabold text-danger">Delete account</span>
          <span className="max-w-[44ch] text-[13px] font-semibold text-soft">
            Removes your progress, certificates and subscription permanently. This cannot be undone.
          </span>
        </span>
        <Button variant="danger" size="none" onClick={() => setDeleting(true)} className="px-5.5 py-2.75 text-[13px]">
          Delete…
        </Button>
      </div>
      <DeleteAccountDialog open={deleting} onOpenChange={setDeleting} />
    </>
  );
};

export default AccountTab;
