import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Badge,
  Button,
  DataTable,
  DataTableBulkActions,
  DataTableEmptyState,
  DataTableFilter,
  DataTablePagination,
  DataTableSearch,
  DataTableToolbar,
  DownloadIcon,
  MetricCard,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  type DataTableColumn,
  type DataTableFilterOption,
} from "@withalif/luna";

type OrderStatus = "Awaiting review" | "Processing" | "Ready" | "Blocked";
type OrderPriority = "Standard" | "Priority";

type QueueOrder = {
  id: string;
  customer: string;
  destination: string;
  dueAt: string;
  amount: number;
  priority: OrderPriority;
  status: OrderStatus;
};

const initialOrders: readonly QueueOrder[] = [
  {
    id: "ORD-1042",
    customer: "Northstar Retail",
    destination: "Jakarta",
    dueAt: "2026-10-24",
    amount: 12840,
    priority: "Priority",
    status: "Awaiting review",
  },
  {
    id: "ORD-1043",
    customer: "Harbor Foods",
    destination: "Surabaya",
    dueAt: "2026-10-24",
    amount: 8750,
    priority: "Standard",
    status: "Processing",
  },
  {
    id: "ORD-1044",
    customer: "Meridian Health",
    destination: "Bandung",
    dueAt: "2026-10-25",
    amount: 19620,
    priority: "Priority",
    status: "Blocked",
  },
  {
    id: "ORD-1045",
    customer: "Atlas Workshop",
    destination: "Jakarta",
    dueAt: "2026-10-25",
    amount: 6240,
    priority: "Standard",
    status: "Ready",
  },
  {
    id: "ORD-1046",
    customer: "Cedar Hospitality",
    destination: "Yogyakarta",
    dueAt: "2026-10-26",
    amount: 15300,
    priority: "Standard",
    status: "Processing",
  },
  {
    id: "ORD-1047",
    customer: "Summit Education",
    destination: "Semarang",
    dueAt: "2026-10-26",
    amount: 9480,
    priority: "Priority",
    status: "Awaiting review",
  },
  {
    id: "ORD-1048",
    customer: "Fieldstone Market",
    destination: "Medan",
    dueAt: "2026-10-27",
    amount: 11890,
    priority: "Standard",
    status: "Ready",
  },
  {
    id: "ORD-1049",
    customer: "Bluebird Supply",
    destination: "Makassar",
    dueAt: "2026-10-27",
    amount: 7320,
    priority: "Standard",
    status: "Processing",
  },
];

const statusOptions = [
  { label: "Awaiting review", value: "Awaiting review", count: 2 },
  { label: "Processing", value: "Processing", count: 3 },
  { label: "Ready", value: "Ready", count: 2 },
  { label: "Blocked", value: "Blocked", count: 1 },
] satisfies readonly DataTableFilterOption[];

const priorityOptions = [
  { label: "Priority", value: "Priority", count: 3 },
  { label: "Standard", value: "Standard", count: 5 },
] satisfies readonly DataTableFilterOption[];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function statusVariant(status: OrderStatus) {
  if (status === "Blocked") return "destructive" as const;
  if (status === "Ready") return "secondary" as const;
  return "outline" as const;
}

function orderColumns(): readonly DataTableColumn<QueueOrder>[] {
  return [
    {
      id: "order",
      header: "Order",
      rowHeader: true,
      width: 220,
      cell: (order) => (
        <span className="grid min-w-44 gap-0.5">
          <span className="font-medium">{order.id}</span>
          <span className="break-words text-body-sm text-foreground-secondary">
            {order.customer}
          </span>
        </span>
      ),
    },
    {
      id: "destination",
      header: "Destination",
      cell: (order) => order.destination,
    },
    {
      id: "due",
      header: "Due",
      cell: (order) => (
        <time dateTime={order.dueAt} className="whitespace-nowrap">
          {dateFormatter.format(new Date(`${order.dueAt}T00:00:00Z`))}
        </time>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      align: "end",
      cell: (order) => (
        <bdi className="whitespace-nowrap tabular-nums">
          {currencyFormatter.format(order.amount)}
        </bdi>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      cell: (order) => <Badge variant="outline">{order.priority}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (order) => (
        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
      ),
    },
  ];
}

function OperationsWorkspace({
  constrained = false,
  empty = false,
  loading = false,
}: {
  constrained?: boolean;
  empty?: boolean;
  loading?: boolean;
}) {
  const [orders, setOrders] = React.useState<readonly QueueOrder[]>(
    empty ? [] : initialOrders,
  );
  const [query, setQuery] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [priorities, setPriorities] = React.useState<string[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [announcement, setAnnouncement] = React.useState("");
  const pageSize = 5;
  const filtersActive =
    query.trim().length > 0 || statuses.length > 0 || priorities.length > 0;

  const filteredOrders = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [order.id, order.customer, order.destination].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );
      const matchesStatus =
        statuses.length === 0 || statuses.includes(order.status);
      const matchesPriority =
        priorities.length === 0 || priorities.includes(order.priority);

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [orders, priorities, query, statuses]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const readyCount = orders.filter((order) => order.status === "Ready").length;
  const blockedCount = orders.filter(
    (order) => order.status === "Blocked",
  ).length;

  function resetFilters() {
    setQuery("");
    setStatuses([]);
    setPriorities([]);
    setPage(1);
  }

  function markSelectedReady() {
    if (selectedIds.length === 0) return;

    const selected = new Set(selectedIds);
    const count = selectedIds.length;

    setOrders((current) =>
      current.map((order) =>
        selected.has(order.id) ? { ...order, status: "Ready" } : order,
      ),
    );
    setSelectedIds([]);
    setAnnouncement(
      count === 1 ? "1 order marked ready." : `${count} orders marked ready.`,
    );
  }

  return (
    <main
      className={
        constrained
          ? "mx-auto grid w-80 max-w-full min-w-0 gap-6 bg-background p-4 text-foreground"
          : "mx-auto grid w-full max-w-7xl min-w-0 gap-6 bg-background p-4 text-foreground sm:p-6"
      }
    >
      <PageHeader
        className={constrained ? "min-w-0 pb-0 sm:!flex-col" : "min-w-0 pb-0"}
      >
        <PageHeaderContent className="min-w-0">
          <PageHeaderHeading className="break-words text-balance">
            Order operations
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Review incoming orders, resolve blockers, and prepare work for
            fulfilment.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions
          className={
            constrained
              ? "w-full flex-col items-stretch sm:!w-full"
              : "w-full flex-wrap sm:w-auto sm:justify-end"
          }
        >
          <Button
            type="button"
            className={constrained ? "w-full sm:!w-full" : "w-full sm:w-auto"}
            onClick={() => setAnnouncement("Queue export requested.")}
          >
            <DownloadIcon data-icon="inline-start" aria-hidden="true" />
            Export queue
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <section aria-labelledby="queue-summary-heading" className="grid gap-3">
        <h2 id="queue-summary-heading" className="sr-only">
          Queue summary
        </h2>
        <div
          className={
            constrained
              ? "grid min-w-0 grid-cols-1 gap-4 sm:!grid-cols-1"
              : "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3"
          }
        >
          <MetricCard
            label="Orders in queue"
            value={String(orders.length)}
            status={loading ? "loading" : orders.length ? "default" : "empty"}
            stateLabel="No orders"
            loadingLabel="Loading queue total"
            description="Across every current queue status"
          />
          <MetricCard
            label="Ready for fulfilment"
            value={String(readyCount)}
            status={loading ? "loading" : orders.length ? "default" : "empty"}
            stateLabel="No orders"
            loadingLabel="Loading ready orders"
            description="Prepared for the next fulfilment step"
          />
          <MetricCard
            label="Blocked"
            value={String(blockedCount)}
            status={loading ? "loading" : orders.length ? "default" : "empty"}
            stateLabel="No orders"
            loadingLabel="Loading blocked orders"
            description="Requires review before work can continue"
          />
        </div>
      </section>

      <section aria-labelledby="orders-heading" className="grid min-w-0 gap-4">
        <div className="flex min-w-0 flex-wrap items-end justify-between gap-2">
          <div className="grid min-w-0 gap-1">
            <h2 id="orders-heading" className="text-section font-semibold">
              Orders
            </h2>
            <p
              role="status"
              className="text-body-sm tabular-nums text-foreground-secondary"
            >
              {loading
                ? "Loading orders"
                : `${filteredOrders.length} ${
                    filteredOrders.length === 1 ? "order" : "orders"
                  } shown`}
            </p>
          </div>
        </div>

        <DataTableToolbar>
          <DataTableSearch
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            label="Search orders"
            placeholder="Search orders…"
            disabled={loading}
            className="sm:me-auto"
          />
          <DataTableFilter
            mode="multiple"
            label="Status"
            options={statusOptions}
            value={statuses}
            disabled={loading}
            onValueChange={(value) => {
              setStatuses(value);
              setPage(1);
            }}
          />
          <DataTableFilter
            mode="multiple"
            label="Priority"
            options={priorityOptions}
            value={priorities}
            disabled={loading}
            onValueChange={(value) => {
              setPriorities(value);
              setPage(1);
            }}
          />
          {filtersActive ? (
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Clear filters
            </Button>
          ) : null}
        </DataTableToolbar>

        <DataTableBulkActions
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          alwaysVisible
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={markSelectedReady}
          >
            Mark ready
          </Button>
        </DataTableBulkActions>

        <p
          className={
            constrained
              ? "text-caption text-foreground-secondary"
              : "text-caption text-foreground-secondary md:hidden"
          }
        >
          Scroll the table horizontally to view all columns.
        </p>

        <div className="min-w-0">
          <DataTable
            columns={orderColumns()}
            data={visibleOrders}
            caption="Order operations queue"
            hideCaption
            loading={loading}
            loadingLabel="Loading order operations queue"
            selectedRowIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isRowSelectable={(order) => order.status !== "Blocked"}
            getRowSelectionLabel={(order) => `Select order ${order.id}`}
            selectAllLabel="Select all available orders on this page"
            emptyState={
              <DataTableEmptyState
                title={
                  filtersActive
                    ? "No orders match these filters"
                    : "No orders yet"
                }
                description={
                  filtersActive
                    ? "Clear the search or filters to return to the full queue."
                    : "New orders will appear here when they enter the queue."
                }
              >
                {filtersActive ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </DataTableEmptyState>
            }
          />
        </div>

        <DataTablePagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
          showFirstLast={!constrained}
          disabled={loading || filteredOrders.length === 0}
          renderPageStatus={(activePage, totalPages) =>
            `Page ${activePage} of ${totalPages}`
          }
        />
      </section>
    </main>
  );
}

const meta = {
  title: "Patterns/OperationsWorkspace",
  component: OperationsWorkspace,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          "Composition recipe, not a new Luna export. Search, filters, paging, selection, mutations, permissions, and server requests remain application-owned while Luna exposes controlled presentation primitives.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OperationsWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <OperationsWorkspace />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Search orders" });

    await expect(canvas.getAllByRole("main")).toHaveLength(1);
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Order operations" }),
    ).toBeInTheDocument();

    await userEvent.type(search, "Harbor");
    await waitFor(() =>
      expect(canvas.getByText("1 order shown")).toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole("rowheader", { name: /ORD-1043/ }),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    const rowSelection = canvas.getByRole("checkbox", {
      name: "Select order ORD-1042",
    });
    await userEvent.click(rowSelection);
    await waitFor(() => expect(rowSelection).toBeChecked());
    await expect(
      canvas.getByRole("button", { name: "Mark ready" }),
    ).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Mark ready" }));
    await waitFor(() =>
      expect(canvas.getByText("1 order marked ready.")).toBeInTheDocument(),
    );
    await expect(
      canvas.queryByRole("button", { name: "Mark ready" }),
    ).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () => <OperationsWorkspace loading />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("searchbox", { name: "Search orders" }),
    ).toBeDisabled();
    await expect(canvas.getByRole("table")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(canvas.getByText("Loading orders")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => <OperationsWorkspace empty />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No orders yet")).toBeInTheDocument();
    await expect(
      canvas.getByText(
        "New orders will appear here when they enter the queue.",
      ),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("checkbox", {
        name: "Select all available orders on this page",
      }),
    ).toHaveAttribute("aria-disabled", "true");
  },
};

export const FilteredEmpty: Story = {
  render: () => <OperationsWorkspace />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Search orders" });

    await userEvent.type(search, "Not a real order");
    await waitFor(() =>
      expect(
        canvas.getByText("No orders match these filters"),
      ).toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Clear filters" })[0]!,
    );
    await waitFor(() =>
      expect(canvas.getByText("8 orders shown")).toBeInTheDocument(),
    );
  },
};

export const NarrowViewport: Story = {
  render: () => <OperationsWorkspace constrained />,
  parameters: {
    docs: {
      description: {
        story:
          "A 320 px content boundary verifies wrapping controls and keeps wide table content in its labelled horizontal scroll region.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const main = canvas.getByRole("main");
    const tableContainer = canvasElement.querySelector<HTMLElement>(
      '[data-slot="data-table-container"]',
    );

    await expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
    await expect(tableContainer).not.toBeNull();
    await expect(tableContainer!.scrollWidth).toBeGreaterThanOrEqual(
      tableContainer!.clientWidth,
    );
  },
};
