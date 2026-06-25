"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PAGE_BLOCK_TYPES, type PageBlockType, getPageUrl } from "@/lib/page-blocks";
import { CONTENT_VIEW_MODES, type ContentViewMode } from "@/lib/content-views";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";

type Block = {
  id: number;
  type: string;
  order: number;
  config: Record<string, unknown>;
};

type Page = {
  id: number;
  title: string;
  slug: string;
  isHome: boolean;
  published: boolean;
  inNav?: boolean;
  blocks: Block[];
};

type Space = { id: number; name: string; slug: string };
type ContentItem = { id: number; title: string };

const DEFAULT_CONFIGS: Record<string, Record<string, unknown>> = {
  hero: { title: "Заглавие", subtitle: "Подзаглавие", buttonText: "Започни", buttonUrl: "/register" },
  text: { title: "Секция", body: "Текст тук..." },
  posts: { spaceId: null, limit: 6, title: "Последни публикации", view: "grid" },
  space_posts: { spaceId: null, title: "Публикации", postIds: [], limit: 6, view: "grid" },
  spaces: {},
  cta: { title: "Присъедини се", subtitle: "Стани част от общността", buttonText: "Регистрация", buttonUrl: "/register" },
};

export default function AdminPageEditor() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacePosts, setSpacePosts] = useState<Record<number, ContentItem[]>>({});
  const [addToNav, setAddToNav] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () =>
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((data: Page) => {
        setPage(data);
        setAddToNav(Boolean(data.inNav));
      });
  useEffect(() => {
    load();
    fetch("/api/admin/spaces").then((r) => r.json()).then(setSpaces);
  }, [id]);

  useEffect(() => {
    if (!page) return;
    page.blocks.forEach((block) => {
      if (block.type === "space_posts" && block.config?.spaceId) {
        loadSpacePosts(Number(block.config.spaceId), block.id);
      }
    });
  }, [page?.id]);

  const savePage = async () => {
    if (!page) return;
    const res = await fetch(`/api/admin/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: page.title,
        slug: page.slug,
        isHome: page.isHome,
        published: page.published,
        addToNav,
      }),
    });
    const data = await res.json();
    if (data?.inNav !== undefined) setAddToNav(Boolean(data.inNav));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const addBlock = async (type: PageBlockType) => {
    await fetch(`/api/admin/pages/${id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, config: DEFAULT_CONFIGS[type] ?? {} }),
    });
    load();
  };

  const updateBlockConfig = async (block: Block) => {
    await fetch(`/api/admin/pages/${id}/blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: block.config }),
    });
    load();
  };

  const removeBlock = async (blockId: number) => {
    if (!confirm("Изтриване на блок?")) return;
    await fetch(`/api/admin/pages/${id}/blocks/${blockId}`, { method: "DELETE" });
    load();
  };

  const moveBlock = async (index: number, direction: -1 | 1) => {
    if (!page) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= page.blocks.length) return;
    const blocks = [...page.blocks];
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setPage({ ...page, blocks });
    await fetch(`/api/admin/pages/${id}/blocks/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockIds: blocks.map((b) => b.id) }),
    });
    load();
  };

  const loadSpacePosts = (spaceId: number, blockId: number) => {
    fetch(`/api/content?status=PUBLISHED&spaceId=${spaceId}`)
      .then((r) => r.json())
      .then((data: ContentItem[]) => {
        setSpacePosts((prev) => ({ ...prev, [blockId]: Array.isArray(data) ? data : [] }));
      });
  };

  const togglePostId = (block: Block, postId: number) => {
    const current = (block.config.postIds as number[]) ?? [];
    const postIds = current.includes(postId)
      ? current.filter((id) => id !== postId)
      : [...current, postId];
    updateBlockInState(block.id, { ...block.config, postIds });
  };

  const updateBlockInState = (blockId: number, config: Record<string, unknown>) => {
    if (!page) return;
    setPage({
      ...page,
      blocks: page.blocks.map((b) => (b.id === blockId ? { ...b, config } : b)),
    });
  };

  if (!page) return <p className="text-zinc-500">Зареждане...</p>;

  const pageUrl = getPageUrl(page);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/pages" className="text-sm text-violet-600 hover:underline">← Страници</Link>
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            URL: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{pageUrl}</code>
            {!page.published && <span className="ml-2 text-amber-600">(непубликувана — няма да се вижда)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {page.published && (
            <Link href={pageUrl} target="_blank">
              <Button variant="outline" className="gap-1">
                <ExternalLink className="h-4 w-4" /> Преглед
              </Button>
            </Link>
          )}
          <Button onClick={savePage}>{saved ? "Запазено ✓" : "Запази"}</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Настройки на страницата</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Заглавие</Label>
            <Input value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input
              value={page.slug}
              disabled={page.isHome}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              placeholder="about-us"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={page.isHome} onChange={(e) => setPage({ ...page, isHome: e.target.checked })} />
            Начална страница (заменя /)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={page.published} onChange={(e) => setPage({ ...page, published: e.target.checked })} />
            Публикувана
          </label>
          {!page.isHome && (
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={addToNav} onChange={(e) => setAddToNav(e.target.checked)} />
              Показвай в навигацията
            </label>
          )}
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium text-zinc-500">Добави блок</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PAGE_BLOCK_TYPES) as PageBlockType[]).map((type) => (
            <Button key={type} variant="outline" size="sm" onClick={() => addBlock(type)}>
              + {PAGE_BLOCK_TYPES[type]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {page.blocks.length === 0 && (
          <p className="text-zinc-500">Няма блокове. Добави поне един отгоре.</p>
        )}
        {page.blocks.map((block, index) => (
          <Card key={block.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <Badge>{PAGE_BLOCK_TYPES[block.type as PageBlockType] ?? block.type}</Badge>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => moveBlock(index, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" disabled={index === page.blocks.length - 1} onClick={() => moveBlock(index, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeBlock(block.id)}>Изтрий</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(block.type === "hero" || block.type === "cta" || block.type === "text") && (
                <>
                  <div className="space-y-1">
                    <Label>Заглавие</Label>
                    <Input
                      value={String(block.config?.title ?? "")}
                      onChange={(e) => updateBlockInState(block.id, { ...block.config, title: e.target.value })}
                    />
                  </div>
                  {block.type === "text" ? (
                    <div className="space-y-1">
                      <Label>Съдържание</Label>
                      <Textarea
                        value={String(block.config?.body ?? "")}
                        onChange={(e) => updateBlockInState(block.id, { ...block.config, body: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label>Подзаглавие</Label>
                      <Input
                        value={String(block.config?.subtitle ?? "")}
                        onChange={(e) => updateBlockInState(block.id, { ...block.config, subtitle: e.target.value })}
                      />
                    </div>
                  )}
                  {(block.type === "hero" || block.type === "cta") && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Бутон текст</Label>
                        <Input
                          value={String(block.config?.buttonText ?? "")}
                          onChange={(e) => updateBlockInState(block.id, { ...block.config, buttonText: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Бутон URL</Label>
                        <Input
                          value={String(block.config?.buttonUrl ?? "")}
                          onChange={(e) => updateBlockInState(block.id, { ...block.config, buttonUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                  <Button size="sm" onClick={() => updateBlockConfig(page.blocks.find((b) => b.id === block.id)!)}>
                    Запази блок
                  </Button>
                </>
              )}
              {(block.type === "posts" || block.type === "space_posts") && (
                <>
                  <div className="space-y-1">
                    <Label>Заглавие на секцията</Label>
                    <Input
                      value={String(block.config?.title ?? (block.type === "posts" ? "Последни публикации" : "Публикации"))}
                      onChange={(e) => updateBlockInState(block.id, { ...block.config, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Пространство</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border px-3 text-sm"
                      value={String(block.config?.spaceId ?? "")}
                      onChange={(e) => {
                        const spaceId = e.target.value ? Number(e.target.value) : null;
                        updateBlockInState(block.id, { ...block.config, spaceId, postIds: [] });
                        if (spaceId) loadSpacePosts(spaceId, block.id);
                      }}
                    >
                      <option value="">{block.type === "posts" ? "Всички пространства" : "Избери пространство"}</option>
                      {spaces.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Брой публикации</Label>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={String(block.config?.limit ?? 6)}
                      onChange={(e) => updateBlockInState(block.id, { ...block.config, limit: Number(e.target.value) || 6 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Изглед по подразбиране</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border px-3 text-sm"
                      value={String(block.config?.view ?? "grid")}
                      onChange={(e) => updateBlockInState(block.id, { ...block.config, view: e.target.value as ContentViewMode })}
                    >
                      {(Object.keys(CONTENT_VIEW_MODES) as ContentViewMode[]).map((mode) => (
                        <option key={mode} value={mode}>{CONTENT_VIEW_MODES[mode]}</option>
                      ))}
                    </select>
                    <p className="text-xs text-zinc-500">Посетителите могат да сменят изгледа с бутоните отгоре.</p>
                  </div>
                  {block.type === "space_posts" && block.config?.spaceId && (
                    <div className="space-y-2">
                      <Label>Избери конкретни постове (по избор)</Label>
                      <p className="text-xs text-zinc-500">Ако не избереш — показва последните от пространството.</p>
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                        {(spacePosts[block.id] ?? []).length === 0 && (
                          <button
                            type="button"
                            className="text-sm text-violet-600 hover:underline"
                            onClick={() => loadSpacePosts(Number(block.config.spaceId), block.id)}
                          >
                            Зареди постове
                          </button>
                        )}
                        {(spacePosts[block.id] ?? []).map((post) => (
                          <label key={post.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={((block.config.postIds as number[]) ?? []).includes(post.id)}
                              onChange={() => togglePostId(block, post.id)}
                            />
                            {post.title}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button size="sm" onClick={() => updateBlockConfig(page.blocks.find((b) => b.id === block.id)!)}>
                    Запази блок
                  </Button>
                </>
              )}
              {block.type === "spaces" && (
                <p className="text-sm text-zinc-500">Показва всички пространства автоматично.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
