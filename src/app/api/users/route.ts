import db from "@/db/index";
import { users } from "@/db/schemas/users";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/server/lib";

export interface DecodedToken {
  userId: number;
  isAdmin: boolean;
}

export async function PATCH(request: Request) {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not defined in .env.local");
      return NextResponse.json(
        { error: "Internal server error: JWT secret not configured" },
        { status: 500 }
      );
    }

    // Check for token in Authorization header
    let decodedToken: DecodedToken | null = null;
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      decodedToken = await verifyToken(token, secret);
    }

    // Check for token in cookie
    if (!decodedToken) {
      const cookieStore = await cookies();
      const cookie = cookieStore.get("auth_token")?.value;
      decodedToken = await verifyToken(cookie, secret);
    }

    if (!decodedToken) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid token" },
        { status: 401 }
      );
    }

    // Get user from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decodedToken.userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check verification status
    if (user.isVerified !== 1) {
      return NextResponse.json(
        { error: "Account not verified" },
        { status: 403 }
      );
    }

    // Validate request body
    const { firstName, lastName} = await request.json();
    const updateData: Record<string, any> = {};

    if (firstName !== undefined) {
      if (firstName.length > 32) {
        return NextResponse.json(
          { error: "First name too long (max 32 characters)" },
          { status: 400 }
        );
      }
      updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
      if (lastName.length > 32) {
        return NextResponse.json(
          { error: "Last name too long (max 32 characters)" },
          { status: 400 }
        );
      }
      updateData.lastName = lastName;
    }

    // if (gender !== undefined) {
    //   // Validate gender exists
    //   const [validGender] = await db
    //     .select()
    //     .from(genders)
    //     .where(eq(genders.gender, gender.toLowerCase()));

    //   if (!validGender) {
    //     return NextResponse.json(
    //       { error: "Invalid gender specified" },
    //       { status: 400 }
    //     );
    //   }
    //   updateData.gender = validGender.gender;
    // }

    // Update user if we have valid changes
    if (Object.keys(updateData).length > 0) {
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, decodedToken.userId))
        .returning();

      return NextResponse.json({
        message: "Profile updated successfully",
        user: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          // gender: updatedUser.gender,
        },
      });
    }

    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
