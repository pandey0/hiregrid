import { createAuthClient } from "better-auth/react"
const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== "undefined" ? window.location.origin : "")
})
export const {signUp,signOut,signIn} = authClient