import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { exportCsv } from "@/components/admin/csv";
import ReasonDialog from "@/components/admin/dialogs/ReasonDialog";
import { formatDateTime, isRefundable } from "@/components/admin/format";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import { AdminCard, InfoList } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { QueryStatus } from "@/components/common/QueryStatus";
import usePageTitle from "@/hooks/usePageTitle";
import { formatTaka } from "@/lib/utils";
import { useAdminPayment, useRefund, useRejectRefund } from "@/queries/admin";
import type { AdminPaymentDetail as Detail, AdminPaymentEvent } from "@/types/admin";

const DOT: Record<AdminPaymentEvent["tone"], string> = {
  success: "bg-success",
  info: "bg-brand",
  warn: "bg-amber",
  danger: "bg-danger",
};

type Decision = "refund" | "reject" | null;

const PaymentView = ({ detail: { order, timeline } }: { detail: Detail }) => {
  usePageTitle(`Admin · ${order.id}`);
  const refund = useRefund();
  const reject = useRejectRefund();
  const [decision, setDecision] = useState<Decision>(null);
  const requested = order.status === "refund_requested";
  const mutation = decision === "reject" ? reject : refund;

  const exportOne = () =>
    exportCsv(
      `${order.id}.csv`,
      [
        { header: "field", value: (r: [string, string | number | null]) => r[0] },
        { header: "value", value: (r: [string, string | number | null]) => r[1] },
      ],
      [
        ["id", order.id],
        ["customer", order.userName],
        ["email", order.userEmail],
        ["item", order.itemTitle],
        ["method", order.method],
        ["subtotal_bdt", order.subtotal],
        ["discount_bdt", order.discount],
        ["total_bdt", order.total],
        ["promo", order.promoCode],
        ["status", order.status],
        ["date", order.createdAt],
      ]
    );

  return (
    <AdminPage
      crumbs={[{ label: "Payments", to: "/admin/payments" }, { label: order.id }]}
      eyebrow="Transaction"
      title={order.id}
      desc={
        <span className="inline-flex flex-wrap items-center gap-2">
          <Pill status={order.status} />
          {formatTaka(order.total)} · {order.method} · {formatDateTime(order.createdAt)}
        </span>
      }
      actions={
        <>
          <HeaderButton icon="download" onClick={exportOne}>
            Export CSV
          </HeaderButton>
          {requested && (
            <HeaderButton icon="undo" onClick={() => setDecision("reject")}>
              Reject request
            </HeaderButton>
          )}
          {isRefundable(order) && (
            <HeaderButton icon="currency_exchange" danger onClick={() => setDecision("refund")}>
              {requested ? "Approve refund" : "Refund"}
            </HeaderButton>
          )}
        </>
      }
    >
      {requested && order.refundReason && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-[14px] border border-amber/40 bg-[#FFF5DB] px-4 py-3 text-xs font-semibold text-[#A16C00] dark:bg-amber/15 dark:text-amber"
        >
          <b className="font-extrabold">Refund requested:</b> “{order.refundReason}”
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 min-[1050px]:grid-cols-[1.2fr_1fr]">
        <AdminCard title="Timeline">
          <ol className="m-0 flex list-none flex-col p-0">
            {timeline.map((e, i) => (
              <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < timeline.length - 1 && <span aria-hidden className="absolute top-3.5 left-1.25 h-full w-px bg-line" />}
                <span aria-hidden className={`relative mt-1 h-2.75 w-2.75 flex-none rounded-full ${DOT[e.tone]}`} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs font-extrabold text-ink">{e.label}</span>
                  {e.detail && <span className="text-[11.5px] font-semibold wrap-break-word text-muted">{e.detail}</span>}
                  {e.at && <span className="text-[10.5px] font-bold text-soft">{formatDateTime(e.at)}</span>}
                </span>
              </li>
            ))}
          </ol>
        </AdminCard>

        <div className="flex min-w-0 flex-col gap-5">
          <AdminCard title="Customer">
            <InfoList
              items={[
                { label: "Name", value: order.userName },
                { label: "Email", value: order.userEmail ?? "Guest (anonymous)" },
              ]}
            />
          </AdminCard>
          <AdminCard title="Item">
            <InfoList
              items={[
                {
                  label: order.kind === "course" ? "Course" : order.kind === "plan" ? "Plan" : "Donation",
                  value:
                    order.kind === "course" ? (
                      <Link to={`/admin/courses/${order.itemId}`} className="text-brand">
                        {order.itemTitle}
                      </Link>
                    ) : (
                      order.itemTitle
                    ),
                },
                ...(order.cycle ? [{ label: "Billing", value: order.cycle === "yearly" ? "Yearly" : "Monthly" }] : []),
                { label: "Method", value: order.method },
              ]}
            />
          </AdminCard>
          <AdminCard title="Amounts">
            <InfoList
              items={[
                { label: "Subtotal", value: formatTaka(order.subtotal) },
                {
                  label: order.promoCode ? `Discount (${order.promoCode})` : "Discount",
                  value: order.discount ? `−${formatTaka(order.discount)}` : "—",
                },
                { label: "Total paid", value: <span className="text-sm font-black">{formatTaka(order.total)}</span> },
              ]}
            />
          </AdminCard>
        </div>
      </div>

      <ReasonDialog
        open={!!decision}
        onOpenChange={(o) => {
          if (!o) {
            setDecision(null);
            refund.reset();
            reject.reset();
          }
        }}
        title={decision === "reject" ? "Reject refund request?" : `Refund ${formatTaka(order.total)}?`}
        description={
          decision === "reject"
            ? "The order goes back to paid and the learner keeps access. Tell them why."
            : `The full ${formatTaka(order.total)} goes back to ${order.userName} via ${order.method}. This can't be undone.`
        }
        reasonLabel={decision === "reject" ? "Reason for rejecting" : "Reason for the refund"}
        submitLabel={decision === "reject" ? "Reject request" : "Refund"}
        danger={decision === "refund"}
        pending={mutation.isPending}
        error={mutation.error}
        onConfirm={(reason) =>
          mutation.mutate(
            { id: order.id, reason },
            {
              onSuccess: () => {
                toast.success(decision === "reject" ? "Refund request rejected" : `${order.id} was refunded`);
                setDecision(null);
              },
            }
          )
        }
      />
    </AdminPage>
  );
};

const AdminPaymentDetail = () => {
  const { paymentId = "" } = useParams();
  const query = useAdminPayment(paymentId);
  return query.data ? (
    <PaymentView detail={query.data} />
  ) : (
    <AdminPage crumbs={[{ label: "Payments", to: "/admin/payments" }, { label: "Payment" }]} title="Payment">
      <QueryStatus query={query}>{() => null}</QueryStatus>
    </AdminPage>
  );
};

export default AdminPaymentDetail;
