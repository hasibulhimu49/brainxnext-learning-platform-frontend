import { useState } from "react";
import { CreateNoteDialog, UploadVersionDialog } from "@/components/admin/dialogs/NoteDialogs";
import ImportDialog from "@/components/admin/dialogs/ImportDialog";
import EmptyState, { NoMatches } from "@/components/admin/EmptyState";
import { SearchFilter, SelectFilter } from "@/components/admin/Filters";
import { formatBytes, matches, timeAgo } from "@/components/admin/format";
import { StatStrip } from "@/components/admin/KpiStrip";
import AdminPage, { HeaderButton } from "@/components/admin/PageHeader";
import Pagination from "@/components/admin/Pagination";
import { AdminCard, ListItem, Name, SideList } from "@/components/admin/Panel";
import Pill from "@/components/admin/Pill";
import { RowAction, RowActions } from "@/components/admin/RowActions";
import { QueryStatus } from "@/components/common/QueryStatus";
import { PAGE_SIZE, SECTION_META } from "@/constants/admin";
import usePageTitle from "@/hooks/usePageTitle";
import { useAdminNotes } from "@/queries/admin";
import type { AdminNote, AdminNoteStatus } from "@/types/admin";

const meta = SECTION_META.notes;

const NotesSection = () => {
  usePageTitle("Admin · Notes");
  const query = useAdminNotes();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AdminNoteStatus>("all");
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState<AdminNote | null>(null);

  const rows = (query.data?.rows ?? []).filter((n) => (status === "all" || n.status === status) && matches(q, n.name, n.category));
  const current = Math.min(page, Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1));
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <AdminPage
      crumbs={[{ label: meta.crumb }]}
      eyebrow={meta.eyebrow}
      title={meta.title}
      desc={meta.desc}
      search={{ value: q, onChange: setQ }}
      actions={
        <>
          <HeaderButton onClick={() => setImporting(true)}>Import</HeaderButton>
          <HeaderButton primary onClick={() => setCreating(true)}>
            + Create note
          </HeaderButton>
        </>
      }
    >
      <QueryStatus query={query}>
        {(data) => (
          <>
            <StatStrip stats={data.stats} />
            <div className="grid grid-cols-1 gap-5 min-[1050px]:grid-cols-[1.45fr_.75fr]">
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
                        { value: "published", label: "Published" },
                        { value: "draft", label: "Draft" },
                      ]}
                    />
                    <SearchFilter placeholder={meta.filter} value={q} onChange={setQ} />
                  </div>
                }
              >
                {data.rows.length === 0 ? (
                  <EmptyState
                    icon="description"
                    title="No notes yet"
                    action={
                      <HeaderButton primary onClick={() => setCreating(true)}>
                        + Create note
                      </HeaderButton>
                    }
                  >
                    Handbooks and study notes you create appear here.
                  </EmptyState>
                ) : (
                  visible.length === 0 && <NoMatches />
                )}
                {visible.map((n) => (
                  <ListItem key={n.id}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-chip text-[11px] font-black text-brand dark:text-brand-light">
                        {n.type}
                      </div>
                      <div className="min-w-0">
                        <Name
                          title={n.name}
                          sub={`${n.category} • ${n.pages} pages • v${n.version} • Updated ${timeAgo(n.updatedAt)}${n.fileName ? ` • ${n.fileName} (${formatBytes(n.fileSize ?? 0)})` : ""}`}
                        />
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-2.5">
                      <Pill status={n.status} />
                      <RowActions>
                        <RowAction icon="upload" label={`Upload new version of ${n.name}`} onClick={() => setUploading(n)} />
                      </RowActions>
                    </div>
                  </ListItem>
                ))}
                <Pagination page={current} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
              </AdminCard>
              <SideList title={meta.sideTitle} items={data.categories} />
            </div>
          </>
        )}
      </QueryStatus>
      <CreateNoteDialog open={creating} onOpenChange={setCreating} />
      <UploadVersionDialog note={uploading} onOpenChange={(o) => !o && setUploading(null)} />
      <ImportDialog open={importing} onOpenChange={setImporting} what="notes" requiredHeaders={["name", "category", "type", "pages"]} />
    </AdminPage>
  );
};

export default NotesSection;
