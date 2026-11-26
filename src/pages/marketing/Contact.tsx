import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { errorMessage } from "@/api/envelope";
import { Alert, FieldError } from "@/components/common/FormFeedback";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FACEBOOK_URL, SUPPORT_EMAIL, YOUTUBE_URL } from "@/constants/social";
import usePageTitle from "@/hooks/usePageTitle";
import { useSendContactMessage } from "@/queries/account";
import { CONTACT_TOPICS, contactSchema, type ContactValues } from "@/schemas/account";
import { emailField } from "@/schemas/auth";

interface Channel {
  icon: string;
  grad: string;
  glow: string;
  title: string;
  sub: string;
  href?: string;
  to?: string;
  external?: boolean;
}

/** ?topic= values (used by links across the site) → topic chip labels */
const TOPIC_PARAMS: Record<string, ContactValues["topic"]> = {
  course: "Course question",
  billing: "Billing",
  teams: "Teams",
  teach: "Teach with us",
  other: "Other",
};

const topicFromParam = (value: string | null): ContactValues["topic"] => (value && TOPIC_PARAMS[value.toLowerCase()]) || "Course question";

const CHANNELS: Channel[] = [
  {
    icon: "mail",
    grad: "linear-gradient(135deg,#1B6FD0,#3E92E8)",
    glow: "rgba(27,111,208,.3)",
    title: "Email us",
    sub: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
  },
  {
    icon: "groups",
    grad: "linear-gradient(135deg,#1877F2,#4B95F5)",
    glow: "rgba(24,119,242,.3)",
    title: "Facebook",
    sub: "@brainxnext — news and student community",
    href: FACEBOOK_URL,
    external: true,
  },
  {
    icon: "smart_display",
    grad: "linear-gradient(135deg,#D0491B,#E9744B)",
    glow: "rgba(208,73,27,.3)",
    title: "YouTube",
    sub: "@brainxnext — free lessons, 31k subscribers",
    href: YOUTUBE_URL,
    external: true,
  },
  {
    icon: "business_center",
    grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)",
    glow: "rgba(233,162,27,.3)",
    title: "Teams & partnerships",
    sub: "Training for your organization",
    to: "/pricing",
  },
];

const fieldCls = "py-3.5! text-[14.5px]!";

const Contact = () => {
  usePageTitle("Contact");
  const [params] = useSearchParams();
  const send = useSendContactMessage();
  const {
    register,
    control,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: topicFromParam(params.get("topic")), message: "" },
  });

  const values = useWatch({ control });
  const ready = contactSchema.safeParse(values).success;
  const emailLooksWrong = !!values.email && !emailField.safeParse(values.email).success;

  const onSubmit = handleSubmit((v) => send.mutate(v));
  const sendAnother = () => {
    resetField("message");
    send.reset();
  };

  return (
    <>
      <HeroBand className="pt-16 pb-14" innerClassName="max-w-190 items-center text-center gap-4!">
        <div className="eyebrow-dark">
          <Icon name="forum" size={16} className="text-gold" />
          WE REPLY WITHIN 24 HOURS
        </div>
        <h1 className="m-0 font-display text-[clamp(32px,4.4vw,52px)] leading-[1.06] font-extrabold tracking-[-0.02em]">
          Get in <span className="text-grad-hero">touch</span>
        </h1>
        <p className="m-0 max-w-130 text-base leading-relaxed font-semibold text-[#C3D8EF]">
          Questions about a course, teams, teaching with us, or anything else — we read every message.
        </p>
      </HeroBand>

      <section id="contact-form" className="bg-page px-4.5 pt-18 pb-22 sm:px-6">
        <div className="mx-auto grid max-w-275 grid-cols-1 items-start gap-6 min-[1001px]:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)]">
          <div className="card rounded-3xl! p-6 sm:p-9">
            {send.isSuccess ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <span className="flex h-17 w-17 items-center justify-center rounded-full border border-success/35 bg-success/12">
                  <Icon name="mark_email_read" size={32} className="text-success" />
                </span>
                <h2 className="m-0 font-display text-[23px] font-extrabold tracking-[-0.01em] text-ink">Message sent!</h2>
                <p className="m-0 max-w-[40ch] text-[14.5px] leading-relaxed font-medium text-muted">
                  Thanks {values.name} — we&apos;ll reply to <span className="font-extrabold text-ink">{values.email}</span> within 24
                  hours.
                </p>
                <Button variant="outline" size="none" onClick={sendAnother} className="bg-surface2! px-6.5 py-3.25">
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                <h2 className="mt-0 mb-1 font-display text-[22px] font-extrabold tracking-[-0.01em] text-ink">Send us a message</h2>
                <div className="grid grid-cols-1 gap-3.5 min-[1001px]:grid-cols-2">
                  <span className="flex flex-col gap-2">
                    <Input
                      className={fieldCls}
                      aria-label="Your name"
                      placeholder="Your name"
                      autoComplete="name"
                      aria-invalid={!!errors.name || undefined}
                      {...register("name")}
                    />
                    <FieldError message={errors.name?.message} />
                  </span>
                  <span className="flex flex-col gap-2">
                    <Input
                      className={fieldCls}
                      type="email"
                      aria-label="Email address"
                      placeholder="Email address"
                      autoComplete="email"
                      aria-invalid={emailLooksWrong || !!errors.email || undefined}
                      {...register("email")}
                    />
                    <FieldError message={errors.email?.message} />
                  </span>
                </div>
                <Controller
                  control={control}
                  name="topic"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
                      {CONTACT_TOPICS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={field.value === t}
                          data-active={field.value === t}
                          onClick={() => field.onChange(t)}
                          className="filter-chip bg-surface2! px-4.25 py-2.25 data-[active=true]:bg-[linear-gradient(135deg,#1B6FD0,#0E97B0)]!"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                />
                <Textarea
                  className={`${fieldCls} min-h-32.5`}
                  aria-label="Message"
                  rows={6}
                  placeholder="Tell us what's on your mind…"
                  aria-invalid={!!errors.message || undefined}
                  {...register("message")}
                />
                <FieldError message={errors.message?.message} />
                <Button
                  type="submit"
                  size="xl"
                  shape="rounded"
                  disabled={send.isPending}
                  className={ready && !send.isPending ? "" : "opacity-55"}
                >
                  <Icon name="send" size={18} />
                  Send message
                </Button>
                {send.isError && <Alert>{errorMessage(send.error)}</Alert>}
              </form>
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            {CHANNELS.map((c) => {
              const inner = (
                <>
                  <span
                    className="flex h-11.5 w-11.5 flex-none items-center justify-center rounded-[14px]"
                    style={{ background: c.grad, boxShadow: `0 8px 20px ${c.glow}` }}
                  >
                    <Icon name={c.icon} size={22} className="text-white" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-display text-[15px] font-bold">{c.title}</span>
                    <span className="text-[13px] font-semibold text-muted">{c.sub}</span>
                  </span>
                </>
              );
              const cls =
                "card flex items-center gap-3.75 rounded-[20px]! p-5.5 text-ink transition-all duration-250 hover:-translate-y-0.75 hover:shadow-card-lg hover:text-ink";
              return c.to ? (
                <Link key={c.title} to={c.to} className={cls}>
                  {inner}
                </Link>
              ) : (
                <a key={c.title} href={c.href} className={cls} {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                  {inner}
                </a>
              );
            })}
            <div className="flex items-start gap-3 rounded-[20px] border border-line bg-surface2 px-5.5 py-5">
              <Icon name="schedule" size={19} className="mt-px text-brand" />
              <span className="text-[13px] leading-[1.55] font-semibold text-muted">
                Support hours: Sat–Thu, 10:00–22:00 (GMT+6). Messages sent outside hours are answered next morning.
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
