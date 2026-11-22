import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Badge,
  Button,
  DataTable,
  DataTableEmptyState,
  FileIcon,
  type DataTableColumn,
} from "@withalif/luna";

// DataTable is presentation only. Every story below hands it a plain array and
// a set of column definitions; there is no fetching, filtering, sorting or
// paging inside Luna. Those arrive in Phase 3B onwards and stay controlled by
// the consuming application.

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
  seats: number;
};

const users: User[] = [
  {
    id: "usr_01",
    name: "Jordan Lee",
    email: "jordan@example.com",
    role: "Owner",
    status: "active",
    seats: 12,
  },
  {
    id: "usr_02",
    name: "Priya Raman",
    email: "priya@example.com",
    role: "Admin",
    status: "active",
    seats: 8,
  },
  {
    id: "usr_03",
    name: "Tomas Novak",
    email: "tomas@example.com",
    role: "Member",
    status: "invited",
    seats: 3,
  },
  {
    id: "usr_04",
    name: "Amara Okafor",
    email: "amara@example.com",
    role: "Member",
    status: "suspended",
    seats: 1,
  },
];

// Status reads from the badge text, not from its color alone.
const statusVariants = {
  active: "secondary",
  invited: "outline",
  suspended: "destructive",
} as const;

const columns: DataTableColumn<User>[] = [
  {
    id: "name",
    header: "Name",
    // One column per row should identify the record. `rowHeader` renders it as
    // `<th scope="row">` so screen readers announce it alongside every cell.
    rowHeader: true,
    cell: (user) => user.name,
  },
  { id: "email", header: "Email", cell: (user) => user.email },
  { id: "role", header: "Role", cell: (user) => user.role },
  {
    id: "status",
    header: "Status",
    cell: (user) => (
      <Badge variant={statusVariants[user.status]}>{user.status}</Badge>
    ),
  },
  {
    id: "seats",
    header: "Seats",
    align: "end",
    cell: (user) => user.seats,
  },
];

const meta: Meta<typeof DataTable<User>> = {
  title: "Luna/DataTable",
  component: DataTable,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns,
    data: users,
    caption: "Workspace members",
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Workspace members" });

    // Header row plus one row per record.
    expect(within(table).getAllByRole("row")).toHaveLength(users.length + 1);
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Name", "Email", "Role", "Status", "Seats"]);
    expect(
      within(table).getByRole("rowheader", { name: "Jordan Lee" }),
    ).toBeInTheDocument();
    expect(within(table).getByText("amara@example.com")).toBeInTheDocument();
  },
};

/**
 * `caption` names the table for assistive technology. When the surrounding
 * page already carries a visible heading, `hideCaption` keeps the name without
 * repeating it on screen.
 */
export const HiddenCaption: Story = {
  args: {
    columns,
    data: users.slice(0, 2),
    caption: "Workspace members",
    hideCaption: true,
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    // Still named, still reachable — just not painted.
    expect(
      canvas.getByRole("table", { name: "Workspace members" }),
    ).toBeInTheDocument();
  },
};

export const SmallDataset: Story = {
  args: {
    columns,
    data: users.slice(0, 1),
    caption: "Workspace members",
  },
};

export const LargeDataset: Story = {
  args: {
    columns,
    data: Array.from({ length: 50 }, (_, index) => ({
      id: `usr_${index}`,
      name: `Member ${index + 1}`,
      email: `member${index + 1}@example.com`,
      role: index % 5 === 0 ? "Admin" : "Member",
      status: (["active", "invited", "suspended"] as const)[index % 3]!,
      seats: (index % 9) + 1,
    })),
    caption: "Workspace members",
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Workspace members" });

    expect(within(table).getAllByRole("row")).toHaveLength(51);
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    caption: "Workspace members",
    loading: true,
    loadingRowCount: 4,
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Workspace members" });

    expect(table).toHaveAttribute("aria-busy", "true");
    // Placeholder rows keep the table's height stable while data arrives.
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(canvas.getByRole("status")).toHaveTextContent("Loading data");
    // The empty state must not appear while data is still in flight.
    expect(canvas.queryByText("No data")).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    caption: "Workspace members",
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    expect(canvas.getByText("No data")).toBeInTheDocument();
    // Column headers survive so the reader still knows what the table lists.
    expect(canvas.getAllByRole("columnheader")).toHaveLength(columns.length);
  },
};

/**
 * Luna ships a neutral default. Applications that know *why* the table is
 * empty pass their own copy and recovery action.
 */
export const EmptyWithAction: Story = {
  args: {
    columns,
    data: [],
    caption: "Workspace members",
    emptyState: (
      <DataTableEmptyState
        icon={<FileIcon />}
        title="No members yet"
        description="Invite a teammate to get started."
      >
        <Button>Invite member</Button>
      </DataTableEmptyState>
    ),
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    expect(canvas.getByText("No members yet")).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: "Invite member" }),
    ).toBeInTheDocument();
  },
};

/**
 * Long values wrap instead of forcing the whole page sideways. Only the table
 * itself scrolls horizontally.
 */
export const LongContent: Story = {
  args: {
    columns: [
      ...columns,
      {
        id: "note",
        header: "Note",
        cell: (user) =>
          `${user.name} requested elevated access to the reporting workspace and the billing console, pending review by the account owner.`,
      },
    ],
    data: users,
    caption: "Workspace members",
  },
};

/**
 * A table too wide for its container becomes its own scrollable region, and
 * that region joins the tab order so it can be scrolled without a mouse. The
 * tab stop only exists while the table actually overflows.
 */
export const HorizontalOverflow: Story = {
  args: {
    columns: [
      ...columns,
      { id: "team", header: "Team", cell: () => "Platform Engineering" },
      { id: "location", header: "Location", cell: () => "Jakarta, Indonesia" },
      { id: "manager", header: "Manager", cell: () => "Priya Raman" },
      { id: "joined", header: "Joined", cell: () => "12 March 2024" },
      { id: "lastSeen", header: "Last seen", cell: () => "2 hours ago" },
    ],
    data: users,
    caption: "Workspace members",
    containerClassName: "max-w-2xl",
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    const region = await waitFor(() =>
      canvas.getByRole("region", { name: "Workspace members" }),
    );

    expect(region).toHaveAttribute("tabindex", "0");

    await userEvent.tab();
    expect(region).toHaveFocus();
  },
};

/**
 * Nothing overflows here, so no region and no tab stop are created — an empty
 * tab stop would be a dead end for keyboard users.
 */
export const NoOverflowHasNoTabStop: Story = {
  args: {
    columns: columns.slice(0, 2),
    data: users.slice(0, 2),
    caption: "Workspace members",
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Workspace members" });
    const container = table.parentElement!;

    await waitFor(() => {
      expect(container).not.toHaveAttribute("tabindex");
    });
    expect(
      canvas.queryByRole("region", { name: "Workspace members" }),
    ).not.toBeInTheDocument();
  },
};

/**
 * `getRowId` ties a rendered row to a record rather than to its position, so
 * reordering the data moves the row instead of rewriting every cell in place.
 */
export const RowIdentity: Story = {
  args: {
    columns,
    data: users,
    caption: "Workspace members",
    getRowId: (user) => user.id,
    rowClassName: (user) =>
      user.status === "suspended" ? "bg-danger-subtle" : undefined,
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Workspace members" });
    const rows = within(table).getAllByRole("row").slice(1);

    expect(rows).toHaveLength(users.length);
    expect(rows[0]).toHaveTextContent("Jordan Lee");
    expect(rows[3]).toHaveClass("bg-danger-subtle");
  },
};

/**
 * Narrow viewport check: the page itself must not scroll sideways, the table
 * must.
 */
export const NarrowViewport: Story = {
  args: {
    columns,
    data: users,
    caption: "Workspace members",
  },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="w-full max-w-[360px] p-4">
      <DataTable<User> {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Workspace members" });
    const container = table.parentElement!;

    await waitFor(() => {
      expect(container.scrollWidth).toBeGreaterThan(container.clientWidth);
    });
    // The overflow is contained: the wrapper never grows past its own box.
    expect(container.clientWidth).toBeLessThanOrEqual(360);
  },
};
