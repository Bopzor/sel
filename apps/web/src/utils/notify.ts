import { toast } from 'solid-toast';

export const notify = {
  success: (message: string) => toast.success(message),
};
