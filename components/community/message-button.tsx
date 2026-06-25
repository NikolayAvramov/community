"use client";

import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function MessageButton({ userId }: { userId: number }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  if (loading) return null;
  if (!user || user.id === userId) return null;

  const startChat = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      const conv = await res.json();
      router.push(`/messages?id=${conv.id}`);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={startChat} disabled={starting} className="gap-1">
      <MessageCircle className="h-4 w-4" />
      {starting ? "..." : "Съобщение"}
    </Button>
  );
}
