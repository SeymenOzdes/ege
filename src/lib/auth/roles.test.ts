import { describe, expect, it } from "vitest";
import { getUserRole, isStaffRole } from "@/lib/auth/roles";

describe("trusted application roles", () => {
  it("reads a recognized role only from app_metadata", () => {
    expect(
      getUserRole({ app_metadata: { role: "EDITOR" }, user_metadata: { role: "ADMIN" } }),
    ).toBe("EDITOR");
  });

  it("does not accept user-editable metadata or unknown roles", () => {
    expect(getUserRole({ user_metadata: { role: "ADMIN" } })).toBeUndefined();
    expect(getUserRole({ app_metadata: { role: "OWNER" } })).toBeUndefined();
  });

  it("limits staff access to editor and admin roles", () => {
    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("EDITOR")).toBe(true);
    expect(isStaffRole("READER")).toBe(false);
  });
});
