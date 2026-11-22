import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Badge,
  Button,
  DataTable,
  DataTableColumnHeader,
  DataTableEmptyState,
  DataTableFilter,
  DataTablePagination,
  DataTableSearch,
  DataTableToolbar,
  DataTableViewOptions,
  type DataTableColumn,
  type DataTableColumnVisibility,
  type DataTableFilterOption,
  type DataTableSortDirection,
  type DataTableViewOption,
} from "@withalif/luna";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  status: "active" | "inactive";
  createdAt: string;
};

const roles = ["Admin", "Manager", "Staff"] as const;

const firstNames = [
  "Jordan",
  "Priya",
  "Tomas",
  "Amara",
  "Mei",
  "Luca",
  "Fatima",
  "Noah",
  "Ingrid",
  "Rafael",
  "Sofia",
  "Kwame",
];

const lastNames = [
  "Lee",
  "Raman",
  "Novak",
  "Okafor",
  "Chen",
  "Bianchi",
  "Haddad",
  "Nilsen",
  "Olsen",
  "Duarte",
  "Rossi",
  "Mensah",
];

const members: Member[] = Array.from({ length: 24 }, (_, index) => {
  const name = `${firstNames[index % firstNames.length]} ${
    lastNames[(index * 5) % lastNames.length]
  }`;

  return {
    id: `member-${index + 1}`,
    name,
    email: `${name.toLowerCase().replace(" ", ".")}${index}@example.com`,
    role: roles[index % roles.length]!,
    status: index % 4 === 0 ? "inactive" : "active",
    createdAt: `2026-${String((index % 12) + 1).padStart(2, "0")}-14`,
  };
});

const statusOptions: DataTableFilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

/**
 * The sort state a consuming application owns. Luna is told which column is
 * sorted and in which direction, and reports the next direction back.
 */
type SortState =
  { columnId: string; direction: DataTableSortDirection } | undefined;

/**
 * The recommended consumer pattern: one helper that wires the header control
 * and the header cell's `aria-sort` from the same piece of state.
 */
function sortableColumn(
  column: DataTableColumn<Member>,
  title: string,
  sort: SortState,
  setSort: (next: SortState) => void,
): DataTableColumn<Member> {
  const direction = sort?.columnId === column.id ? sort.direction : undefined;

  return {
    ...column,
    sortable: true,
    sortDirection: direction,
    header: (
      <DataTableColumnHeader
        title={title}
        sortDirection={direction}
        onSortChange={(next) =>
          setSort(next ? { columnId: column.id, direction: next } : undefined)
        }
      />
    ),
  };
}

function compareMembers(a: Member, b: Member, sort: SortState) {
  if (!sort) {
    return 0;
  }

  const key = sort.columnId as keyof Member;
  const result = String(a[key]).localeCompare(String(b[key]));

  return sort.direction === "asc" ? result : -result;
}

const meta: Meta<typeof DataTablePagination> = {
  title: "Luna/DataTable Controls",
  component: DataTablePagination,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

function SortingExample({ initialSort }: { initialSort?: SortState }) {
  const [sort, setSort] = React.useState<SortState>(initialSort);
  const rows = React.useMemo(
    () => [...members].slice(0, 5).sort((a, b) => compareMembers(a, b, sort)),
    [sort],
  );

  const columns: DataTableColumn<Member>[] = [
    sortableColumn(
      { id: "name", header: "Name", rowHeader: true, cell: (m) => m.name },
      "Name",
      sort,
      setSort,
    ),
    { id: "email", header: "Email", cell: (m) => m.email },
    sortableColumn(
      { id: "role", header: "Role", cell: (m) => m.role },
      "Role",
      sort,
      setSort,
    ),
    sortableColumn(
      { id: "createdAt", header: "Created", cell: (m) => m.createdAt },
      "Created",
      sort,
      setSort,
    ),
  ];

  return (
    <div className="grid w-full min-w-0 gap-3">
      <DataTable columns={columns} data={rows} caption="Members" hideCaption />
      <p
        role="status"
        data-testid="sort-state"
        className="text-body-sm text-muted-foreground"
      >
        Sort: {sort ? `${sort.columnId} ${sort.direction}` : "none"}
      </p>
    </div>
  );
}

export const SortableColumns: Story = {
  render: () => <SortingExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const header = canvas.getByRole("button", { name: "Name" });
    const cell = header.closest("th")!;

    expect(cell).toHaveAttribute("aria-sort", "none");

    await userEvent.click(header);
    await waitFor(() => expect(cell).toHaveAttribute("aria-sort", "ascending"));
    expect(canvas.getByTestId("sort-state")).toHaveTextContent(
      "Sort: name asc",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await waitFor(() =>
      expect(cell).toHaveAttribute("aria-sort", "descending"),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await waitFor(() => expect(cell).toHaveAttribute("aria-sort", "none"));
    expect(canvas.getByTestId("sort-state")).toHaveTextContent("Sort: none");
  },
};

export const AscendingSort: Story = {
  render: () => (
    <SortingExample initialSort={{ columnId: "name", direction: "asc" }} />
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const cell = canvas.getByRole("button", { name: "Name" }).closest("th")!;

    expect(cell).toHaveAttribute("aria-sort", "ascending");
    expect(
      canvas.getByRole("button", { name: "Role" }).closest("th"),
    ).toHaveAttribute("aria-sort", "none");
  },
};

export const DescendingSort: Story = {
  render: () => (
    <SortingExample
      initialSort={{ columnId: "createdAt", direction: "desc" }}
    />
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    expect(
      canvas.getByRole("button", { name: "Created" }).closest("th"),
    ).toHaveAttribute("aria-sort", "descending");
  },
};

export const ResetSort: Story = {
  render: () => (
    <SortingExample initialSort={{ columnId: "role", direction: "desc" }} />
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const header = canvas.getByRole("button", { name: "Role" });

    // Keyboard has to reach the same cycle the pointer does.
    header.focus();
    await userEvent.keyboard("{Enter}");

    await waitFor(() =>
      expect(canvas.getByTestId("sort-state")).toHaveTextContent("Sort: none"),
    );
    expect(
      canvas.getByRole("button", { name: "Role" }).closest("th"),
    ).toHaveAttribute("aria-sort", "none");
  },
};

export const NonSortableColumn: Story = {
  render: () => <SortingExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const emailHeader = canvas.getByRole("columnheader", { name: "Email" });

    expect(emailHeader).not.toHaveAttribute("aria-sort");
    expect(within(emailHeader).queryByRole("button")).not.toBeInTheDocument();
  },
};

export const LongHeaderLabels: Story = {
  render: () => {
    function LongLabelsExample() {
      const [sort, setSort] = React.useState<SortState>(undefined);
      const columns: DataTableColumn<Member>[] = [
        sortableColumn(
          { id: "name", header: "", rowHeader: true, cell: (m) => m.name },
          "Assigned Operational Business Unit",
          sort,
          setSort,
        ),
        sortableColumn(
          { id: "createdAt", header: "", cell: (m) => m.createdAt },
          "Last Administrative Modification Date",
          sort,
          setSort,
        ),
        sortableColumn(
          { id: "status", header: "", cell: (m) => m.status },
          "Pending Administrative Approval Status",
          sort,
          setSort,
        ),
      ];

      return (
        <DataTable
          columns={columns}
          data={members.slice(0, 3)}
          caption="Members"
          hideCaption
        />
      );
    }

    return <LongLabelsExample />;
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const header = canvas.getByRole("button", {
      name: "Last Administrative Modification Date",
    });

    await userEvent.click(header);
    expect(header.closest("th")).toHaveAttribute("aria-sort", "ascending");
    // The page itself must not gain a horizontal scrollbar; the table's own
    // scroll container is what absorbs the extra width.
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Column visibility                                                          */
/* -------------------------------------------------------------------------- */

const viewColumns: DataTableViewOption[] = [
  { id: "name", label: "Name", canHide: false },
  { id: "email", label: "Email" },
  { id: "role", label: "Role" },
  { id: "status", label: "Status" },
  { id: "createdAt", label: "Created" },
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
  { id: "createdAt", header: "Created", cell: (m) => m.createdAt },
];

function VisibilityExample({
  initialVisibility = {},
}: {
  initialVisibility?: DataTableColumnVisibility;
}) {
  const [visibility, setVisibility] =
    React.useState<DataTableColumnVisibility>(initialVisibility);
  const visibleColumns = allColumns.filter(
    (column) => visibility[column.id] !== false,
  );

  return (
    <div className="grid w-full min-w-0 gap-3">
      <DataTableToolbar className="justify-end">
        <DataTableViewOptions
          columns={viewColumns}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />
      </DataTableToolbar>
      <DataTable
        columns={visibleColumns}
        data={members.slice(0, 4)}
        caption="Members"
        hideCaption
      />
    </div>
  );
}

export const ColumnVisibility: Story = {
  render: () => <VisibilityExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    expect(
      canvas.getByRole("columnheader", { name: "Role" }),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    await userEvent.click(await page.findByRole("checkbox", { name: "Role" }));

    await waitFor(() =>
      expect(
        canvas.queryByRole("columnheader", { name: "Role" }),
      ).not.toBeInTheDocument(),
    );
    expect(canvas.getByRole("button", { name: "Columns 1" })).toBeVisible();

    await userEvent.click(page.getByRole("checkbox", { name: "Role" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("columnheader", { name: "Role" }),
      ).toBeInTheDocument(),
    );
  },
};

export const HiddenColumns: Story = {
  render: () => (
    <VisibilityExample initialVisibility={{ email: false, createdAt: false }} />
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    expect(
      canvas.queryByRole("columnheader", { name: "Email" }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Columns 2" }));
    await userEvent.click(
      await page.findByRole("button", { name: "Show all columns" }),
    );

    await waitFor(() =>
      expect(
        canvas.getByRole("columnheader", { name: "Email" }),
      ).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Columns" })).toHaveFocus(),
    );
  },
};

export const MandatoryColumn: Story = {
  render: () => <VisibilityExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));

    const name = await page.findByRole("checkbox", { name: "Name" });
    expect(name).toBeChecked();
    expect(name).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(name);
    expect(name).toBeChecked();
    expect(
      canvas.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
  },
};

export const ManyColumns: Story = {
  render: () => {
    function ManyColumnsExample() {
      const columns: DataTableViewOption[] = [
        { id: "name", label: "Name", canHide: false },
        { id: "email", label: "Email" },
        { id: "role", label: "Role" },
        { id: "status", label: "Status" },
        { id: "createdAt", label: "Created" },
        { id: "unit", label: "Assigned Operational Business Unit" },
        { id: "approval", label: "Pending Administrative Approval Status" },
        { id: "modified", label: "Last Administrative Modification Date" },
        { id: "manager", label: "Reporting Manager" },
        { id: "location", label: "Primary Work Location" },
        { id: "contract", label: "Contract Type" },
        { id: "seat", label: "Licensed Seat" },
      ];
      const [visibility, setVisibility] =
        React.useState<DataTableColumnVisibility>({});

      return (
        <DataTableToolbar className="justify-end">
          <DataTableViewOptions
            columns={columns}
            visibility={visibility}
            onVisibilityChange={setVisibility}
          />
        </DataTableToolbar>
      );
    }

    return <ManyColumnsExample />;
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));

    const list = (await page.findByRole("group", {
      name: "Columns",
    })) as HTMLElement;
    expect(within(list).getAllByRole("checkbox")).toHaveLength(12);
    // Twelve rows must not push the popover past the viewport.
    expect(list.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      window.innerHeight,
    );
  },
};

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

function PaginationExample({
  initialPage = 1,
  initialPageSize,
  pageSizeEnabled = false,
  showFirstLast = true,
}: {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeEnabled?: boolean;
  showFirstLast?: boolean;
}) {
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize ?? 5);
  const pageCount = Math.max(1, Math.ceil(members.length / pageSize));
  const rows = members.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="grid w-full min-w-0 gap-3">
      <DataTable
        columns={allColumns.slice(0, 3)}
        data={rows}
        caption="Members"
        hideCaption
      />
      <DataTablePagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        showFirstLast={showFirstLast}
        {...(pageSizeEnabled
          ? {
              pageSize,
              pageSizeOptions: [5, 10, 25],
              onPageSizeChange: setPageSize,
            }
          : {})}
      />
    </div>
  );
}

export const PaginationFirstPage: Story = {
  render: () => <PaginationExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    expect(
      canvas.getByRole("button", { name: "Go to first page" }),
    ).toBeDisabled();
    expect(
      canvas.getByRole("button", { name: "Go to previous page" }),
    ).toBeDisabled();
    expect(
      canvas.getByRole("button", { name: "Go to next page" }),
    ).toBeEnabled();
    expect(
      canvas.getByRole("navigation", { name: "Pagination" }),
    ).toHaveTextContent("Page 1 of 5");
  },
};

export const PaginationMiddlePage: Story = {
  render: () => <PaginationExample initialPage={3} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Pagination" });

    expect(nav).toHaveTextContent("Page 3 of 5");
    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );
    await waitFor(() => expect(nav).toHaveTextContent("Page 4 of 5"));

    await userEvent.click(
      canvas.getByRole("button", { name: "Go to previous page" }),
    );
    await waitFor(() => expect(nav).toHaveTextContent("Page 3 of 5"));

    await userEvent.click(
      canvas.getByRole("button", { name: "Go to first page" }),
    );
    await waitFor(() => expect(nav).toHaveTextContent("Page 1 of 5"));
  },
};

export const PaginationLastPage: Story = {
  render: () => <PaginationExample initialPage={5} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Pagination" });

    expect(
      canvas.getByRole("button", { name: "Go to next page" }),
    ).toBeDisabled();
    expect(
      canvas.getByRole("button", { name: "Go to last page" }),
    ).toBeDisabled();

    await userEvent.click(
      canvas.getByRole("button", { name: "Go to previous page" }),
    );
    await waitFor(() => expect(nav).toHaveTextContent("Page 4 of 5"));

    await userEvent.click(
      canvas.getByRole("button", { name: "Go to last page" }),
    );
    await waitFor(() => expect(nav).toHaveTextContent("Page 5 of 5"));
  },
};

export const PaginationWithPageSize: Story = {
  render: () => <PaginationExample initialPage={2} pageSizeEnabled />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const nav = canvas.getByRole("navigation", { name: "Pagination" });

    expect(nav).toHaveTextContent("Page 2 of 5");

    await userEvent.click(
      canvas.getByRole("combobox", { name: "Rows per page" }),
    );
    await userEvent.click(await page.findByRole("option", { name: "10" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("combobox", { name: "Rows per page" }),
      ).toHaveFocus(),
    );

    // Luna emits the new size and nothing else: the page is left exactly where
    // the consumer had it.
    await waitFor(() => expect(nav).toHaveTextContent("Page 2 of 3"));
  },
};

export const PaginationWithoutFirstLast: Story = {
  render: () => <PaginationExample initialPage={2} showFirstLast={false} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    expect(
      canvas.queryByRole("button", { name: "Go to first page" }),
    ).not.toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: "Go to next page" }),
    ).toBeEnabled();
  },
};

export const PaginationSinglePage: Story = {
  render: () => (
    <DataTablePagination page={1} pageCount={1} onPageChange={() => {}} />
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    expect(
      canvas.getByRole("navigation", { name: "Pagination" }),
    ).toHaveTextContent("Page 1 of 1");
    for (const name of [
      "Go to first page",
      "Go to previous page",
      "Go to next page",
      "Go to last page",
    ]) {
      expect(canvas.getByRole("button", { name })).toBeDisabled();
    }
  },
};

/* -------------------------------------------------------------------------- */
/* Combined                                                                   */
/* -------------------------------------------------------------------------- */

function FullExample({ initialSearch = "" }: { initialSearch?: string }) {
  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [sort, setSort] = React.useState<SortState>(undefined);
  const [visibility, setVisibility] = React.useState<DataTableColumnVisibility>(
    {},
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const query = search.trim().toLocaleLowerCase();
  const filtered = members
    .filter((member) => {
      const matchesSearch =
        !query ||
        [member.name, member.email, member.role]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query);

      return matchesSearch && (!status || member.status === status);
    })
    .sort((a, b) => compareMembers(a, b, sort));

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columns: DataTableColumn<Member>[] = [
    sortableColumn(allColumns[0]!, "Name", sort, setSort),
    allColumns[1]!,
    sortableColumn(allColumns[2]!, "Role", sort, setSort),
    allColumns[3]!,
    sortableColumn(allColumns[4]!, "Created", sort, setSort),
  ].filter((column) => visibility[column.id] !== false);

  const hasFilters = Boolean(search || status);

  function clearAll() {
    setSearch("");
    setStatus(undefined);
    setPage(1);
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
        {hasFilters ? (
          <Button type="button" variant="ghost" onClick={clearAll}>
            Clear all
          </Button>
        ) : null}
        <DataTableViewOptions
          className="ms-auto"
          columns={viewColumns}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={rows}
        caption="Workspace members"
        hideCaption
        emptyState={
          <DataTableEmptyState
            title="No matching members"
            description="Try a different search or clear the active filters."
          >
            {hasFilters ? (
              <Button type="button" variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            ) : null}
          </DataTableEmptyState>
        }
      />

      <DataTablePagination
        page={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 25]}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(next);
          setPage(1);
        }}
      />
    </div>
  );
}

export const SearchFilterSortCombined: Story = {
  render: () => <FullExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(await page.findByRole("radio", { name: /Inactive/ }));
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Status: Inactive" }),
      ).toHaveFocus(),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Name" }).closest("th"),
      ).toHaveAttribute("aria-sort", "ascending"),
    );

    // The filter survives sorting.
    expect(
      canvas.getByRole("button", { name: "Status: Inactive" }),
    ).toBeInTheDocument();
  },
};

export const FullTableControls: Story = {
  tags: ["phase6c-reference"],
  render: () => <FullExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const nav = canvas.getByRole("navigation", { name: "Pagination" });

    expect(nav).toHaveTextContent("Page 1 of 5");

    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );
    await waitFor(() => expect(nav).toHaveTextContent("Page 2 of 5"));

    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    await userEvent.click(
      await page.findByRole("checkbox", { name: "Created" }),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Columns 1" })).toHaveFocus(),
    );

    await waitFor(() =>
      expect(
        canvas.queryByRole("columnheader", { name: "Created" }),
      ).not.toBeInTheDocument(),
    );
    // Hiding a column is not a data change, so the page is untouched.
    expect(nav).toHaveTextContent("Page 2 of 5");

    await userEvent.click(canvas.getByRole("button", { name: "Role" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Role" }).closest("th"),
      ).toHaveAttribute("aria-sort", "ascending"),
    );
    expect(nav).toHaveTextContent("Page 2 of 5");
  },
};

export const ResponsiveTableControls: Story = {
  tags: ["phase6c-reference", "phase6c-narrow"],
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="w-[320px] max-w-full p-4">
      <FullExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Pagination" });
    const toolbar = canvasElement.querySelector<HTMLElement>(
      '[data-slot="data-table-toolbar"]',
    )!;

    // Both control clusters wrap instead of forcing a horizontal scroll.
    expect(toolbar.scrollWidth).toBeLessThanOrEqual(toolbar.clientWidth);
    expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
    expect(
      canvas.getByRole("button", { name: "Go to next page" }),
    ).toBeVisible();
  },
};
