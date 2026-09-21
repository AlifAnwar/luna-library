import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Checkbox,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@withalif/luna";

const meta: Meta<typeof FormField> = {
  title: "Luna/Form Field",
  component: FormField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
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
  render: () => (
    <FormField>
      <FormLabel>Email address</FormLabel>
      <FormControl>
        <Input type="email" placeholder="name@company.com" />
      </FormControl>
    </FormField>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <FormField>
      <FormLabel>Reference code</FormLabel>
      <FormControl>
        <Input placeholder="INV-001" />
      </FormControl>
      <FormDescription>Use the code shown on your invoice.</FormDescription>
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField required>
      <FormLabel>Email address</FormLabel>
      <FormControl>
        <Input type="email" />
      </FormControl>
      <FormDescription>This field is required.</FormDescription>
    </FormField>
  ),
};

export const Invalid: Story = {
  render: () => (
    <FormField invalid>
      <FormLabel>Email address</FormLabel>
      <FormControl>
        <Input type="email" defaultValue="not-an-email" />
      </FormControl>
      <FormDescription>Enter your company email.</FormDescription>
      <FormMessage>Enter a valid email address.</FormMessage>
    </FormField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormField disabled>
      <FormLabel>Reference code</FormLabel>
      <FormControl>
        <Input defaultValue="INV-001" />
      </FormControl>
      <FormDescription>This value cannot be edited.</FormDescription>
    </FormField>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <FormField>
      <FormLabel>Notes</FormLabel>
      <FormControl>
        <Textarea placeholder="Add supporting notes" />
      </FormControl>
      <FormDescription>Keep the notes concise and actionable.</FormDescription>
    </FormField>
  ),
};

const priorities = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const WithSelect: Story = {
  render: () => (
    <FormField required>
      <FormLabel>Priority</FormLabel>
      <Select items={priorities}>
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <FormDescription>Choose the appropriate urgency.</FormDescription>
    </FormField>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <FormField required>
      <div className="flex items-center gap-2">
        <FormControl>
          <Checkbox />
        </FormControl>
        <FormLabel>Accept the usage policy</FormLabel>
      </div>
      <FormDescription>Required before continuing.</FormDescription>
    </FormField>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <FormField>
      <FormLabel>Notification frequency</FormLabel>
      <FormControl>
        <RadioGroup defaultValue="weekly" name="notification-frequency">
          <label className="flex items-center gap-2 text-body">
            <RadioGroupItem value="daily" />
            Daily
          </label>
          <label className="flex items-center gap-2 text-body">
            <RadioGroupItem value="weekly" />
            Weekly
          </label>
        </RadioGroup>
      </FormControl>
      <FormDescription>Controls how often summaries are sent.</FormDescription>
    </FormField>
  ),
};

export const WithSwitch: Story = {
  render: () => (
    <FormField>
      <div className="flex items-center justify-between gap-4">
        <FormLabel>Enable notifications</FormLabel>
        <FormControl>
          <Switch defaultChecked />
        </FormControl>
      </div>
      <FormDescription>Receive updates when records change.</FormDescription>
    </FormField>
  ),
};

export const EmptyMessage: Story = {
  render: () => (
    <FormField>
      <FormLabel>Display name</FormLabel>
      <FormControl>
        <Input />
      </FormControl>
      <FormMessage>{undefined}</FormMessage>
    </FormField>
  ),
};
