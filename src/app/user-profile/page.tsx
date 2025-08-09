"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  gender: "Male" | "Female" | "Other" | "";
  employeeCode: string;
}

const UserUpdatePage = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    gender: "",
    employeeCode: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let decodeToken: DecodedToken;
    const token = Cookies.get("auth_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (token) {
      decodeToken = jwtDecode<DecodedToken>(token);
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${decodeToken.userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { user } = await response.json();
          setFormData({
            ...user,
            gender:
              user.gender === "male"
                ? "Male"
                : user.gender === "female"
                ? "Female"
                : user.gender === "other"
                ? "Other"
                : "",
          });
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [router]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/booking");
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4 py-2">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-center mb-6">Update Profile</h1>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full text-sm"
              disabled={loading}
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full text-sm"
              disabled={loading}
            />
            <Input
              type="tel"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              className="w-full text-sm"
              disabled
            />
            <Select
              value={formData.gender || ""}
              onValueChange={(value) =>
                handleChange(
                  "gender",
                  value as "Male" | "Female" | "Other" | ""
                )
              }
              disabled
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select Gender">
                  {formData.gender}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="UserID (e.g., User001)"
              value={formData.employeeCode}
              className="w-full text-sm"
              disabled
            />
            <Button type="submit" className="w-full text-sm" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
            <Link href={"/booking"}>
              <Button variant="outline" className="w-full text-sm mt-2">
                Back to Booking
              </Button>
            </Link>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserUpdatePage;
