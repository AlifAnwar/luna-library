import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import {
  BarChart,
  Button,
  DashboardGrid,
  DashboardGridItem,
  DashboardWidget,
  DateRangePicker,
  DonutChart,
  DownloadIcon,
  KpiCard,
  LineChart,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  type CartesianChartDatum,
  type CartesianChartSeries,
  type DateRange,
  type DistributionChartDatum,
} from "@withalif/luna";

type AnalyticsStatus = "default" | "loading" | "empty";

const activityData = [
  { category: "May", completed: 1840, target: 1750 },
  { category: "Jun", completed: 1980, target: 1900 },
  { category: "Jul", completed: 1920, target: 2050 },
  { category: "Aug", completed: 2240, target: 2150 },
  { category: "Sep", completed: 2380, target: 2250 },
  { category: "Oct", completed: 2520, target: 2400 },
] satisfies readonly CartesianChartDatum[];

const activitySeries = [
  { dataKey: "completed", label: "Completed orders" },
  {
    dataKey: "target",
    label: "Monthly target",
    marker: "dash",
  },
] satisfies readonly CartesianChartSeries[];

const channelData = [
  { category: "Portal", value: 4210, percentage: 48.4 },
  { category: "API", value: 2670, percentage: 30.7 },
  { category: "Partner", value: 1180, percentage: 13.6 },
  { category: "Manual", value: 640, percentage: 7.3 },
] satisfies readonly DistributionChartDatum[];

const serviceLevelData = [
  { category: "Same day", orders: 1960 },
  { category: "Next day", orders: 3430 },
  { category: "Two days", orders: 2210 },
  { category: "Three or more days", orders: 1100 },
] satisfies readonly CartesianChartDatum[];

const serviceLevelSeries = [
  { dataKey: "orders", label: "Orders" },
] satisfies readonly CartesianChartSeries[];

const numberFormatter = new Intl.NumberFormat("en-US");

function AnalyticsDashboard({
  constrained = false,
  status = "default",
}: {
  constrained?: boolean;
  status?: AnalyticsStatus;
}) {
  const [period, setPeriod] = React.useState<DateRange | undefined>({
    from: new Date(2026, 4, 1),
    to: new Date(2026, 9, 24),
  });
  const [announcement, setAnnouncement] = React.useState("");
  const loading = status === "loading";
  const empty = status === "empty";
  const metricStatus = status;

  return (
    <main
      className={
        constrained
          ? "mx-auto grid w-80 max-w-full min-w-0 gap-6 bg-background p-4 text-foreground"
          : "mx-auto grid w-full max-w-7xl min-w-0 gap-6 bg-background p-4 text-foreground sm:p-6"
      }
    >
      <PageHeader
        className={constrained ? "min-w-0 pb-0 sm:!flex-col" : "min-w-0 pb-0"}
      >
        <PageHeaderContent className="min-w-0">
          <PageHeaderHeading className="break-words text-balance">
            Performance overview
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Track order volume, service levels, and intake channels for the
            selected reporting period.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions
          className={
            constrained
              ? "w-full flex-col items-stretch sm:!w-full"
              : "w-full flex-wrap sm:w-auto sm:justify-end"
          }
        >
          <DateRangePicker
            aria-label="Reporting period"
            value={period}
            onValueChange={setPeriod}
            className={constrained ? "w-full sm:!w-full" : "w-full sm:w-auto"}
            calendarProps={{ defaultMonth: new Date(2026, 9, 1) }}
          />
          <Button
            type="button"
            className={constrained ? "w-full sm:!w-full" : "w-full sm:w-auto"}
            onClick={() => setAnnouncement("Report export requested.")}
          >
            <DownloadIcon data-icon="inline-start" aria-hidden="true" />
            Export report
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <section aria-labelledby="summary-heading" className="grid min-w-0 gap-3">
        <h2 id="summary-heading" className="sr-only">
          Performance summary
        </h2>
        <DashboardGrid>
          <DashboardGridItem>
            <KpiCard
              label="Completed orders"
              value="12,880"
              status={metricStatus}
              loadingLabel="Loading completed orders"
              stateLabel="No orders"
              trend={{
                direction: "up",
                value: "8.2%",
                tone: "success",
                toneLabel: "Favorable",
              }}
              description="vs. previous period"
            />
          </DashboardGridItem>
          <DashboardGridItem>
            <KpiCard
              label="On-time completion"
              value="94.6%"
              status={metricStatus}
              loadingLabel="Loading on-time completion"
              stateLabel="No service data"
              trend={{
                direction: "up",
                value: "1.4 pp",
                tone: "success",
                toneLabel: "Favorable",
              }}
              description="vs. previous period"
            />
          </DashboardGridItem>
          <DashboardGridItem>
            <KpiCard
              label="Average cycle time"
              value="18.4 h"
              status={metricStatus}
              loadingLabel="Loading average cycle time"
              stateLabel="No cycle data"
              trend={{
                direction: "down",
                value: "2.1 h",
                tone: "success",
                toneLabel: "Favorable",
              }}
              description="vs. previous period"
            />
          </DashboardGridItem>
          <DashboardGridItem>
            <KpiCard
              label="Open exceptions"
              value="37"
              status={metricStatus}
              loadingLabel="Loading open exceptions"
              stateLabel="No exception data"
              trend={{
                direction: "down",
                value: "12",
                tone: "success",
                toneLabel: "Favorable",
              }}
              description="vs. previous period"
            />
          </DashboardGridItem>
        </DashboardGrid>
      </section>

      <section
        aria-labelledby="analysis-heading"
        className="grid min-w-0 gap-3"
      >
        <h2 id="analysis-heading" className="sr-only">
          Detailed analysis
        </h2>
        <DashboardGrid>
          <DashboardGridItem span={3}>
            <DashboardWidget
              title="Completed orders"
              description="Monthly volume compared with the operating target."
            >
              <LineChart
                title="Completed orders"
                description="Monthly volume compared with the operating target."
                data={empty ? [] : activityData}
                series={activitySeries}
                loading={loading}
                loadingLabel="Loading completed-order trend"
                emptyTitle="No completed orders"
                emptyDescription="Choose a reporting period with completed orders."
                showHeader={false}
                formatValue={(value) =>
                  `${numberFormatter.format(value)} orders`
                }
                formatYAxis={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                  }).format(value)
                }
              />
            </DashboardWidget>
          </DashboardGridItem>

          <DashboardGridItem>
            <DashboardWidget
              title="Orders by channel"
              description="Share of orders received through each intake channel."
            >
              <DonutChart
                title="Orders by channel"
                description="Share of orders received through each intake channel."
                data={empty ? [] : channelData}
                centerValue={empty ? undefined : "8,700"}
                centerLabel={empty ? undefined : "Total orders"}
                loading={loading}
                loadingLabel="Loading order channels"
                emptyTitle="No channel data"
                emptyDescription="Channel data will appear after orders are received."
                formatValue={(value) => numberFormatter.format(value)}
                legendPosition="bottom"
                showHeader={false}
                size="sm"
                variant="modern"
              />
            </DashboardWidget>
          </DashboardGridItem>

          <DashboardGridItem span={4}>
            <DashboardWidget
              title="Orders by completion window"
              description="Completed orders grouped by elapsed time from intake to completion."
            >
              <BarChart
                title="Orders by completion window"
                description="Completed orders grouped by elapsed time from intake to completion."
                data={empty ? [] : serviceLevelData}
                series={serviceLevelSeries}
                loading={loading}
                loadingLabel="Loading completion windows"
                emptyTitle="No completion-window data"
                emptyDescription="Completion windows will appear after orders finish processing."
                formatValue={(value) =>
                  `${numberFormatter.format(value)} orders`
                }
                showHeader={false}
                showLegend={false}
                variant="modern"
              />
            </DashboardWidget>
          </DashboardGridItem>
        </DashboardGrid>
      </section>
    </main>
  );
}

const meta = {
  title: "Patterns/AnalyticsDashboard",
  component: AnalyticsDashboard,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          "Composition recipe, not a new Luna export. The application owns reporting periods, queries, formatting, and export behavior; Luna components supply the responsive hierarchy and accessible data views.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AnalyticsDashboard />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("main")).toHaveLength(1);
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Performance overview" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Reporting period" }),
    ).toBeEnabled();
    await expect(
      canvasElement.querySelectorAll('[data-slot="dashboard-widget"]'),
    ).toHaveLength(3);
    await expect(canvas.getAllByRole("figure")).toHaveLength(3);
  },
};

export const Loading: Story = {
  render: () => <AnalyticsDashboard status="loading" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("Loading completed orders", { selector: ".sr-only" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("Loading completed-order trend", {
        selector: ".sr-only",
      }),
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelectorAll('[aria-busy="true"]'),
    ).not.toHaveLength(0);
  },
};

export const Empty: Story = {
  render: () => <AnalyticsDashboard status="empty" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No completed orders")).toBeInTheDocument();
    await expect(canvas.getByText("No channel data")).toBeInTheDocument();
    await expect(
      canvas.getByText("No completion-window data"),
    ).toBeInTheDocument();
  },
};

export const NarrowViewport: Story = {
  render: () => <AnalyticsDashboard constrained />,
  parameters: {
    docs: {
      description: {
        story:
          "A 320 px content boundary verifies that controls wrap, widgets stack, and charts stay inside the page rather than creating page-level horizontal scrolling.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const main = within(canvasElement).getByRole("main");

    await expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
  },
};
