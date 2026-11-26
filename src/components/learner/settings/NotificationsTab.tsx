import { errorMessage } from "@/api/envelope";
import { Alert } from "@/components/common/FormFeedback";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { Switch } from "@/components/ui/switch";
import { usePreferences, useUpdatePreferences } from "@/queries/account";
import { DIGEST_OPTIONS, type DigestFrequency, type NotificationPreferences } from "@/types/account";
import { PillBtn, Row, RowText, SavedNote, SettingsCard } from "./SettingsBlocks";

const TOPICS = [
  {
    key: "courseUpdates",
    icon: "auto_stories",
    label: "Course updates",
    desc: "New lessons, course announcements and instructor updates.",
  },
  { key: "assignments", icon: "check", label: "Assignment reminders", desc: "Get reminded before upcoming assignments and deadlines." },
  {
    key: "recommendations",
    icon: "star",
    label: "Learning recommendations",
    desc: "Personalized courses and learning resources based on your activity.",
  },
  { key: "community", icon: "diamond", label: "Community activity", desc: "Replies, mentions and activity from your learning community." },
] as const;

const isDigest = (v: string): v is DigestFrequency => (DIGEST_OPTIONS as readonly string[]).includes(v);

/** Every change is saved right away (PATCH /me/preferences); the cache shows the server's answer. */
const PreferencesForm = ({ prefs }: { prefs: NotificationPreferences }) => {
  const update = useUpdatePreferences();
  const save = (patch: Partial<NotificationPreferences>) => update.mutate(patch);
  // show the value being saved while the request is in flight
  const view: NotificationPreferences = { ...prefs, ...(update.isPending ? update.variables : {}) };

  return (
    <>
      <SettingsCard title="Notification preferences" className="gap-0!">
        <div className="mt-4.5 flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-[13px] leading-normal font-semibold text-soft">
            Choose which updates you want to receive from BrainXNext.
          </p>
          {update.isSuccess && <SavedNote />}
        </div>
        <div className="mt-3.25 flex flex-col">
          {TOPICS.map((n) => (
            <div key={n.key} className="flex items-center justify-between gap-4.5 border-b border-line py-4.25 last:border-b-0">
              <span className="flex min-w-0 items-start gap-3.25">
                <span className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-[11px] bg-chip text-brand">
                  <Icon name={n.icon} size={19} />
                </span>
                <RowText id={`notif-${n.key}`} title={n.label} desc={n.desc} />
              </span>
              <Switch aria-labelledby={`notif-${n.key}`} checked={view[n.key]} onCheckedChange={(on) => save({ [n.key]: on })} />
            </div>
          ))}
        </div>
        {update.isError && <Alert>{errorMessage(update.error)}</Alert>}
      </SettingsCard>

      <SettingsCard title="Email frequency">
        <Row>
          <RowText title="Digest frequency" desc="How often BrainXNext sends a summary email." />
          <select
            aria-label="Digest frequency"
            value={view.digest}
            onChange={(e) => isDigest(e.target.value) && save({ digest: e.target.value })}
            className="cursor-pointer rounded-[11px] border border-line bg-surface2 px-3.25 py-2.5 text-[13px] font-bold text-ink outline-none focus:border-brand"
          >
            {DIGEST_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Row>
      </SettingsCard>

      <SettingsCard title="Browser notifications">
        <Row>
          <RowText title="Desktop notifications" desc="Allow BrainXNext to show notifications in your browser." />
          <PillBtn primary={view.desktop} aria-pressed={view.desktop} onClick={() => save({ desktop: !view.desktop })}>
            {view.desktop ? "Enabled" : "Disabled"}
          </PillBtn>
        </Row>
      </SettingsCard>
    </>
  );
};

const NotificationsTab = () => {
  const prefs = usePreferences();
  return (
    <QueryStatus query={prefs} className="card rounded-3xl!">
      {(p) => <PreferencesForm prefs={p} />}
    </QueryStatus>
  );
};

export default NotificationsTab;
