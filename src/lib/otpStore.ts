// lib/otpStore.ts
const otpStore: { [key: string]: string } = {};

export function setOtp(phoneNumber: string, otp: string) {
  otpStore[phoneNumber] = otp;
}

export function getOtp(phoneNumber: string): string | undefined {
  return otpStore[phoneNumber];
}

export function clearOtp(phoneNumber: string) {
  delete otpStore[phoneNumber];
}
