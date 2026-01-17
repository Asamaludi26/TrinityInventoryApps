/**
 * useZodForm - React Hook Form with Zod Integration
 *
 * A custom hook that combines React Hook Form with Zod validation.
 * Provides type-safe form handling with automatic validation.
 */

import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodSchema } from "zod";

/**
 * Custom hook that creates a form instance with Zod schema validation
 *
 * @template TSchema - The Zod schema type
 * @param schema - The Zod schema to validate against
 * @param options - Additional React Hook Form options
 * @returns A React Hook Form instance with type inference from the Zod schema
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * function LoginForm() {
 *   const form = useZodForm(schema, {
 *     defaultValues: { email: '', password: '' },
 *   });
 *
 *   const onSubmit = form.handleSubmit((data) => {
 *     // data is fully typed as { email: string; password: string }
 *     console.log(data);
 *   });
 *
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <input {...form.register('email')} />
 *       {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
 *       ...
 *     </form>
 *   );
 * }
 * ```
 */
export function useZodForm<TFieldValues extends FieldValues>(
  schema: ZodSchema<TFieldValues>,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">,
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: "onBlur",
    reValidateMode: "onChange",
    ...options,
  });
}

/**
 * Form field error helper
 * Extracts error message from React Hook Form field state
 */
export function getFieldError(
  errors: Record<string, { message?: string } | undefined>,
  fieldName: string,
): string | undefined {
  return errors[fieldName]?.message;
}

/**
 * Check if a field has been touched and has an error
 */
export function hasFieldError(
  errors: Record<string, unknown>,
  touchedFields: Record<string, boolean>,
  fieldName: string,
): boolean {
  return !!errors[fieldName] && !!touchedFields[fieldName];
}

export default useZodForm;
