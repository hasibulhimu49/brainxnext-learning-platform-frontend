import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { previewCsv, toCsv } from "@/lib/csv";
import DataTable, { type Column } from "./DataTable";

interface Row {
  id: string;
  name: string;
  score: number;
}

const ROWS: Row[] = Array.from({ length: 23 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `Row ${String(i + 1).padStart(2, "0")}`,
  score: (i * 7) % 23,
}));

const COLUMNS: Column<Row>[] = [
  { key: "name", header: "Name", sort: (r) => r.name, render: (r) => r.name },
  { key: "score", header: "Score", sort: (r) => r.score, render: (r) => r.score },
];

const bodyNames = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("cell")[0]?.textContent);

describe("<DataTable />", () => {
  it("shows 10 rows per page with Previous / Next and a range label", async () => {
    const user = userEvent.setup();
    render(<DataTable label="Rows" columns={COLUMNS} rows={ROWS} />);
    expect(bodyNames()).toHaveLength(10);
    expect(screen.getByText("Showing 1–10 of 23")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Showing 21–23 of 23")).toBeInTheDocument();
    expect(bodyNames()).toEqual(["Row 21", "Row 22", "Row 23"]);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("sorts by a column header, toggling the direction", async () => {
    const user = userEvent.setup();
    render(<DataTable label="Rows" columns={COLUMNS} rows={ROWS} />);
    const scoreHeader = screen.getByRole("columnheader", { name: /Score/ });

    await user.click(screen.getByRole("button", { name: /Score/ }));
    expect(scoreHeader).toHaveAttribute("aria-sort", "ascending");
    const firstScores = within(screen.getByRole("table"))
      .getAllByRole("row")
      .slice(1, 4)
      .map((r) => Number(within(r).getAllByRole("cell")[1]?.textContent));
    expect(firstScores).toEqual([0, 1, 2]);

    await user.click(screen.getByRole("button", { name: /Score/ }));
    expect(scoreHeader).toHaveAttribute("aria-sort", "descending");
    expect(within(screen.getByRole("table")).getAllByRole("row")[1]).toHaveTextContent("22");
  });

  it("renders row actions and the empty state", () => {
    const { rerender } = render(
      <DataTable label="Rows" columns={COLUMNS} rows={ROWS.slice(0, 2)} actions={(r) => <button type="button">Open {r.name}</button>} />
    );
    expect(screen.getByRole("button", { name: "Open Row 01" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();

    rerender(<DataTable label="Rows" columns={COLUMNS} rows={[]} empty={<p>No rows yet</p>} />);
    expect(screen.getByText("No rows yet")).toBeInTheDocument();
  });
});

describe("csv helpers", () => {
  it("escapes commas, quotes and newlines", () => {
    const csv = toCsv([{ header: "name", value: (r: { n: string }) => r.n }], [{ n: 'Say "hi", ok' }, { n: "two\nlines" }]);
    expect(csv).toBe('name\r\n"Say ""hi"", ok"\r\n"two\nlines"');
  });

  it("checks required headers case-insensitively and counts rows", () => {
    expect(previewCsv("Title,track,Level,price\r\na,b,c,1\r\nd,e,f,2\r\n", ["title", "track", "level", "price"])).toEqual({
      headers: ["Title", "track", "Level", "price"],
      rows: 2,
      missing: [],
    });
    expect(previewCsv("title,price\n", ["title", "track"]).missing).toEqual(["track"]);
  });
});
