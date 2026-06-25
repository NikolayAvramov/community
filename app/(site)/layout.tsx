import SiteNavigation from "@/components/community/navigation";
import { SiteFooter } from "@/components/community/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <SiteNavigation />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
