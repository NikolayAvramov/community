"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageButton } from "@/components/community/message-button";
import { ContentFeedSection } from "@/components/community/content-feed-section";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type Profile = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  createdAt: string;
  customFields?: Record<string, unknown>;
  contents: Array<{ id: number; title: string; slug: string; type: string; excerpt?: string; createdAt: string }>;
  _count: { contents: number; comments: number; likes: number };
};

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then((r) => r.json()).then(setProfile);
  }, [id]);

  if (!profile) return <div className="p-8 text-center text-zinc-500">Зареждане...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700 dark:bg-violet-900/30">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <MessageButton userId={profile.id} />
            </div>
            {profile.role !== "MEMBER" && (
              <Badge className="mt-2">{ROLE_LABELS[profile.role] ?? profile.role}</Badge>
            )}
            {profile.bio && <p className="mt-3 text-zinc-600 dark:text-zinc-400">{profile.bio}</p>}
            <p className="mt-3 text-sm text-zinc-400">
              {profile._count.contents} публикации · {profile._count.comments} коментара · {profile._count.likes} харесвания
            </p>
            <p className="text-xs text-zinc-400">Мембър от {formatDate(profile.createdAt)}</p>
          </div>
        </CardHeader>

        {profile.customFields && Object.keys(profile.customFields).length > 0 && (
          <CardContent className="grid gap-3 border-t pt-6 sm:grid-cols-2">
            {Object.entries(profile.customFields).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs uppercase text-zinc-400">{key}</p>
                <p className="font-medium">{String(value)}</p>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Публикации</h2>
        <ContentFeedSection
          items={profile.contents.map((item) => ({
            ...item,
            author: { name: profile.name, id: profile.id },
          }))}
          defaultView="compact"
          storageKey={`content-view-member-${profile.id}`}
          emptyMessage="Няма публикации."
          showAuthor={false}
          showSpace={false}
          showStats={false}
        />
      </div>
    </div>
  );
}
