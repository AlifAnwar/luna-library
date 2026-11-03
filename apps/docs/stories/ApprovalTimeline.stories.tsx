import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  ApprovalTimeline,
  ApprovalTimelineItem,
  CancelIcon,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CheckIcon,
  LoadingIcon,
  MoreHorizontalIcon,
} from "@withalif/luna";

type ApprovalHistoryProps = {
  constrained?: boolean;
  longLabels?: boolean;
  rejected?: boolean;
};

function ApprovalHistory({
  constrained = false,
  longLabels = false,
  rejected = false,
}: ApprovalHistoryProps) {
  return (
    <section
      aria-labelledby="approval-history-heading"
      className={
        constrained
          ? "w-80 max-w-full min-w-0 bg-background p-4 text-foreground"
          : "w-full max-w-2xl min-w-0 bg-background p-4 text-foreground"
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="approval-history-heading">Approval history</h2>
          </CardTitle>
          <CardDescription>
            Status labels and workflow meaning are supplied by the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalTimeline aria-label="Approval history">
            <ApprovalTimelineItem
              marker={<CheckIcon />}
              title="Request submitted"
              status="Complete"
              tone="success"
              meta={
                <>
                  Maya Chen ·{" "}
                  <time dateTime="2026-11-01T10:15:00+07:00">
                    1 Nov 2026, 10:15
                  </time>
                </>
              }
            >
              The application recorded the request and its supporting context.
            </ApprovalTimelineItem>

            <ApprovalTimelineItem
              marker={rejected ? <CancelIcon /> : <CheckIcon />}
              title={
                longLabels
                  ? "Regional operations and compliance review for the Southeast Asia program"
                  : "Operations review"
              }
              status={rejected ? "Rejected" : "Complete"}
              tone={rejected ? "danger" : "success"}
              meta={
                rejected ? (
                  <>
                    Andre Silva ·{" "}
                    <time dateTime="2026-11-02T14:30:00+07:00">
                      2 Nov 2026, 14:30
                    </time>
                  </>
                ) : (
                  "Andre Silva"
                )
              }
            >
              {rejected
                ? "Supporting documentation must be updated before another review."
                : "Operational details were reviewed without exceptions."}
            </ApprovalTimelineItem>

            <ApprovalTimelineItem
              marker={rejected ? <MoreHorizontalIcon /> : <LoadingIcon />}
              title="Finance review"
              status={rejected ? "On hold" : "In review"}
              tone={rejected ? "warning" : "info"}
              meta="Finance team"
              aria-current={rejected ? undefined : "step"}
            >
              {rejected
                ? "This step will resume after the rejected review is resolved."
                : "The finance team is reviewing the supplied record."}
            </ApprovalTimelineItem>

            <ApprovalTimelineItem
              title="Final confirmation"
              status="Not started"
              meta="Unassigned"
            >
              This presentation does not execute or enforce the confirmation.
            </ApprovalTimelineItem>
          </ApprovalTimeline>
        </CardContent>
      </Card>
    </section>
  );
}

const meta = {
  title: "Patterns/Approval Timeline",
  component: ApprovalHistory,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof ApprovalHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Approval history" });

    await expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.getAllByText("Complete")).toHaveLength(2);
    await expect(canvas.getByText("In review")).toBeVisible();
    await expect(
      canvasElement.querySelector('[aria-current="step"]'),
    ).not.toBeNull();
  },
};

export const RejectedStep: Story = {
  args: { rejected: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Rejected")).toBeVisible();
    await expect(canvas.getByText("On hold")).toBeVisible();
  },
};

export const LongLabels: Story = {
  args: { longLabels: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(/Regional operations and compliance/),
    ).toBeVisible();
  },
};

export const NarrowViewport: Story = {
  args: { constrained: true, longLabels: true, rejected: true },
  play: async ({ canvasElement }) => {
    const section = canvasElement.querySelector("section");

    await expect(section).not.toBeNull();
    await expect(section!.scrollWidth).toBeLessThanOrEqual(
      section!.clientWidth,
    );
    await expect(
      within(canvasElement).getByRole("list", { name: "Approval history" }),
    ).toBeVisible();
  },
};
