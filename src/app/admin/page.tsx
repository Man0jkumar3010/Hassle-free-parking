"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CalendarIcon } from "lucide-react";
import AuthUser from "@/components/AuthUser";
import Link from "next/link";

function AdminPage() {
  interface Admindata {
    bookedBy: number;
    slotId: number;
    slotName: string;
    companyId: number;
    firstName: string;
    lastName: string;
    mobileNumber: number;
    gender: string;
    vehicleNumber: string;
    employeeCode: string;
  }

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialDate = searchParams.get("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate ? parseISO(initialDate) : new Date()
  );
  const [bookings, setBookings] = useState<Admindata[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedDate) {
      params.set("date", format(selectedDate, "yyyy-MM-dd"));
    } else {
      params.delete("date");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, router, searchParams]);

  async function fetchAdminData(day: Date | undefined) {
    if (!day) return;

    const startTime = new Date(day).setHours(0, 0, 0, 0);
    const endTime = new Date(day).setHours(23, 59, 59, 999);
    const response = await fetch(
      `/api/bookings?startTime=${new Date(
        startTime
      ).toISOString()}&endTime=${new Date(endTime).toISOString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const { slots } = await response.json();
    setSelectedDate(day);
    setBookings(slots);
  }

  useEffect(() => {
    fetchAdminData(selectedDate);
  }, [selectedDate]);

  async function removeSlot(slotId: number) {
    try {
      const response = await fetch(`/api/bookings/${slotId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete slot");
      }

      fetchAdminData(selectedDate);
    } catch (error: any) {
      console.error("Error:", error);
    }
  }

  const handleClearClick = (slotId: number) => {
    setSelectedSlotId(slotId);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen px-2 py-2 sm:px-4 bg-gray-100">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Card className="w-full max-w-4xl sm:max-w-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-center sm:text-xl">
                Booking Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[200px] justify-start text-left font-normal text-xs sm:w-[240px] sm:text-sm"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={fetchAdminData}
                      initialFocus
                      className="text-xs sm:text-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {selectedDate && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] w-[300px] sm:text-xs">
                          S.No
                        </TableHead>
                        <TableHead className="text-[10px] w-[400px] sm:text-xs">
                          Employee Code
                        </TableHead>
                        <TableHead className="text-[10px] w-[400px] sm:text-xs">
                          Employee Name
                        </TableHead>
                        <TableHead className="text-[10px] w-[400px] sm:text-xs">
                          Gender
                        </TableHead>
                        <TableHead className="text-[10px] w-[400px] sm:text-xs">
                          Employee Number
                        </TableHead>
                        <TableHead className="text-[10px] w-[400px] sm:text-xs">
                          Vechile Number
                        </TableHead>
                        <TableHead className="text-[10px] w-[400px] sm:text-xs">
                          Slot
                        </TableHead>
                        <TableHead className="text-[10px] w-[400px] sm:text-xs">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings
                        .filter((booking) => booking.bookedBy)
                        .map((booking, index: number) => (
                          <TableRow key={booking.slotId}>
                            <TableCell className="text-[10px] sm:text-sm">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-sm">
                              {booking.employeeCode}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-sm whitespace-nowrap overflow-hidden text-overflow-ellipsis max-w-[200px]">
                              {booking.bookedBy
                                ? `${booking.firstName} ${booking.lastName}`
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-sm whitespace-nowrap overflow-hidden text-overflow-ellipsis max-w-[100px]">
                              {booking.gender}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-sm">
                              {booking.mobileNumber}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-sm">
                              {booking.vehicleNumber}
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-sm">
                              {booking.slotName}
                            </TableCell>
                            <TableCell>
                              <Dialog
                                open={
                                  isDialogOpen &&
                                  selectedSlotId === booking.slotId
                                }
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setSelectedSlotId(null);
                                    setIsDialogOpen(false);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleClearClick(booking.slotId)
                                    }
                                    className="py-1 px-2 text-[10px] sm:text-sm sm:py-2 sm:px-4"
                                  >
                                    Clear
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[90%] sm:w-full max-w-[400px] rounded-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-sm sm:text-lg">
                                      Confirm Deletion
                                    </DialogTitle>
                                    <DialogDescription className="text-xs sm:text-sm">
                                      Are you sure you want to clear this
                                      booking slot?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-2">
                                    <DialogFooter className="flex flex-row justify-end sm:flex-row gap-2 sm:gap-0">
                                      <Button
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="w-full sm:w-auto text-xs sm:text-sm"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() =>
                                          selectedSlotId &&
                                          removeSlot(selectedSlotId)
                                        }
                                        className="w-full sm:w-auto text-xs sm:text-sm"
                                      >
                                        Confirm
                                      </Button>
                                    </DialogFooter>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      {bookings.filter((booking) => booking.bookedBy).length ===
                        0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center text-gray-500 text-[10px] sm:text-sm"
                          >
                            No bookings for {format(selectedDate, "PPP")}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <Link href={"/booking"} className="mt-8 sm:mt-16">
            <Button className="text-xs sm:text-sm py-1 px-4 sm:py-2 sm:px-6">
              Back
            </Button>
          </Link>
        </div>
        {/* <div
          className="flex flex-col justify-center gap-10 
                absolute right-6 top-36 
                lg:right-24 lg:bottom-0
                md:right-10 md:bottom-0 md:gap-6
                sm: top-0 right-0 sm:bottom-6 sm:gap-4"
        >
          <p className="text-xl lg:text-lg md:text-base sm:text-sm font-semibold flex items-center gap-2">
            Enable tomorrow slots for male <Switch />
          </p>
        </div> */}
        <Footer />
      </div>
    </>
  );
}

export default AuthUser(AdminPage, true);
