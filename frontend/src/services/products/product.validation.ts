import * as Yup from 'yup';

export const productFormSchema = Yup.object({
  name: Yup.string().trim().required('Name is required'),
  description: Yup.string().nullable(),
  price: Yup.number()
    .typeError('Price must be a number')
    .min(0, 'Price must be non-negative')
    .required('Price is required'),
  stock: Yup.number()
    .typeError('Stock must be a number')
    .integer('Stock must be an integer')
    .min(0, 'Stock must be non-negative')
    .required('Stock is required'),
});

export type ProductFormValues = Yup.InferType<typeof productFormSchema>;

export const initialProductFormValues: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
};

