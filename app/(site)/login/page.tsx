"use client";

import { Suspense, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import LoginForm from "./login-form";

function LoginPageContent() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  if (loading) return <div className="p-8 text-center text-zinc-500">Зареждане...</div>;
  if (user) return null;

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Зареждане...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
