import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Badge,
  Button,
  DataTable,
  DataTableEmptyState,
  DataTableFilter,
  DataTableSearch,
  DataTableToolbar,
  type DataTableColumn,
  type DataTableFilterOption,
} from "@withalif/luna";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Staff";
  status: "active" | "inactive";
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
    status: "inactive",
  },
  {
    id: "member-4",
    name: "Amara Okafor",
    email: "amara@example.com",
    role: "Staff",
    status: "active",
  },
];

const columns: DataTableColumn<Member>[] = [
  {
    id: "name",
    header: "Name",
    rowHeader: true,
    cell: (member) => member.name,
  },
  { id: "email", header: "Email", cell: (member) => member.email },
  { id: "role", header: "Role", cell: (member) => member.role },
  {
    id: "status",
    header: "Status",
    cell: (member) => (
      <Badge variant={member.status === "active" ? "secondary" : "outline"}>
        {member.status}
      </Badge>
    ),
  },
];

const statusOptions: DataTableFilterOption[] = [
  { label: "Active", value: "active", count: 3 },
  { label: "Inactive", value: "inactive", count: 1 },
];

const roleOptions: DataTableFilterOption[] = [
  { label: "Admin", value: "Admin", count: 1 },
  { label: "Manager", value: "Manager", count: 1 },
  { label: "Staff", value: "Staff", count: 2 },
  {
    label: "Contractor with limited workspace access",
    value: "Contractor",
    count: 0,
    disabled: true,
  },
];

const meta = {
  title: "Luna/DataTable Toolbar",
  component: DataTableToolbar,
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataTableToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

function SearchExample({
  initialValue = "",
  disabled = false,
}: {
  initialValue?: string;
  disabled?: boolean;
}) {
  const [search, setSearch] = React.useState(initialValue);

  return (
    <div className="grid w-full max-w-xl gap-3">
      <DataTableSearch
        value={search}
        onValueChange={setSearch}
        label="Search members"
        placeholder="Search members..."
        disabled={disabled}
      />
      <p role="status" className="text-body-sm text-muted-foreground">
        Current search: {search || "empty"}
      </p>
    </div>
  );
}

export const EmptySearch: Story = {
  render: () => <SearchExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox", { name: "Search members" });

    expect(search).toHaveValue("");
    await userEvent.type(search, "Jordan");
    expect(search).toHaveValue("Jordan");
    expect(canvas.getByRole("status")).toHaveTextContent(
      "Current search: Jordan",
    );
  },
};

export const ActiveSearch: Story = {
  render: () => <SearchExample initialValue="Priya" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("searchbox", { name: "Search members" }),
    ).toHaveValue("Priya");
    expect(canvas.getByRole("button", { name: "Clear search" })).toBeEnabled();
  },
};

export const ClearSearch: Story = {
  render: () => <SearchExample initialValue="Amara" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    expect(
      canvas.getByRole("searchbox", { name: "Search members" }),
    ).toHaveValue("");
    expect(
      canvas.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  },
};

export const DisabledSearch: Story = {
  render: () => <SearchExample initialValue="Locked query" disabled />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("searchbox", { name: "Search members" }),
    ).toBeDisabled();
    expect(canvas.getByRole("button", { name: "Clear search" })).toBeDisabled();
  },
};

function SingleFilterExample({ initialValue }: { initialValue?: string }) {
  const [status, setStatus] = React.useState<string | undefined>(initialValue);

  return (
    <DataTableToolbar>
      <DataTableFilter
        label="Status"
        options={statusOptions}
        value={status}
        onValueChange={setStatus}
      />
    </DataTableToolbar>
  );
}

export const SingleFilter: Story = {
  render: () => <SingleFilterExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Status" });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const activeOption = await page.findByRole("radio", { name: /Active/ });
    await waitFor(() => expect(activeOption).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Status: Inactive" }),
      ).toHaveFocus(),
    );
  },
};

export const ActiveSingleFilter: Story = {
  render: () => <SingleFilterExample initialValue="active" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Status: Active" }),
    );
    expect(await page.findByRole("radio", { name: /Active/ })).toBeChecked();
  },
};

function MultiFilterExample({
  initialValue = [],
}: {
  initialValue?: string[];
}) {
  const [roles, setRoles] = React.useState(initialValue);

  return (
    <DataTableToolbar>
      <DataTableFilter
        mode="multiple"
        label="Role"
        options={roleOptions}
        value={roles}
        onValueChange={setRoles}
      />
    </DataTableToolbar>
  );
}

export const MultiFilter: Story = {
  render: () => <MultiFilterExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Role" }));
    const staff = await page.findByRole("checkbox", { name: /Staff/ });
    await userEvent.click(staff);

    expect(staff).toBeChecked();
    expect(
      canvas.getByRole("button", { name: "Role: Staff" }),
    ).toBeInTheDocument();
    await userEvent.click(page.getByRole("button", { name: "Clear filter" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Role" })).toHaveFocus(),
    );
    expect(
      page.queryByRole("checkbox", { name: /Staff/ }),
    ).not.toBeInTheDocument();
  },
};

export const MultipleActiveValues: Story = {
  render: () => <MultiFilterExample initialValue={["Admin", "Staff"]} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Role 2" }));
    expect(await page.findByRole("checkbox", { name: /Admin/ })).toBeChecked();
    expect(page.getByRole("checkbox", { name: /Staff/ })).toBeChecked();
  },
};

export const DisabledOption: Story = {
  render: () => <MultiFilterExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Role" }));
    expect(
      await page.findByRole("checkbox", { name: /Contractor/ }),
    ).toHaveAttribute("aria-disabled", "true");
  },
};

export const ClearFilter: Story = {
  render: () => <SingleFilterExample initialValue="inactive" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole("button", { name: "Status: Inactive" }),
    );
    await userEvent.click(
      await page.findByRole("button", { name: "Clear filter" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Status" })).toHaveFocus(),
    );
  },
};

type IntegratedExampleProps = {
  initialSearch?: string;
  initialStatus?: string;
  initialRoles?: string[];
  showStatus?: boolean;
  showRoles?: boolean;
};

function IntegratedExample({
  initialSearch = "",
  initialStatus,
  initialRoles = [],
  showStatus = true,
  showRoles = true,
}: IntegratedExampleProps) {
  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState<string | undefined>(initialStatus);
  const [roles, setRoles] = React.useState(initialRoles);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !normalizedSearch ||
      [member.name, member.email, member.role, member.status]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedSearch);
    const matchesStatus = !status || member.status === status;
    const matchesRole = roles.length === 0 || roles.includes(member.role);

    return matchesSearch && matchesStatus && matchesRole;
  });
  const hasActiveFilters = Boolean(search || status || roles.length);

  function clearAll() {
    setSearch("");
    setStatus(undefined);
    setRoles([]);
  }

  return (
    <div className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
      <DataTableToolbar>
        <DataTableSearch
          value={search}
          onValueChange={setSearch}
          label="Search members"
          placeholder="Search members..."
        />
        {showStatus ? (
          <DataTableFilter
            label="Status"
            options={statusOptions}
            value={status}
            onValueChange={setStatus}
          />
        ) : null}
        {showRoles ? (
          <DataTableFilter
            mode="multiple"
            label="Role"
            options={roleOptions}
            value={roles}
            onValueChange={setRoles}
          />
        ) : null}
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" onClick={clearAll}>
            Clear all
          </Button>
        ) : null}
      </DataTableToolbar>

      <p role="status" className="sr-only">
        {filteredMembers.length} members shown
      </p>

      <DataTable
        columns={columns}
        data={filteredMembers}
        caption="Workspace members"
        hideCaption
        emptyState={
          <DataTableEmptyState
            title="No matching members"
            description="Try a different search or clear the active filters."
          >
            {hasActiveFilters ? (
              <Button type="button" variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            ) : null}
          </DataTableEmptyState>
        }
      />
    </div>
  );
}

export const SearchAndTable: Story = {
  render: () => <IntegratedExample showStatus={false} showRoles={false} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search members" }),
      "Priya",
    );
    const table = canvas.getByRole("table", { name: "Workspace members" });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("Priya Raman")).toBeInTheDocument();
  },
};

export const FilterAndTable: Story = {
  render: () => <IntegratedExample showRoles={false} />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(await page.findByRole("radio", { name: /Inactive/ }));
    await waitFor(() => {
      expect(
        page.queryByRole("radio", { name: /Inactive/ }),
      ).not.toBeInTheDocument();
    });

    const table = canvas.getByRole("table", { name: "Workspace members" });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("Tomas Novak")).toBeInTheDocument();
  },
};

export const SearchAndMultipleFilters: Story = {
  render: () => <IntegratedExample />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Search members" }),
      "a",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(await page.findByRole("radio", { name: /Active/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Role" }));
    await userEvent.click(await page.findByRole("checkbox", { name: /Staff/ }));

    const table = canvas.getByRole("table", { name: "Workspace members" });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("Amara Okafor")).toBeInTheDocument();
  },
};

export const ClearAllFilters: Story = {
  render: () => (
    <IntegratedExample
      initialSearch="a"
      initialStatus="active"
      initialRoles={["Staff"]}
    />
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));

    expect(
      canvas.getByRole("searchbox", { name: "Search members" }),
    ).toHaveValue("");
    expect(canvas.getByRole("button", { name: "Status" })).toBeInTheDocument();
    expect(canvas.getByRole("button", { name: "Role" })).toBeInTheDocument();
    const table = canvas.getByRole("table", { name: "Workspace members" });
    expect(within(table).getAllByRole("row")).toHaveLength(members.length + 1);
  },
};

export const NoMatchingResults: Story = {
  render: () => <IntegratedExample initialSearch="No such member" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    expect(canvas.getByText("No matching members")).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
  },
};

export const NarrowViewport: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="w-[320px] max-w-full p-4">
      <IntegratedExample
        initialSearch="Long search value"
        initialStatus="active"
        initialRoles={["Admin", "Staff"]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole("searchbox", {
      name: "Search members",
    }).parentElement?.parentElement;

    expect(toolbar).toHaveAttribute("data-slot", "data-table-toolbar");
    expect(toolbar!.scrollWidth).toBeLessThanOrEqual(toolbar!.clientWidth);
    expect(canvas.getByRole("button", { name: "Clear all" })).toBeVisible();
  },
};
