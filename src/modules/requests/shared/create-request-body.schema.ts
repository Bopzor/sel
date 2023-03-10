import { yup } from '../../../common/yup';

export const createRequestBody = yup.object({
  id: yup.string().required(),
  title: yup.string().required(),
  description: yup.string().required(),
});

export type CreateRequestBody = yup.InferType<typeof createRequestBody>;
