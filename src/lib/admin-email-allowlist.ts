function parseList(raw: string | undefined): Set<string> {
  const s = new Set<string>();
  if (!raw?.trim()) return s;
  for (const part of raw.split(",")) {
    const e = part.trim().toLowerCase();
    if (e.includes("@")) s.add(e);
  }
  return s;
}

export function adminStaffAllowlists() {
  return {
    admins: parseList(process.env.GALANA_ADMIN_EMAILS),
    staff: parseList(process.env.GALANA_STAFF_EMAILS),
  };
}

export function roleForEmail(email: string): "admin" | "staff" | null {
  const e = email.trim().toLowerCase();
  const { admins, staff } = adminStaffAllowlists();
  if (admins.has(e)) return "admin";
  if (staff.has(e)) return "staff";
  return null;
}
