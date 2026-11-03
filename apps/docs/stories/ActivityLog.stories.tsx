import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  ActivityLog,
  ActivityLogItem,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CheckIcon,
  EditIcon,
  FileIcon,
} from "@withalif/luna";

type ActivityHistoryProps = {
  constrained?: boolean;
  empty?: boolean;
  longMessage?: boolean;
};

function ActivityHistory({
  constrained = false,
  empty = false,
  longMessage = false,
}: ActivityHistoryProps) {
  return (
    <section
      aria-labelledby="activity-history-heading"
      className={
        constrained
          ? "w-80 max-w-full min-w-0 bg-background p-4 text-foreground"
          : "w-full max-w-2xl min-w-0 bg-background p-4 text-foreground"
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="activity-history-heading">Recent activity</h2>
          </CardTitle>
          <CardDescription>
            A chronological record supplied by the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="rounded-md border border-dashed border-border bg-surface-subtle p-4">
              <p className="font-medium text-foreground">No activity yet</p>
              <p className="mt-1 text-body-sm text-foreground-secondary">
                Events will appear here after the first recorded change.
              </p>
            </div>
          ) : (
            <ActivityLog aria-label="Recent activity">
              <ActivityLogItem
                marker={<EditIcon />}
                title={
                  <>
                    <span className="font-semibold">Maya Chen</span> updated the
                    record
                  </>
                }
                timestamp={
                  <time dateTime="2026-11-03T09:24:00+07:00">09:24</time>
                }
              >
                {longMessage
                  ? "Changed the operational notes for the Southeast Asia research program and added an intentionally long reference, OPERATIONS-REVIEW-2026-0000000000001042, to verify wrapping without hiding context or widening the page."
                  : "Changed the operational notes and primary region."}
              </ActivityLogItem>

              <ActivityLogItem
                marker={<FileIcon />}
                title={
                  <>
                    <span className="font-semibold">Andre Silva</span> attached
                    a document
                  </>
                }
                timestamp={
                  <time dateTime="2026-11-03T08:10:00+07:00">08:10</time>
                }
              >
                Quarterly-review.pdf
              </ActivityLogItem>

              <ActivityLogItem
                marker={<CheckIcon />}
                title="Automated review completed"
                timestamp={
                  <time dateTime="2026-11-02T16:42:00+07:00">Yesterday</time>
                }
              >
                No policy exceptions were detected.
              </ActivityLogItem>
            </ActivityLog>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

const meta = {
  title: "Patterns/Activity Log",
  component: ActivityHistory,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof ActivityHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Recent activity" });

    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByText("Maya Chen")).toBeVisible();
    await expect(canvasElement.querySelectorAll("time")).toHaveLength(3);
  },
};

export const LongEventMessage: Story = {
  args: { longMessage: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(/OPERATIONS-REVIEW-2026/),
    ).toBeVisible();
  },
};

export const EmptyHistory: Story = {
  args: { empty: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No activity yet")).toBeVisible();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};

export const NarrowViewport: Story = {
  args: { constrained: true, longMessage: true },
  play: async ({ canvasElement }) => {
    const section = canvasElement.querySelector("section");

    await expect(section).not.toBeNull();
    await expect(section!.scrollWidth).toBeLessThanOrEqual(
      section!.clientWidth,
    );
    await expect(
      within(canvasElement).getByRole("list", { name: "Recent activity" }),
    ).toBeVisible();
  },
};
