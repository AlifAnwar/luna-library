import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  Combobox,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@withalif/luna";

const offices = [
  { value: "jakarta", label: "Jakarta" },
  { value: "bandung", label: "Bandung" },
  { value: "surabaya", label: "Surabaya" },
  { value: "singapore", label: "Singapore" },
  { value: "bangkok", label: "Bangkok" },
  { value: "tokyo", label: "Tokyo", disabled: true },
];

const meta: Meta<typeof Combobox> = {
  title: "Luna/Combobox",
  component: Combobox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Office location",
    items: offices,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["phase6c-reference"],
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      page.getByRole("combobox", { name: "Office location" }),
    );
    await waitFor(() =>
      expect(page.getByRole("option", { name: "Jakarta" })).toBeVisible(),
    );
    await userEvent.click(page.getByRole("option", { name: "Jakarta" }));
    await expect(
      page.getByRole("combobox", { name: "Office location" }),
    ).toHaveTextContent("Jakarta");
    await waitFor(() =>
      expect(page.queryByRole("listbox")).not.toBeInTheDocument(),
    );
  },
};

export const Preselected: Story = {
  args: { defaultValue: "jakarta" },
};

export const CustomCopy: Story = {
  args: {
    emptyText: "No matching locations.",
    placeholder: "Choose a location",
    searchLabel: "Filter office locations",
    searchPlaceholder: "Type a city...",
  },
};

export const Disabled: Story = {
  args: { defaultValue: "bandung", disabled: true },
};

export const Invalid: Story = {
  render: () => (
    <FormField invalid required>
      <FormLabel>Office location</FormLabel>
      <FormControl>
        <Combobox aria-label="Office location" items={offices} />
      </FormControl>
      <FormDescription>Select the office closest to you.</FormDescription>
      <FormMessage>Choose an office location.</FormMessage>
    </FormField>
  ),
};
