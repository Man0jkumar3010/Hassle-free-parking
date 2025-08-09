import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-14 rounded-md">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-sm">
            For urgent requests, please{" "}
            <Link
              href="https://api.whatsapp.com/send?phone=+919790187373"
              className="text-green-500 hover:text-green-400 transition duration-300"
            >
              contact us on WhatsApp
            </Link>{" "}
            at {process.env.NEXT_PUBLIC_HR_NUMBER}.
          </p>
          <p className="text-sm mt-1">
            For other queries, email us at{" "}
            <a
              href="mailto:manojkumar.fsd3@gmail.com"
              className="text-blue-400 hover:underline"
            >
              manojkumar.fsd3@gmail.com
            </a>
            .
          </p>
        </div>

        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} Parking. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
