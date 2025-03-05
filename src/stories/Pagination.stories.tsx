import type { Meta, StoryObj } from '@storybook/react';
import Pagination from '@/components/Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    totalPages: {
      control: { type: 'number' },
      description: 'The total number of pages.',
    },
    currentPage: {
      control: { type: 'number' },
      description: 'The current active page.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    totalPages: 10,
    currentPage: 1,
  },
};

export const MiddlePage: Story = {
  args: {
    totalPages: 10,
    currentPage: 5,
  },
};

export const LastPage: Story = {
  args: {
    totalPages: 10,
    currentPage: 10,
  },
};

export const FewPages: Story = {
    args: {
      totalPages: 3,
      currentPage: 2,
    },
  };
