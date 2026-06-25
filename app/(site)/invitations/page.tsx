"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SPACE_LABEL } from "@/lib/space-labels";
import { Mail } from "lucide-react";

function InvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);
  const token = searchParams.get("token")?.trim() ?? "";
  const [info, setInfo] = useState<{
    email: string;
    space: { name: string; slug: string };
    requiresLogin: boolean;
    emailMatch: boolean | null;
  } | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Липсва валидна покана.");
      return;
    }
    fetch(`/api/invitations/accept?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setInfo(data);
        setStatus("loading");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message ?? "Невалидна покана.");
      });
  }, [token]);

  useEffect(() => {
    if (!token || loading || !info || !user) return;
    if (user.email.toLowerCase() !== info.email.toLowerCase()) {
      setStatus("error");
      setMessage(`Поканата е за ${info.email}. Влезте с този имейл.`);
      return;
    }
    fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setStatus("success");
        setMessage(`Добре дошли в ${SPACE_LABEL.oneAcc} „${info.space.name}"!`);
        router.replace(data.redirect ?? `/spaces/${info.space.slug}`);
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message ?? "Грешка при приемане.");
      });
  }, [token, loading, info, user, router]);

  if (!token) {
    return <p className="text-center text-slate-500">Липсва линк за покана.</p>;
  }

  if (!loading && !user && info) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Покана за {SPACE_LABEL.oneLower}</CardTitle>
          <CardDescription>
            Поканени сте в „{info.space.name}". Влезте с <strong>{info.email}</strong>, за да приемете.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Link href={`/login?redirect=/invitations?token=${encodeURIComponent(token)}`}>
            <Button className="w-full">Вход</Button>
          </Link>
          <Link href={`/register?redirect=/invitations?token=${encodeURIComponent(token)}`}>
            <Button variant="outline" className="w-full">Регистрация</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Mail className="h-6 w-6" />
        </div>
        <CardTitle>Покана за {SPACE_LABEL.oneLower}</CardTitle>
        <CardDescription>
          {status === "loading" && "Обработване на поканата..."}
          {status === "success" && message}
          {status === "error" && message}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function InvitationsPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
      <Suspense fallback={<p className="text-center text-slate-500">Зареждане...</p>}>
        <InvitationContent />
      </Suspense>
    </div>
  );
}
