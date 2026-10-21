// Shared data shapes for tasks, their priority values, and signed-in users.
export type Priority = 'Low' | 'Medium' | 'High';

export type Task = {
  _id: string;
  title: string;
  description: string;
  scheduledAt?: string;
  deadline?: string;
  priority: Priority;
  category: string;
  completed: boolean;
};

export type User = { id: string; name: string; email: string };
