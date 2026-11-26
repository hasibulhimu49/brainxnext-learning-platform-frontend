import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { errorMessage } from "@/api/envelope";
import { Alert } from "@/components/common/FormFeedback";
import { QueryStatus } from "@/components/common/QueryStatus";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateProfile } from "@/queries/account";
import { profileSchema, type ProfileValues } from "@/schemas/account";
import type { Profile } from "@/types/account";
import ChangeEmailDialog from "./ChangeEmailDialog";
import { SavedNote, SettingsCard } from "./SettingsBlocks";

const ProfileForm = ({ profile }: { profile: Profile }) => {
  const update = useUpdateProfile();
  const [changingEmail, setChangingEmail] = useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name, bio: profile.bio, portfolio: profile.portfolio, goal: profile.goal },
  });

  const onSubmit = form.handleSubmit((values) => update.mutate(values, { onSuccess: (saved) => form.reset(saved) }));
  const text = (name: keyof ProfileValues, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} onChange={(e) => (update.reset(), field.onChange(e))} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <SettingsCard title="Profile">
      <Form {...form}>
        <form className="flex flex-col gap-4.5" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {text("name", "Full name")}
            {/* the email changes only through the OTP-verified dialog */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <div className="flex gap-2">
                <Input id="profile-email" type="email" value={profile.email} readOnly className="min-w-0 flex-1 text-soft" />
                <Button variant="outline" size="none" shape="rounded" onClick={() => setChangingEmail(true)} className="px-4 text-[13px]">
                  Change
                </Button>
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="A line about you, shown on your public portfolio page" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {text("portfolio", "Portfolio URL")}
            {text("goal", "Learning goal")}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="none" disabled={update.isPending} className="px-6.5 py-3.25">
              Save changes
            </Button>
            {update.isSuccess && <SavedNote />}
          </div>
          {update.isError && <Alert>{errorMessage(update.error)}</Alert>}
        </form>
      </Form>
      <ChangeEmailDialog open={changingEmail} onOpenChange={setChangingEmail} currentEmail={profile.email} />
    </SettingsCard>
  );
};

const ProfileTab = () => {
  const profile = useProfile();
  return (
    <QueryStatus query={profile} className="card rounded-3xl!">
      {(p) => <ProfileForm key={p.email} profile={p} />}
    </QueryStatus>
  );
};

export default ProfileTab;
