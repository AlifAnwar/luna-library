import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  DatePicker,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@withalif/luna";

const meta: Meta<typeof DatePicker> = {
  title: "Luna/Date Picker",
  component: DatePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Select date",
    onValueChange: () => undefined,
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

function ControlledDatePicker({ initialValue }: { initialValue?: Date }) {
  const [value, setValue] = React.useState<Date | undefined>(initialValue);

  return (
    <DatePicker
      aria-label="Select date"
      value={value}
      onValueChange={setValue}
      calendarProps={{ defaultMonth: new Date(2026, 8, 1) }}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledDatePicker />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = page.getByRole("button", { name: "Select date" });

    await userEvent.click(trigger);
    const grid = page.getByRole("grid");
    await waitFor(() => expect(grid).toBeVisible());
    await userEvent.click(
      within(grid).getByRole("button", { name: /September 15/ }),
    );
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(trigger).toHaveTextContent("Sep 15, 2026");
  },
};

export const Selected: Story = {
  render: () => <ControlledDatePicker initialValue={new Date(2026, 8, 21)} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: new Date(2026, 8, 21),
  },
};

function InvalidDatePicker() {
  const [value, setValue] = React.useState<Date | undefined>();

  return (
    <FormField invalid required>
      <FormLabel>Effective date</FormLabel>
      <FormControl>
        <DatePicker
          aria-label="Effective date"
          value={value}
          onValueChange={setValue}
        />
      </FormControl>
      <FormDescription>Choose when this change takes effect.</FormDescription>
      <FormMessage>An effective date is required.</FormMessage>
    </FormField>
  );
}

export const Invalid: Story = {
  render: () => <InvalidDatePicker />,
};

export const RestrictedDates: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date | undefined>();

    return (
      <DatePicker
        aria-label="Select a weekday"
        value={value}
        onValueChange={setValue}
        calendarProps={{ disabled: { dayOfWeek: [0, 6] } }}
      />
    );
  },
};
