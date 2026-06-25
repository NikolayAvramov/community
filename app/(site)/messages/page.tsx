"use client";

import { useEffect, useState, useRef } from "react";
import { useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Suspense } from "react";

type Message = {
  id: number;
  body: string;
  createdAt: string;
  author: { id: number; name: string };
};

type Conversation = {
  id: number;
  participants: Array<{ user: { id: number; name: string; avatar?: string | null } }>;
  messages: Message[];
};

function MessagesContent() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/messages");
  }, [user, loading, router]);

  const loadConversations = () =>
    fetch("/api/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []));

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    const load = () =>
      fetch(`/api/conversations/${activeId}/messages`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setMessages(Array.isArray(data) ? data : []));
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    await fetch(`/api/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: text }),
    });
    setText("");
    const res = await fetch(`/api/conversations/${activeId}/messages`, { credentials: "include" });
    setMessages(await res.json());
    loadConversations();
  };

  const otherUser = (conv: Conversation) =>
    conv.participants.find((p) => p.user.id !== user?.id)?.user;

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-center text-zinc-500">Зареждане...</div>;
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl gap-4 px-4 py-4">
      <Card className="w-80 shrink-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b p-4 font-semibold">Съобщения</div>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500">Няма разговори. Започни от профил на член.</p>
            ) : (
              conversations.map((conv) => {
                const other = otherUser(conv);
                const last = conv.messages[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => router.push(`/messages?id=${conv.id}`)}
                    className={`w-full border-b p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 ${activeId === String(conv.id) ? "bg-violet-50 dark:bg-violet-950/20" : ""}`}
                  >
                    <p className="font-medium">{other?.name}</p>
                    {last && <p className="truncate text-xs text-zinc-500">{last.body}</p>}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col overflow-hidden">
        {activeId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${msg.author.id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${msg.author.id === user.id ? "bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                    <p>{msg.body}</p>
                    <p className={`mt-1 text-xs ${msg.author.id === user.id ? "text-violet-200" : "text-zinc-400"}`}>
                      {formatDateTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t p-4">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Напиши съобщение..." />
              <Button type="submit">Изпрати</Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500">
            Избери разговор
          </div>
        )}
      </Card>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Зареждане...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
