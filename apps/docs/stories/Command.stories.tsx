import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  Button,
  Command,
  CommandDialog,
  EditIcon,
  SearchIcon,
  SettingsIcon,
  type CommandItem,
} from "@withalif/luna";

const commands: CommandItem[] = [
  {
    value: "search-records",
    label: "Search records",
    description: "Find records across the workspace",
    group: "Navigation",
    shortcut: "⌘K",
    icon: <SearchIcon aria-hidden="true" />,
  },
  {
    value: "open-settings",
    label: "Open settings",
    description: "Manage workspace preferences",
    group: "Navigation",
    icon: <SettingsIcon aria-hidden="true" />,
  },
  {
    value: "edit-profile",
    label: "Edit profile",
    description: "Update your personal information",
    keywords: ["account", "user"],
    group: "Actions",
    shortcut: "E",
    icon: <EditIcon aria-hidden="true" />,
  },
  {
    value: "archived-action",
    label: "Archived action",
    group: "Actions",
    disabled: true,
  },
];

const meta: Meta<typeof Command> = {
  title: "Luna/Command",
  component: Command,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Search workspace",
    items: commands,
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-md max-w-[calc(100vw-2rem)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("combobox", {
      name: "Search workspace",
    });

    await userEvent.type(search, "profile");
    await expect(
      canvas.getByRole("option", { name: /Edit profile/ }),
    ).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: "edit-profile" }),
    );
  },
};

export const Empty: Story = {
  args: { defaultQuery: "No matching command" },
};

function CommandDialogExample() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command menu</Button>
      <CommandDialog
        aria-label="Search quick actions"
        title="Quick actions"
        description="Search and run a workspace action."
        items={commands}
        open={open}
        onOpenChange={setOpen}
        onSelect={() => undefined}
      />
    </>
  );
}

export const InDialog: Story = {
  render: () => <CommandDialogExample />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      page.getByRole("button", { name: "Open command menu" }),
    );
    const dialog = page.getByRole("dialog", { name: "Quick actions" });
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.type(
      within(dialog).getByRole("combobox", { name: "Search quick actions" }),
      "settings",
    );
    await userEvent.click(
      within(dialog).getByRole("option", { name: /Open settings/ }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
