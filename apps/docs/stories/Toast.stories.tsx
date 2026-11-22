import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, ToastProvider, ToastViewport, useToast } from "@withalif/luna";

const meta = {
  title: "Luna/Toast",
  component: ToastViewport,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ToastViewport>;
export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: "Information",
            description: "Your workspace is ready.",
            type: "info",
          })
        }
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: "Saved",
            description: "Your changes have been saved.",
            type: "success",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: "Check this",
            description: "Some details need attention.",
            type: "warning",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: "Could not save",
            description: "Please try again.",
            type: "destructive",
            priority: "high",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const id = toast.add({
            title: "Draft saved",
            description: "You can undo this action.",
            type: "success",
            actionProps: { children: "Undo", onClick: () => toast.close(id) },
          });
        }}
      >
        With action
      </Button>
    </div>
  );
}

export const Default: Story = {
  tags: ["phase6c-reference"],
  render: () => (
    <ToastProvider>
      <ToastDemo />
      <ToastViewport />
    </ToastProvider>
  ),
};
