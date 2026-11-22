import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Button,
  DashboardGrid,
  DashboardGridItem,
  DashboardWidget,
  DonutChart,
  KpiCard,
  LineChart,
  type CartesianChartDatum,
  type CartesianChartSeries,
  type DistributionChartDatum,
} from "@withalif/luna";

const activity = [
  { category: "Apr", completed: 1280 },
  { category: "May", completed: 1460 },
  { category: "Jun", completed: 1380 },
  { category: "Jul", completed: 1710 },
  { category: "Aug", completed: 1840 },
  { category: "Sep", completed: 1920 },
] satisfies readonly CartesianChartDatum[];

const series = [
  { dataKey: "completed", label: "Completed" },
] satisfies readonly CartesianChartSeries[];

const requestStatus = [
  { category: "Resolved", value: 4820, percentage: 58.1 },
  { category: "In progress", value: 1935, percentage: 23.3 },
  { category: "Awaiting reply", value: 1012, percentage: 12.2 },
  { category: "Escalated", value: 531, percentage: 6.4 },
] satisfies readonly DistributionChartDatum[];

const meta = {
  title: "Luna/DashboardGrid",
  component: DashboardGrid,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <h1 className="mb-6 text-page-title font-semibold">
          Reporting overview
        </h1>
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof DashboardGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DashboardGrid>
      <DashboardGridItem>
        <KpiCard label="Completed records" value="8,298" />
      </DashboardGridItem>
      <DashboardGridItem>
        <KpiCard label="Open requests" value="248" />
      </DashboardGridItem>
      <DashboardGridItem span={2}>
        <DashboardWidget title="Reporting note">
          <p>Activity is updated at the end of each reporting day.</p>
        </DashboardWidget>
      </DashboardGridItem>
    </DashboardGrid>
  ),
};

function KpiCollection() {
  return (
    <DashboardGrid>
      <DashboardGridItem>
        <KpiCard label="Completed records" value="8,298" />
      </DashboardGridItem>
      <DashboardGridItem>
        <KpiCard label="Open requests" value="248" />
      </DashboardGridItem>
      <DashboardGridItem>
        <KpiCard label="Completion rate" value="94.8%" />
      </DashboardGridItem>
      <DashboardGridItem>
        <KpiCard label="Average response" value="4.2 hr" />
      </DashboardGridItem>
    </DashboardGrid>
  );
}

export const MultipleKpiCards: Story = {
  render: () => <KpiCollection />,
};

export const KpiAndChart: Story = {
  render: () => (
    <DashboardGrid>
      <DashboardGridItem>
        <KpiCard label="Completed records" value="8,298" />
      </DashboardGridItem>
      <DashboardGridItem>
        <KpiCard label="Open requests" value="248" />
      </DashboardGridItem>
      <DashboardGridItem span={2}>
        <DashboardWidget
          title="Monthly activity"
          description="Completed records by month."
        >
          <LineChart
            title="Completed records by month"
            description="Completed records in the current reporting period."
            showHeader={false}
            data={activity}
            series={series}
          />
        </DashboardWidget>
      </DashboardGridItem>
    </DashboardGrid>
  ),
};

export const MixedWidgetSizes: Story = {
  render: () => (
    <DashboardGrid>
      <DashboardGridItem>
        <KpiCard label="Completion rate" value="94.8%" />
      </DashboardGridItem>
      <DashboardGridItem span={3}>
        <DashboardWidget
          title="Monthly activity"
          description="Completed records by month."
          action={
            <Button size="sm" variant="outline">
              View details
            </Button>
          }
        >
          <LineChart
            title="Completed records by month"
            description="Completed records in the current reporting period."
            showHeader={false}
            data={activity}
            series={series}
          />
        </DashboardWidget>
      </DashboardGridItem>
      <DashboardGridItem span={2}>
        <DashboardWidget
          title="Requests by status"
          description="Current reporting period."
        >
          <DonutChart
            title="Requests by status"
            description="Requests in the current reporting period."
            showHeader={false}
            data={requestStatus}
            centerValue="8,298"
            centerLabel="Requests"
          />
        </DashboardWidget>
      </DashboardGridItem>
      <DashboardGridItem span={2}>
        <DashboardWidget
          title="Data availability"
          status="empty"
          emptyTitle="No archive data"
          emptyDescription="Archive records will appear after the next update."
        >
          <p>Archive records are available.</p>
        </DashboardWidget>
      </DashboardGridItem>
    </DashboardGrid>
  ),
};

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="w-full" data-testid="responsive-dashboard">
      <KpiCollection />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId("responsive-dashboard");
    const layout = wrapper.querySelector('[data-slot="dashboard-grid-layout"]');
    await expect(layout).not.toBeNull();

    for (const [width, columns] of [
      [1440, 4],
      [1024, 4],
      [768, 2],
      [375, 1],
      [320, 1],
    ] as const) {
      wrapper.style.width = `${width}px`;
      await waitFor(() =>
        expect(
          getComputedStyle(layout!).gridTemplateColumns.split(" "),
        ).toHaveLength(columns),
      );
      await expect(wrapper.scrollWidth).toBeLessThanOrEqual(
        wrapper.clientWidth,
      );
    }

    wrapper.style.width = "";
  },
};

export const NarrowViewport: Story = {
  render: () => (
    <div className="w-72 max-w-full" data-testid="narrow-dashboard">
      <DashboardGrid>
        <DashboardGridItem>
          <KpiCard label="Completed records" value="8,298" />
        </DashboardGridItem>
        <DashboardGridItem span={2}>
          <DashboardWidget
            title="Monthly activity"
            description="Completed records by month."
          >
            <LineChart
              title="Completed records by month"
              description="Completed records in the current reporting period."
              showHeader={false}
              data={activity}
              series={series}
              size="sm"
            />
          </DashboardWidget>
        </DashboardGridItem>
      </DashboardGrid>
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId("narrow-dashboard");
    const layout = wrapper.querySelector('[data-slot="dashboard-grid-layout"]');
    await expect(layout).not.toBeNull();
    await expect(
      getComputedStyle(layout!).gridTemplateColumns.split(" "),
    ).toHaveLength(1);
    await expect(wrapper.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
  },
};
