import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@withalif/luna";

const meta = {
  title: "Luna/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Workspace settings</CardTitle>
        <CardDescription>Manage how your team works together.</CardDescription>
      </CardHeader>
      <CardContent>Members can update shared resources.</CardContent>
      <CardFooter>
        <Button size="sm">Save changes</Button>
      </CardFooter>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card size="sm" className="w-64">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Updated just now</CardDescription>
      </CardHeader>
      <CardContent>3 new updates</CardContent>
    </Card>
  ),
};
