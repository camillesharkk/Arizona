"use client";

import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";

export function ResetPasswordForm() {
  const params = useSearchParams();
  return <AuthForm mode="reset" initialToken={params.get("token") || ""} />;
}
