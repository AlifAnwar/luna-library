import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  MultiSelect,
} from "@withalif/luna";

const skills = [
  { value: "analytics", label: "Analytics" },
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "support", label: "Support", disabled: true },
];

const meta: Meta<typeof MultiSelect> = {
  title: "Luna/Multi Select",
  component: MultiSelect,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Skills",
    items: skills,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(page.getByRole("combobox", { name: "Skills" }));
    await waitFor(() =>
      expect(page.getByRole("option", { name: "Analytics" })).toBeVisible(),
    );
    await userEvent.click(page.getByRole("option", { name: "Analytics" }));
    await expect(
      within(page.getByLabelText("Selected options")).getByText("Analytics"),
    ).toBeVisible();
  },
};

export const Preselected: Story = {
  args: { defaultValue: ["design", "engineering"] },
};

export const Disabled: Story = {
  args: {
    defaultValue: ["analytics", "finance"],
    disabled: true,
  },
};

export const Invalid: Story = {
  render: () => (
    <FormField invalid required>
      <FormLabel>Skills</FormLabel>
      <FormControl>
        <MultiSelect aria-label="Skills" items={skills} />
      </FormControl>
      <FormDescription>Select one or more relevant skills.</FormDescription>
      <FormMessage>Select at least one skill.</FormMessage>
    </FormField>
  ),
};
