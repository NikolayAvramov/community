"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LikeButton } from "@/components/community/like-button";
import { CommentSection } from "@/components/community/comment-section";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, MessageCircle } from "lucide-react";

type ContentDetail = {
  id: number;
  title: string;
  body: string;
  excerpt?: string;
  type: string;
  coverImage?: string;
  createdAt: string;
  eventStart?: string;
  eventEnd?: string;
  eventLocation?: string;
  author: { id: number; name: string; avatar?: string | null };
  space?: { name: string; slug: string };
  customFields?: Record<string, unknown>;
  likedByMe: boolean;
  _count: { likes: number; comments: number };
};

export default function ContentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<ContentDetail | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/content/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setContent)
      .catch(() => setContent(null));
  }, [slug]);

  if (content === null) {
    return <div className="p-8 text-center text-zinc-500">Съдържанието не е намерено.</div>;
  }

  if (!content) {
    return <div className="p-8 text-center text-zinc-500">Зареждане...</div>;
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Badge>{CONTENT_TYPE_LABELS[content.type]}</Badge>
        {content.space && (
          <Link href={`/spaces/${content.space.slug}`}>
            <Badge variant="outline">{content.space.name}</Badge>
          </Link>
        )}
      </div>

      {content.coverImage && (
        <img src={content.coverImage} alt="" className="mb-6 h-64 w-full rounded-xl object-cover" />
      )}

      <h1 className="text-4xl font-bold tracking-tight">{content.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Link href={`/members/${content.author.id}`} className="text-zinc-500 hover:text-violet-600">
          {content.author.name}
        </Link>
        <span className="text-zinc-400">·</span>
        <span className="text-zinc-500">{formatDate(content.createdAt)}</span>
        <span className="flex items-center gap-1 text-sm text-zinc-400">
          <MessageCircle className="h-4 w-4" />
          {content._count.comments}
        </span>
        <LikeButton slug={slug} initialCount={content._count.likes} initialLiked={content.likedByMe} />
      </div>

      {content.type === "EVENT" && (
        <Card className="mt-6">
          <CardContent className="flex flex-wrap gap-4 pt-6">
            {content.eventStart && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-violet-600" />
                {formatDateTime(content.eventStart)}
                {content.eventEnd && ` – ${formatDateTime(content.eventEnd)}`}
              </div>
            )}
            {content.eventLocation && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-violet-600" />
                {content.eventLocation}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
        <p className="whitespace-pre-wrap text-lg leading-relaxed">{content.body}</p>
      </div>

      {content.customFields && Object.keys(content.customFields).length > 0 && (
        <Card className="mt-8">
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
            {Object.entries(content.customFields).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs uppercase text-zinc-400">{key}</p>
                {typeof value === "string" && (value.startsWith("/uploads/") || value.startsWith("http")) && /\.(jpg|jpeg|png|gif|webp)/i.test(value) ? (
                  <img src={value} alt="" className="mt-1 max-h-48 rounded-lg object-cover" />
                ) : (
                  <p className="font-medium">{String(value)}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <CommentSection slug={slug} />
    </article>
  );
}
