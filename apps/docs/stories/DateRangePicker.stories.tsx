import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  DateRangePicker,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  type DateRange,
} from "@withalif/luna";

const meta: Meta<typeof DateRangePicker> = {
  title: "Luna/Date Range Picker",
  component: DateRangePicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    "aria-label": "Select date range",
    onValueChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledDateRangePicker({
  initialValue,
}: {
  initialValue?: DateRange;
}) {
  const [value, setValue] = React.useState<DateRange | undefined>(initialValue);

  return (
    <DateRangePicker
      aria-label="Select date range"
      value={value}
      onValueChange={setValue}
      calendarProps={{ defaultMonth: new Date(2026, 8, 1) }}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledDateRangePicker />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = page.getByRole("button", { name: "Select date range" });

    await userEvent.click(trigger);
    await waitFor(() => {
      const grids = page.getAllByRole("grid");
      expect(grids).toHaveLength(1);
      expect(grids[0]).toBeVisible();
    });
    const [firstGrid] = page.getAllByRole("grid");
    if (!firstGrid) {
      throw new Error("Expected the first calendar grid to be rendered.");
    }
    await userEvent.click(
      within(firstGrid).getByRole("button", { name: /September 15/ }),
    );
    await userEvent.click(
      within(firstGrid).getByRole("button", { name: /September 20/ }),
    );
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    await waitFor(() =>
      expect(page.queryByRole("grid")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveTextContent("15 – 20 Sep 26");
  },
};

export const Selected: Story = {
  render: () => (
    <ControlledDateRangePicker
      initialValue={{
        from: new Date(2026, 8, 21),
        to: new Date(2026, 8, 28),
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = page.getByRole("button", { name: "Select date range" });

    await expect(trigger).toHaveTextContent("21 – 28 Sep 26");
    await userEvent.click(
      page.getByRole("button", { name: "Clear date range" }),
    );
    await expect(trigger).toHaveTextContent("Select a date range");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: {
      from: new Date(2026, 8, 21),
      to: new Date(2026, 8, 28),
    },
  },
};

function InvalidDateRangePicker() {
  const [value, setValue] = React.useState<DateRange | undefined>();

  return (
    <FormField invalid required>
      <FormLabel>Reporting period</FormLabel>
      <FormControl>
        <DateRangePicker
          aria-label="Reporting period"
          value={value}
          onValueChange={setValue}
        />
      </FormControl>
      <FormDescription>Select the start and end dates.</FormDescription>
      <FormMessage>A reporting period is required.</FormMessage>
    </FormField>
  );
}

export const Invalid: Story = {
  render: () => <InvalidDateRangePicker />,
};

export const TwoMonths: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange | undefined>();

    return (
      <DateRangePicker
        aria-label="Select date range"
        value={value}
        onValueChange={setValue}
        calendarProps={{ numberOfMonths: 2 }}
      />
    );
  },
};
