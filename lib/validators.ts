import { z } from "zod";
import { fieldKeyFromText } from "./utils";

export const fieldKeySchema = z
  .string()
  .min(1, "Ключът е задължителен")
  .transform((value) => fieldKeyFromText(value))
  .refine((value) => /^[a-z0-9_]+$/.test(value), {
    message: "Невалиден технически ключ",
  });

export const loginSchema = z.object({
  email: z.string().email("Невалиден имейл"),
  password: z.string().min(6, "Минимум 6 символа"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Невалиден имейл"),
  password: z.string().min(6, "Минимум 6 символа"),
});

export const fieldSchema = z.object({
  key: fieldKeySchema,
  label: z.string().min(1, "Етикетът е задължителен"),
  description: z.string().optional(),
  type: z.enum([
    "TEXT", "TEXTAREA", "NUMBER", "EMAIL", "URL", "SELECT",
    "MULTI_SELECT", "CHECKBOX", "DATE", "DATETIME", "IMAGE", "RICH_TEXT",
  ]),
  options: z.array(z.string()).optional(),
  validation: z.object({
    required: z.boolean().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  entityType: z.enum(["content", "user"]),
  applicableTypes: z.array(z.enum(["POST", "ARTICLE", "EVENT"])).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const formSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  entityType: z.enum(["content", "user"]),
  contentType: z.enum(["POST", "ARTICLE", "EVENT"]).optional(),
  spaceId: z.number().int().nullable().optional(),
  fieldIds: z.array(z.object({
    fieldId: z.number().int(),
    order: z.number().int(),
    required: z.boolean(),
  })).optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  placement: z.enum(["home", "global", "space"]).optional(),
  spaceId: z.number().int().nullable().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export const spaceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isPrivate: z.boolean().optional(),
  accessMode: z.enum(["PUBLIC", "MEMBERS", "RESTRICTED"]).optional(),
  allowMemberPosts: z.boolean().optional(),
  order: z.number().int().optional(),
  collectionId: z.number().int().nullable().optional(),
});

export const spaceInvitationSchema = z.object({
  email: z.string().email("Невалиден имейл"),
});

export const collectionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
});

export const contentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  type: z.enum(["POST", "ARTICLE", "EVENT"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  coverImage: z.string().optional().or(z.literal("")),
  spaceId: z.number().int().nullable().optional(),
  eventStart: z.string().optional(),
  eventEnd: z.string().optional(),
  eventLocation: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const siteSettingSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteDescription: z.string().optional(),
  primaryColor: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal("")),
  allowRegistration: z.boolean().optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1, "Коментарът не може да е празен").max(2000),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const navigationItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
