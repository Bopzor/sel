import { yup } from '../../../common/yup';

export const editRequestBody = yup.object({
  title: yup.string().required(),
  description: yup.string().required(),
});

export type EditRequestBody = yup.InferType<typeof editRequestBody>;
