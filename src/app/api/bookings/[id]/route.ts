import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { slot, slotBooking, users } from "@/db/schemas";
import { and, eq } from "drizzle-orm";
import { getISTDate, verifyToken } from "@/utils/server/lib";
import AWS from "aws-sdk";

const sns = new AWS.SNS({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    const decoded = await verifyToken(token, secret);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { message: "Permission Denied" },
        { status: 403 }
      );
    }

    const { id: slotId } = await params;
    if (!slotId || isNaN(Number(slotId))) {
      return NextResponse.json({ message: "Invalid Slot ID" }, { status: 400 });
    }

    const slotIdNum = Number(slotId);

    let userMobileNumber;
    let bookingExists;
    let bookingDate;
    let slotName;

     await db.transaction(async (tx) => {
       // Fetch booking details and user mobile number
       const [bookingDetails] = await tx
         .select({
           userId: slotBooking.userId,
           bookingDate: slotBooking.startTime,
           mobileNumber: users.mobileNumber,
           slotName: slot.slotName,
         })
         .from(slotBooking)
         .leftJoin(users, eq(slotBooking.userId, users.id))
         .leftJoin(slot, eq(slotBooking.slotId, slot.id))
         .where(
           and(eq(slotBooking.slotId, slotIdNum), eq(slotBooking.isDeleted, 0))
         );

       if (!bookingDetails) {
         bookingExists = false;
         return [];
       }

       bookingExists = true;
       userMobileNumber = bookingDetails.mobileNumber;
       bookingDate = getISTDate(String(bookingDetails.bookingDate));
       slotName = bookingDetails.slotName;

       // Soft delete the slot booking
       const updateResult = await tx
         .update(slotBooking)
         .set({ isDeleted: 1 })
         .where(eq(slotBooking.slotId, slotIdNum))
         .returning();

       return updateResult;
     });

     if (!bookingExists) {
       return NextResponse.json(
         { message: "Slot not found or already deleted" },
         { status: 404 }
       );
     }

    const cancelSlotNotification = {
      PhoneNumber: `+91 ${userMobileNumber}`,
      Message: `Your Easy Parking slot "${slotName}" booked for ${bookingDate} has been cancelled by admin. If you have any queries, please contact our HR team.`,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    };

    await sns.publish(cancelSlotNotification).promise();

    return NextResponse.json(
      { message: "Slot deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
