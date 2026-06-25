"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { resolveCtaForUser } from "@/lib/auth-ui";
import { ArrowRight, Sparkles } from "lucide-react";

export type BannerItem = {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
};

const BANNER_GRADIENTS = [
  "from-violet-600 via-purple-600 to-fuchsia-700",
  "from-sky-500 via-indigo-600 to-violet-700",
  "from-orange-500 via-rose-500 to-pink-600",
  "from-emerald-500 via-teal-600 to-cyan-700",
];

export function BannerList({ banners }: { banners: BannerItem[] }) {
  const { user } = useContext(AuthContext);

  if (banners.length === 0) return null;

  return (
    <div className="mb-12 space-y-6">
      {banners.map((banner, index) => {
        const cta = resolveCtaForUser(user, banner.linkUrl ?? null, banner.linkText ?? null);
        const gradient = BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];

        return (
          <section
            key={banner.id}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 shadow-2xl md:p-14`}
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {/* Decorative blobs */}
            <div className="blob -right-10 -top-10 h-48 w-48 bg-white/20" />
            <div className="blob -bottom-16 left-1/4 h-40 w-40 bg-fuchsia-300/30" />
            <div className="blob bottom-0 right-1/3 h-32 w-32 bg-orange-300/20" />

            {banner.imageUrl && (
              <>
                <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
              </>
            )}

            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Общността те очаква
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="mt-4 text-lg leading-relaxed text-white/85 md:text-xl">{banner.subtitle}</p>
              )}
              {cta.url && (
                <Link href={cta.url}>
                  <Button className="mt-8 gap-2 bg-white font-semibold text-violet-700 shadow-lg hover:bg-violet-50">
                    {cta.text ?? "Научи повече"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
