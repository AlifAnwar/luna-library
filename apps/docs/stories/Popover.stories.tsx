import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@withalif/luna";

const meta = {
  title: "Luna/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["phase6c-reference"],
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Open popover
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Notifications</PopoverTitle>
        <PopoverDescription className="mt-1">
          You are all caught up.
        </PopoverDescription>
        <PopoverClose
          render={<Button size="sm" variant="outline" className="mt-3" />}
        >
          Close
        </PopoverClose>
      </PopoverContent>
    </Popover>
  ),
};
