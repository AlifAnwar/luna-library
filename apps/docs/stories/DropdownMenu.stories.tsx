import {
  Delete01Icon,
  Edit01Icon,
  MoreHorizontalIcon,
  Settings01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@withalif/luna";

const meta = {
  title: "Luna/Dropdown Menu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Actions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <HugeiconsIcon
          icon={MoreHorizontalIcon}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Record actions</DropdownMenuLabel>
          <DropdownMenuItem>
            <HugeiconsIcon
              icon={ViewIcon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HugeiconsIcon
              icon={Edit01Icon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Edit record
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Duplicate (unavailable)</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <HugeiconsIcon
            icon={Delete01Icon}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          Delete record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const CheckboxItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>
            Name
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem defaultChecked>
            Status
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Owner</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem disabled>
            Created at (required)
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const RadioItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Row density
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Display density</DropdownMenuLabel>
          <DropdownMenuRadioGroup defaultValue="comfortable">
            <DropdownMenuRadioItem value="compact">
              Compact
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="comfortable">
              Comfortable
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="spacious">
              Spacious
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Submenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        More options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} aria-hidden="true" />
          View details
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <HugeiconsIcon
              icon={Settings01Icon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Preferences
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuItem>Privacy</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
