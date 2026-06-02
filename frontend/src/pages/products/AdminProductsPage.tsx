import { AuthFormError } from '@/components/auth/AuthFormError';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/format-price';
import { getApiErrorMessage } from '@/lib/api-error';
import { productService } from '@/services/products/product.service';
import {
  initialProductFormValues,
  productFormSchema,
  type ProductFormValues,
} from '@/services/products/product.validation';
import type { Product } from '@/types/product.types';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

function ProductFormFields({ submitLabel }: { submitLabel: string }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Field as={Input} id="name" name="name" />
          <ErrorMessage name="name" component="p" className="text-xs text-destructive" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <Field
            as="textarea"
            id="description"
            name="description"
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
          />
          <ErrorMessage name="description" component="p" className="text-xs text-destructive" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="price">
            Price
          </label>
          <Field as={Input} id="price" name="price" type="number" step="0.01" min="0" />
          <ErrorMessage name="price" component="p" className="text-xs text-destructive" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="stock">
            Stock
          </label>
          <Field as={Input} id="stock" name="stock" type="number" min="0" step="1" />
          <ErrorMessage name="stock" component="p" className="text-xs text-destructive" />
        </div>
      </div>

      <Button type="submit">{submitLabel}</Button>
    </>
  );
}

function toFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? '',
    price: Number(product.price),
    stock: product.stock,
  };
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await productService.listProducts();
      setProducts(list);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Failed to load products'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create, edit, and delete products in the catalog.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add new product</CardTitle>
          <CardDescription>New products are available in shop and search after save.</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialProductFormValues}
            validationSchema={productFormSchema}
            onSubmit={async (values, { resetForm, setSubmitting }) => {
              setActionError(null);
              try {
                await productService.createProduct({
                  name: values.name.trim(),
                  description: values.description?.trim() || undefined,
                  price: Number(values.price),
                  stock: Number(values.stock),
                });
                resetForm();
                await loadProducts();
              } catch (error) {
                setActionError(getApiErrorMessage(error, 'Failed to create product'));
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <ProductFormFields submitLabel={isSubmitting ? 'Creating...' : 'Create product'} />
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      <AuthFormError message={actionError} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Catalog</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadProducts()}>
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">Loading products...</CardContent>
          </Card>
        ) : loadError ? (
          <Card>
            <CardContent className="pt-6">
              <AuthFormError message={loadError} />
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">No products yet.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => {
              const isEditing = editingId === product.id;

              return (
                <Card key={product.id}>
                  <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>
                        {formatPrice(product.price)} · Stock: {product.stock}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(isEditing ? null : product.id)}
                      >
                        <Pencil className="size-4" />
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          const ok = window.confirm(`Delete "${product.name}"?`);
                          if (!ok) {
                            return;
                          }

                          setActionError(null);
                          try {
                            await productService.deleteProduct(product.id);
                            if (editingId === product.id) {
                              setEditingId(null);
                            }
                            await loadProducts();
                          } catch (error) {
                            setActionError(getApiErrorMessage(error, 'Failed to delete product'));
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </CardHeader>

                  {!isEditing ? (
                    <CardContent className="text-sm text-muted-foreground">
                      {product.description || 'No description'}
                    </CardContent>
                  ) : (
                    <CardContent>
                      <Formik
                        initialValues={toFormValues(product)}
                        enableReinitialize
                        validationSchema={productFormSchema}
                        onSubmit={async (values, { setSubmitting }) => {
                          setActionError(null);
                          try {
                            await productService.updateProduct(product.id, {
                              name: values.name.trim(),
                              description: values.description?.trim() || null,
                              price: Number(values.price),
                              stock: Number(values.stock),
                            });
                            setEditingId(null);
                            await loadProducts();
                          } catch (error) {
                            setActionError(getApiErrorMessage(error, 'Failed to update product'));
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                      >
                        {({ isSubmitting }) => (
                          <Form className="space-y-4">
                            <ProductFormFields
                              submitLabel={isSubmitting ? 'Saving...' : 'Save changes'}
                            />
                          </Form>
                        )}
                      </Formik>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

