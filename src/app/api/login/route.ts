import db from "@/db/index";
import {  users } from "@/db/schemas";
import {  company } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import { OTP_CONSTANT, OTP_LIMIT_EXPIRY_TIME } from "../../../../constant";

const sns = new AWS.SNS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(request: Request) {
  try {
    const { mobileNumber, companyCode } = await request.json();

    // Validate input
    if (!mobileNumber || !companyCode) {
      return NextResponse.json(
        { error: "Mobile number and company code are required" },
        { status: 400 }
      );
    }

    // Verify company code
    const companyResult = await db
      .select()
      .from(company)
      .where(eq(company.companyCode, companyCode))
      .limit(1);

    if (companyResult.length === 0) {
      return NextResponse.json(
        { error: "Invalid company code" },
        { status: 401 }
      );
    }

    // Check existing user
    const [existingUser] = await db
      .select({
        id: users.id,
        mobileNumber: users.mobileNumber,
        // companyId: users.companyId,
        otpCount: users.otpCount,
        expireTime: users.otpLimitExpireTime,
      })
      .from(users)
      .where(eq(users.mobileNumber, mobileNumber))
      .limit(1);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (existingUser?.id) {
      let newOtpCount = (existingUser.otpCount ?? 0) + 1;
      let newOtpExpireTime = new Date(Date.now() + OTP_LIMIT_EXPIRY_TIME);

      if (new Date() > (existingUser.expireTime ?? 0)) {
        newOtpCount = 0;
        newOtpExpireTime = new Date(Date.now() + OTP_LIMIT_EXPIRY_TIME);
      } else if (
        existingUser.expireTime &&
        new Date() < existingUser.expireTime &&
        (existingUser.otpCount ?? 0) < OTP_CONSTANT
      ) {
        newOtpCount = (existingUser.otpCount ?? 0) + 1;
      } else if (
        existingUser.expireTime &&
        new Date() < existingUser.expireTime &&
        (existingUser.otpCount ?? 0) >= OTP_CONSTANT
      ) {
        return NextResponse.json(
          { error: "Too many OTP Request try after some time." },
          { status: 429 }
        );
      }
      await db
        .update(users)
        .set({
          otp: otp,
          otpExpireAt: otpExpireAt,
          updatedAt: new Date(),
          otpCount: newOtpCount,
          otpLimitExpireTime: newOtpExpireTime,
        })
        .where(eq(users.id, existingUser.id));

      // TODO: Send OTP Notification here.

      // const params = {
      //   PhoneNumber: `+91${existingUser.mobileNumber}`,
      //   Message: `Your OTP for Easy Parking is ${otp}. It is valid for 10 minutes. Do not share this code.`,
      //   // TopicArn: process.env.TOPIC_ARN, // Replace with your Topic ARN
      //   MessageAttributes: {
      //     "AWS.SNS.SMS.SMSType": {
      //       DataType: "String",
      //       StringValue: "Transactional",
      //     },
      //   },
      // };

      // const awsresponse = await sns.publish(params).promise();
      if (existingUser.mobileNumber) {
        return NextResponse.json(
          {
            otp,
            message: "OTP sent successfully",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "Failed to send OTP" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "User not registered" }, { status: 404 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
