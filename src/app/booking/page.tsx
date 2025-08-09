"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FaTimes } from "react-icons/fa";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import ConfirmModal from "@/components/ConfirmModal";
import AuthUser from "@/components/AuthUser";
import { HiMenu } from "react-icons/hi";

function BookingPage() {
  interface Slot {
    slotId: number;
    slotName: string;
    isBooked: boolean;
    bookedBy: number | null;
    startTime?: string;
    gender: string;
  }
  interface DecodedToken {
    userId: number;
    isAdmin: boolean;
    gender: string;
  }

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ userId: number; gender?: string } | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState("Today");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isBefore11IST, setIsBefore11IST] = useState({
    isMaleSlottime: false,
    isFemaleSlotTime: false,
  });
  const router = useRouter();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const currentSelectedDate = selectedDate === "Today" ? today : tomorrow;

  useEffect(() => {
    const checkISTTime = () => {
      const now = new Date();
      const istTime = new Date(now.getTime());

      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const seconds = istTime.getSeconds();

      const isFemaleSloteTime = hours >= 9 && hours < 11;

      const isMaleSlotTime =
        hours >= 11 &&
        hours <= 23 &&
        (hours < 23 || (hours === 23 && minutes <= 59 && seconds <= 59));

      setIsBefore11IST({
        isMaleSlottime: isMaleSlotTime,
        isFemaleSlotTime: isFemaleSloteTime,
      });
    };

    checkISTTime();
    const interval = setInterval(checkISTTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const hasUserBooked = slots.some((slot) => {
    if (!slot.isBooked || !slot.bookedBy || !slot.startTime) return false;
    const bookingDate = new Date(slot.startTime);
    return (
      slot.bookedBy === user?.userId &&
      bookingDate.toDateString() === currentSelectedDate.toDateString()
    );
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setIsMenuOpen(false);
  };

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      setUser({ userId: decodedToken.userId, gender: decodedToken.gender });
      setIsAdmin(decodedToken.isAdmin || false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSlots(currentSelectedDate);
    }
  }, [selectedDate, user]);

  const fetchSlots = async (date: Date) => {
    setLoading(true);
    setError("");
    try {
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/bookings?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch slots");
      }

      const { slots } = await response.json();
      setSlots(slots);
    } catch (err: any) {
      console.log(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("auth_token");
    localStorage.clear();
    router.push("/login");
  };

  const openConfirmationModal = (slotId: number) => {
    setSelectedSlotId(slotId);
    setIsModalOpen(true);
  };

  const handleBookSlot = async (slotId: number) => {
    if (hasUserBooked) {
      setError(`You have already booked a slot for ${selectedDate}`);
      return;
    }

    try {
      const bookingDate = new Date(currentSelectedDate);
      const startTime = new Date(bookingDate);
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date(bookingDate);
      endTime.setHours(23, 59, 59, 999);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId: slotId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to book slot");

      setError("");
      fetchSlots(currentSelectedDate);
    } catch (err: any) {
      setError(err.message);
    }
  };

  let maleCount = 0;
  let femaleCount = 0;
  let availableSlots = 0;
  if (slots) {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].isBooked && slots[i].gender === "female") {
        femaleCount++;
      } else if (slots[i].isBooked && slots[i].gender === "male") {
        maleCount++;
      } else if (slots[i].isBooked !== true) {
        availableSlots++;
      }
    }
  }

  const getSlotStyles = (slot: Slot) => {
    const baseStyles = "h-16 text-xs font-semibold rounded-lg shadow-md ";
    if (slot.isBooked && slot.bookedBy === user?.userId) {
      return `${baseStyles} bg-green-400 border-2 border-green-400 text-white hover:bg-yellow-800`;
    } else if (slot.isBooked && slot.gender === "male") {
      return `${baseStyles} bg-blue-400 border-2 border-blue-800 text-white`;
    } else if (slot.isBooked && slot.gender === "female") {
      return `${baseStyles} bg-pink-400 border-2 border-pink-400 text-white`;
    } else {
      return `${baseStyles} bg-gray-400 border-2 border-gray-400 text-white hover:bg-green-400`;
    }
  };

  const isSlotDisabled = (slot: Slot) => {
    const isMaleRestrictedTime =
      slot.gender === "male" && selectedDate === "Today" && !isBefore11IST;
    return (
      hasUserBooked ||
      slot.isBooked ||
      (user?.gender === "male" && selectedDate === "Tomorrow") ||
      isMaleRestrictedTime
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4 py-2 overflow-x-hidden">
      <Header />
      <div className="flex justify-between mb-4 items-center">
        <Button
          onClick={toggleMenu}
          className="text-sm px-3 py-1 absolute top-10"
        >
          <HiMenu />
        </Button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-center">
              Book a Parking Slot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
              <Button
                variant={selectedDate === "Today" ? "default" : "outline"}
                onClick={() => setSelectedDate("Today")}
                className="w-full sm:w-auto"
              >
                Today ({today.toLocaleDateString()})
              </Button>
              {user?.gender === "female" && (
                <Button
                  variant={selectedDate === "Tomorrow" ? "default" : "outline"}
                  onClick={() => setSelectedDate("Tomorrow")}
                  className="w-full sm:w-auto"
                >
                  Tomorrow ({tomorrow.toLocaleDateString()})
                </Button>
              )}
            </div>

            {loading ? (
              <p className="text-center text-sm">Loading...</p>
            ) : error ? (
              <p className="text-red-500 text-center text-sm">{error}</p>
            ) : (
              <>
                {user?.gender === "male" && !isBefore11IST.isMaleSlottime ? (
                  <div className="text-center p-4">
                    <div className="text-red-500 font-semibold text-lg">
                      Slots for males are currently closed.
                    </div>
                    <div className="text-gray-600 mt-2">
                      Booking starts from 11:00 AM IST
                    </div>
                  </div>
                ) : user?.gender === "female" &&
                  !isBefore11IST.isFemaleSlotTime ? (
                  <div className="text-center p-4">
                    <div className="text-red-500 font-semibold text-lg">
                      Slots for females are currently closed.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Slot Booking UI */}
                    <div className="grid grid-cols-8 gap-2">
                      {slots.map((slot) => (
                        <Button
                          key={slot.slotId}
                          className={getSlotStyles(slot)}
                          onClick={() => openConfirmationModal(slot.slotId)}
                          disabled={isSlotDisabled(slot)}
                        >
                          <div className="text-center">
                            <div className="text-[10px] text-black">{slot.slotName}</div>
                          </div>
                        </Button>
                      ))}
                    </div>

                    {/* Legends */}
                    <div className="mb-4 mt-4 text-sm">
                      <div className="flex flex-wrap gap-4 justify-center">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-gray-400 rounded"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-blue-400 rounded"></div>
                          <span>Booked (Male)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-pink-400 rounded"></div>
                          <span>Booked (Female)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-green-400 rounded"></div>
                          <span>Your Booking</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {hasUserBooked && (
                  <p className="text-center text-red-500 mt-2">
                    You have booked slot (
                    {
                      slots.find((slot) => slot.bookedBy === user?.userId)
                        ?.slotName
                    }
                    )
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(slotId: number) => {
          handleBookSlot(slotId);
          setIsModalOpen(false);
        }}
        slotId={selectedSlotId || 0}
      />
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={handleOutsideClick}
        >
          <div className="fixed left-0 top-0 h-full w-64 bg-white p-4 shadow-lg transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-bold">Edit Profile</h2>
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(false)}
                className="p-1"
              >
                <FaTimes className="text-xl" />
              </Button>
            </div>

            <div className="flex flex-col h-full">
              {/* Main content */}
              <div className="flex-grow">
                <div className="mb-4">
                  <Link href={`/user-profile`}>
                    <Button className="w-full bg-primary/80 text-white">
                      Update profile
                    </Button>
                  </Link>
                </div>
                <div className="w-full absolute bottom-2 right-4 ">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="ml-8  w-56  bg-red-500 border-red-500 text-white hover:bg-red-50"
                  >
                    Logout
                  </Button>
                </div>

                {isAdmin && (
                  <div className="mb-4">
                    <Link href={"/admin"}>
                      <Button className="w-full bg-primary/80 text-white">
                        Booking details
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      <div className="grid grid-cols-3 px-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-10">
        <div className="bg-white shadow-md rounded-lg p-6 px-2 text-center hover:shadow-lg transition-transform transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-700">Male Bookings</h3>
          <p className="text-2xl font-bold text-blue-500">{maleCount}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 px-2 text-center hover:shadow-lg transition-transform transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-700">
            Female Bookings
          </h3>
          <p className="text-2xl font-bold text-pink-500">{femaleCount}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6  px-2 text-center hover:shadow-lg transition-transform transform hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-700">
            Available Slots
          </h3>
          <p className="text-2xl font-bold text-green-500">{availableSlots}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AuthUser(BookingPage);
