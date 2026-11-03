import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DetailField,
  DetailList,
  EditIcon,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@withalif/luna";

type RecordDetailProps = {
  compact?: boolean;
  constrained?: boolean;
  emptyValues?: boolean;
  longValues?: boolean;
};

function DetailCard({
  children,
  description,
  id,
  title,
}: {
  children: React.ReactNode;
  description: string;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={id}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id={id} className="break-words text-balance">
              {title}
            </h2>
          </CardTitle>
          <CardDescription className="break-words text-pretty">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

function RecordDetail({
  compact = false,
  constrained = false,
  emptyValues = false,
  longValues = false,
}: RecordDetailProps) {
  const [announcement, setAnnouncement] = React.useState("");
  const columns = constrained ? 1 : 2;
  const density = compact ? "compact" : "default";

  return (
    <main
      className={
        constrained
          ? "mx-auto grid w-80 max-w-full min-w-0 gap-6 bg-background p-4 text-foreground"
          : "mx-auto grid w-full max-w-5xl min-w-0 gap-6 bg-background p-4 text-foreground sm:p-6"
      }
    >
      <PageHeader
        className={constrained ? "min-w-0 pb-0 sm:!flex-col" : "min-w-0 pb-0"}
      >
        <PageHeaderContent className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#organizations">
                  Organizations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Aster Labs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <PageHeaderHeading className="break-words text-balance">
              Aster Labs
            </PageHeaderHeading>
            <Badge variant="secondary">Active</Badge>
          </div>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Review the organization profile, contacts, and account settings.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions
          className={
            constrained
              ? "w-full flex-col items-stretch sm:!w-full"
              : "w-full flex-wrap sm:w-auto sm:justify-end"
          }
        >
          <Button
            type="button"
            className={constrained ? "w-full sm:!w-full" : undefined}
            onClick={() => setAnnouncement("Edit record requested.")}
          >
            <EditIcon data-icon="inline-start" aria-hidden="true" />
            Edit record
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <DetailCard
        id="organization-details-heading"
        title="Organization details"
        description="Core identifiers and classification for this record."
      >
        <DetailList columns={columns} density={density}>
          <DetailField label="Organization ID">ORG-1042</DetailField>
          <DetailField label="Organization type">Private company</DetailField>
          <DetailField label="Registration number">
            {longValues
              ? "REG-2026-INDONESIA-ENTERPRISE-0000000000001042"
              : "REG-2026-1042"}
          </DetailField>
          <DetailField label="Primary region">Southeast Asia</DetailField>
          <DetailField label="Website">
            <a
              href="https://example.com/aster-labs-enterprise"
              className="text-primary underline underline-offset-4"
            >
              {longValues
                ? "example.com/aster-labs-enterprise/customer-operations-and-research"
                : "example.com/aster-labs"}
            </a>
          </DetailField>
          <DetailField label="External reference">
            {emptyValues ? null : "EXT-48219"}
          </DetailField>
          <DetailField label="Summary" span="full">
            {longValues
              ? "Aster Labs coordinates a multi-region research program with an intentionally long description that verifies wrapping without hiding meaningful record context or widening the page."
              : "Research and operations partner for regional programs."}
          </DetailField>
        </DetailList>
      </DetailCard>

      <DetailCard
        id="contact-details-heading"
        title="Contact details"
        description="People and channels used for routine account communication."
      >
        <DetailList columns={columns} density={density}>
          <DetailField label="Primary contact">Maya Chen</DetailField>
          <DetailField label="Role">Operations director</DetailField>
          <DetailField label="Email address">
            <a
              href="mailto:maya.chen@example.com"
              className="text-primary underline underline-offset-4"
            >
              maya.chen@example.com
            </a>
          </DetailField>
          <DetailField label="Phone number">
            {emptyValues ? null : "+62 21 555 0148"}
          </DetailField>
          <DetailField label="Mailing address" span="full">
            18 Research Avenue, Central Jakarta, Jakarta 10220, Indonesia
          </DetailField>
        </DetailList>
      </DetailCard>
    </main>
  );
}

const meta = {
  title: "Patterns/Record Detail",
  component: RecordDetail,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof RecordDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Aster Labs" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Organization details" }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("term").length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("button", { name: "Edit record" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Edit record requested.",
    );
  },
};

export const EmptyValues: Story = {
  args: { emptyValues: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Not provided")).toHaveLength(2);
  },
};

export const LongValues: Story = {
  args: { longValues: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("REG-2026-INDONESIA-ENTERPRISE-0000000000001042"),
    ).toBeVisible();
  },
};

export const DenseDetail: Story = {
  args: { compact: true },
};

export const NarrowViewport: Story = {
  args: { constrained: true, longValues: true },
  play: async ({ canvasElement }) => {
    const main = canvasElement.querySelector("main");
    await expect(main).not.toBeNull();
    await expect(main!.scrollWidth).toBeLessThanOrEqual(main!.clientWidth);
    await expect(
      within(canvasElement).getByRole("button", { name: "Edit record" }),
    ).toBeVisible();
  },
};
