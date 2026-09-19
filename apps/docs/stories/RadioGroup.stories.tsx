import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RadioGroup, RadioGroupItem } from "@withalif/luna";

const meta = {
  title: "Luna/Radio Group",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <div id="plan-label" className="mb-3 text-label font-medium">
        Plan
      </div>
      <RadioGroup
        aria-labelledby="plan-label"
        name="plan"
        defaultValue="standard"
      >
        <label className="flex items-center gap-2 text-body">
          <RadioGroupItem value="basic" />
          Basic
        </label>
        <label className="flex items-center gap-2 text-body">
          <RadioGroupItem value="standard" />
          Standard
        </label>
        <label className="flex items-center gap-2 text-body">
          <RadioGroupItem value="premium" />
          Premium
        </label>
      </RadioGroup>
    </div>
  ),
};

export const Unselected: Story = {
  render: () => (
    <RadioGroup aria-label="Notification frequency" name="frequency">
      <label className="flex items-center gap-2 text-body">
        <RadioGroupItem value="daily" />
        Daily
      </label>
      <label className="flex items-center gap-2 text-body">
        <RadioGroupItem value="weekly" />
        Weekly
      </label>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup
      aria-label="Locked plan"
      name="locked-plan"
      defaultValue="standard"
      disabled
    >
      <label className="flex items-center gap-2 text-body text-muted-foreground">
        <RadioGroupItem value="basic" />
        Basic
      </label>
      <label className="flex items-center gap-2 text-body text-muted-foreground">
        <RadioGroupItem value="standard" />
        Standard
      </label>
    </RadioGroup>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <RadioGroup
      aria-label="Delivery speed"
      name="delivery"
      defaultValue="regular"
    >
      <label className="flex items-center gap-2 text-body">
        <RadioGroupItem value="regular" />
        Regular
      </label>
      <label className="flex items-center gap-2 text-body text-muted-foreground">
        <RadioGroupItem value="express" disabled />
        Express unavailable
      </label>
    </RadioGroup>
  ),
};
