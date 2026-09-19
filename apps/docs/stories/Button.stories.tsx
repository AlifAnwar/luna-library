import {
  Add01Icon,
  ArrowRight01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@withalif/luna";

const meta = {
  title: "Luna/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button>
        <HugeiconsIcon
          icon={Add01Icon}
          data-icon="inline-start"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        Create record
      </Button>
      <Button variant="outline">
        View details
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          data-icon="inline-end"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    variant: "outline",
    "aria-label": "Search records",
    children: (
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    ),
  },
};

export const Loading: Story = {
  args: {
    children: "Saving changes",
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Unavailable",
    disabled: true,
  },
};
