import { DecodedToken } from "@/app/api/users/route";
import jwt from "jsonwebtoken";

export class CustomHTTPError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export function isIsoDate(str: string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.toISOString() === str; // valid date
}

export const getISTDate = (dateString: string): string => {
  const date = new Date(dateString);
  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, "0");
  const dd = String(istDate.getDate()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy}`;
};

// Helper function to verify JWT
export async function verifyToken(
  token: string | undefined | null,
  secret: string | undefined
): Promise<DecodedToken | null> {
  if (!token || !secret) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (err) {
    console.log("error in verify token", err);
    return null;
  }
}
