import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarIcon, MetricCard } from "@withalif/luna";

const meta = {
  title: "Luna/MetricCard",
  component: MetricCard,
  args: { label: "Open requests", value: "248" },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(18rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MetricCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MetricCard
      label="Open requests"
      value="248"
      trend={{ direction: "up", value: "14" }}
      description="since yesterday"
    />
  ),
};

export const WithSecondaryValue: Story = {
  render: () => (
    <MetricCard
      label="Completion rate"
      value="94.8%"
      secondaryValue="1,896 of 2,000"
      icon={<CalendarIcon />}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <MetricCard
      label="Completion rate"
      status="loading"
      loadingLabel="Loading completion rate"
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <MetricCard
      label="Completion rate"
      status="empty"
      description="Completed records will be included here."
    />
  ),
};

export const NegativeValue: Story = {
  render: () => (
    <MetricCard
      label="Net change"
      value="−42"
      secondaryValue="units"
      trend={{
        direction: "down",
        value: "7.1%",
        tone: "warning",
        toneLabel: "Needs review",
      }}
    />
  ),
};
