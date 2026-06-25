# Community Platform

Персонализируема общност платформа — Next.js 16, Prisma, SQLite, JWT auth, админ CMS.

**Репо:** https://github.com/NikolayAvramov/community

---

## Изисквания

| Нещо | Версия |
|------|--------|
| Node.js | 18+ (препоръчително 20+) |
| npm | 9+ |
| Git | за clone |

---

## Първоначална инсталация (нов компютър)

```bash
# 1. Сваляне
git clone https://github.com/NikolayAvramov/community.git
cd community

# 2. Зависимости (автоматично пуска prisma generate)
npm install

# 3. Environment файл
cp .env.example .env

# 4. База данни — създава prisma/dev.db и прилага миграциите
npx prisma migrate dev

# 5. Демо данни, админ акаунт, секции, навигация
npm run db:seed

# 6. Старт
npm run dev
```

Отвори: **http://localhost:3000**

---

## Environment променливи (`.env`)

| Ключ | Задължителен | Описание | Пример |
|------|--------------|----------|--------|
| `DATABASE_URL` | Да | Път до SQLite файла | `file:./dev.db` |
| `JWT_SECRET` | Да | Секрет за login токени. **Смени в production!** | `dev-secret-change-in-production` |

Файлът `.env` **не е в git** — създава се ръчно от `.env.example`.

---

## Тестови акаунти (след `db:seed`)

| Роля | Имейл | Парола | Достъп |
|------|--------|--------|--------|
| **Админ** | `admin@community.bg` | `admin123` | Пълен админ панел `/admin` |
| **Мембър** | `member@community.bg` | `member123` | Обикновен потребител |
| Support | `support@platform.internal` | — | Само чрез support access линк (не за вход) |

---

## npm команди

| Команда | Какво прави |
|---------|-------------|
| `npm run dev` | Dev сървър на :3000 (`prisma generate` + `next dev`) |
| `npm run build` | Production build |
| `npm start` | Стартира build-нат app |
| `npm run db:migrate` | Нова миграция / прилагане на schema промени |
| `npm run db:seed` | Пълни базата с демо данни |
| `npm run db:studio` | Prisma Studio — визуален преглед на БД |
| `npm run lint` | ESLint |

---

## Структура на проекта

```
app/
  (site)/          # Публичен сайт (начало, секции, мембъри, съобщения…)
  admin/           # Админ CMS панел
  api/             # REST API routes
components/        # UI и community компоненти
lib/               # Auth, Prisma, validators, helpers
prisma/
  schema.prisma    # Database schema
  migrations/      # Миграции (в git)
  seed.ts          # Seed скрипт
public/uploads/    # Качени файлове (локално, не в git)
```

---

## Админ панел

- URL: **http://localhost:3000/admin**
- Вход с `admin@community.bg` / `admin123`

Възможности:
- Секции (достъп, покани, slug)
- Съдържание, банери, страници, навигация
- Полета и форми, настройки на сайта
- Support access (временен линк за поддръжка)

---

## Support Access

В **Админ → Настройки** може да се генерира временен линк за екип поддръжка:

```
/support-access?token=...
```

Токенът е валиден 7 дни. Ролята `SUPPORT` има пълен админ достъп.

---

## Slug редиректи (секции)

При смяна на slug на секция в админа, старият URL автоматично пренасочва към новия:

```
/spaces/stariy-slug  →  /spaces/noviyat-slug  (308)
```

Slug-овете се нормализират до **латиница** (кирилица се преобразува автоматично).

---

## Какво **няма** в git (и е нормално)

| Файл/папка | Защо |
|------------|------|
| `node_modules/` | Инсталира се с `npm install` |
| `.next/` | Build cache — генерира се при `dev`/`build` |
| `.env` | Тайни ключове — копира се от `.env.example` |
| `prisma/dev.db` | Локална база — създава се с `migrate dev` |
| `public/uploads/*` | Качени снимки — само локално |

---

## Production (кратко)

1. Смени `JWT_SECRET` на дълъг случаен низ
2. Използвай PostgreSQL вместо SQLite (промени `DATABASE_URL` и `provider` в schema)
3. `npm run build && npm start`
4. Или deploy на Vercel / VPS с Node

---

## Чести проблеми

### `Unknown field ... for model` (Prisma)
```bash
npx prisma generate
# рестартирай dev сървъра
npm run dev
```

### Порт 3000 зает
```bash
lsof -ti :3000 | xargs kill -9
rm -f .next/dev/lock
npm run dev
```

### Push към GitHub отхвърлен (големи файлове)
Не комитвай `node_modules`, `.next`, `.env`, `dev.db`. Виж `.gitignore`.

### Счупени снимки след clone
Качените файлове не са в git. Качи ги отново или ползвай seed без снимки.

---

## Лиценз

Private — личен проект.
