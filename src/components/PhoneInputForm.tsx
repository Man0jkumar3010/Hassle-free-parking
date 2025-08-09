import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface PhoneInputFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  loading: boolean;
}

export default function PhoneInputForm({
  phoneNumber,
  setPhoneNumber,
  onSubmit,
  error,
  loading,
}: PhoneInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <div className="flex items-center border rounded-md">
          <span className="px-3 py-2 bg-gray-200 text-gray-700 border-r">
            +91-
          </span>
          <Input
            type="tel"
            placeholder="9876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            className="border-0 flex-1 focus:ring-0"
            maxLength={10}
            disabled={loading}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </Button>
      <p className="text-center text-sm text-gray-600 mt-2">
        Don’t have an account?{" "}
        <Link href={"/register"}>
          <button
            type="button"
            className="text-blue-500 hover:underline"
            disabled={loading}
          >
            Sign Up
          </button>
        </Link>
      </p>
    </form>
  );
}
