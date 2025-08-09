import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpInputFormProps {
  otp: string;
  setOtp: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  loading: boolean;
  handleResendOtp: () => void;
  timer: number;
  showResend: boolean;
}

export default function OtpInputForm({
  otp,
  setOtp,
  onSubmit,
  error,
  loading,
  handleResendOtp,
  timer,
  showResend,
}: OtpInputFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
      <div className="flex justify-center pt-4">
        {!showResend ? (
          <p className="text-gray-500">Resend OTP in {timer} seconds</p>
        ) : (
          <button className="cursor-pointer" onClick={handleResendOtp}>
            Didn&apos;t receive code?{" "}
            <span className="text-orange-600">Resend</span>
          </button>
        )}
      </div>
    </>
  );
}
