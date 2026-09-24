import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TrendIndicator } from "@withalif/luna";

const meta = {
  title: "Luna/TrendIndicator",
  component: TrendIndicator,
  args: { direction: "up", value: "12.4%" },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof TrendIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { direction: "up", value: "12.4%" },
};

export const Directions: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <TrendIndicator direction="up" value="12.4%" />
      <TrendIndicator direction="down" value="3.2%" />
      <TrendIndicator direction="neutral" value="0.0%" />
    </div>
  ),
};

export const SemanticTones: Story = {
  render: () => (
    <div className="flex max-w-md flex-wrap items-center gap-3">
      <TrendIndicator
        direction="up"
        value="8.1%"
        tone="success"
        toneLabel="Favorable"
      />
      <TrendIndicator
        direction="up"
        value="6.8%"
        tone="danger"
        toneLabel="Unfavorable"
      />
      <TrendIndicator
        direction="neutral"
        value="0.0%"
        tone="info"
        toneLabel="On target"
      />
    </div>
  ),
};

export const LocalizedDirection: Story = {
  args: {
    direction: "down",
    directionLabel: "Menurun",
    value: "4,7%",
    label: "dibanding bulan lalu",
  },
};
