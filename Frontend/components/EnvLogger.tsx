"use client";

import { useEffect } from "react";

export default function EnvLogger() {
  useEffect(() => {
    console.log("🌐 Client Side Environment Check:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("window.location.origin:", window.location.origin);
    console.log("===============================");
  }, []);

  return null;
}
