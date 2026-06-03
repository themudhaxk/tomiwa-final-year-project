"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageSpinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of academic performance metrics" },
  "/students": { title: "Students", subtitle: "Manage student records" },
  "/courses": { title: "Courses", subtitle: "Manage course offerings" },
  "/records": { title: "Academic Records", subtitle: "View and manage academic records" },
  "/predictions": { title: "Predictions", subtitle: "ML-powered performance predictions" },
  "/reports": { title: "Reports & Analytics", subtitle: "Comprehensive performance reports" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return <PageSpinner />;
  if (!isAuthenticated || !user) return null;

  const basePath = "/" + (pathname.split("/")[1] || "dashboard");
  const pageInfo = PAGE_TITLES[pathname] ?? PAGE_TITLES[basePath] ?? { title: "SAPPS" };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={logout} />
      <div className="ml-64">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
