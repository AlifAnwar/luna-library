import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, ChartHeader } from "@withalif/luna";

const meta = {
  title: "Luna/ChartHeader",
  component: ChartHeader,
  args: {
    title: "Processed records",
    description: "Daily completed records for the selected reporting period.",
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <figure className="w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-4">
        <Story />
      </figure>
    ),
  ],
} satisfies Meta<typeof ChartHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <Button size="sm" variant="outline">
        View details
      </Button>
    ),
  },
};

export const LongLabels: Story = {
  args: {
    title:
      "Processed records across the current rolling thirty-day reporting period",
    description:
      "This intentionally expanded description verifies that the caption remains readable when localization produces substantially longer interface text.",
  },
};
