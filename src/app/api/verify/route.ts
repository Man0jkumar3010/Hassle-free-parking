import db from "@/db/index";
import { users } from "@/db/schemas/users";
import { eq, and, gt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { mobileNumber, otp } = await request.json();

    if (!mobileNumber || !otp) {
      return NextResponse.json(
        { error: "Mobile number and OTP are required" },
        { status: 400 }
      );
    }

    // Find user with matching mobile and OTP that's not expired
    const [user] = await db
      .select({
        companyId: users.companyId,
        userId: users.id,
        isAdmin: sql.raw(
          `CASE WHEN "users"."isAdmin" = 1 THEN TRUE ELSE FALSE END`
        ),
        gender: users.gender,
      })
      .from(users)
      .where(
        and(
          eq(users.mobileNumber, mobileNumber),
          eq(users.otp, otp),
          // eq(users.isVerified, 0),
          gt(users.otpExpireAt, new Date())
        )
      );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid OTP or expired" },
        { status: 401 }
      );
    }

    // Clear OTP fields after successful verification
    await db
      .update(users)
      .set({
        otp: null,
        otpExpireAt: null,
        updatedAt: new Date(),
        isVerified: 1,
      })
      .where(eq(users.id, user.userId));

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.userId,
        companyId: user.companyId,
        isAdmin: user.isAdmin,
        gender: user.gender,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );

    // Set authentication cookie
    response.cookies.set("auth_token", token, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
