"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/community/page-header";
import { Badge } from "@/components/ui/badge";
import { getAvatarGradient } from "@/lib/content-visuals";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Member = {
  id: number;
  name: string;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  createdAt: string;
  _count: { contents: number; comments: number };
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data.filter((m: Member) => m.role !== "SUPPORT") : []));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader title="Мембъри" description="Хората, които правят общността жива и интересна" />

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 py-16 text-center dark:border-violet-900/50 dark:bg-violet-950/20">
          <p className="text-4xl">👋</p>
          <p className="mt-3 text-sm text-slate-500">Няма мембъри все още.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Link key={member.id} href={`/members/${member.id}`}>
              <article className="group card-shine overflow-hidden rounded-2xl border border-white/80 bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-lg ring-2 ring-white dark:ring-slate-800",
                      !member.avatar && getAvatarGradient(member.name),
                    )}
                  >
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-bold text-slate-900 group-hover:text-violet-600 dark:text-slate-50 dark:group-hover:text-violet-400">
                        {member.name}
                      </span>
                      {member.role !== "MEMBER" && (
                        <Badge variant="secondary">{ROLE_LABELS[member.role] ?? member.role}</Badge>
                      )}
                    </div>
                    {member.bio ? (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{member.bio}</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">
                        {member._count.contents} публикации · {member._count.comments} коментара
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">от {formatDate(member.createdAt)}</p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
