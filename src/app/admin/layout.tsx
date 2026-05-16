import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Galana — Admin",
  description: "Internal console for quotes, orders, and team profiles.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="admin-root">{children}</div>;
}
