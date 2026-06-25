"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  initialCount: number;
  initialLiked: boolean;
};

export function LikeButton({ slug, initialCount, initialLiked }: Props) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
    setLiked(initialLiked);
  }, [initialCount, initialLiked]);

  const toggle = async () => {
    if (authLoading || !user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${slug}/like`, {
        method: liked ? "DELETE" : "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setCount(data.likeCount);
        setLiked(data.likedByMe);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Heart className="h-4 w-4" />
        {count}
      </Button>
    );
  }

  if (!user) {
    return (
      <Link href={`/login?redirect=/content/${slug}`}>
        <Button variant="outline" size="sm" className="gap-2">
          <Heart className="h-4 w-4" />
          {count}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={cn("gap-2", liked && "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30")}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      {count}
    </Button>
  );
}
