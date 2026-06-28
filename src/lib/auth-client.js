import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// ❌ import { auth } from "./auth"  — এই line টা DELETE করুন
// auth.js এ MongoDB আছে, সেটা browser এ চলে না

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",

  plugins: [
    inferAdditionalFields({
      // from: auth এর বদলে manually field লিখুন
      fields: {
        role: {
          type: "string",
        },
      },
    }),
  ],
});

export const {
  signIn,
  signUp,
  useSession,
  signOut,
} = authClient;