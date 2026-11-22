import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@withalif/luna";

const meta = {
  title: "Luna/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["phase6c-reference"],
  render: () => (
    <TooltipProvider delay={100}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>
          Hover or focus
        </TooltipTrigger>
        <TooltipContent>Helpful context</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
