"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  SESSION_COOKIE_NAME,
  DEFAULT_SESSION_EXPIRY_DAYS,
  REMEMBER_ME_EXPIRY_DAYS,
} from "@/lib/authCrypto";

export interface AdminUserPublic {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  address: string | null;
  department: string | null;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export type AuthResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Authenticates an admin user, sets a secure HTTP-only session cookie,
 * and records session in the database.
 */
export async function loginAdminAction(formData: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<AuthResponse<{ user: AdminUserPublic; redirectUrl: string }>> {
  try {
    const email = formData.email?.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return { success: false, error: "Invalid email or password." };
    }

    if (!admin.isActive) {
      return {
        success: false,
        error: "Your administrator account has been deactivated. Please contact the Super Admin.",
      };
    }

    const isValid = verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    // Generate Session
    const token = generateSessionToken();
    const expiryDays = formData.rememberMe
      ? REMEMBER_ME_EXPIRY_DAYS
      : DEFAULT_SESSION_EXPIRY_DAYS;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || undefined;
    const ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      undefined;

    // Save session in PostgreSQL
    await prisma.adminSession.create({
      data: {
        id: token,
        adminUserId: admin.id,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    // Update lastLoginAt
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    const userPublic: AdminUserPublic = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      phone: admin.phone,
      avatarUrl: admin.avatarUrl,
      bio: admin.bio,
      address: admin.address,
      department: admin.department,
      twoFactorEnabled: admin.twoFactorEnabled,
      isActive: admin.isActive,
      lastLoginAt: new Date(),
      createdAt: admin.createdAt,
    };

    return {
      success: true,
      data: {
        user: userPublic,
        redirectUrl: "/admin",
      },
    };
  } catch (error) {
    console.error("loginAdminAction error:", error);
    return {
      success: false,
      error: "Authentication server error. Please try again later.",
    };
  }
}

/**
 * Retrieves the currently authenticated admin user from session cookie
 */
export async function getCurrentAdminAction(): Promise<AdminUserPublic | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.adminSession.findUnique({
      where: { id: sessionToken },
      include: { adminUser: true },
    });

    if (!session) {
      return null;
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      await prisma.adminSession.delete({ where: { id: sessionToken } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    if (!session.adminUser.isActive) {
      return null;
    }

    const user = session.adminUser;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      address: user.address,
      department: user.department,
      twoFactorEnabled: user.twoFactorEnabled,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("getCurrentAdminAction error:", error);
    return null;
  }
}

/**
 * Logs out the current admin and invalidates database session & cookies
 */
export async function logoutAdminAction(): Promise<AuthResponse> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      await prisma.adminSession.deleteMany({
        where: { id: sessionToken },
      }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
    }

    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("logoutAdminAction error:", error);
    return { success: false, error: "Failed to log out" };
  }
}

/**
 * Updates General Profile Details (Name, Phone, Bio, Address, Department, Avatar)
 */
export async function updateAdminProfileAction(data: {
  name: string;
  phone?: string;
  bio?: string;
  address?: string;
  department?: string;
  avatarUrl?: string;
}): Promise<AuthResponse<AdminUserPublic>> {
  try {
    const currentAdmin = await getCurrentAdminAction();
    if (!currentAdmin) {
      return { success: false, error: "Unauthorized. Please sign in again." };
    }

    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: "Full name cannot be empty." };
    }

    const updated = await prisma.adminUser.update({
      where: { id: currentAdmin.id },
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        bio: data.bio?.trim() || null,
        address: data.address?.trim() || null,
        department: data.department?.trim() || null,
        ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Profile updated successfully!",
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        phone: updated.phone,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        address: updated.address,
        department: updated.department,
        twoFactorEnabled: updated.twoFactorEnabled,
        isActive: updated.isActive,
        lastLoginAt: updated.lastLoginAt,
        createdAt: updated.createdAt,
      },
    };
  } catch (error) {
    console.error("updateAdminProfileAction error:", error);
    return { success: false, error: "Failed to update profile information." };
  }
}

/**
 * Changes the admin password after verifying the current password
 */
export async function changeAdminPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResponse> {
  try {
    const currentAdmin = await getCurrentAdminAction();
    if (!currentAdmin) {
      return { success: false, error: "Unauthorized. Please sign in again." };
    }

    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      return { success: false, error: "All password fields are required." };
    }

    if (data.newPassword.length < 8) {
      return {
        success: false,
        error: "New password must be at least 8 characters long.",
      };
    }

    if (data.newPassword !== data.confirmPassword) {
      return { success: false, error: "New password and confirmation do not match." };
    }

    const dbUser = await prisma.adminUser.findUnique({
      where: { id: currentAdmin.id },
    });

    if (!dbUser) {
      return { success: false, error: "User account not found." };
    }

    const isMatch = verifyPassword(data.currentPassword, dbUser.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHash = hashPassword(data.newPassword);

    await prisma.adminUser.update({
      where: { id: currentAdmin.id },
      data: { passwordHash: newHash },
    });

    return {
      success: true,
      message: "Your password has been changed successfully!",
    };
  } catch (error) {
    console.error("changeAdminPasswordAction error:", error);
    return { success: false, error: "Failed to change password." };
  }
}

/**
 * Toggles Two-Factor Authentication state
 */
export async function toggleTwoFactorAction(): Promise<AuthResponse<{ twoFactorEnabled: boolean }>> {
  try {
    const currentAdmin = await getCurrentAdminAction();
    if (!currentAdmin) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const dbUser = await prisma.adminUser.findUnique({
      where: { id: currentAdmin.id },
    });

    if (!dbUser) {
      return { success: false, error: "User not found." };
    }

    const updated = await prisma.adminUser.update({
      where: { id: currentAdmin.id },
      data: { twoFactorEnabled: !dbUser.twoFactorEnabled },
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: updated.twoFactorEnabled
        ? "Two-Factor Authentication enabled."
        : "Two-Factor Authentication disabled.",
      data: { twoFactorEnabled: updated.twoFactorEnabled },
    };
  } catch (error) {
    console.error("toggleTwoFactorAction error:", error);
    return { success: false, error: "Failed to toggle Two-Factor Authentication." };
  }
}
