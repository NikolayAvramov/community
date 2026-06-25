import { cn } from "@/lib/utils";
import { getContentVisuals } from "@/lib/content-visuals";

type Props = {
  type: string;
  title: string;
  coverImage?: string | null;
  className?: string;
  imageClassName?: string;
  overlay?: boolean;
};

export function ContentCover({
  type,
  title,
  coverImage,
  className,
  imageClassName,
  overlay = false,
}: Props) {
  const visual = getContentVisuals(type);

  if (coverImage) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <img
          src={coverImage}
          alt=""
          className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-105", imageClassName)}
        />
        {overlay && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        visual.gradient,
        className,
      )}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/20 blur-xl" />
      </div>
      <span className="relative text-4xl drop-shadow-md md:text-5xl">{visual.emoji}</span>
      <p className="sr-only">{title}</p>
    </div>
  );
}
