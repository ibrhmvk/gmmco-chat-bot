"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(process.env.NEXT_PUBLIC_TOKEN_ID || "");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
}