import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";

import {
  ActivityLog,
  ActivityLogItem,
  Alert,
  AlertDescription,
  AlertTitle,
  ApprovalTimeline,
  ApprovalTimelineItem,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  buttonVariants,
  CancelIcon,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  CheckCircleIcon,
  CheckIcon,
  DataTable,
  DataTableEmptyState,
  DataTableFilter,
  DataTableSearch,
  DataTableToolbar,
  DashboardGrid,
  DashboardGridItem,
  DashboardWidget,
  DatePicker,
  DateRangePicker,
  DetailField,
  DetailList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  EditIcon,
  FileIcon,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  HomeIcon,
  InfoIcon,
  Input,
  KpiCard,
  LineChart,
  LoadingIcon,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SearchableSelect,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarTrigger,
  Switch,
  Textarea,
  ToastProvider,
  ToastViewport,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  WarningIcon,
  useToast,
  type CartesianChartDatum,
  type CartesianChartSeries,
  type DataTableColumn,
  type DataTableFilterOption,
  type DateRange,
} from "@withalif/luna";

type ApplicationView = "overview" | "detail" | "edit";
type IntegrationStatus = "default" | "loading" | "empty" | "unavailable";
type ReviewStatus = "In review" | "Approved" | "Needs changes";

type ReviewRecord = {
  id: string;
  name: string;
  owner: string;
  email: string;
  region: string;
  submittedAt: string;
  status: ReviewStatus;
  summary: string;
};

type CrossPatternApplicationProps = {
  constrained?: boolean;
  initialStatus?: IntegrationStatus;
  initialView?: ApplicationView;
};

const initialRecords: readonly ReviewRecord[] = [
  {
    id: "REQ-2042",
    name: "Aster Labs",
    owner: "Maya Chen",
    email: "maya.chen@example.com",
    region: "Southeast Asia",
    submittedAt: "2026-10-28",
    status: "In review",
    summary: "Research and operations partner for regional programs.",
  },
  {
    id: "REQ-2043",
    name: "Northstar Retail",
    owner: "Andre Silva",
    email: "andre.silva@example.com",
    region: "Europe",
    submittedAt: "2026-10-27",
    status: "Approved",
    summary: "Retail operations record for the quarterly review cycle.",
  },
  {
    id: "REQ-2044",
    name: "Meridian Health",
    owner: "Priya Nair",
    email: "priya.nair@example.com",
    region: "South Asia",
    submittedAt: "2026-10-26",
    status: "Needs changes",
    summary: "Healthcare services record awaiting supporting documentation.",
  },
];

const statusOptions = [
  { label: "In review", value: "In review", count: 1 },
  { label: "Approved", value: "Approved", count: 1 },
  { label: "Needs changes", value: "Needs changes", count: 1 },
] satisfies readonly DataTableFilterOption[];

const reviewVolumeData = [
  { category: "Week 1", submitted: 34, completed: 27 },
  { category: "Week 2", submitted: 42, completed: 35 },
  { category: "Week 3", submitted: 38, completed: 36 },
  { category: "Week 4", submitted: 51, completed: 43 },
] satisfies readonly CartesianChartDatum[];

const reviewVolumeSeries = [
  { dataKey: "submitted", label: "Submitted" },
  { dataKey: "completed", label: "Completed", marker: "dash" },
] satisfies readonly CartesianChartSeries[];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function badgeVariant(status: ReviewStatus) {
  if (status === "Needs changes") return "destructive" as const;
  if (status === "Approved") return "secondary" as const;
  return "outline" as const;
}

function recordColumns(
  onOpenRecord: (record: ReviewRecord) => void,
): readonly DataTableColumn<ReviewRecord>[] {
  return [
    {
      id: "record",
      header: "Record",
      rowHeader: true,
      width: 240,
      cell: (record) => (
        <span className="grid min-w-48 gap-0.5">
          <span className="font-medium">{record.id}</span>
          <span className="break-words text-body-sm text-foreground-secondary">
            {record.name}
          </span>
        </span>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      cell: (record) => record.owner,
    },
    {
      id: "region",
      header: "Region",
      cell: (record) => record.region,
    },
    {
      id: "submitted",
      header: "Submitted",
      cell: (record) => (
        <time dateTime={record.submittedAt} className="whitespace-nowrap">
          {dateFormatter.format(new Date(`${record.submittedAt}T00:00:00Z`))}
        </time>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (record) => (
        <Badge variant={badgeVariant(record.status)}>{record.status}</Badge>
      ),
    },
    {
      id: "action",
      header: "Action",
      align: "end",
      width: "1%",
      cellClassName: "whitespace-nowrap",
      cell: (record) => (
        <a
          href="#integration-main"
          className={buttonVariants({
            variant: "link",
            size: "sm",
            className: "h-auto px-0 py-1",
          })}
          onClick={(event) => {
            event.preventDefault();
            onOpenRecord(record);
          }}
        >
          View details
          <span className="sr-only"> for {record.id}</span>
        </a>
      ),
    },
  ];
}

function IntegrationNavigation({
  onNavigate,
  view,
}: {
  onNavigate: (view: ApplicationView, announcement: string) => void;
  view: ApplicationView;
}) {
  const recordsActive = view === "detail" || view === "edit";

  return (
    <Sidebar collapsible="icon" mobileTitle="Review workspace navigation">
      <SidebarHeader>
        <div className="flex min-w-0 items-center gap-2 px-2 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-label font-semibold text-primary-foreground"
          >
            L
          </span>
          <span className="min-w-0 break-words text-body font-semibold text-foreground group-data-[collapsible=icon]/sidebar:hidden">
            Luna Review
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent aria-label="Primary navigation">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuLink
                  href="#integration-main"
                  label="Overview"
                  isActive={view === "overview"}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate("overview", "Overview opened.");
                  }}
                >
                  <HomeIcon aria-hidden="true" />
                  <span>Overview</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuLink
                  href="#integration-main"
                  label="Records"
                  isActive={recordsActive}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate("detail", "Record details opened.");
                  }}
                >
                  <FileIcon aria-hidden="true" />
                  <span>Records</span>
                </SidebarMenuLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function OverviewPage({
  constrained,
  onAnnounce,
  onOpenRecord,
  onRetry,
  period,
  query,
  records,
  selectedStatuses,
  status,
  onPeriodChange,
  onQueryChange,
  onStatusesChange,
}: {
  constrained: boolean;
  onAnnounce: (message: string) => void;
  onOpenRecord: (record: ReviewRecord) => void;
  onRetry: () => void;
  period: DateRange | undefined;
  query: string;
  records: readonly ReviewRecord[];
  selectedStatuses: readonly string[];
  status: IntegrationStatus;
  onPeriodChange: (value: DateRange | undefined) => void;
  onQueryChange: (value: string) => void;
  onStatusesChange: (value: string[]) => void;
}) {
  const loading = status === "loading";
  const unavailable = status === "unavailable";
  const metricStatus = status;
  const controlsDisabled = loading || unavailable;
  const chartData = status === "default" ? reviewVolumeData : [];
  const filteredRecords = React.useMemo(() => {
    if (status === "empty" || unavailable) return [];

    const normalizedQuery = query.trim().toLocaleLowerCase();
    return records.filter((record) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [record.id, record.name, record.owner, record.region].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(record.status);

      return matchesQuery && matchesStatus;
    });
  }, [query, records, selectedStatuses, status, unavailable]);
  const approvedCount = records.filter(
    (record) => record.status === "Approved",
  ).length;
  const tableColumns = React.useMemo(
    () => recordColumns(onOpenRecord),
    [onOpenRecord],
  );

  return (
    <>
      <PageHeader
        className={
          constrained
            ? "min-w-0 pb-0 sm:!flex-col"
            : "min-w-0 pb-0 sm:!flex-col lg:!flex-row"
        }
      >
        <PageHeaderContent className="min-w-0">
          <PageHeaderHeading
            id="integration-page-title"
            className="break-words text-balance"
          >
            Review overview
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Track review volume, filter operational records, and open a record
            without moving application state into Luna.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions
          className={
            constrained
              ? "w-full flex-col items-stretch sm:!w-full"
              : "w-full flex-wrap sm:justify-start lg:w-auto lg:justify-end"
          }
        >
          <DateRangePicker
            aria-label="Reporting period"
            value={period}
            disabled={controlsDisabled}
            onValueChange={onPeriodChange}
            className={constrained ? "w-full sm:!w-full" : "w-full sm:w-auto"}
            calendarProps={{ defaultMonth: new Date(2026, 9, 1) }}
          />
          <Button
            type="button"
            disabled={controlsDisabled}
            className={constrained ? "w-full sm:!w-full" : "w-full sm:w-auto"}
            onClick={() => onAnnounce("Overview export requested.")}
          >
            Export overview
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {unavailable ? (
        <Alert variant="warning">
          <WarningIcon aria-hidden="true" />
          <AlertTitle>Workspace data unavailable</AlertTitle>
          <AlertDescription>
            Check the connection and try loading the overview again.
          </AlertDescription>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2 w-fit"
            onClick={onRetry}
          >
            Try again
          </Button>
        </Alert>
      ) : null}

      <section
        aria-labelledby="integration-summary-heading"
        className="grid gap-3"
      >
        <h2 id="integration-summary-heading" className="sr-only">
          Review summary
        </h2>
        <DashboardGrid>
          <DashboardGridItem>
            <KpiCard
              label="Records in review"
              value={String(records.length)}
              status={metricStatus}
              loadingLabel="Loading records in review"
              stateLabel={unavailable ? "Unavailable" : "No records"}
              description="Across all current review states"
            />
          </DashboardGridItem>
          <DashboardGridItem>
            <KpiCard
              label="Approved this period"
              value={String(approvedCount)}
              status={metricStatus}
              loadingLabel="Loading approved records"
              stateLabel={unavailable ? "Unavailable" : "No approvals"}
              trend={{
                direction: "up",
                value: "6.4%",
                tone: "success",
                toneLabel: "Favorable",
              }}
              description="vs. previous period"
            />
          </DashboardGridItem>
          <DashboardGridItem>
            <KpiCard
              label="Average review time"
              value="14.2 h"
              status={metricStatus}
              loadingLabel="Loading average review time"
              stateLabel={unavailable ? "Unavailable" : "No duration data"}
              trend={{
                direction: "down",
                value: "1.8 h",
                tone: "success",
                toneLabel: "Favorable",
              }}
              description="vs. previous period"
            />
          </DashboardGridItem>
        </DashboardGrid>
      </section>

      <section
        aria-labelledby="integration-analysis-heading"
        className="grid gap-3"
      >
        <h2 id="integration-analysis-heading" className="sr-only">
          Review analysis
        </h2>
        <DashboardGrid>
          <DashboardGridItem span={4}>
            <DashboardWidget
              title="Review volume"
              description="Weekly submitted and completed records for the selected period."
            >
              <LineChart
                title="Review volume"
                description="Weekly submitted and completed records for the selected period."
                data={chartData}
                series={reviewVolumeSeries}
                loading={loading}
                loadingLabel="Loading review volume"
                emptyTitle={
                  unavailable ? "Review volume unavailable" : "No review volume"
                }
                emptyDescription={
                  unavailable
                    ? "Try loading the workspace again."
                    : "Review volume will appear after records are submitted."
                }
                formatValue={(value) => `${value} records`}
                showHeader={false}
                size="sm"
              />
            </DashboardWidget>
          </DashboardGridItem>
        </DashboardGrid>
      </section>

      <section
        aria-labelledby="integration-records-heading"
        className="grid min-w-0 gap-4"
      >
        <div className="grid min-w-0 gap-1">
          <h2
            id="integration-records-heading"
            className="text-section font-semibold"
          >
            Operational records
          </h2>
          <p
            role="status"
            className="text-body-sm tabular-nums text-foreground-secondary"
          >
            {loading
              ? "Loading records"
              : `${filteredRecords.length} ${
                  filteredRecords.length === 1 ? "record" : "records"
                } shown`}
          </p>
        </div>

        <DataTableToolbar>
          <DataTableSearch
            value={query}
            onValueChange={onQueryChange}
            label="Search records"
            placeholder="Search records…"
            disabled={controlsDisabled}
            className="sm:me-auto"
          />
          <DataTableFilter
            mode="multiple"
            label="Status"
            options={statusOptions}
            value={selectedStatuses}
            disabled={controlsDisabled}
            onValueChange={onStatusesChange}
          />
        </DataTableToolbar>

        <p
          className={
            constrained
              ? "text-caption text-foreground-secondary"
              : "text-caption text-foreground-secondary lg:hidden"
          }
        >
          Scroll the table horizontally to view every column.
        </p>

        <div className="min-w-0">
          <DataTable
            columns={tableColumns}
            data={filteredRecords}
            caption="Operational review records"
            hideCaption
            loading={loading}
            loadingLabel="Loading operational review records"
            emptyState={
              <DataTableEmptyState
                title={
                  unavailable
                    ? "Records unavailable"
                    : query || selectedStatuses.length
                      ? "No records match these filters"
                      : "No records yet"
                }
                description={
                  unavailable
                    ? "Try loading the workspace again."
                    : query || selectedStatuses.length
                      ? "Clear the search or status filter to return to all records."
                      : "Records will appear after the first submission."
                }
              />
            }
          />
        </div>
      </section>
    </>
  );
}

function DetailSection({
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

function RecordDetailPage({
  constrained,
  onEdit,
  onOverview,
  record,
}: {
  constrained: boolean;
  onEdit: () => void;
  onOverview: () => void;
  record: ReviewRecord;
}) {
  return (
    <>
      <PageHeader
        className={
          constrained
            ? "min-w-0 pb-0 sm:!flex-col"
            : "min-w-0 pb-0 sm:!flex-col lg:!flex-row"
        }
      >
        <PageHeaderContent className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#integration-main"
                  onClick={(event) => {
                    event.preventDefault();
                    onOverview();
                  }}
                >
                  Overview
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{record.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <PageHeaderHeading
              id="integration-page-title"
              className="break-words text-balance"
            >
              {record.name}
            </PageHeaderHeading>
            <Badge variant={badgeVariant(record.status)}>{record.status}</Badge>
          </div>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Review record details, activity, and the consumer-provided approval
            history.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions
          className={
            constrained
              ? "w-full flex-col items-stretch sm:!w-full"
              : "w-full flex-wrap sm:justify-start lg:w-auto lg:justify-end"
          }
        >
          <Button
            type="button"
            className={constrained ? "w-full sm:!w-full" : undefined}
            onClick={onEdit}
          >
            <EditIcon data-icon="inline-start" aria-hidden="true" />
            Edit record
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div
        className={
          constrained
            ? "grid min-w-0 gap-6"
            : "grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]"
        }
      >
        <DetailSection
          id="integration-record-heading"
          title="Record details"
          description="Identifiers and application-owned profile data."
        >
          <DetailList columns={constrained ? 1 : 2}>
            <DetailField label="Record ID">{record.id}</DetailField>
            <DetailField label="Region">{record.region}</DetailField>
            <DetailField label="Owner">{record.owner}</DetailField>
            <DetailField label="Email address">
              <a
                href={`mailto:${record.email}`}
                className="text-primary underline underline-offset-4"
              >
                {record.email}
              </a>
            </DetailField>
            <DetailField label="Submitted">
              <time dateTime={record.submittedAt}>
                {dateFormatter.format(
                  new Date(`${record.submittedAt}T00:00:00Z`),
                )}
              </time>
            </DetailField>
            <DetailField label="Summary" span="full">
              {record.summary}
            </DetailField>
          </DetailList>
        </DetailSection>

        <div className="grid min-w-0 content-start gap-6">
          <DetailSection
            id="integration-activity-heading"
            title="Recent activity"
            description="Chronological events formatted by the application."
          >
            <ActivityLog aria-label="Recent record activity">
              <ActivityLogItem
                marker={<EditIcon />}
                title={`${record.owner} updated the record`}
                timestamp={
                  <time dateTime="2026-11-03T09:24:00+07:00">09:24</time>
                }
              >
                Updated the profile and supporting context.
              </ActivityLogItem>
              <ActivityLogItem
                marker={<CheckIcon />}
                title="Automated checks completed"
                timestamp={
                  <time dateTime="2026-11-02T16:42:00+07:00">Yesterday</time>
                }
              >
                No structural issues were detected.
              </ActivityLogItem>
            </ActivityLog>
          </DetailSection>

          <DetailSection
            id="integration-approval-heading"
            title="Approval history"
            description="Visible labels carry status meaning; the application owns state."
          >
            <ApprovalTimeline aria-label="Approval history">
              <ApprovalTimelineItem
                marker={<CheckIcon />}
                title="Submission"
                status="Complete"
                tone="success"
                meta="Maya Chen · 1 Nov 2026"
              />
              <ApprovalTimelineItem
                marker={<LoadingIcon />}
                title="Operations review"
                status="In review"
                tone="info"
                meta="Review team"
                aria-current="step"
              />
              <ApprovalTimelineItem
                title="Final confirmation"
                status="Not started"
                meta="Unassigned"
              />
            </ApprovalTimeline>
          </DetailSection>
        </div>
      </div>
    </>
  );
}

type EditErrors = Partial<Record<"name" | "email", string>>;

function RecordEditPage({
  constrained,
  onAnnounce,
  onCancel,
  onSave,
  record,
}: {
  constrained: boolean;
  onAnnounce: (message: string) => void;
  onCancel: () => void;
  onSave: (record: ReviewRecord) => void;
  record: ReviewRecord;
}) {
  const [name, setName] = React.useState(record.name);
  const [owner, setOwner] = React.useState(record.owner);
  const [email, setEmail] = React.useState(record.email);
  const [summary, setSummary] = React.useState(record.summary);
  const [errors, setErrors] = React.useState<EditErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: EditErrors = {};

    if (!name.trim()) nextErrors.name = "Enter the record name.";
    if (!email.includes("@")) {
      nextErrors.email = "Enter a complete email address.";
    }

    if (nextErrors.name || nextErrors.email) {
      setErrors(nextErrors);
      onAnnounce("Review the highlighted fields.");
      requestAnimationFrame(() => {
        document
          .getElementById(
            nextErrors.name
              ? "integration-record-name-control"
              : "integration-record-email-control",
          )
          ?.focus();
      });
      return;
    }

    onSave({
      ...record,
      name: name.trim(),
      owner: owner.trim(),
      email: email.trim(),
      summary: summary.trim(),
    });
  }

  return (
    <>
      <PageHeader className="min-w-0 pb-0">
        <PageHeaderContent className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#integration-main"
                  onClick={(event) => {
                    event.preventDefault();
                    onCancel();
                  }}
                >
                  {record.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageHeaderHeading
            id="integration-page-title"
            className="break-words text-balance"
          >
            Edit record
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Update application-owned values. Luna provides field relationships
            and validation presentation only.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <form className="grid min-w-0 gap-6" noValidate onSubmit={handleSubmit}>
        <section aria-labelledby="integration-edit-heading">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 id="integration-edit-heading">Record information</h2>
              </CardTitle>
              <CardDescription>
                Fields marked with an asterisk are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={
                  constrained
                    ? "grid min-w-0 gap-5"
                    : "grid min-w-0 gap-5 sm:grid-cols-2"
                }
              >
                <FormField
                  id="integration-record-name"
                  required
                  invalid={Boolean(errors.name)}
                >
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input
                      name="organizationName"
                      autoComplete="organization"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          name: undefined,
                        }));
                      }}
                    />
                  </FormControl>
                  {errors.name ? (
                    <FormMessage role="none">{errors.name}</FormMessage>
                  ) : (
                    <FormDescription>
                      Use the registered organization name.
                    </FormDescription>
                  )}
                </FormField>

                <FormField id="integration-record-owner">
                  <FormLabel>Owner</FormLabel>
                  <FormControl>
                    <Input
                      name="owner"
                      autoComplete="name"
                      value={owner}
                      onChange={(event) => setOwner(event.target.value)}
                    />
                  </FormControl>
                </FormField>

                <FormField
                  id="integration-record-email"
                  required
                  invalid={Boolean(errors.email)}
                >
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          email: undefined,
                        }));
                      }}
                    />
                  </FormControl>
                  {errors.email ? (
                    <FormMessage role="none">{errors.email}</FormMessage>
                  ) : (
                    <FormDescription>
                      Use an address monitored by the record owner.
                    </FormDescription>
                  )}
                </FormField>

                <FormField
                  id="integration-record-summary"
                  className={constrained ? undefined : "sm:col-span-2"}
                >
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      name="summary"
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Summarize the record in one or two sentences.
                  </FormDescription>
                </FormField>
              </div>
            </CardContent>
          </Card>
        </section>

        <div
          data-slot="integration-form-actions"
          className={
            constrained
              ? "flex flex-col-reverse gap-2"
              : "flex flex-wrap justify-end gap-2"
          }
        >
          <Button
            type="button"
            variant="outline"
            className={constrained ? "w-full" : undefined}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className={constrained ? "w-full" : undefined}>
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}

function CrossPatternApplication({
  constrained = false,
  initialStatus = "default",
  initialView = "overview",
}: CrossPatternApplicationProps) {
  const [view, setView] = React.useState<ApplicationView>(initialView);
  const [status, setStatus] = React.useState<IntegrationStatus>(initialStatus);
  const [records, setRecords] =
    React.useState<readonly ReviewRecord[]>(initialRecords);
  const [selectedId, setSelectedId] = React.useState(initialRecords[0]!.id);
  const [query, setQuery] = React.useState("");
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [period, setPeriod] = React.useState<DateRange | undefined>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 31),
  });
  const [announcement, setAnnouncement] = React.useState("");
  const mainRef = React.useRef<HTMLElement>(null);
  const selectedRecord =
    records.find((record) => record.id === selectedId) ?? records[0]!;

  const announce = React.useCallback((message: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  const navigate = React.useCallback(
    (nextView: ApplicationView, message: string) => {
      setView(nextView);
      announce(message);
      requestAnimationFrame(() => mainRef.current?.focus());
    },
    [announce],
  );

  const openRecord = React.useCallback(
    (record: ReviewRecord) => {
      setSelectedId(record.id);
      navigate("detail", `${record.id} details opened.`);
    },
    [navigate],
  );

  function saveRecord(nextRecord: ReviewRecord) {
    setRecords((current) =>
      current.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      ),
    );
    navigate("detail", "Changes saved. Record details opened.");
  }

  return (
    <div
      data-slot="cross-pattern-application"
      className={constrained ? "w-80 max-w-full min-w-0" : "w-full min-w-0"}
    >
      <SidebarProvider
        defaultOpen={!constrained}
        className="min-w-0 bg-background text-foreground"
      >
        <a
          href="#integration-main"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-surface focus-visible:px-3 focus-visible:py-2 focus-visible:text-body focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Skip to content
        </a>

        <IntegrationNavigation onNavigate={navigate} view={view} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-14 min-w-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
            <SidebarTrigger className="shrink-0" />
            <span className="min-w-0 flex-1 break-words text-body font-semibold">
              Review workspace
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => announce("Help requested.")}
            >
              Help
            </Button>
          </header>

          <p role="status" className="sr-only">
            {announcement}
          </p>

          <main
            ref={mainRef}
            id="integration-main"
            tabIndex={-1}
            aria-labelledby="integration-page-title"
            className="min-w-0 flex-1 scroll-mt-16 px-4 py-6 outline-none sm:px-6"
          >
            <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-6">
              {view === "overview" ? (
                <OverviewPage
                  constrained={constrained}
                  onAnnounce={announce}
                  onOpenRecord={openRecord}
                  onRetry={() => {
                    setStatus("default");
                    announce("Workspace data loaded.");
                  }}
                  period={period}
                  query={query}
                  records={records}
                  selectedStatuses={selectedStatuses}
                  status={status}
                  onPeriodChange={setPeriod}
                  onQueryChange={setQuery}
                  onStatusesChange={setSelectedStatuses}
                />
              ) : view === "detail" ? (
                <RecordDetailPage
                  constrained={constrained}
                  record={selectedRecord}
                  onEdit={() => navigate("edit", "Edit form opened.")}
                  onOverview={() => navigate("overview", "Overview opened.")}
                />
              ) : (
                <RecordEditPage
                  constrained={constrained}
                  record={selectedRecord}
                  onAnnounce={announce}
                  onCancel={() =>
                    navigate(
                      "detail",
                      "Editing cancelled. Record details opened.",
                    )
                  }
                  onSave={saveRecord}
                />
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

function MatrixToastButton() {
  const toast = useToast();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        toast.add({
          title: "Theme review saved",
          description: "The selected appearance and direction are active.",
          type: "success",
        })
      }
    >
      Show status toast
    </Button>
  );
}

function ThemeDirectionInteractionTray() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 10, 18),
  );

  return (
    <div className="grid min-w-0 gap-6 border-t border-border bg-background p-4 text-foreground">
      <section
        aria-labelledby="matrix-states-heading"
        className="grid min-w-0 gap-3"
      >
        <div>
          <h2 id="matrix-states-heading" className="text-section font-semibold">
            Theme and control states
          </h2>
          <p className="text-body-sm text-foreground-secondary">
            Default, hover, active, selected, invalid, disabled, and loading
            treatments share semantic tokens. Mixed-direction values stay
            isolated: <bdi>طلب REQ-2042 · 1,250</bdi>.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap gap-2">
          <Button type="button">Default action</Button>
          <Button type="button" variant="secondary">
            Secondary action
          </Button>
          <Button type="button" loading>
            Saving changes
          </Button>
          <Button type="button" disabled>
            Unavailable
          </Button>
          <Button type="button" aria-invalid="true">
            Invalid action
          </Button>
        </div>

        <div className="grid min-w-0 gap-3">
          <label className="flex min-w-0 items-center gap-2 text-body">
            <Checkbox defaultChecked />
            Include archived records
          </label>
          <label className="flex min-w-0 items-center gap-2 text-body">
            <Switch defaultChecked />
            Send review notifications
          </label>
          <div className="grid min-w-0 gap-1.5">
            <label
              htmlFor="matrix-reference"
              className="text-label font-medium"
            >
              Reference
            </label>
            <Input
              id="matrix-reference"
              defaultValue="Incomplete reference"
              aria-invalid="true"
              aria-describedby="matrix-reference-error"
            />
            <span
              id="matrix-reference-error"
              className="text-body-sm text-destructive"
            >
              Enter a complete reference.
            </span>
          </div>
          <Select
            defaultValue="ready"
            items={{ ready: "Ready", review: "In review", held: "On hold" }}
          >
            <SelectTrigger aria-label="Theme review status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="review">In review</SelectItem>
              <SelectItem value="held">On hold</SelectItem>
            </SelectContent>
          </Select>
          <SearchableSelect
            aria-label="Theme review assignee"
            searchLabel="Search theme review assignees"
            placeholder="Choose an assignee"
            items={[
              { value: "maya", label: "Maya Chen" },
              { value: "andre", label: "Andre Silva" },
              { value: "priya", label: "Priya Nair" },
            ]}
          />
          <DatePicker
            aria-label="Theme review date"
            value={date}
            onValueChange={setDate}
            calendarProps={{ defaultMonth: new Date(2026, 10, 1) }}
          />
        </div>
      </section>

      <section
        aria-labelledby="matrix-statuses-heading"
        className="grid min-w-0 gap-3"
      >
        <h2 id="matrix-statuses-heading" className="text-section font-semibold">
          Status treatments
        </h2>
        <Alert variant="info">
          <InfoIcon aria-hidden="true" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Review details before continuing.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CheckCircleIcon aria-hidden="true" />
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>The review was saved.</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <WarningIcon aria-hidden="true" />
          <AlertTitle>Check this</AlertTitle>
          <AlertDescription>Some details need attention.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CancelIcon aria-hidden="true" />
          <AlertTitle>Unable to save</AlertTitle>
          <AlertDescription>Check the fields and try again.</AlertDescription>
        </Alert>
      </section>

      <section
        aria-labelledby="matrix-overlays-heading"
        className="grid min-w-0 gap-3"
      >
        <h2 id="matrix-overlays-heading" className="text-section font-semibold">
          Portals and overlays
        </h2>
        <div className="flex min-w-0 flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Open review menu
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Review actions</DropdownMenuLabel>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    More review options
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Advanced review</DropdownMenuItem>
                    <DropdownMenuItem>Review history</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem>Open details</DropdownMenuItem>
                <DropdownMenuItem>Edit record</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                Delete record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>
              Open review popover
            </PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Review context</PopoverTitle>
              <PopoverDescription className="mt-1">
                Portaled content inherits the document theme and direction.
              </PopoverDescription>
              <PopoverClose
                render={<Button size="sm" variant="outline" className="mt-3" />}
              >
                Close popover
              </PopoverClose>
            </PopoverContent>
          </Popover>

          <TooltipProvider delay={0}>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" />}>
                Focus for help
              </TooltipTrigger>
              <TooltipContent>Direction-aware help</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Open review dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm review</DialogTitle>
                <DialogDescription>
                  Verify focus, surface, and close-control placement.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel review
                </DialogClose>
                <DialogClose render={<Button />}>Confirm review</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger render={<Button variant="outline" />}>
              Open review sheet
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Review details</SheetTitle>
                <SheetDescription>
                  The physical right-side API stays on the requested edge.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <p className="text-body text-foreground-secondary">
                  Logical content alignment follows the document direction.
                </p>
              </SheetBody>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>
                  Close review sheet
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <MatrixToastButton />
        </div>
      </section>

      <section
        aria-labelledby="matrix-navigation-heading"
        className="grid min-w-0 gap-3"
      >
        <h2
          id="matrix-navigation-heading"
          className="text-section font-semibold"
        >
          Directional navigation
        </h2>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#matrix-states-heading">
                Review
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Appearance</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#matrix-navigation-heading" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#matrix-navigation-heading" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#matrix-navigation-heading">
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#matrix-navigation-heading" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}

function ThemeDirectionReview() {
  return (
    <ToastProvider>
      <div
        data-slot="theme-direction-matrix"
        className="mx-auto w-80 max-w-full min-w-0 overflow-x-hidden bg-background text-foreground"
        style={{ contain: "layout paint" }}
      >
        <CrossPatternApplication constrained />
        <ThemeDirectionInteractionTray />
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}

const meta = {
  title: "Patterns/Cross-pattern application",
  component: CrossPatternApplication,
  parameters: {
    layout: "fullscreen",
    a11y: {
      test: "error",
      // Base UI popups use invisible focus sentinels to keep keyboard focus
      // inside the active surface. Axe treats those sentinels as hidden
      // focusable content, so only the sentinels are excluded from the audit.
      context: { exclude: ["[data-base-ui-focus-guard]"] },
    },
    docs: {
      description: {
        component:
          "Phase 5E integration recipe, not a new Luna export. It composes the public package API across shell, analytics, operations, detail, form, activity, and approval surfaces. The application owns navigation, data, filtering, validation, persistence, formatting, and authorization.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CrossPatternApplication>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AnalyticsOperationsReference: Story = {
  tags: ["phase6c-reference"],
  render: () => <CrossPatternApplication />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await expect(canvas.getAllByRole("banner")).toHaveLength(1);
    await expect(canvas.getAllByRole("main")).toHaveLength(1);
    await expect(
      canvas.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Review overview" }),
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelectorAll('[data-slot="kpi-card"]'),
    ).toHaveLength(3);
    await expect(canvas.getByRole("figure")).toBeInTheDocument();
    await expect(
      canvas.getByRole("table", { name: "Operational review records" }),
    ).toBeInTheDocument();

    const filter = canvas.getByRole("button", { name: "Status" });
    await userEvent.click(filter);
    await expect(
      page.getByRole("group", { name: "Status" }),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        page.queryByRole("group", { name: "Status" }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(filter).toHaveFocus());
  },
};

export const OverviewDetailEditFlow: Story = {
  tags: ["phase6c-reference"],
  render: () => <CrossPatternApplication />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const main = canvas.getByRole("main");

    await userEvent.click(
      canvas.getByRole("link", { name: "View details for REQ-2042" }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("heading", { level: 1, name: "Aster Labs" }),
      ).toBeInTheDocument(),
    );
    await waitFor(() => expect(main).toHaveFocus());

    await userEvent.click(canvas.getByRole("button", { name: "Edit record" }));
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Edit record" }),
    ).toBeInTheDocument();
    // Navigation moves focus to <main> in the next animation frame. Wait for
    // it before typing; WebKit can run that frame mid-typing and send the
    // remaining keystrokes to <main> instead of the field.
    await waitFor(() => expect(main).toHaveFocus());

    const name = canvas.getByRole("textbox", { name: /Organization name/ });
    await userEvent.clear(name);
    await userEvent.type(name, "Aster Labs International");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(
        canvas.getByRole("heading", {
          level: 1,
          name: "Aster Labs International",
        }),
      ).toBeInTheDocument(),
    );
    // announce() clears the live region and sets the message in the next
    // animation frame, so the message can land after the heading renders.
    await waitFor(() =>
      expect(
        canvas.getByText("Changes saved. Record details opened."),
      ).toBeInTheDocument(),
    );
  },
};

export const ValidationErrors: Story = {
  render: () => <CrossPatternApplication initialView="edit" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: /Organization name/ });
    const email = canvas.getByRole("textbox", { name: /Email address/ });

    await userEvent.clear(name);
    await userEvent.clear(email);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await expect(
      canvas.getByText("Enter the record name."),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("Enter a complete email address."),
    ).toBeInTheDocument();
    await waitFor(() => expect(name).toHaveFocus());
  },
};

export const LoadingOverview: Story = {
  render: () => <CrossPatternApplication initialStatus="loading" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("searchbox", { name: "Search records" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("table", { name: "Operational review records" }),
    ).toHaveAttribute("aria-busy", "true");
    await expect(
      canvas.getByText("Loading review volume", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  },
};

export const EmptyOverview: Story = {
  render: () => <CrossPatternApplication initialStatus="empty" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No review volume")).toBeInTheDocument();
    await expect(canvas.getByText("No records yet")).toBeInTheDocument();
  },
};

export const UnavailableOverview: Story = {
  render: () => <CrossPatternApplication initialStatus="unavailable" />,
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Workspace data unavailable",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("rowheader", { name: /REQ-2042/ }),
      ).toBeInTheDocument(),
    );
    // The announcement is set in the next animation frame (see announce()).
    await waitFor(() =>
      expect(canvas.getByText("Workspace data loaded.")).toBeInTheDocument(),
    );
  },
};

export const NarrowViewport: Story = {
  tags: ["phase6c-reference", "phase6c-narrow"],
  render: () => <CrossPatternApplication constrained />,
  parameters: {
    docs: {
      description: {
        story:
          "A 320 px application boundary verifies shell, dashboard, table, detail, and edit composition without page-level overflow. The table keeps its own labelled horizontal scroll region.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="cross-pattern-application"]',
    );
    const main = canvas.getByRole("main");
    const tableContainer = canvasElement.querySelector<HTMLElement>(
      '[data-slot="data-table-container"]',
    );

    await expect(root).not.toBeNull();
    await expect(root!.scrollWidth).toBeLessThanOrEqual(root!.clientWidth);
    await expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
    await expect(tableContainer).not.toBeNull();
    await expect(tableContainer!.scrollWidth).toBeGreaterThanOrEqual(
      tableContainer!.clientWidth,
    );

    await userEvent.click(
      canvas.getByRole("link", { name: "View details for REQ-2042" }),
    );
    await expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
    await userEvent.click(canvas.getByRole("button", { name: "Edit record" }));
    await expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth);
    await expect(
      canvas.getByRole("button", { name: "Save changes" }),
    ).toBeVisible();
  },
};

const playThemeDirectionReview: NonNullable<Story["play"]> = async ({
  canvasElement,
  globals,
}) => {
  if (!shouldRunStoryPlay()) return;
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  const documentRoot = canvasElement.ownerDocument.documentElement;
  const matrix = canvasElement.querySelector<HTMLElement>(
    '[data-slot="theme-direction-matrix"]',
  );

  await expect(documentRoot).toHaveAttribute("data-theme", globals.theme);
  await expect(documentRoot).toHaveAttribute("dir", globals.direction);
  await expect(matrix).not.toBeNull();
  await expect(documentRoot.scrollWidth).toBeLessThanOrEqual(
    documentRoot.clientWidth,
  );
  await expect(canvas.getByRole("figure")).toBeInTheDocument();
  await expect(
    canvas.getByRole("table", { name: "Operational review records" }),
  ).toBeInTheDocument();
  await expect(canvas.getAllByRole("alert")).toHaveLength(4);
  await expect(
    canvas.getByRole("button", { name: "Focus for help" }),
  ).toBeInTheDocument();

  const defaultAction = canvas.getByRole("button", {
    name: "Default action",
  });
  await userEvent.hover(defaultAction);
  defaultAction.focus();
  await expect(defaultAction).toHaveFocus();
  await userEvent.click(defaultAction);

  const reviewSwitch = canvas.getByRole("switch", {
    name: "Send review notifications",
  });
  await expect(reviewSwitch).toHaveAttribute("aria-checked", "true");
  await userEvent.click(reviewSwitch);
  await expect(reviewSwitch).toHaveAttribute("aria-checked", "false");

  const selectTrigger = canvas.getByRole("combobox", {
    name: "Theme review status",
  });
  await userEvent.click(selectTrigger);
  await waitFor(() => expect(page.getByRole("listbox")).toBeVisible());
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(page.queryByRole("listbox")).toBeNull());
  await expect(selectTrigger).toHaveFocus();

  const searchableTrigger = canvas.getByRole("combobox", {
    name: "Theme review assignee",
  });
  await userEvent.click(searchableTrigger);
  const searchableInput = await waitFor(() => {
    const input = page.getByRole("combobox", {
      name: "Search theme review assignees",
    });
    expect(input).toBeVisible();
    return input;
  });
  await userEvent.type(searchableInput, "Priya");
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await waitFor(() =>
    expect(
      page.queryByRole("combobox", {
        name: "Search theme review assignees",
      }),
    ).toBeNull(),
  );
  await expect(searchableTrigger).toHaveTextContent("Priya Nair");

  const dateTrigger = canvas.getByRole("button", {
    name: "Theme review date",
  });
  await userEvent.click(dateTrigger);
  await waitFor(() => expect(page.getByRole("grid")).toBeVisible());
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(page.queryByRole("grid")).toBeNull());
  await expect(dateTrigger).toHaveFocus();

  const menuTrigger = canvas.getByRole("button", {
    name: "Open review menu",
  });
  await userEvent.click(menuTrigger);
  await waitFor(() => expect(page.getByRole("menu")).toBeVisible());
  const submenuTrigger = page.getByRole("menuitem", {
    name: "More review options",
  });
  submenuTrigger.focus();
  await userEvent.keyboard(
    globals.direction === "rtl" ? "{ArrowLeft}" : "{ArrowRight}",
  );
  await waitFor(() =>
    expect(
      page.getByRole("menuitem", { name: "Advanced review" }),
    ).toBeVisible(),
  );
  await userEvent.keyboard("{Escape}{Escape}");
  await waitFor(() => expect(page.queryByRole("menu")).toBeNull());
  await expect(menuTrigger).toHaveFocus();

  const popoverTrigger = canvas.getByRole("button", {
    name: "Open review popover",
  });
  await userEvent.click(popoverTrigger);
  await waitFor(() =>
    expect(page.getByRole("heading", { name: "Review context" })).toBeVisible(),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(page.queryByRole("heading", { name: "Review context" })).toBeNull(),
  );
  await expect(popoverTrigger).toHaveFocus();

  const dialogTrigger = canvas.getByRole("button", {
    name: "Open review dialog",
  });
  await userEvent.click(dialogTrigger);
  await waitFor(() =>
    expect(page.getByRole("dialog", { name: "Confirm review" })).toBeVisible(),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(page.queryByRole("dialog", { name: "Confirm review" })).toBeNull(),
  );
  await expect(dialogTrigger).toHaveFocus();

  const sheetTrigger = canvas.getByRole("button", {
    name: "Open review sheet",
  });
  await userEvent.click(sheetTrigger);
  await waitFor(() =>
    expect(page.getByRole("dialog", { name: "Review details" })).toBeVisible(),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() =>
    expect(page.queryByRole("dialog", { name: "Review details" })).toBeNull(),
  );
  await expect(sheetTrigger).toHaveFocus();

  await userEvent.click(
    canvas.getByRole("button", { name: "Show status toast" }),
  );
  await expect(page.getByText("Theme review saved")).toBeVisible();
  await expect(
    canvas.getByRole("navigation", { name: "pagination" }),
  ).toBeInTheDocument();
};

export const LightLtrMatrix: Story = {
  tags: ["phase6c-reference"],
  name: "Matrix · Light · LTR",
  globals: { theme: "light", direction: "ltr" },
  render: () => <ThemeDirectionReview />,
  play: playThemeDirectionReview,
};

export const LightRtlMatrix: Story = {
  tags: ["phase6c-reference"],
  name: "Matrix · Light · RTL",
  globals: { theme: "light", direction: "rtl" },
  render: () => <ThemeDirectionReview />,
  play: playThemeDirectionReview,
};

export const DarkLtrMatrix: Story = {
  tags: ["phase6c-reference"],
  name: "Matrix · Dark · LTR",
  globals: { theme: "dark", direction: "ltr" },
  render: () => <ThemeDirectionReview />,
  play: playThemeDirectionReview,
};

export const DarkRtlMatrix: Story = {
  tags: ["phase6c-reference"],
  name: "Matrix · Dark · RTL",
  globals: { theme: "dark", direction: "rtl" },
  render: () => <ThemeDirectionReview />,
  play: playThemeDirectionReview,
};
