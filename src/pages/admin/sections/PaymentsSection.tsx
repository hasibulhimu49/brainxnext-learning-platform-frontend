import { useState } from "react";
import { toast } from "sonner";
import { exportCsv, type CsvColumn } from "@/components/admin/csv";
import DataTable, { type Column } from "@/components/admin/DataTable";
import ReasonDialog from "@/components/admin/dialogs/ReasonDialog";
import EmptyState from "@/components/admin/EmptyState";
import { FilterMenu, SearchFilter } from "@/components/admin/Filters";
import { formatDate, isRefundable, matches } from "@/components/admin/format";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard, Name } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { RowAction, RowActions } from "@/components/admin/RowActions";
import { QueryStatus } from "@/components/common/QueryStatus";
import { SECTION_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { formatTaka } from "@/lib/utils";
import { useAdminPayments, useRefund } from "@/queries/admin";
import type { OrderRecord, OrderStatus } from "@/types/commerce";

const meta = SECTION_META.payments;
type StatusFilter = "all" | OrderStatus;

const COLUMNS: Column<OrderRecord>[] = [
  { key: "id", header: "Transaction", sort: (o) => o.id, className: "font-bold! whitespace-nowrap", render: (o) => o.id },
  { key: "customer", header: "Customer", sort: (o) => o.userName, render: (o) => <Name title={o.userName} sub={o.userEmail ?? "Guest"} /> },
  {
    key: "item",
    header: "Item",
    sort: (o) => o.itemTitle,
    render: (o) => (
      <Name
        title={o.itemTitle}
        sub={o.kind === "plan" ? `Plan · ${o.cycle ?? "monthly"}` : o.kind === "donation" ? "Donation" : "Course"}
      />
    ),
  },
  { key: "method", header: "Method", sort: (o) => o.method, className: "whitespace-nowrap", render: (o) => o.method },
  {
    key: "amount",
    header: "Amount",
    sort: (o) => o.total,
    className: "text-[13px] font-black! whitespace-nowrap",
    render: (o) => formatTaka(o.total),
  },
  { key: "status", header: "Status", sort: (o) => o.status, render: (o) => <Pill status={o.status} /> },
  { key: "date", header: "Date", sort: (o) => o.createdAt, className: "whitespace-nowrap", render: (o) => formatDate(o.createdAt) },
];

const CSV: CsvColumn<OrderRecord>[] = [
  { header: "id", value: (o) => o.id },
  { header: "customer", value: (o) => o.userName },
  { header: "email", value: (o) => o.userEmail },
  { header: "kind", value: (o) => o.kind },
  { header: "item", value: (o) => o.itemTitle },
  { header: "method", value: (o) => o.method },
  { header: "subtotal_bdt", value: (o) => o.subtotal },
  { header: "discount_bdt", value: (o) => o.discount },
  { header: "total_bdt", value: (o) => o.total },
  { header: "promo", value: (o) => o.promoCode },
  { header: "status", value: (o) => o.status },
  { header: "date", value: (o) => o.createdAt },
];

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All payments" },
  { value: "paid", label: "Paid" },
  { value: "refund_requested", label: "Refund requested" },
  { value: "refunded", label: "Refunded" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const PaymentsSection = () => {
  usePageTitle("Admin · Payments");
  const query = useAdminPayments();
  const refund = useRefund();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [target, setTarget] = useState<OrderRecord | null>(null);
  const all = query.data?.rows ?? [];
  const rows = all.filter(
    (o) => (status === "all" || o.status === status) && matches(q, o.id, o.userName, o.userEmail, o.itemTitle, o.method)
  );
  const options = STATUSES.map((s) => ({ ...s, count: s.value === "all" ? all.length : all.filter((o) => o.status === s.value).length }));

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
      actions={
        <>
          <FilterMenu value={status} onChange={setStatus} options={options} />
          <HeaderButton onClick={() => exportCsv("brainxnext-payments.csv", CSV, rows)} disabled={!rows.length}>
            Export report
          </HeaderButton>
        </>
      }
    >
      <QueryStatus query={query}>
        {(data) => (
          <>
            <StatStrip stats={data.stats} />
            <AdminCard title={meta.cardTitle} right={<SearchFilter placeholder={meta.filter} value={q} onChange={setQ} />}>
              <DataTable
                label="Transactions"
                columns={COLUMNS}
                rows={rows}
                initialSort={{ key: "date", dir: "desc" }}
                min={860}
                empty={
                  data.rows.length === 0 ? (
                    <EmptyState icon="payments" title="No payments yet">
                      Orders appear here after the first checkout.
                    </EmptyState>
                  ) : undefined
                }
                actions={(o) => (
                  <RowActions>
                    <RowAction icon="visibility" label={`View ${o.id}`} to={`/admin/payments/${o.id}`} />
                    <RowAction
                      icon="currency_exchange"
                      label={`Refund ${o.id}`}
                      danger
                      disabled={!isRefundable(o)}
                      onClick={() => setTarget(o)}
                    />
                  </RowActions>
                )}
              />
            </AdminCard>
          </>
        )}
      </QueryStatus>
      <ReasonDialog
        open={!!target}
        onOpenChange={(o) => {
          if (!o) {
            setTarget(null);
            refund.reset();
          }
        }}
        title={`Refund ${target?.id ?? ""}`}
        description={
          target ? `Refunds the full ${formatTaka(target.total)} to ${target.userName} via ${target.method}. This can't be undone.` : ""
        }
        submitLabel="Refund"
        reasonLabel="Reason for the refund"
        danger
        pending={refund.isPending}
        error={refund.error}
        onConfirm={(reason) =>
          target &&
          refund.mutate(
            { id: target.id, reason },
            {
              onSuccess: () => {
                toast.success(`${target.id} was refunded`);
                setTarget(null);
              },
            }
          )
        }
      />
    </AdminPage>
  );
};

export default PaymentsSection;
