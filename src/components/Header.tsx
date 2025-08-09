import Image from "next/image";
import parkingLogo from "../../public/parkingLogo.png";
export default function Header() {
  return (
    <div className="flex flex-col items-center mt-6 border-b-2">
      <div className="flex flex-col items-center mt-1 mb-2">
        <Image
          src={parkingLogo}
          alt="logo"
          className="w-[200px] sm:w-[200px] md:w-[300px] lg:w-[300px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          No More Parking Worries!
        </p>
      </div>
    </div>
  );
}
