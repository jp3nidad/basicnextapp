import { betterAuth, BetterAuthOptions } from "better-auth";
import { bearer } from "better-auth/plugins";
import { pool } from "./db";

export const authOptions = {
    database: pool,
    // We explicitly map the plural names at the top level.
    // This is the supported way to handle plural tables in v1.4.9.
    user: { 
        modelName: "users",
        additionalFields: {
            active: {
                type: "boolean",
            },
        },
    },
    session: { modelName: "sessions" },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },

    emailAndPassword: {
        enabled: true,
    },
    
    plugins: [
        bearer()
    ],
                   
    secret: process.env.BETTER_AUTH_SECRET,
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);

export type Auth = typeof auth;
export type AuthOptions = typeof authOptions;