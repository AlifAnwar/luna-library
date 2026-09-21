import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  CancelIcon,
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
} from "@withalif/luna";

const meta: Meta<typeof Alert> = {
  title: "Luna/Alert",
  component: Alert,
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
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Your changes are ready to review.</AlertDescription>
    </Alert>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert variant="info">
        <InfoIcon aria-hidden="true" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Review the details before continuing.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CheckCircleIcon aria-hidden="true" />
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes have been saved.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <WarningIcon aria-hidden="true" />
        <AlertTitle>Check this</AlertTitle>
        <AlertDescription>Some details need your attention.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CancelIcon aria-hidden="true" />
        <AlertTitle>Could not save</AlertTitle>
        <AlertDescription>Try again in a moment.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert variant="success" onClose={() => {}}>
        <CheckCircleIcon aria-hidden="true" />
        <AlertTitle>Payment Successful</AlertTitle>
        <AlertDescription>
          Your payment has been successfully received. You have unlocked
          premium service now.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive" onClose={() => {}}>
        <CancelIcon aria-hidden="true" />
        <AlertTitle>Payment Connection Failure</AlertTitle>
        <AlertDescription>
          We&apos;re encountering issues with processing your payment for
          your subscription.
        </AlertDescription>
      </Alert>
      <Alert variant="warning" onClose={() => {}}>
        <WarningIcon aria-hidden="true" />
        <AlertTitle>Time To Pay Up!</AlertTitle>
        <AlertDescription>
          You&apos;re adding admins to your team and this may cost you more
          than before.
        </AlertDescription>
      </Alert>
      <Alert variant="info" onClose={() => {}}>
        <InfoIcon aria-hidden="true" />
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription>
          New feature and improve have been added. Check them out
        </AlertDescription>
      </Alert>
    </div>
  ),
};
