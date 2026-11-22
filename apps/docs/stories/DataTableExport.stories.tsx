import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Badge,
  Button,
  DataTable,
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTableExport,
  DataTableFilter,
  DataTablePagination,
  DataTableSearch,
  DataTableToolbar,
  DataTableViewOptions,
  type DataTableColumn,
  type DataTableColumnVisibility,
  type DataTableExportFormat,
  type DataTableExportRequest,
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

const allColumns: DataTableColumn<Member>[] = [
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

function describeRequest(request: DataTableExportRequest | undefined) {
  return request ? `${request.format} / ${request.scope}` : "none";
}

const meta: Meta<typeof DataTableExport> = {
  title: "Luna/DataTable Export",
  component: DataTableExport,
  parameters: {
    layout: "padded",
    a11y: {
      test: "error",
      // Most stories finish with the menu open so axe audits it. An open Base
      // UI popup brackets itself with invisible `tabindex="0"` sentinels that
      // hand focus straight back into the menu; axe reads them as focusable
      // hidden content. Only those sentinels are excluded — the menu itself,
      // and everything else on the page, is still checked.
      context: { exclude: ["[data-base-ui-focus-guard]"] },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/* The control on its own                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Records what Luna emitted and nothing else. The consumer would build and
 * download a file here; the stories only show the request that arrived.
 */
function ExportExample({
  formats,
  selectedCount,
  loading,
  disabled,
}: {
  formats?: DataTableExportFormat[];
  selectedCount?: number;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [requests, setRequests] = React.useState<DataTableExportRequest[]>([]);

  return (
    <div className="flex flex-col items-start gap-3">
      <DataTableExport
        formats={formats}
        selectedCount={selectedCount}
        loading={loading}
        disabled={disabled}
        onExport={(request) => setRequests((prev) => [...prev, request])}
      />
      <p
        data-testid="last-export"
        className="text-body-sm text-muted-foreground"
      >
        Last export: {describeRequest(requests.at(-1))}
      </p>
      <p
        data-testid="export-count"
        className="text-body-sm text-muted-foreground"
      >
        Requests: {requests.length}
      </p>
    </div>
  );
}

function openExportMenu(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);

  return {
    canvas,
    page,
    trigger: canvas.getByRole("button", { name: "Export" }),
    async open() {
      // A menu closed a moment ago may still be fading out; let it go first
      // so the lookup below cannot pick it up.
      await waitFor(() => expect(page.queryByRole("menu")).toBeNull());
      await userEvent.click(canvas.getByRole("button", { name: "Export" }));
      const menu = await page.findByRole("menu");

      // The popup fades in, so wait for it to finish before reading it.
      await waitFor(() => expect(menu).toBeVisible());
      return menu;
    },
  };
}

export const ExportDefault: Story = {
  render: () => <ExportExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, trigger, open } = openExportMenu(canvasElement);

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const menu = await open();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(2);
    expect(within(menu).getByText("Current view")).toBeVisible();

    await userEvent.click(
      page.getByRole("menuitem", { name: "Export current view as CSV" }),
    );

    await waitFor(() =>
      expect(page.queryByRole("menu")).not.toBeInTheDocument(),
    );
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: csv / current-view",
    );
    // Choosing an item hands focus back to the control that opened the menu.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ExportCSVOnly: Story = {
  render: () => <ExportExample formats={["csv"]} selectedCount={2} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { page, open } = openExportMenu(canvasElement);

    await open();

    expect(
      page.getByRole("menuitem", { name: "Export current view as CSV" }),
    ).toBeVisible();
    expect(
      page.getByRole("menuitem", { name: "Export 2 selected rows as CSV" }),
    ).toBeVisible();
    // A format the consumer cannot produce is left out, not shown disabled.
    expect(page.queryByRole("menuitem", { name: /Excel/ })).toBeNull();
  },
};

export const ExportExcelOnly: Story = {
  render: () => <ExportExample formats={["excel"]} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, open } = openExportMenu(canvasElement);

    await open();

    expect(page.queryByRole("menuitem", { name: /CSV/ })).toBeNull();
    await userEvent.click(
      page.getByRole("menuitem", { name: "Export current view as Excel" }),
    );
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: excel / current-view",
    );
  },
};

export const ExportCurrentView: Story = {
  render: () => <ExportExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, open } = openExportMenu(canvasElement);

    const menu = await open();

    // Without `selectedCount` the surface has no selection to export, so the
    // selected group is not offered at all.
    expect(within(menu).queryByText(/Selected/)).toBeNull();
    expect(within(menu).queryByRole("separator")).toBeNull();

    await userEvent.click(
      page.getByRole("menuitem", { name: "Export current view as Excel" }),
    );
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: excel / current-view",
    );
  },
};

export const ExportWithSelectedRows: Story = {
  render: () => <ExportExample selectedCount={3} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, open } = openExportMenu(canvasElement);

    const menu = await open();

    expect(within(menu).getByText("Selected (3)")).toBeVisible();
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(4);
    const excel = page.getByRole("menuitem", {
      name: "Export 3 selected rows as Excel",
    });
    expect(excel).not.toHaveAttribute("aria-disabled", "true");

    await userEvent.click(excel);
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: excel / selected",
    );
  },
};

export const ExportSingleSelectedRow: Story = {
  render: () => <ExportExample selectedCount={1} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { page, open } = openExportMenu(canvasElement);

    await open();

    expect(
      page.getByRole("menuitem", { name: "Export 1 selected row as CSV" }),
    ).toBeVisible();
  },
};

export const ExportNoSelection: Story = {
  render: () => <ExportExample selectedCount={0} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, open } = openExportMenu(canvasElement);

    const menu = await open();

    // The group stays so the menu keeps its shape; its actions say why they
    // cannot be used yet.
    expect(within(menu).getByText("Selected (0)")).toBeVisible();
    const hint = within(menu).getByText("Select rows to export them.");
    expect(hint).toBeVisible();

    const csv = page.getByRole("menuitem", {
      name: "Export selected rows as CSV",
    });
    expect(csv).toHaveAttribute("aria-disabled", "true");
    expect(csv).toHaveAttribute("aria-describedby", hint.id);

    await userEvent.click(csv, { pointerEventsCheck: 0 });
    expect(canvas.getByTestId("export-count")).toHaveTextContent("Requests: 0");

    // The current view is still exportable.
    await userEvent.click(
      page.getByRole("menuitem", { name: "Export current view as CSV" }),
    );
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: csv / current-view",
    );
  },
};

export const ExportLoading: Story = {
  render: () => <ExportExample loading selectedCount={3} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, trigger } = openExportMenu(canvasElement);

    expect(trigger).toHaveAttribute("aria-busy", "true");
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    // Kept focusable so focus is not dropped when loading starts.
    expect(trigger).not.toBeDisabled();
    expect(canvas.getByRole("status")).toHaveTextContent("Export in progress");

    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");

    expect(page.queryByRole("menu")).toBeNull();
    expect(canvas.getByTestId("export-count")).toHaveTextContent("Requests: 0");
  },
};

/** A consumer that marks itself busy as soon as a request arrives. */
function LoadingAfterRequestExample() {
  const [loading, setLoading] = React.useState(false);
  const [requests, setRequests] = React.useState(0);

  return (
    <div className="flex flex-col items-start gap-3">
      <DataTableExport
        loading={loading}
        onExport={() => {
          setRequests((count) => count + 1);
          setLoading(true);
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setLoading(false)}
      >
        Finish export
      </Button>
      <p
        data-testid="export-count"
        className="text-body-sm text-muted-foreground"
      >
        Requests: {requests}
      </p>
    </div>
  );
}

export const ExportLoadingBlocksDuplicates: Story = {
  render: () => <LoadingAfterRequestExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, trigger, open } = openExportMenu(canvasElement);

    await open();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(trigger).toHaveAttribute("aria-busy", "true"));
    // Focus survives the switch to loading instead of falling to the page.
    await waitFor(() => expect(trigger).toHaveFocus());

    // A second attempt, by keyboard or pointer, does not reach the consumer.
    await userEvent.keyboard("{Enter}");
    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    expect(page.queryByRole("menu")).toBeNull();
    expect(canvas.getByTestId("export-count")).toHaveTextContent("Requests: 1");

    await userEvent.click(
      canvas.getByRole("button", { name: "Finish export" }),
    );
    await waitFor(() => expect(trigger).not.toHaveAttribute("aria-busy"));
    expect(canvas.getByRole("status")).toBeEmptyDOMElement();
  },
};

export const ExportDisabled: Story = {
  render: () => <ExportExample disabled selectedCount={3} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, trigger } = openExportMenu(canvasElement);

    expect(trigger).toBeDisabled();

    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    expect(page.queryByRole("menu")).toBeNull();

    // A disabled control is out of the tab order.
    await userEvent.tab();
    expect(trigger).not.toHaveFocus();
    expect(canvas.getByTestId("export-count")).toHaveTextContent("Requests: 0");
  },
};

export const ExportNoFormats: Story = {
  render: () => <ExportExample formats={[]} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    expect(canvas.queryByRole("button", { name: "Export" })).toBeNull();
  },
};

export const ExportKeyboard: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline">
        Before
      </Button>
      <ExportExample selectedCount={2} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, trigger } = openExportMenu(canvasElement);

    canvas.getByRole("button", { name: "Before" }).focus();
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(canvas.getByRole("button", { name: "Before" })).toHaveFocus();
    await userEvent.tab();

    // Enter opens and Escape closes, returning focus to the trigger.
    await userEvent.keyboard("{Enter}");
    await page.findByRole("menu");
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(page.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    // Space opens too, landing on the first item; the arrow keys walk the
    // rest in order, across the group boundary.
    await userEvent.keyboard(" ");
    await page.findByRole("menu");
    await waitFor(() =>
      expect(
        page.getByRole("menuitem", { name: "Export current view as CSV" }),
      ).toHaveAttribute("data-highlighted"),
    );
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(
        page.getByRole("menuitem", { name: "Export 2 selected rows as CSV" }),
      ).toHaveAttribute("data-highlighted"),
    );
    await userEvent.keyboard("{Enter}");

    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: csv / selected",
    );
  },
};

export const ExportClassName: Story = {
  render: () => (
    <DataTableExport className="w-full sm:w-auto" onExport={() => {}} />
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const trigger = within(canvasElement).getByRole("button", {
      name: "Export",
    });

    expect(trigger).toHaveClass("w-full", "sm:w-auto");
    // The consumer's classes extend the trigger rather than replace it.
    expect(trigger).toHaveAttribute("data-slot", "data-table-export");
  },
};

/* -------------------------------------------------------------------------- */
/* Composition                                                                */
/* -------------------------------------------------------------------------- */

function BulkActionsExportExample() {
  const [selectedIds, setSelectedIds] = React.useState([
    "member-1",
    "member-2",
  ]);
  const [last, setLast] = React.useState<DataTableExportRequest>();

  return (
    <div className="grid w-full min-w-0 gap-3">
      <DataTableBulkActions
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
      >
        <Button type="button" size="sm" variant="destructive">
          Delete
        </Button>
        {/* Fed the same count as the bar; neither needs the other's context. */}
        <DataTableExport
          selectedCount={selectedIds.length}
          onExport={setLast}
        />
      </DataTableBulkActions>
      <DataTable
        columns={allColumns}
        data={members.slice(0, 4)}
        caption="Workspace members"
        hideCaption
        selectedRowIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      <p
        data-testid="last-export"
        className="text-body-sm text-muted-foreground"
      >
        Last export: {describeRequest(last)}
      </p>
    </div>
  );
}

export const ExportInBulkActions: Story = {
  render: () => <BulkActionsExportExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, open } = openExportMenu(canvasElement);

    await open();
    await userEvent.click(
      page.getByRole("menuitem", { name: "Export 2 selected rows as CSV" }),
    );
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: csv / selected",
    );

    // The count follows the consumer's selection with no shared context.
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Amara Okafor" }),
    );
    await open();
    expect(
      page.getByRole("menuitem", { name: "Export 3 selected rows as Excel" }),
    ).toBeVisible();
  },
};

function FullExportExample({ pageSize = 4 }: { pageSize?: number }) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [visibility, setVisibility] = React.useState<DataTableColumnVisibility>(
    {},
  );
  const [page, setPage] = React.useState(1);
  const [sortDirection, setSortDirection] =
    React.useState<DataTableSortDirection>();
  const [exporting, setExporting] = React.useState(false);
  const [last, setLast] = React.useState<string>("none");

  const query = search.trim().toLocaleLowerCase();
  const filtered = members.filter(
    (member) =>
      (!query || member.name.toLocaleLowerCase().includes(query)) &&
      (!status || member.status === status),
  );
  const sorted = sortDirection
    ? [...filtered].sort((left, right) => {
        const result = left.name.localeCompare(right.name);
        return sortDirection === "asc" ? result : -result;
      })
    : filtered;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const columns = allColumns
    .map((column): DataTableColumn<Member> =>
      column.id === "name"
        ? {
            ...column,
            header: (
              <DataTableColumnHeader
                title="Name"
                sortDirection={sortDirection}
                onSortChange={(direction) => {
                  setSortDirection(direction);
                  setPage(1);
                }}
              />
            ),
            sortable: true,
            sortDirection,
          }
        : column,
    )
    .filter((column) => visibility[column.id] !== false);

  // Everything below is the consumer's: it decides that "current view" means
  // every filtered row, resolves the selection and would start the real job.
  function handleExport({ format, scope }: DataTableExportRequest) {
    const ids =
      scope === "selected" ? selectedIds : filtered.map((member) => member.id);

    setLast(`${format} / ${scope} / ${ids.length} rows`);
    setExporting(true);
  }

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
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <DataTableViewOptions
            columns={allColumns.map((column) => ({
              id: column.id,
              label: String(column.header),
              canHide: column.id !== "name",
            }))}
            visibility={visibility}
            onVisibilityChange={setVisibility}
          />
          <DataTableExport
            loading={exporting}
            disabled={filtered.length === 0}
            selectedCount={selectedIds.length}
            onExport={handleExport}
          />
        </div>
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
        columns={columns}
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

      <div className="flex flex-wrap items-center gap-3">
        <p
          data-testid="last-export"
          className="text-body-sm text-muted-foreground"
        >
          Last export: {last}
        </p>
        {exporting ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExporting(false)}
          >
            Finish export
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export const FullDataTableExport: Story = {
  render: () => <FullExportExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, trigger, open } = openExportMenu(canvasElement);

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Priya Raman" }),
    );
    await open();
    await userEvent.click(
      page.getByRole("menuitem", { name: "Export 1 selected row as Excel" }),
    );
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: excel / selected / 1 rows",
    );
    await waitFor(() => expect(trigger).toHaveAttribute("aria-busy", "true"));

    await userEvent.click(
      canvas.getByRole("button", { name: "Finish export" }),
    );
    await waitFor(() => expect(trigger).not.toHaveAttribute("aria-busy"));

    // The consumer decides the current view spans every filtered page.
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search members" }),
      "a",
    );
    await open();
    await userEvent.click(
      page.getByRole("menuitem", { name: "Export current view as CSV" }),
    );
    expect(canvas.getByTestId("last-export")).toHaveTextContent(
      /Last export: csv \/ current-view \/ \d+ rows/,
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Finish export" }),
    );

    // With nothing to export the consumer disables the control.
    await userEvent.clear(
      canvas.getByRole("searchbox", { name: "Search members" }),
    );
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search members" }),
      "nobody",
    );
    await waitFor(() => expect(trigger).toBeDisabled());
  },
};

/**
 * The Phase 3 release path in one story. It deliberately crosses every
 * controlled state boundary so regressions between otherwise-correct
 * components are caught by the interaction runner.
 */
export const IntegratedFlow: Story = {
  render: () => <FullExportExample pageSize={2} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, open } = openExportMenu(canvasElement);

    // Search → Filter
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search members" }),
      "a",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(page.getByRole("radio", { name: "Active" }));
    await expect(
      canvas.getByRole("button", { name: "Status: Active" }),
    ).toBeVisible();

    // Sorting → Column visibility
    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(
      canvas.getByRole("columnheader", { name: /Name/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent(
      "Amara Okafor",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    await userEvent.click(page.getByRole("checkbox", { name: "Email" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(page.queryByRole("checkbox", { name: "Email" })).toBeNull(),
    );
    await expect(
      canvas.queryByRole("columnheader", { name: "Email" }),
    ).toBeNull();

    // Pagination → Selection → Bulk actions
    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );
    await expect(canvas.getByText("Page 2 of 2")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Luca Bianchi" }),
    );
    await expect(canvas.getByText("1 selected")).toBeVisible();

    // Export the exact selection created after all upstream state changes.
    await open();
    await userEvent.click(
      page.getByRole("menuitem", { name: "Export 1 selected row as Excel" }),
    );
    await waitFor(() =>
      expect(page.queryByRole("menu")).not.toBeInTheDocument(),
    );
    await expect(canvas.getByTestId("last-export")).toHaveTextContent(
      "Last export: excel / selected / 1 rows",
    );
  },
};

export const ExportResponsive: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="w-[320px] max-w-full p-4">
      <FullExportExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const { canvas, page, trigger, open } = openExportMenu(canvasElement);
    const toolbar = canvasElement.querySelector<HTMLElement>(
      '[data-slot="data-table-toolbar"]',
    )!;

    // The trigger keeps its text label at narrow widths.
    expect(trigger).toHaveTextContent("Export");
    expect(trigger).toBeVisible();
    expect(trigger.getBoundingClientRect().right).toBeLessThanOrEqual(
      Math.ceil(toolbar.getBoundingClientRect().right),
    );
    expect(toolbar.scrollWidth).toBeLessThanOrEqual(toolbar.clientWidth);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select row Jordan Lee" }),
    );
    const menu = await open();
    const rect = menu.getBoundingClientRect();

    // The popup stays inside the viewport rather than spilling past its edge.
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    expect(
      page.getByRole("menuitem", { name: "Export 1 selected row as Excel" }),
    ).toBeVisible();
  },
};
