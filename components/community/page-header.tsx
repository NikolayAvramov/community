import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  accent?: boolean;
};

export function PageHeader({ title, description, action, className, accent = true }: Props) {
  return (
    <div className={cn("relative mb-10", className)}>
      {accent && (
        <div className="pointer-events-none absolute -left-4 top-0 h-full w-1 rounded-full bg-gradient-to-b from-violet-500 via-fuchsia-500 to-orange-400 sm:-left-6" />
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 pl-2 sm:pl-0">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            <span className="text-gradient">{title}</span>
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 md:text-base">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
