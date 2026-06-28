import { auth } from "../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getUserSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user || null;
};

export const requireRole = async (role) => {
  const user = await getUserSession();

  if (!user) {
    redirect("/sign-in");
  }

  if ((user.role || "").toLowerCase() !== role.toLowerCase()) {
    redirect("/unauthorized");
  }

  return user;
};