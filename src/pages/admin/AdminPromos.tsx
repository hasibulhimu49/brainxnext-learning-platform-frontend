import { useState } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { exportCsv, type CsvColumn } from "@/components/admin/csv";
import DataTable, { type Column } from "@/components/admin/DataTable";
import PromoDialog from "@/components/admin/dialogs/PromoDialog";
import EmptyState from "@/components/admin/EmptyState";
import { SearchFilter, SelectFilter } from "@/components/admin/Filters";
import { formatDate, matches } from "@/components/admin/format";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { RowAction, RowActions } from "@/components/admin/RowActions";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { QueryStatus } from "@/components/common/QueryStatus";
import { SECTION_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminPromos, useDeletePromo, useUpdatePromo } from "@/queries/admin";
import type { AdminPromo, PromoStatus } from "@/types/admin";

const meta = SECTION_META.promos;

const COLUMNS: Column<AdminPromo>[] = [
  { key: "code", header: "Code", sort: (p) => p.code, className: "font-mono font-extrabold! tracking-[0.04em]", render: (p) => p.code },
  { key: "off", header: "% off", sort: (p) => p.percentOff, className: "font-black!", render: (p) => `${p.percentOff}%` },
  {
    key: "used",
    header: "Used / limit",
    sort: (p) => p.used,
    render: (p) => `${p.used.toLocaleString("en-IN")} / ${p.usageLimit === null ? "∞" : p.usageLimit.toLocaleString("en-IN")}`,
  },
  {
    key: "expiry",
    header: "Expires",
    sort: (p) => p.expiresAt ?? "9999",
    render: (p) => (p.expiresAt ? formatDate(`${p.expiresAt}T12:00:00`) : "Never"),
  },
  { key: "status", header: "Status", sort: (p) => p.status, render: (p) => <Pill status={p.status} /> },
];

const CSV: CsvColumn<AdminPromo>[] = [
  { header: "code", value: (p) => p.code },
  { header: "percent_off", value: (p) => p.percentOff },
  { header: "used", value: (p) => p.used },
  { header: "usage_limit", value: (p) => p.usageLimit },
  { header: "expires", value: (p) => p.expiresAt },
  { header: "status", value: (p) => p.status },
];

type Confirm = { kind: "deactivate" | "delete"; promo: AdminPromo } | null;

const AdminPromos = () => {
  usePageTitle("Admin · Promo codes");
  const query = useAdminPromos();
  const update = useUpdatePromo();
  const remove = useDeletePromo();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | PromoStatus>("all");
  const [editing, setEditing] = useState<AdminPromo | "new" | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const all = query.data ?? [];
  const rows = all.filter((p) => (status === "all" || p.status === status) && matches(q, p.code));
  const pending = update.isPending || remove.isPending;

  const setActive = (p: AdminPromo, active: boolean) =>
    update.mutate(
      { code: p.code, active },
      {
        onSuccess: () => {
          toast.success(active ? `${p.code} is active again` : `${p.code} was deactivated`);
          setConfirm(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
      }
    );

  const onConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "deactivate") return setActive(confirm.promo, false);
    remove.mutate(confirm.promo.code, {
      onSuccess: () => {
        toast.success(`${confirm.promo.code} was deleted`);
        setConfirm(null);
      },
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
      actions={
        <>
          <HeaderButton onClick={() => exportCsv("brainxnext-promos.csv", CSV, rows)} disabled={!rows.length}>
            Export
          </HeaderButton>
          <HeaderButton primary onClick={() => setEditing("new")}>
            + Create code
          </HeaderButton>
        </>
      }
    >
      <QueryStatus query={query}>
        {(data) => (
          <>
            <StatStrip
              stats={[
                { label: "Codes", value: String(data.length), trend: `${data.filter((p) => p.status === "active").length} active` },
                { label: "Redemptions", value: data.reduce((s, p) => s + p.used, 0).toLocaleString("en-IN"), trend: "All codes" },
                {
                  label: "Best discount",
                  value: data.length ? `${Math.max(...data.map((p) => p.percentOff))}%` : "—",
                  trend: "Highest % off",
                },
                {
                  label: "Expired / used up",
                  value: String(data.filter((p) => p.status === "expired" || p.status === "used_up").length),
                  trend: "No longer valid",
                },
              ]}
            />
            <AdminCard
              title={meta.cardTitle}
              right={
                <div className="flex flex-wrap gap-2">
                  <SelectFilter
                    label="Filter by status"
                    value={status}
                    onChange={setStatus}
                    options={[
                      { value: "all", label: "All statuses" },
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "expired", label: "Expired" },
                      { value: "used_up", label: "Used up" },
                    ]}
                  />
                  <SearchFilter placeholder={meta.filter} value={q} onChange={setQ} />
                </div>
              }
            >
              <DataTable
                label="Promo codes"
                columns={COLUMNS}
                rows={rows}
                initialSort={{ key: "code", dir: "asc" }}
                empty={
                  data.length === 0 ? (
                    <EmptyState
                      icon="sell"
                      title="No promo codes yet"
                      action={
                        <HeaderButton primary onClick={() => setEditing("new")}>
                          + Create code
                        </HeaderButton>
                      }
                    >
                      Create a code to give learners a discount at checkout.
                    </EmptyState>
                  ) : undefined
                }
                actions={(p) => (
                  <RowActions>
                    <RowAction icon="edit" label={`Edit ${p.code}`} onClick={() => setEditing(p)} />
                    {p.active ? (
                      <RowAction icon="block" label={`Deactivate ${p.code}`} onClick={() => setConfirm({ kind: "deactivate", promo: p })} />
                    ) : (
                      <RowAction icon="play_circle" label={`Activate ${p.code}`} disabled={pending} onClick={() => setActive(p, true)} />
                    )}
                    <RowAction icon="delete" label={`Delete ${p.code}`} danger onClick={() => setConfirm({ kind: "delete", promo: p })} />
                  </RowActions>
                )}
              />
            </AdminCard>
          </>
        )}
      </QueryStatus>

      <PromoDialog promo={editing} onOpenChange={(o) => !o && setEditing(null)} />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.kind === "delete" ? `Delete ${confirm.promo.code}?` : `Deactivate ${confirm?.promo.code ?? ""}?`}
        description={
          confirm?.kind === "delete"
            ? "Checkout stops accepting it and it is removed from this list. Past orders keep their discount."
            : "Checkout stops accepting it until you activate it again."
        }
        confirmLabel={confirm?.kind === "delete" ? "Delete code" : "Deactivate"}
        danger
        pending={pending}
        onConfirm={onConfirm}
      />
    </AdminPage>
  );
};

export default AdminPromos;
