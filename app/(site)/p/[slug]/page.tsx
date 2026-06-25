import { redirect } from "next/navigation";

export default async function LegacyPageRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
