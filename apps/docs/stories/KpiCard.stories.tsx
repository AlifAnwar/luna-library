import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KpiCard, SettingsIcon } from "@withalif/luna";

const meta = {
  title: "Luna/KpiCard",
  component: KpiCard,
  args: { label: "Monthly revenue", value: "$128,400" },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(22rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KpiCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <KpiCard
      label="Monthly revenue"
      value="$128,400"
      trend={{ direction: "up", value: "12.4%" }}
      description="vs previous month"
      icon={<SettingsIcon />}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <KpiCard
      label="Monthly revenue"
      status="loading"
      loadingLabel="Loading monthly revenue"
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <KpiCard
      label="Monthly revenue"
      status="empty"
      stateLabel="No revenue recorded"
      description="Revenue will appear after the first completed transaction."
    />
  ),
};

export const Unavailable: Story = {
  render: () => (
    <KpiCard
      label="Monthly revenue"
      status="unavailable"
      description="Connect a reporting source to make this metric available."
    />
  ),
};

export const LongLabels: Story = {
  render: () => (
    <div className="w-64">
      <KpiCard
        label="Average resolution time for escalated enterprise support requests"
        value="18 hr 42 min"
        trend={{ direction: "down", value: "2 hr 18 min" }}
        description="compared with the previous 30-day reporting period"
      />
    </div>
  ),
};

export const DirectionAndTone: Story = {
  render: () => (
    <KpiCard
      label="Average response time"
      value="4.2 hours"
      trend={{
        direction: "down",
        value: "18%",
        tone: "success",
        toneLabel: "Favorable",
      }}
      description="Lower is within the service target."
    />
  ),
};

export const HighValue: Story = {
  render: () => (
    <KpiCard
      label="Processed volume"
      value="9,876,543,210"
      secondaryValue="records"
      trend={{ direction: "neutral", value: "0.0%" }}
      description="vs previous period"
    />
  ),
};
