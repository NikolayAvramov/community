"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones } from "lucide-react";

function SupportAccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Липсва валиден линк за достъп.");
      return;
    }

    fetch("/api/support-access/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "Невалиден или изтекъл линк.");
          return;
        }
        setStatus("success");
        setMessage("Достъпът е активиран. Пренасочване...");
        router.replace(data.redirect ?? "/admin");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Възникна грешка при активиране на достъпа.");
      });
  }, [token, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Headphones className="h-6 w-6" />
          </div>
          <CardTitle>Достъп за поддръжка</CardTitle>
          <CardDescription>
            {status === "loading" && "Активиране на достъп до общността..."}
            {status === "success" && message}
            {status === "error" && message}
          </CardDescription>
        </CardHeader>
        {status === "error" && (
          <CardContent className="text-center text-sm text-slate-500">
            Свържете се с администратора на общността за нов линк.
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function SupportAccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Зареждане...</div>}>
      <SupportAccessContent />
    </Suspense>
  );
}
