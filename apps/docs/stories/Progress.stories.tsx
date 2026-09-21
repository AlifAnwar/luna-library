import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Progress } from "@withalif/luna";

const meta: Meta<typeof Progress> = {
  title: "Luna/Progress",
  component: Progress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 45, "aria-label": "Upload progress" },
};
export const Complete: Story = {
  args: { value: 100, "aria-label": "Upload progress" },
};
export const Indeterminate: Story = {
  args: { value: null, "aria-label": "Loading" },
};
