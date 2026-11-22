import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Button,
  DeleteIcon,
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
  EditIcon,
  EyeIcon,
  MoreHorizontalIcon,
  SettingsIcon,
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
        <MoreHorizontalIcon aria-hidden="true" />
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Record actions</DropdownMenuLabel>
          <DropdownMenuItem>
            <EyeIcon aria-hidden="true" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <EditIcon aria-hidden="true" />
            Edit record
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Duplicate (unavailable)</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <DeleteIcon aria-hidden="true" />
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
  tags: ["phase6c-reference"],
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        More options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <EyeIcon aria-hidden="true" />
          View details
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SettingsIcon aria-hidden="true" />
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
