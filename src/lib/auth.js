import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

const authDb = client.db(process.env.AUTH_DB_NAME || "auth-db");
const appDb  = client.db("skill-swap");

export const auth = betterAuth({

  emailAndPassword: {
    enabled: true,
  },

  database: mongodbAdapter(authDb, {
    client,
  }),

  user: {
    additionalFields: {
      role: {
        type:         "string",
        defaultValue: "Freelancer",
        required:     false,
        output:       true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const usersCollection = appDb.collection("users");

            await usersCollection.updateOne(
              { email: user.email },
              {
                $set: {
                  name:  user.name  || user.email,
                  email: user.email,
                  role:  user.role  || "Freelancer",
                },
                $setOnInsert: {
                  status: "Active",
                  joined: new Date(),
                },
              },
              { upsert: true }
            );

            console.log("✅ User saved to skill-swap:", user.email);
          } catch (err) {
            console.error("❌ Failed to save user:", err);
          }
        },
      },
    },
  },

});