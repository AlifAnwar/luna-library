import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@withalif/luna";

const meta = {
  title: "Luna/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderHeading>Settings</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your account preferences and workspace configuration.
        </PageHeaderDescription>
      </PageHeaderContent>
    </PageHeader>
  ),
};

export const WithBreadcrumbAndActions: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageHeaderHeading>Settings</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your account preferences and workspace configuration.
        </PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </PageHeaderActions>
    </PageHeader>
  ),
};
