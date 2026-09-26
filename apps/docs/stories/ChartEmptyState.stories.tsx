import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, ChartEmptyState, FileIcon } from "@withalif/luna";

const meta = {
  title: "Luna/ChartEmptyState",
  component: ChartEmptyState,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="grid min-h-64 w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-border bg-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartEmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    title: "No records match these filters",
    description: "Adjust or clear the active filters to include more records.",
    icon: <FileIcon />,
    action: (
      <Button size="sm" variant="outline">
        Clear filters
      </Button>
    ),
  },
};

export const LongCopy: Story = {
  args: {
    title: "No records are available for the selected reporting period",
    description:
      "Records will appear here after the source completes its next scheduled synchronization and the selected reporting period contains eligible entries.",
  },
};
