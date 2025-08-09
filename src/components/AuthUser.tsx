"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  isAdmin: boolean;
}

const AuthUser = (
  WrappedComponent: React.ComponentType<any>,
  isAdminPage = false
) => {
  // Define the component with a display name
  const AuthComponent = (props: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const authToken = Cookies.get("auth_token");
      if (!authToken) {
        router.push("/login");
        return;
      }

      try {
        const decodedToken = jwtDecode<DecodedToken>(authToken);
        setIsAdmin(decodedToken.isAdmin === true);
        setIsAuthenticated(true);

        if (pathname === "/login" || pathname === "/") {
          router.push("/booking");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        router.push("/login");
      }
    }, [router, pathname]);

    if (!isAuthenticated) return null;

    if (isAdminPage && !isAdmin) {
      router.push("/booking");
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `AuthUser(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthComponent;
};

export default AuthUser;
