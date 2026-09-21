import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarFallback, AvatarImage } from "@withalif/luna";

const avatarImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23dcebff'/%3E%3Ccircle cx='40' cy='30' r='15' fill='%230065f4'/%3E%3Cpath d='M11 80c1-17 12-27 29-27s28 10 29 27' fill='%230065f4'/%3E%3C/svg%3E";

const meta = {
  title: "Luna/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: () => (
    <Avatar aria-label="Alex Morgan">
      <AvatarImage src={avatarImage} alt="Alex Morgan" />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar aria-label="Alex Morgan">
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="sm" aria-label="Small avatar">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar aria-label="Default avatar">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg" aria-label="Large avatar">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};
