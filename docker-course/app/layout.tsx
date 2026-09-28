import type { Metadata } from "next";
import type { ReactNode } from "react";
import CourseShell from "./components/course-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Operator's Reel — Practical DevOps School",
  description: "A cloud-free, hands-on course in Bash, Linux, networking, Docker, and CI/CD, told in a rubber-hose cartoon world.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><CourseShell>{children}</CourseShell></body>
    </html>
  );
}
