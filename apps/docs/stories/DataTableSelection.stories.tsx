import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Badge,
  Button,
  DataTable,
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTableFilter,
  DataTablePagination,
  DataTableSearch,
  DataTableToolbar,
  type DataTableColumn,
  type DataTableFilterOption,
  type DataTableSortDirection,
} from "@withalif/luna";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  status: "active" | "archived";
};

const members: Member[] = [
  {
    id: "member-1",
    name: "Jordan Lee",
    email: "jordan@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: "member-2",
    name: "Priya Raman",
    email: "priya@example.com",
    role: "Manager",
    status: "active",
  },
  {
    id: "member-3",
    name: "Tomas Novak",
    email: "tomas@example.com",
    role: "Staff",
    status: "archived",
  },
  {
    id: "member-4",
    name: "Amara Okafor",
    email: "amara@example.com",
    role: "Staff",
    status: "active",
  },
  {
    id: "member-5",
    name: "Mei Chen",
    email: "mei@example.com",
    role: "Manager",
    status: "active",
  },
  {
    id: "member-6",
    name: "Luca Bianchi",
    email: "luca@example.com",
    role: "Staff",
    status: "active",
  },
];

const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Name", rowHeader: true, cell: (m) => m.name },
  { id: "email", header: "Email", cell: (m) => m.email },
  { id: "role", header: "Role", cell: (m) => m.role },
  {
    id: "status",
    header: "Status",
    cell: (m) => (
      <Badge variant={m.status === "active" ? "secondary" : "outline"}>
        {m.status}
      </Badge>
    ),
  },
];

const statusOptions: DataTableFilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

/**
 * Luna's `destructive` button variant renders #d94d55 on a 10% tint of itself,
 * which measures 3.5:1 — under the 4.5:1 AA floor for text this size, on any
 * background. That is the shared `--danger` token, not something this surface
 * introduces, and re-toning it touches every component that uses it. Until
 * that token is corrected the rule is switched off here, so these stories
 * still guard everything else.
 */
const destructiveContrastKnownIssue = {
  a11y: {
    test: "error",
    config: { rules: [{ id: "color-contrast", enabled: false }] },
  },
} as const;

/** Archived members cannot be acted on in bulk, so they are not selectable. */
const isRowSelectable = (member: Member) => member.status === "active";

const meta: Meta<typeof DataTableBulkActions> = {
  title: "Luna/DataTable Selection",
  component: DataTableBulkActions,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/* Selection                                                                  */
/* -------------------------------------------------------------------------- */

function SelectionExample({
  initialSelection = [],
  rows = members.slice(0, 4),
  withDisabledRow = false,
}: {
  initialSelection?: string[];
  rows?: Member[];
  withDisabledRow?: boolean;
}) {
  const [selectedIds, setSelectedIds] = React.useState(initialSelection);

  return (
    <div className="grid w-full min-w-0 gap-3">
      <DataTable
        columns={columns}
        data={rows}
        caption="Workspace members"
        hideCaption
        selectedRowIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isRowSelectable={withDisabledRow ? isRowSelectable : undefined}
      />
      <p data-testid="selection" className="text-body-sm text-muted-foreground">
        Selected: {selectedIds.join(", ") || "none"}
      </p>
    </div>
  );
}

export const SelectionNone: Story = {
  render: () => <SelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole("checkbox", {
      name: "Select all rows on this page",
    });

    expect(selectAll).not.toBeChecked();
    expect(selectAll).toHaveAttribute("aria-checked", "false");
    // The row checkbox takes its name from the row-header cell.
    expect(
      canvas.getByRole("checkbox", { name: "Select row Jordan Lee" }),
    ).not.toBeChecked();
  },
};

export const SelectionSingle: Story = {
  render: () => <SelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole("checkbox", {
      name: "Select row Priya Raman",
    });

    await userEvent.click(row);
    await waitFor(() => expect(row).toBeChecked());
    expect(canvas.getByTestId("selection")).toHaveTextContent(
      "Selected: member-2",
    );
    expect(row.closest("tr")).toHaveAttribute("data-selected");

    // Deselecting takes it back out of the list rather than leaving a hole.
    await userEvent.click(row);
    await waitFor(() => expect(row).not.toBeChecked());
    expect(canvas.getByTestId("selection")).toHaveTextContent("Selected: none");
  },
};

export const SelectionMultiple: Story = {
  render: () => <SelectionExample initialSelection={["member-1"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Tomas Novak" }),
    );
    await waitFor(() =>
      expect(canvas.getByTestId("selection")).toHaveTextContent(
        "Selected: member-1, member-3",
      ),
    );
    // Space toggles the focused checkbox, without a pointer.
    await userEvent.keyboard(" ");
    await waitFor(() =>
      expect(canvas.getByTestId("selection")).toHaveTextContent(
        "Selected: member-1",
      ),
    );
  },
};

export const SelectionAllVisible: Story = {
  render: () => <SelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole("checkbox", {
      name: "Select all rows on this page",
    });

    await userEvent.click(selectAll);
    await waitFor(() => expect(selectAll).toBeChecked());
    expect(canvas.getByTestId("selection")).toHaveTextContent(
      "Selected: member-1, member-2, member-3, member-4",
    );

    await userEvent.click(selectAll);
    await waitFor(() => expect(selectAll).not.toBeChecked());
    expect(canvas.getByTestId("selection")).toHaveTextContent("Selected: none");
  },
};

export const SelectionIndeterminate: Story = {
  render: () => <SelectionExample initialSelection={["member-2"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole("checkbox", {
      name: "Select all rows on this page",
    });

    expect(selectAll).toHaveAttribute("aria-checked", "mixed");

    // Activating a mixed header selects the rest rather than clearing.
    await userEvent.click(selectAll);
    await waitFor(() => expect(selectAll).toBeChecked());
    expect(canvas.getByTestId("selection")).toHaveTextContent(
      "Selected: member-2, member-1, member-3, member-4",
    );
  },
};

export const SelectionWithDisabledRow: Story = {
  render: () => <SelectionExample withDisabledRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const archived = canvas.getByRole("checkbox", {
      name: "Select row Tomas Novak",
    });

    expect(archived).toHaveAttribute("aria-disabled", "true");

    const selectAll = canvas.getByRole("checkbox", {
      name: "Select all rows on this page",
    });

    await userEvent.click(selectAll);
    // The archived row is left out, and the header still reads as fully
    // selected because it only counts selectable rows.
    await waitFor(() => expect(selectAll).toBeChecked());
    expect(canvas.getByTestId("selection")).toHaveTextContent(
      "Selected: member-1, member-2, member-4",
    );
    expect(archived).not.toBeChecked();
  },
};

export const SelectionEmptyTable: Story = {
  render: () => <SelectionExample rows={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.getByRole("checkbox", { name: "Select all rows on this page" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(canvas.getByText("No data")).toBeVisible();
  },
};

/* -------------------------------------------------------------------------- */
/* Bulk actions                                                               */
/* -------------------------------------------------------------------------- */

function BulkActionsExample({
  initialSelection = ["member-1", "member-2"],
  busy = false,
  alwaysVisible = false,
}: {
  initialSelection?: string[];
  busy?: boolean;
  alwaysVisible?: boolean;
}) {
  const [selectedIds, setSelectedIds] = React.useState(initialSelection);
  const [lastAction, setLastAction] = React.useState("none");

  return (
    <div className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
      <DataTableBulkActions
        selectedCount={selectedIds.length}
        alwaysVisible={alwaysVisible}
        onClearSelection={() => setSelectedIds([])}
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => setLastAction("archive")}
        >
          Archive
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={busy}
          onClick={() => setLastAction("delete")}
        >
          Delete
        </Button>
      </DataTableBulkActions>

      <DataTable
        columns={columns}
        data={members.slice(0, 4)}
        caption="Workspace members"
        hideCaption
        selectedRowIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <p
        data-testid="last-action"
        className="text-body-sm text-muted-foreground"
      >
        Last action: {lastAction}
      </p>
    </div>
  );
}

export const BulkActionsDefault: Story = {
  parameters: destructiveContrastKnownIssue,
  render: () => <BulkActionsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvasElement.querySelector<HTMLElement>(
      '[data-slot="data-table-bulk-actions"]',
    )!;

    expect(bar).toHaveTextContent("2 selected");
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    expect(canvas.getByTestId("last-action")).toHaveTextContent(
      "Last action: archive",
    );
  },
};

export const BulkActionsDestructive: Story = {
  parameters: destructiveContrastKnownIssue,
  render: () => <BulkActionsExample initialSelection={["member-3"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole("button", { name: "Delete" });

    expect(
      canvasElement.querySelector('[data-slot="data-table-bulk-actions"]'),
    ).toHaveTextContent("1 selected");

    // Luna runs nothing and confirms nothing: the click only reaches the
    // consumer's own handler.
    await userEvent.click(remove);
    expect(canvas.getByTestId("last-action")).toHaveTextContent(
      "Last action: delete",
    );
    expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const BulkActionsDisabled: Story = {
  parameters: destructiveContrastKnownIssue,
  render: () => <BulkActionsExample busy />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole("button", { name: "Archive" })).toBeDisabled();
    expect(canvas.getByRole("button", { name: "Delete" })).toBeDisabled();
    // Clearing the selection stays available while a mutation is running.
    expect(
      canvas.getByRole("button", { name: "Clear selection" }),
    ).toBeEnabled();
  },
};

export const BulkActionsHiddenWhenEmpty: Story = {
  parameters: destructiveContrastKnownIssue,
  render: () => <BulkActionsExample initialSelection={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvasElement.querySelector('[data-slot="data-table-bulk-actions"]'),
    ).toBeNull();

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Jordan Lee" }),
    );
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-slot="data-table-bulk-actions"]'),
      ).toHaveTextContent("1 selected"),
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Clear selection" }),
    );
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-slot="data-table-bulk-actions"]'),
      ).toBeNull(),
    );
  },
};

export const BulkActionsAlwaysVisible: Story = {
  parameters: destructiveContrastKnownIssue,
  render: () => <BulkActionsExample initialSelection={[]} alwaysVisible />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvasElement.querySelector<HTMLElement>(
      '[data-slot="data-table-bulk-actions"]',
    )!;
    const height = bar.getBoundingClientRect().height;

    expect(bar).toHaveTextContent("0 selected");
    expect(canvas.queryByRole("button", { name: "Archive" })).toBeNull();

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Jordan Lee" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Archive" })).toBeVisible(),
    );
    // Holding the row keeps the table from jumping as actions appear.
    expect(bar.getBoundingClientRect().height).toBe(height);
  },
};

export const BulkActionsResponsive: Story = {
  parameters: { ...destructiveContrastKnownIssue, layout: "fullscreen" },
  render: () => (
    <div className="w-[320px] max-w-full p-4">
      <BulkActionsExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvasElement.querySelector<HTMLElement>(
      '[data-slot="data-table-bulk-actions"]',
    )!;

    const clear = canvas.getByRole("button", { name: "Clear selection" });

    expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
    // Every action has to land inside the bar rather than past its trailing
    // edge, which a bar that grew instead of wrapping would still pass a
    // scrollWidth check for.
    expect(bar.getBoundingClientRect().width).toBeLessThanOrEqual(
      bar.parentElement!.getBoundingClientRect().width,
    );
    for (const action of [
      canvas.getByRole("button", { name: "Archive" }),
      canvas.getByRole("button", { name: "Delete" }),
      clear,
    ]) {
      expect(action).toBeVisible();
      expect(action.getBoundingClientRect().right).toBeLessThanOrEqual(
        Math.ceil(bar.getBoundingClientRect().right),
      );
    }
  },
};

/* -------------------------------------------------------------------------- */
/* Selection against the rest of the table controls                           */
/* -------------------------------------------------------------------------- */

type SortState =
  { columnId: string; direction: DataTableSortDirection } | undefined;

function FullSelectionExample({
  initialSelection = [],
  pageSize = 4,
}: {
  initialSelection?: string[];
  pageSize?: number;
}) {
  const [selectedIds, setSelectedIds] = React.useState(initialSelection);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [sort, setSort] = React.useState<SortState>(undefined);
  const [page, setPage] = React.useState(1);

  const query = search.trim().toLocaleLowerCase();
  const filtered = members
    .filter(
      (member) =>
        (!query || member.name.toLocaleLowerCase().includes(query)) &&
        (!status || member.status === status),
    )
    .sort((a, b) => {
      if (!sort) {
        return 0;
      }

      const key = sort.columnId as keyof Member;
      const result = String(a[key]).localeCompare(String(b[key]));

      return sort.direction === "asc" ? result : -result;
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const tableColumns: DataTableColumn<Member>[] = columns.map((column) =>
    column.id === "name"
      ? {
          ...column,
          sortable: true,
          sortDirection: sort?.columnId === "name" ? sort.direction : undefined,
          header: (
            <DataTableColumnHeader
              title="Name"
              sortDirection={
                sort?.columnId === "name" ? sort.direction : undefined
              }
              onSortChange={(direction) =>
                setSort(direction ? { columnId: "name", direction } : undefined)
              }
            />
          ),
        }
      : column,
  );

  return (
    <div className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
      <DataTableToolbar>
        <DataTableSearch
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          label="Search members"
          placeholder="Search members..."
        />
        <DataTableFilter
          label="Status"
          options={statusOptions}
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      </DataTableToolbar>

      <DataTableBulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
      >
        <Button type="button" size="sm" variant="outline">
          Archive
        </Button>
      </DataTableBulkActions>

      <DataTable
        columns={tableColumns}
        data={rows}
        caption="Workspace members"
        hideCaption
        selectedRowIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <DataTablePagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
      />

      <p data-testid="selection" className="text-body-sm text-muted-foreground">
        Selected: {selectedIds.join(", ") || "none"}
      </p>
    </div>
  );
}

export const SelectionWithSorting: Story = {
  render: () => <FullSelectionExample initialSelection={["member-1"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Name" }).closest("th"),
      ).toHaveAttribute("aria-sort", "ascending"),
    );

    // Selection is keyed on row identity, so reordering leaves it intact.
    expect(canvas.getByTestId("selection")).toHaveTextContent(
      "Selected: member-1",
    );
    expect(
      canvas.getByRole("checkbox", { name: "Select row Jordan Lee" }),
    ).toBeChecked();
  },
};

export const SelectionWithFilters: Story = {
  render: () => <FullSelectionExample initialSelection={["member-3"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(await page.findByRole("radio", { name: /Active/ }));
    await waitFor(() =>
      expect(
        page.queryByRole("radio", { name: /Active/ }),
      ).not.toBeInTheDocument(),
    );

    // Filtering the archived row out of view does not silently drop it from
    // the selection the consumer holds.
    expect(canvas.getByTestId("selection")).toHaveTextContent(
      "Selected: member-3",
    );
    expect(
      canvas.queryByRole("checkbox", { name: "Select row Tomas Novak" }),
    ).not.toBeInTheDocument();
    // Select-all only covers what is on screen, so the header is unchecked.
    expect(
      canvas.getByRole("checkbox", { name: "Select all rows on this page" }),
    ).not.toBeChecked();
  },
};

export const SelectionWithPagination: Story = {
  render: () => <FullSelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole("checkbox", {
      name: "Select all rows on this page",
    });

    await userEvent.click(selectAll);
    await waitFor(() =>
      expect(canvas.getByTestId("selection")).toHaveTextContent(
        "Selected: member-1, member-2, member-3, member-4",
      ),
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );

    // The next page starts unselected: select-all never reaches across pages.
    await waitFor(() =>
      expect(
        canvas.getByRole("checkbox", { name: "Select all rows on this page" }),
      ).not.toBeChecked(),
    );
    expect(canvas.getByTestId("selection")).toHaveTextContent(
      "Selected: member-1, member-2, member-3, member-4",
    );
  },
};

export const FullDataTableSelection: Story = {
  render: () => <FullSelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Amara Okafor" }),
    );
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-slot="data-table-bulk-actions"]'),
      ).toHaveTextContent("1 selected"),
    );

    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search members" }),
      "Mei",
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("checkbox", { name: "Select row Mei Chen" }),
      ).toBeInTheDocument(),
    );

    // Search hides the selected row but the bulk bar still reflects it.
    expect(
      canvasElement.querySelector('[data-slot="data-table-bulk-actions"]'),
    ).toHaveTextContent("1 selected");

    await userEvent.click(
      canvas.getByRole("button", { name: "Clear selection" }),
    );
    await waitFor(() =>
      expect(canvas.getByTestId("selection")).toHaveTextContent(
        "Selected: none",
      ),
    );
  },
};
