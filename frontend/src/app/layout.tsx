import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAPPS — Student Academic Performance Prediction System",
  description:
    "ML-powered student academic performance prediction for LASUSTECH. Final year project by Famuditi Babatomiwa Abdul Hamid.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
