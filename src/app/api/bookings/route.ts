import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import db from "@/db";
import { slotBooking, slot, users } from "@/db/schemas";
import { eq, and, lte, gte, sql } from "drizzle-orm";
import { DecodedToken } from "../users/route";
import {
  CustomHTTPError,
  getISTDate,
  isIsoDate,
  verifyToken,
} from "@/utils/server/lib";
import AWS from "aws-sdk";

const sns = new AWS.SNS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function GET(req: NextRequest) {
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
    const authHeader = req.headers.get("Authorization");
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

    if (typeof decodedToken.userId !== "number") {
      return NextResponse.json({ error: "Invalid User ID." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required query parameters: startTime and endTime" },
        { status: 400 }
      );
    }

    if (!(isIsoDate(startTime) && isIsoDate(endTime))) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO format." },
        { status: 400 }
      );
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    // Fetch user's company ID
    const [user] = await db
      .select({ companyId: users.companyId })
      .from(users)
      .where(eq(users.id, decodedToken.userId));

    if (!user?.companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 404 }
      );
    }

    // Fetch all slots for the company
    const allSlots = await db
      .select({
        // id: slot.id,
        startTime: slotBooking.startTime,
        endTime: slotBooking.endTime,
        bookedBy: slotBooking.userId,
        isBooked: sql.raw(
          `CASE WHEN "slot-booking"."slot_id" IS NOT NULL THEN TRUE ELSE FALSE END`
        ),
        slotId: slot.id,
        companyId: slot.companyId,
        slotName: slot.slotName,
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        gender: users.gender,
        mobileNumber: users.mobileNumber,
        vehicleNumber: users.vehicleNumber,
        employeeCode: users.employeeCode,
      })
      .from(slot)
      .leftJoin(
        slotBooking,
        and(
          eq(slot.id, slotBooking.slotId),
          // gte(slotBooking.startTime, parsedStartTime),
          lte(slotBooking.startTime, parsedStartTime),
          // lte(slotBooking.endTime, parsedEndTime)
          gte(slotBooking.endTime, parsedEndTime),
          eq(slotBooking.isDeleted, 0)
        )
      )
      .leftJoin(users, eq(slotBooking.userId, users.id))
      .where(
        and(
          eq(slot.companyId, user.companyId)
          // , eq(slotBooking.isDeleted, 0)
        )
      )
      // .orderBy(slot.id);
      .orderBy(
        sql`regexp_replace(slot_name, '[0-9]', '', 'g') ASC, CAST(regexp_replace(slot_name, '[^0-9]', '', 'g') AS INTEGER) ASC`
      );

    // const formattedSlots = allSlots.map((slot) => ({
    //   id: slot.id,
    //   startTime: slot.startTime,
    //   endTime: slot.endTime,
    //   isBooked: slot.isBooked,
    //   slotId: slot.slotId,
    //   companyId: slot.companyId,
    // }));

    return NextResponse.json({ slots: allSlots }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      {
        error:
          (error as CustomHTTPError)?.message ?? "Failed to fetch bookings",
      },
      { status: (error as CustomHTTPError).statusCode ?? 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const authHeader = req.headers.get("Authorization");
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

    if (typeof decodedToken.userId !== "number") {
      return NextResponse.json({ error: "Invalid User ID." }, { status: 400 });
    }
    const { slotId, startTime, endTime } = await req.json();

    if (!slotId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate input types (optional but recommended)
    if (
      typeof slotId !== "number" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid input types" },
        { status: 400 }
      );
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (!(isIsoDate(startTime) || isIsoDate(endTime))) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO format." },
        { status: 400 }
      );
    }

    let getSlotName;
    let userMobileNumber;
    const bookingDate = getISTDate(String(parsedStartTime));

    await db.transaction(async (tx) => {
      const [slotDetails] = await tx
        .select({
          companyId: slot.companyId,
          slotName: slot.slotName,
          mobileNumber: users.mobileNumber,
          slotId: slot.id,
        })
        .from(slot)
        .leftJoin(users, eq(users.id, decodedToken.userId))
        .where(eq(slot.id, slotId));
      const existingBookings = await tx
        .select()
        .from(slotBooking)
        .where(
          and(
            eq(slotBooking.slotId, slotId),
            lte(slotBooking.startTime, parsedStartTime),
            gte(slotBooking.endTime, parsedEndTime),
            eq(slotBooking.isDeleted, 0)
          )
        );

      getSlotName = slotDetails.slotName;
      userMobileNumber = slotDetails.mobileNumber;
      if (existingBookings.length > 0) {
        throw new CustomHTTPError(
          "Slot is already booked for the selected time",
          409
        );
      }

      const userBookingsToday = await tx
        .select()
        .from(slotBooking)
        .where(
          and(
            eq(slotBooking.userId, decodedToken!.userId),
            // gte(slotBooking.startTime, parsedStartTime),
            lte(slotBooking.startTime, parsedStartTime),
            // lte(slotBooking.startTime, parsedEndTime)
            gte(slotBooking.startTime, parsedEndTime)
          )
        );

      if (userBookingsToday.length > 0) {
        throw new CustomHTTPError("User can only book one slot per day", 403);
      }

      const insertedResponse =
        await tx.execute(sql`insert into "slot-booking" (user_id, slot_id, start_time, end_time)
      select ${decodedToken?.userId}, ${slotId}, ${parsedStartTime}, ${parsedEndTime} 
      where (select count(sb.id) from "slot-booking" sb inner join slot s on sb.slot_id = s.id
      where start_time <= ${parsedEndTime} and end_time >= ${parsedStartTime} and slot_id = ${slotId}
      and sb.is_deleted = 0
      )
	    < (select count(id) from slot where company_id = ${slotDetails.companyId} and id = ${slotId})`);

      if (insertedResponse.rowCount === 0) {
        throw new CustomHTTPError("The slot has been booked", 404);
      }
    });

    const params = {
      PhoneNumber: `+91${userMobileNumber}`,
      Message: `Your slot booking for "${getSlotName}" on ${bookingDate} has been successfully booked.`,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    };

    // await sns.publish(params).promise();

    return NextResponse.json(
      { message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation failed:", error);
    return NextResponse.json(
      {
        error:
          (error as CustomHTTPError)?.message ?? "Failed to create booking",
      },
      { status: (error as CustomHTTPError).statusCode ?? 500 }
    );
  }
}
