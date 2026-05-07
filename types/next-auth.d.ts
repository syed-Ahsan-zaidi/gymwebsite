import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    gymId?: string | null;
    adminApprovalStatus?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      gymId?: string | null;
      adminApprovalStatus?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    gymId?: string | null;
    adminApprovalStatus?: string;
  }
}
