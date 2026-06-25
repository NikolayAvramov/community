"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { SPACE_LABEL } from "@/lib/space-labels";
import { formatDate } from "@/lib/utils";

type Stats = {
  users: number;
  contents: number;
  spaces: number;
  fields: number;
  forms: number;
  banners: number;
  recentContent: Array<{
    id: number;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    author: { name: string };
  }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return <p className="text-zinc-500">Зареждане...</p>;
  }

  const cards = [
    { label: "Потребители", value: stats.users },
    { label: "Съдържание", value: stats.contents },
    { label: SPACE_LABEL.many, value: stats.spaces },
    { label: "Персонални полета", value: stats.fields },
    { label: "Форми", value: stats.forms },
    { label: "Активни банери", value: stats.banners },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Табло</h1>
        <p className="mt-1 text-zinc-500">Преглед на вашата общност</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последно съдържание</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentContent.length === 0 ? (
            <p className="text-zinc-500">Няма съдържание</p>
          ) : (
            <div className="space-y-3">
              {stats.recentContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-zinc-500">
                      {item.author.name} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{CONTENT_TYPE_LABELS[item.type]}</Badge>
                    <Badge variant={item.status === "PUBLISHED" ? "success" : "outline"}>{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
