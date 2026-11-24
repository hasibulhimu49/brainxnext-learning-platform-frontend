import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { Alert } from "@/components/auth/AuthCard";
import { Field } from "@/components/admin/dialogs/FormDialog";
import { formatDateTime } from "@/components/admin/format";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard, InfoList } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminTicket, useReplyTicket, useSetTicketStatus } from "@/queries/admin";
import { replySchema, type ReplyValues } from "@/schemas/admin";
import type { Ticket } from "@/types/commerce";

const Bubble = ({ from, at, children, admin }: { from: string; at: string; children: string; admin?: boolean }) => (
  <div className={`flex flex-col gap-1.5 ${admin ? "items-end" : "items-start"}`}>
    <span className="text-[10.5px] font-bold text-soft">
      {from} · {formatDateTime(at)}
    </span>
    <p
      className={`m-0 max-w-140 rounded-2xl px-4 py-3 text-[13px] leading-relaxed font-semibold whitespace-pre-line ${
        admin ? "bg-grad-brand text-white" : "bg-surface2 text-ink"
      }`}
    >
      {children}
    </p>
  </div>
);

const Composer = ({ ticket }: { ticket: Ticket }) => {
  const reply = useReplyTicket();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyValues>({ resolver: zodResolver(replySchema), defaultValues: { message: "" } });

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={handleSubmit((v) =>
        reply.mutate(
          { id: ticket.id, message: v.message },
          {
            onSuccess: () => {
              toast.success(`Reply sent to ${ticket.email}`);
              reset();
            },
          }
        )
      )}
    >
      <Field id="ticket-reply" label="Reply" error={errors.message?.message}>
        <Textarea
          id="ticket-reply"
          rows={5}
          placeholder={`Write to ${ticket.name}…`}
          aria-invalid={!!errors.message || undefined}
          {...register("message")}
        />
      </Field>
      {reply.isError && <Alert>{errorMessage(reply.error)}</Alert>}
      <div className="flex justify-end">
        <Button type="submit" size="md" disabled={reply.isPending} aria-busy={reply.isPending || undefined}>
          <Icon name="send" size={16} />
          Send reply
        </Button>
      </div>
    </form>
  );
};

const TicketView = ({ ticket }: { ticket: Ticket }) => {
  usePageTitle(`Admin · ${ticket.id}`);
  const setStatus = useSetTicketStatus();
  const [confirmClose, setConfirmClose] = useState(false);
  const closed = ticket.status === "closed";

  const change = (status: "open" | "closed") =>
    setStatus.mutate(
      { id: ticket.id, status },
      {
        onSuccess: () => {
          toast.success(status === "closed" ? "Ticket closed" : "Ticket reopened");
          setConfirmClose(false);
        },
        onError: (e) => toast.error(errorMessage(e)),
      }
    );

  return (
    <AdminPage
      crumbs={[{ label: "Inbox", to: "/admin/inbox" }, { label: ticket.id }]}
      eyebrow={ticket.topic}
      title={`Message from ${ticket.name}`}
      desc={
        <span className="inline-flex flex-wrap items-center gap-2">
          <Pill status={ticket.status} />
          {ticket.email} · {formatDateTime(ticket.createdAt)}
        </span>
      }
      actions={
        closed ? (
          <HeaderButton icon="mark_email_unread" onClick={() => change("open")} disabled={setStatus.isPending}>
            Reopen
          </HeaderButton>
        ) : (
          <HeaderButton icon="task_alt" onClick={() => setConfirmClose(true)}>
            Close ticket
          </HeaderButton>
        )
      }
    >
      <div className="grid grid-cols-1 gap-5 min-[1050px]:grid-cols-[1.45fr_.75fr]">
        <AdminCard title="Conversation">
          <div className="flex flex-col gap-4">
            <Bubble from={ticket.name} at={ticket.createdAt}>
              {ticket.message}
            </Bubble>
            {ticket.replies.map((r, i) => (
              <Bubble key={i} from={r.from === "admin" ? "BrainXNext" : ticket.name} at={r.at} admin={r.from === "admin"}>
                {r.message}
              </Bubble>
            ))}
          </div>
          <div className="mt-6 border-t border-line pt-5">
            {closed ? (
              <p className="m-0 text-xs font-semibold text-soft">This ticket is closed. Reopen it to reply.</p>
            ) : (
              <Composer ticket={ticket} />
            )}
          </div>
        </AdminCard>
        <AdminCard title="Sender" className="self-start">
          <InfoList
            items={[
              { label: "Name", value: ticket.name },
              {
                label: "Email",
                value: (
                  <a href={`mailto:${ticket.email}`} className="text-brand">
                    {ticket.email}
                  </a>
                ),
              },
              { label: "Topic", value: ticket.topic },
              { label: "Ticket", value: ticket.id },
              { label: "Replies", value: ticket.replies.length },
            ]}
          />
        </AdminCard>
      </div>
      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Close this ticket?"
        description="It moves out of the open queue. You can reopen it any time."
        confirmLabel="Close ticket"
        pending={setStatus.isPending}
        onConfirm={() => change("closed")}
      />
    </AdminPage>
  );
};

const AdminInboxDetail = () => {
  const { ticketId = "" } = useParams();
  const query = useAdminTicket(ticketId);
  return query.data ? (
    <TicketView ticket={query.data} />
  ) : (
    <AdminPage crumbs={[{ label: "Inbox", to: "/admin/inbox" }, { label: "Ticket" }]} title="Message">
      <QueryStatus query={query}>{() => null}</QueryStatus>
    </AdminPage>
  );
};

export default AdminInboxDetail;
