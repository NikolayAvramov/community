"use client";

import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LoginValues = { email: string; password: string };

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const { register, handleSubmit } = useForm<LoginValues>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const onSubmit = async (data: LoginValues) => {
    setError(null);
    try {
      await login(data.email, data.password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при вход");
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
              <span className="text-gradient">Добре дошли</span>
            </CardTitle>
          <CardDescription>Влезте в акаунта си, за да продължите</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Имейл</Label>
              <Input id="email" type="email" placeholder="ти@example.com" {...register("email", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Парола</Label>
              <Input id="password" type="password" {...register("password", { required: true })} />
            </div>
            <Button type="submit" className="w-full">
              Влез
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Нямате акаунт?{" "}
            <Link href="/register" className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
              Регистрирайте се
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
