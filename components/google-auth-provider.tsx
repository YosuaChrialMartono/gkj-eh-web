"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"

export function ClientGoogleAuthProvider({
  children,
  clientId,
}: {
  children: React.ReactNode
  clientId: string
}) {
  if (!clientId) return <>{children}</>
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
}
