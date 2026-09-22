import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetSide,
} from "@withalif/luna";

const meta: Meta<typeof Sheet> = {
  title: "Luna/Sheet & Drawer",
  component: Sheet,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

function SheetExample({ side = "right" }: { side?: SheetSide }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open {side} sheet
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Panel details</SheetTitle>
          <SheetDescription>
            Review contextual information without leaving the current page.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="text-body text-foreground-secondary">
            Sheet content belongs to the consuming application and can contain
            forms, summaries, or secondary actions.
          </p>
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          <SheetClose render={<Button />}>Save changes</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const Right: Story = {
  render: () => <SheetExample />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      page.getByRole("button", { name: "Open right sheet" }),
    );
    const dialog = page.getByRole("dialog", { name: "Panel details" });
    await expect(dialog).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Close panel" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const Left: Story = {
  render: () => <SheetExample side="left" />,
};

export const Bottom: Story = {
  render: () => <SheetExample side="bottom" />,
};

export const DrawerExample: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open drawer
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Review changes</DrawerTitle>
          <DrawerDescription>
            Confirm the information before continuing.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-body text-foreground-secondary">
            Drawers use the bottom edge for compact and mobile-friendly
            secondary surfaces.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
          <DrawerClose render={<Button />}>Continue</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
