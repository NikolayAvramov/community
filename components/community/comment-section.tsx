"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type Comment = {
  id: number;
  body: string;
  createdAt: string;
  author: { id: number; name: string; avatar?: string | null };
};

type Props = { slug: string };

export function CommentSection({ slug }: Props) {
  const { user, loading } = useContext(AuthContext);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    fetch(`/api/content/${slug}/comments`)
      .then((r) => r.json())
      .then(setComments);

  useEffect(() => { load(); }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/content/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setBody("");
        load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Изтриване на коментар?")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Коментари ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-sm text-zinc-400">Зареждане...</p>
        ) : user ? (
          <form onSubmit={submit} className="space-y-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Напиши коментар..."
              rows={3}
            />
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Изпращане..." : "Коментирай"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-zinc-500">
            <Link href="/login" className="text-violet-600 hover:underline">Влез</Link>, за да коментираш.
          </p>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-500">Все още няма коментари.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/members/${comment.author.id}`} className="font-medium hover:text-violet-600">
                      {comment.author.name}
                    </Link>
                    <p className="mt-1 text-sm leading-relaxed">{comment.body}</p>
                    <p className="mt-2 text-xs text-zinc-400">{formatDate(comment.createdAt)}</p>
                  </div>
                  {user && (user.id === comment.author.id || user.role === "ADMIN" || user.role === "MODERATOR") && (
                    <Button size="sm" variant="ghost" onClick={() => remove(comment.id)}>
                      Изтрий
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
