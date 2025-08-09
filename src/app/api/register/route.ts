import db from "@/db/index";
import { company, users } from "@/db/schemas";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { CustomHTTPError } from "@/utils/server/lib";

const sns = new AWS.SNS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(request: Request) {
  try {
    const {
      mobileNumber,
      companyCode,
      firstName,
      lastName,
      employeeCode,
      gender,
      vehicleNumber,
    } = await request.json();

    // Validate input
    if (
      !mobileNumber ||
      !companyCode ||
      !firstName ||
      !lastName ||
      !employeeCode ||
      !gender ||
      !vehicleNumber
    ) {
      throw new CustomHTTPError(
        "Some of the required fields (mobileNumber, companyCode, firstName, lastName, employeeCode) are not present",
        400
      );
    }

    if (
      !(gender?.toLowerCase() === "male" || gender?.toLowerCase() === "female")
    ) {
      throw new CustomHTTPError("Invalid gender values", 400);
    }

    let newUser;
    await db.transaction(async (tx) => {
      const companyResult = await tx
        .select()
        .from(company)
        .where(eq(company.companyCode, companyCode))
        .limit(1);

      if (companyResult.length === 0) {
        throw new CustomHTTPError("Invalid company code", 401);
      }

      // Check existing user by mobile number
      const [existingUser] = await tx
        .select({
          id: users.id,
          mobileNumber: users.mobileNumber,
          companyId: users.companyId,
          otp:users.otp
        })
        .from(users)
        .where(eq(users.mobileNumber, mobileNumber))
        .limit(1);

      if (existingUser?.id) {
        throw new CustomHTTPError(
          "User already registered with this mobile number",
          409
        );
      }

      const existingUserData = await tx
        .select({
          vehicleNumber: users.vehicleNumber,
          employeeCode: users.employeeCode,
        })
        .from(users)
        .where(
          or(
            eq(users.vehicleNumber, vehicleNumber),
            eq(users.employeeCode, employeeCode)
          )
        )
        .limit(1);

      if (existingUserData[0]?.vehicleNumber === vehicleNumber) {
        throw new CustomHTTPError(
          "Another user already registered with this vehicle number",
          409
        );
      }

      if (existingUserData[0]?.employeeCode === employeeCode) {
        throw new CustomHTTPError(
          "Employee code should be unique",
          409
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Create new user
      const [newUserRow] = await tx
        .insert(users)
        .values({
          mobileNumber,
          companyId: companyResult[0].id,
          firstName,
          lastName,
          employeeCode,
          gender: gender.toLowerCase(),
          createdAt: new Date(),
          otp,
          otpExpireAt,
          vehicleNumber,
        })
        .returning();

      newUser = newUserRow;
      // Send OTP Notification
      const params = {
        PhoneNumber: `+91${newUser.mobileNumber}`,
        Message: `Easy Parking Verification Code ${otp}. Please enter this OTP to complete your registration. This code is valid for 10 minutes. Do not share it with anyone.`,
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType": {
            DataType: "String",
            StringValue: "Transactional",
          },
        },
      };

      // await sns.publish(params).promise();
    });

    // Verify company code
    // Create response
    if (newUser) {
      return NextResponse.json({
        userId: (newUser as any).id,
        mobileNumber: (newUser as any).mobileNumber,
        companyId: (newUser as any).companyId,
        otp:(newUser as any ).otp 
        
      });
    } else {
      return NextResponse.json(
        { error: "User registration failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: (error as CustomHTTPError)?.message ?? "Failed to register user",
      },
      { status: (error as CustomHTTPError).statusCode ?? 500 }
    );
  }
}
