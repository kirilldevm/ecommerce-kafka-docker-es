import { AuthFormError } from '@/components/auth/AuthFormError';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getDefaultRouteForRole, routes } from '@/config/routes.config';
import { useAuth } from '@/context/auth.context';
import {
  loginSchema,
  type LoginFormValues,
} from '@/services/auth/auth.validation';
import { useAuthStore } from '@/stores/auth/auth.store';
import type { LoginCredentials } from '@/types/auth.types';
import { Form, Formik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isSubmitting, error, clearError } = useAuth();

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-base font-semibold'>Sign in</h2>
        <p className='text-sm text-muted-foreground'>
          Use your account email and password
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          clearError();
          try {
            await login(values as LoginCredentials);
            const role = useAuthStore.getState().user?.role;
            navigate(getDefaultRouteForRole(role === 'ADMIN'), {
              replace: true,
            });
          } catch {
            // Error is stored in auth store
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting: formSubmitting,
        }) => (
          <Form className='space-y-4'>
            <AuthFormError message={error} />

            <FieldGroup>
              <Field data-invalid={Boolean(touched.email && errors.email)}>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  placeholder='you@example.com'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(touched.email && errors.email)}
                />
                <FieldError>{touched.email && errors.email}</FieldError>
              </Field>

              <Field
                data-invalid={Boolean(touched.password && errors.password)}
              >
                <FieldLabel htmlFor='password'>Password</FieldLabel>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  placeholder='••••••••'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(touched.password && errors.password)}
                />
                <FieldError>{touched.password && errors.password}</FieldError>
              </Field>
            </FieldGroup>

            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting || formSubmitting}
            >
              {isSubmitting || formSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>
        )}
      </Formik>

      <p className='text-center text-sm text-muted-foreground'>
        No account?{' '}
        <Link
          to={routes.register}
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
