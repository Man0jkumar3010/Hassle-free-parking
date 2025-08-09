"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthCard from "@/components/AuthCard";
import PhoneInputForm from "@/components/PhoneInputForm";
import OtpInputForm from "@/components/OtpInputForm";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [showResend, setShowResend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authToken = Cookies.get("auth_token");
    if (authToken) {
      router.push("/booking");
    }
  }, [router]);

  useEffect(() => {
    if (isOtpSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setShowResend(true);
    }
  }, [isOtpSent, timer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number (e.g., 9876543210)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const fullPhoneNumber = `${phoneNumber}`;
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: fullPhoneNumber,
          companyCode: "TSI",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send OTP");

      setIsOtpSent(true);
      setTimer(30);
      setShowResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const fullPhoneNumber = `${phoneNumber}`;
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: fullPhoneNumber, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to verify OTP");
      router.push("/booking");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const fullPhoneNumber = `${phoneNumber}`;
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: fullPhoneNumber,
          companyCode: "TSI",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to resend OTP");
      setTimer(30);
      setShowResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <AuthCard title={isOtpSent ? "Enter OTP" : "Login with Phone"}>
          {!isOtpSent ? (
            <PhoneInputForm
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onSubmit={handlePhoneSubmit}
              error={error}
              loading={loading}
            />
          ) : (
            <div>
              <OtpInputForm
                otp={otp}
                setOtp={setOtp}
                onSubmit={handleOtpSubmit}
                error={error}
                loading={loading}
                handleResendOtp={handleResendOtp}
                timer={timer}
                showResend={showResend}
              />
            </div>
          )}
        </AuthCard>
      </div>
      <Footer />
    </div>
  );
}
