import { ReactNode } from "react";
import { ProfileShell } from "@/components/profile-shell";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <main className="checkout-main-wrap">
      <ProfileShell>{children}</ProfileShell>
    </main>
  );
}
