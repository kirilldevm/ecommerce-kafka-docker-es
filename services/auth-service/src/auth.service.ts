import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@ecommerce/shared";
import { config } from "./config";
import {
  deleteRefreshToken,
  getRefreshTokenUserId,
  storeRefreshToken,
} from "./redis";
import {
  createRefreshToken,
  signAccessToken,
  type AccessTokenPayload,
} from "./tokens";

const SALT_ROUNDS = 10;

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function toTokenResponse(user: { id: string; email: string; role: Role }) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = createRefreshToken();

  return { accessToken, refreshToken };
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new AuthError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: Role.USER,
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password", 401);
  }

  const tokens = toTokenResponse(user);
  await storeRefreshToken(
    tokens.refreshToken,
    user.id,
    config.refreshTokenExpiresIn,
  );

  return {
    user: { id: user.id, email: user.email, role: user.role },
    ...tokens,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const userId = await getRefreshTokenUserId(refreshToken);
  if (!userId) {
    throw new AuthError("Invalid or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    await deleteRefreshToken(refreshToken);
    throw new AuthError("User not found", 401);
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    accessToken,
  };
}

export async function logoutUser(refreshToken: string) {
  await deleteRefreshToken(refreshToken);
}

export function getPublicUserFromPayload(payload: AccessTokenPayload) {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
