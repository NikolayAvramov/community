"use client";

import { useForm } from "react-hook-form";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RegisterValues = { name: string; email: string; password: string };

export default function RegisterPage() {
  const { user, loading, refresh } = useContext(AuthContext);
  const { register, handleSubmit } = useForm<RegisterValues>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  if (loading) return <div className="p-8 text-center text-slate-500">Зареждане...</div>;
  if (user) return null;

  const onSubmit = async (data: RegisterValues) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await refresh();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при регистрация");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="relative w-full">
        <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-orange-400/20 blur-2xl" />
        <Card className="relative w-full overflow-hidden shadow-[var(--shadow-card-hover)]">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400" />
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              <span className="text-gradient">Създайте акаунт</span>
            </CardTitle>
          <CardDescription>Присъединете се към общността</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Име</Label>
              <Input id="name" placeholder="Вашето име" {...register("name", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Имейл</Label>
              <Input id="email" type="email" placeholder="ти@example.com" {...register("email", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Парола</Label>
              <Input id="password" type="password" {...register("password", { required: true, minLength: 6 })} />
            </div>
            <Button type="submit" className="w-full">Регистрирай се</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Вече имате акаунт?{" "}
            <Link href="/login" className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
              Влезте
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
