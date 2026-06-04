import { parseBody, z } from "@ecommerce/shared";
import { AuthError } from "../errors/auth.error";

const emailPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = emailPasswordSchema;
export const loginSchema = emailPasswordSchema;

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1, "refreshToken is required"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;

export function parseRegisterBody(body: unknown): RegisterDto {
  return parseBody(registerSchema, body, AuthError);
}

export function parseLoginBody(body: unknown): LoginDto {
  return parseBody(loginSchema, body, AuthError);
}

export function parseRefreshBody(body: unknown): RefreshDto {
  return parseBody(refreshSchema, body, AuthError);
}
