import { useState } from "react";
import DataTable, { type Column } from "@/components/admin/DataTable";
import EmptyState from "@/components/admin/EmptyState";
import { ChipFilter, SearchFilter } from "@/components/admin/Filters";
import { matches } from "@/lib/admin";
import { timeAgoGB } from "@/lib/dates";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage from "@/components/admin/PageHeader";
import { AdminCard, Name } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { RowAction, RowActions } from "@/components/admin/RowActions";
import { QueryStatus } from "@/components/common/QueryStatus";
import { SECTION_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminTickets } from "@/queries/admin";
import type { Ticket, TicketStatus } from "@/types/commerce";

const meta = SECTION_META.inbox;
type Filter = TicketStatus | "all";

const COLUMNS: Column<Ticket>[] = [
  { key: "from", header: "From", sort: (t) => t.name, render: (t) => <Name title={t.name} sub={t.email} /> },
  { key: "topic", header: "Topic", sort: (t) => t.topic, className: "whitespace-nowrap", render: (t) => t.topic },
  {
    key: "message",
    header: "Message",
    render: (t) => <span className="line-clamp-2 max-w-90 text-muted">{t.message}</span>,
  },
  { key: "received", header: "Received", sort: (t) => t.createdAt, className: "whitespace-nowrap", render: (t) => timeAgoGB(t.createdAt) },
  { key: "status", header: "Status", sort: (t) => t.status, render: (t) => <Pill status={t.status} /> },
];

const AdminInbox = () => {
  usePageTitle("Admin · Inbox");
  const query = useAdminTickets();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Filter>("open");
  const all = query.data ?? [];
  const rows = all.filter((t) => (status === "all" || t.status === status) && matches(q, t.name, t.email, t.topic, t.message, t.id));
  const count = (v: Filter) => (v === "all" ? all.length : all.filter((t) => t.status === v).length);

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
    >
      <QueryStatus query={query}>
        {(data) => (
          <>
            <StatStrip
              stats={[
                { label: "Open", value: String(count("open")), trend: "Waiting for a reply" },
                { label: "Replied", value: String(count("replied")), trend: "Waiting on the sender" },
                { label: "Closed", value: String(count("closed")), trend: "Resolved" },
                { label: "Total", value: String(data.length), trend: "From the contact form" },
              ]}
            />
            <AdminCard
              title={meta.cardTitle}
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <ChipFilter
                    label="Filter by status"
                    value={status}
                    onChange={setStatus}
                    options={(["open", "replied", "closed", "all"] as const).map((v) => ({
                      value: v,
                      label: { open: "Open", replied: "Replied", closed: "Closed", all: "All" }[v],
                      count: count(v),
                    }))}
                  />
                  <SearchFilter placeholder={meta.filter} value={q} onChange={setQ} />
                </div>
              }
            >
              <DataTable
                label="Tickets"
                columns={COLUMNS}
                rows={rows}
                initialSort={{ key: "received", dir: "desc" }}
                min={760}
                empty={
                  data.length === 0 ? (
                    <EmptyState icon="inbox" title="No messages yet">
                      Messages sent from the contact page land here.
                    </EmptyState>
                  ) : status === "open" && !q ? (
                    <EmptyState icon="mark_email_read" title="Inbox zero">
                      Every open message has been answered.
                    </EmptyState>
                  ) : undefined
                }
                actions={(t) => (
                  <RowActions>
                    <RowAction icon="mail" label={`Open message from ${t.name}`} to={`/admin/inbox/${t.id}`} />
                  </RowActions>
                )}
              />
            </AdminCard>
          </>
        )}
      </QueryStatus>
    </AdminPage>
  );
};

export default AdminInbox;
