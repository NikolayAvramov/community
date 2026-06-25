import type { Role } from "@prisma/client";

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

export function isModerator(role: Role): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  POST: "Пост",
  ARTICLE: "Статия",
  EVENT: "Събитие",
};

export const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: "Текст",
  TEXTAREA: "Дълъг текст",
  NUMBER: "Число",
  EMAIL: "Имейл",
  URL: "URL",
  SELECT: "Избор",
  MULTI_SELECT: "Множествен избор",
  CHECKBOX: "Отметка",
  DATE: "Дата",
  DATETIME: "Дата и час",
  IMAGE: "Изображение",
  RICH_TEXT: "Форматиран текст",
};

export const PLACEMENT_LABELS: Record<string, string> = {
  home: "Начална страница",
  global: "Глобално",
  space: "Секция",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Администратор",
  MODERATOR: "Модератор",
  SUPPORT: "Поддръжка",
  MEMBER: "Мембър",
};
