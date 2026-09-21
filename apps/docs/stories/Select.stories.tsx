import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SearchableSelect,
} from "@withalif/luna";

const statuses = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
};

const meta: Meta<typeof Select> = {
  title: "Luna/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="active" items={statuses}>
      <SelectTrigger aria-label="Status" className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="paused">Paused</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Placeholder: Story = {
  render: () => (
    <Select items={statuses}>
      <SelectTrigger aria-label="Status" className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="paused">Paused</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select
      items={{
        jakarta: "Jakarta",
        bandung: "Bandung",
        singapore: "Singapore",
        bangkok: "Bangkok",
      }}
    >
      <SelectTrigger aria-label="Office location" className="w-full">
        <SelectValue placeholder="Choose an office" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Indonesia</SelectLabel>
          <SelectItem value="jakarta">Jakarta</SelectItem>
          <SelectItem value="bandung">Bandung</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Other locations</SelectLabel>
          <SelectItem value="singapore">Singapore</SelectItem>
          <SelectItem value="bangkok">Bangkok</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select defaultValue="active" items={statuses} disabled>
      <SelectTrigger aria-label="Status" className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="active">Active</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const LongList: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Page size" className="w-full">
        <SelectValue placeholder="Choose an option" />
      </SelectTrigger>
      <SelectContent style={{ maxHeight: 224 }}>
        {Array.from({ length: 30 }, (_, index) => (
          <SelectItem key={index} value={`option-${index + 1}`}>
            Option {index + 1}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6 }}>
      <Select items={statuses}>
        <SelectTrigger
          aria-label="Status"
          aria-invalid="true"
          aria-describedby="select-status-error"
          className="w-full"
        >
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
        </SelectContent>
      </Select>
      <span
        id="select-status-error"
        style={{ color: "var(--destructive)", fontSize: 13 }}
      >
        Choose a status.
      </span>
    </div>
  ),
};

export const Searchable: Story = {
  render: () => (
    <SearchableSelect
      aria-label="Office location"
      placeholder="Choose an office"
      searchPlaceholder="Search office..."
      items={[
        { value: "jakarta", label: "Jakarta" },
        { value: "bandung", label: "Bandung" },
        { value: "surabaya", label: "Surabaya" },
        { value: "singapore", label: "Singapore" },
        { value: "bangkok", label: "Bangkok" },
        { value: "tokyo", label: "Tokyo", disabled: true },
      ]}
    />
  ),
};
