import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CalendarIcon,
  CheckCircleIcon,
  FileIcon,
  SettingsIcon,
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperStepLabel,
  StepperTitle,
} from "@withalif/luna";

const meta: Meta<typeof Stepper> = {
  title: "Luna/Stepper",
  component: Stepper,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    currentStep: 1,
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Stepper currentStep={1} className="max-w-2xl">
      <StepperItem step={0}>
        <StepperIndicator />
        <StepperTitle>Account</StepperTitle>
        <StepperDescription>Create your account</StepperDescription>
      </StepperItem>
      <StepperSeparator step={0} />
      <StepperItem step={1}>
        <StepperIndicator />
        <StepperTitle>Profile</StepperTitle>
        <StepperDescription>Add your details</StepperDescription>
      </StepperItem>
      <StepperSeparator step={1} />
      <StepperItem step={2}>
        <StepperIndicator />
        <StepperTitle>Preferences</StepperTitle>
        <StepperDescription>Configure settings</StepperDescription>
      </StepperItem>
      <StepperSeparator step={2} />
      <StepperItem step={3}>
        <StepperIndicator />
        <StepperTitle>Review</StepperTitle>
        <StepperDescription>Confirm and finish</StepperDescription>
      </StepperItem>
    </Stepper>
  ),
};

export const WithStepLabel: Story = {
  name: "With step label + icon",
  render: () => (
    <Stepper currentStep={1} className="max-w-2xl">
      <StepperItem step={0}>
        <StepperIndicator>
          <CheckCircleIcon className="size-4" aria-hidden="true" />
        </StepperIndicator>
        <StepperStepLabel>Step 1</StepperStepLabel>
        <StepperTitle>Getting Started</StepperTitle>
      </StepperItem>
      <StepperSeparator step={0} />
      <StepperItem step={1}>
        <StepperIndicator>
          <FileIcon className="size-4" aria-hidden="true" />
        </StepperIndicator>
        <StepperStepLabel>Step 2</StepperStepLabel>
        <StepperTitle>Basic Information</StepperTitle>
      </StepperItem>
      <StepperSeparator step={1} />
      <StepperItem step={2}>
        <StepperIndicator>
          <SettingsIcon className="size-4" aria-hidden="true" />
        </StepperIndicator>
        <StepperStepLabel>Step 3</StepperStepLabel>
        <StepperTitle>Preferences</StepperTitle>
      </StepperItem>
      <StepperSeparator step={2} />
      <StepperItem step={3}>
        <StepperIndicator>
          <CalendarIcon className="size-4" aria-hidden="true" />
        </StepperIndicator>
        <StepperStepLabel>Step 4</StepperStepLabel>
        <StepperTitle>Confirmation</StepperTitle>
      </StepperItem>
    </Stepper>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Stepper currentStep={1} orientation="vertical" className="max-w-xs">
      <StepperItem step={0}>
        <StepperIndicator />
        <div className="flex flex-col">
          <StepperTitle>Account</StepperTitle>
          <StepperDescription>Create your account</StepperDescription>
        </div>
      </StepperItem>
      <StepperSeparator step={0} />
      <StepperItem step={1}>
        <StepperIndicator />
        <div className="flex flex-col">
          <StepperTitle>Profile</StepperTitle>
          <StepperDescription>Add your details</StepperDescription>
        </div>
      </StepperItem>
      <StepperSeparator step={1} />
      <StepperItem step={2}>
        <StepperIndicator />
        <div className="flex flex-col">
          <StepperTitle>Review</StepperTitle>
          <StepperDescription>Confirm and finish</StepperDescription>
        </div>
      </StepperItem>
    </Stepper>
  ),
};
