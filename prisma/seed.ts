import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@community.bg" },
    update: { role: "ADMIN" },
    create: {
      name: "Администратор",
      email: "admin@community.bg",
      password,
      role: "ADMIN",
    },
  });

  const memberPassword = await bcrypt.hash("member123", 10);
  await prisma.user.upsert({
    where: { email: "member@community.bg" },
    update: {},
    create: {
      name: "Демо Потребител",
      email: "member@community.bg",
      password: memberPassword,
      role: "MEMBER",
    },
  });

  const supportPassword = await bcrypt.hash("support-no-login", 10);
  await prisma.user.upsert({
    where: { email: "support@platform.internal" },
    update: { role: "SUPPORT", name: "Екип поддръжка" },
    create: {
      name: "Екип поддръжка",
      email: "support@platform.internal",
      password: supportPassword,
      role: "SUPPORT",
    },
  });

  const collection = await prisma.collection.upsert({
    where: { slug: "general" },
    update: {},
    create: {
      name: "Общи",
      slug: "general",
      description: "Основни пространства на общността",
      order: 0,
    },
  });

  const spaces = [
    { name: "Дискусии", slug: "discussions", description: "Общи дискусии и въпроси", icon: "💬", color: "#7c3aed" },
    { name: "Статии", slug: "articles", description: "Дълги статии и ръководства", icon: "📰", color: "#2563eb" },
    { name: "Събития", slug: "events", description: "Предстоящи събития и срещи", icon: "📅", color: "#059669" },
  ];

  for (const [i, space] of spaces.entries()) {
    await prisma.space.upsert({
      where: { slug: space.slug },
      update: {},
      create: { ...space, order: i, collectionId: collection.id },
    });
  }

  const fields = [
    { key: "company", label: "Компания", type: "TEXT" as const, entityType: "user" },
    { key: "website", label: "Уебсайт", type: "URL" as const, entityType: "user" },
    { key: "difficulty", label: "Трудност", type: "SELECT" as const, entityType: "content", options: ["Начинаещ", "Среден", "Напреднал"], applicableTypes: ["ARTICLE"] },
    { key: "event_type", label: "Тип събитие", type: "SELECT" as const, entityType: "content", options: ["Онлайн", "На живо", "Хибрид"], applicableTypes: ["EVENT"] },
    { key: "registration_url", label: "Линк за регистрация", type: "URL" as const, entityType: "content", applicableTypes: ["EVENT"] },
  ];

  for (const [i, field] of fields.entries()) {
    await prisma.fieldDefinition.upsert({
      where: { key: field.key },
      update: {},
      create: {
        key: field.key,
        label: field.label,
        type: field.type,
        entityType: field.entityType,
        options: field.options,
        applicableTypes: field.applicableTypes,
        order: i,
      },
    });
  }

  const articleForm = await prisma.formDefinition.upsert({
    where: { slug: "article-form" },
    update: {},
    create: {
      name: "Форма за статия",
      slug: "article-form",
      entityType: "content",
      contentType: "ARTICLE",
    },
  });

  const difficultyField = await prisma.fieldDefinition.findUnique({ where: { key: "difficulty" } });
  if (difficultyField) {
    await prisma.formField.upsert({
      where: { formId_fieldId: { formId: articleForm.id, fieldId: difficultyField.id } },
      update: {},
      create: { formId: articleForm.id, fieldId: difficultyField.id, order: 0, required: false },
    });
  }

  const eventForm = await prisma.formDefinition.upsert({
    where: { slug: "event-form" },
    update: {},
    create: {
      name: "Форма за събитие",
      slug: "event-form",
      entityType: "content",
      contentType: "EVENT",
    },
  });

  const eventTypeField = await prisma.fieldDefinition.findUnique({ where: { key: "event_type" } });
  const regUrlField = await prisma.fieldDefinition.findUnique({ where: { key: "registration_url" } });
  if (eventTypeField) {
    await prisma.formField.upsert({
      where: { formId_fieldId: { formId: eventForm.id, fieldId: eventTypeField.id } },
      update: {},
      create: { formId: eventForm.id, fieldId: eventTypeField.id, order: 0, required: true },
    });
  }
  if (regUrlField) {
    await prisma.formField.upsert({
      where: { formId_fieldId: { formId: eventForm.id, fieldId: regUrlField.id } },
      update: {},
      create: { formId: eventForm.id, fieldId: regUrlField.id, order: 1, required: false },
    });
  }

  await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Добре дошли в общността",
      subtitle: "Споделяй, учи и се свързвай с хора със сходни интереси",
      linkUrl: "/register",
      linkText: "Присъедини се",
      isActive: true,
      order: 0,
      placement: "home",
    },
  });

  const discussionsSpace = await prisma.space.findUnique({ where: { slug: "discussions" } });
  if (discussionsSpace) {
    await prisma.content.upsert({
      where: { slug_type: { slug: "welcome-post", type: "POST" } },
      update: {},
      create: {
        title: "Добре дошли!",
        slug: "welcome-post",
        excerpt: "Първият пост в общността",
        body: "Това е началото на вашата общност. Създавайте постове, статии и събития — всичко е напълно персонализируемо от админ панела.",
        type: "POST",
        status: "PUBLISHED",
        authorId: admin.id,
        spaceId: discussionsSpace.id,
        publishedAt: new Date(),
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "general" },
    update: {},
    create: {
      key: "general",
      value: {
        siteName: "Community",
        siteDescription: "Вашата персонализируема общност",
        primaryColor: "#7c3aed",
        logoUrl: "",
        allowRegistration: true,
      },
    },
  });

  const navItems = [
    { label: "Начало", href: "/", order: 0 },
    { label: "Секции", href: "/spaces", order: 1 },
    { label: "Мембъри", href: "/members", order: 2 },
    { label: "Съобщения", href: "/messages", order: 3 },
  ];

  for (const item of navItems) {
    const existing = await prisma.navigationItem.findFirst({ where: { href: item.href } });
    if (!existing) {
      await prisma.navigationItem.create({ data: item });
    }
  }

  const homePage = await prisma.page.upsert({
    where: { slug: "home" },
    update: { isHome: true, published: true },
    create: {
      title: "Начална страница",
      slug: "home",
      isHome: true,
      published: true,
    },
  });

  const existingBlocks = await prisma.pageBlock.count({ where: { pageId: homePage.id } });
  if (existingBlocks === 0) {
    await prisma.pageBlock.createMany({
      data: [
        {
          pageId: homePage.id,
          type: "hero",
          order: 0,
          config: {
            title: "Добре дошли в общността",
            subtitle: "Споделяй, учи и се свързвай с хора със сходни интереси",
            buttonText: "Присъедини се",
            buttonUrl: "/register",
          },
        },
        { pageId: homePage.id, type: "posts", order: 1, config: {} },
        { pageId: homePage.id, type: "spaces", order: 2, config: {} },
        {
          pageId: homePage.id,
          type: "cta",
          order: 3,
          config: {
            title: "Готов ли си?",
            subtitle: "Създай акаунт и започни да публикуваш",
            buttonText: "Регистрация",
            buttonUrl: "/register",
          },
        },
      ],
    });
  }

  console.log("Seed completed!");
  console.log("Admin: admin@community.bg / admin123");
  console.log("Member: member@community.bg / member123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
