"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    vehicleNumber: "",
    companyCode: "TSI",
    gender: "" as "Male" | "Female",
    employeeCode: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (
      formData.firstName.trim().length < 3 ||
      /\d/.test(formData.firstName) ||
      /[^a-zA-Z\s]/.test(formData.firstName)
    ) {
      newErrors.firstName =
        "First Name must be at least 3 characters long, contain no numbers, and no special characters";
    }

    if (
      formData.lastName.trim().length < 3 ||
      /\d/.test(formData.lastName) ||
      /[^a-zA-Z\s]/.test(formData.lastName)
    ) {
      newErrors.lastName =
        "Last Name must be at least 3 characters long, contain no numbers, and no special characters";
    }
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile Number must be exactly 10 digits";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    const empIdPattern = /^TS\d{3}$/;
    if (!empIdPattern.test(formData.employeeCode.trim())) {
      newErrors.employeeCode =
        "Employee ID must follow TS001 format (e.g., TS123)";
    }

    const vehiclePattern = /^[A-Z]{2}\s*\d{2}\s*[A-Z]{1,2}\s*\d{4}$/;

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle Number is required";
    } else if (!vehiclePattern.test(formData.vehicleNumber.trim())) {
      newErrors.vehicleNumber =
        "Vehicle Number must follow the format 'TN 39 BS 7102' or 'TN39BS7102' (e.g., 2 letters, 2 digits, 1-2 letters, 4 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // True if no errors
  };
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors((prev) => ({
          ...prev,
          apiError: errorData.error || errorData.message,
        }));
        return;
      }
      await response.json();
      setShowOtp(true);
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        apiError: error.message || "Something went wrong",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch("/api/login", {
        method: "POSt",
        body: JSON.stringify({
          mobileNumber: formData.mobileNumber,
          companyCode: "TSI",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      await response.json();
    } catch (error: any) {
      setErrors(error.message);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobileNumber: formData.mobileNumber, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "OTP verification failed");
      }

      await response.json();
      router.push("/booking");
    } catch (error: any) {
      console.log("OTP verification error:", error);
      setErrors((prev) => ({
        ...prev,
        otp: error.message,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4 py-2">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center pt-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              Register for Easy Parking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showOtp ? (
              <form onSubmit={handleRegistration} className="space-y-3">
                {/* First Name */}
                <div>
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <Input
                    type="tel"
                    placeholder="Mobile Number"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      handleChange("mobileNumber", value);
                    }}
                    className="w-full"
                    disabled={loading}
                    maxLength={10}
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                {/* Vehicle Number */}
                <div>
                  <Input
                    type="text"
                    placeholder="Vehicle Number (e.g., TN39BS7102)"
                    value={formData.vehicleNumber}
                    onChange={(e) =>
                      handleChange(
                        "vehicleNumber",
                        e.target.value.toUpperCase().replace(/\s+/g, "")
                      )
                    }
                    className="w-full"
                    disabled={loading}
                  />
                  {errors.vehicleNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.vehicleNumber}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleChange(
                        "gender",
                        value as "Male" | "Female" | "Other"
                      )
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="UserID (e.g., User001)"
                    value={formData.employeeCode}
                    onChange={(e) =>
                      handleChange("employeeCode", e.target.value.toUpperCase())
                    }
                    className="w-full"
                    disabled={loading}
                  />
                  {errors.employeeCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.employeeCode}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
                {errors.apiError && (
                  <p className="text-red-500 text-xs mt-1">{errors.apiError}</p>
                )}
                <p className="text-center text-sm text-gray-600 mt-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-blue-500 hover:underline"
                    disabled={loading}
                  >
                    Login
                  </button>
                </p>
                {errors.form && (
                  <p className="text-red-500 text-sm text-center">
                    {errors.form}
                  </p>
                )}
              </form>
            ) : (
              <>
                <form onSubmit={handleOtpVerification} className="space-y-4">
                  <p className="text-center text-sm text-gray-600">
                    An OTP has been sent to your mobile number. Please enter it
                    below.
                  </p>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
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
                  {errors.otp && (
                    <p className="text-red-500 text-sm text-center">
                      {errors.otp}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </form>

                <div className="flex justify-center pt-4">
                  <button className="cursor-pointer" onClick={handleResendOtp}>
                    Didn&apos;t receive code?{" "}
                    <span className="text-orange-600">Resend</span>
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
