import * as yup from 'yup';

yup.setLocale({
  mixed: {
    default: 'default',
    required: 'required',
  },
});

export { yup };
