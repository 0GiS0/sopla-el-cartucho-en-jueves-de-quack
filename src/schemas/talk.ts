import { z } from 'zod';

export const SessionTypeSchema = z.literal('episode');
export const SessionLanguageSchema = z.literal('es');

export const SpeakerSchema = z.object({
  name: z.string().min(1),
  role: z.string(),
  avatarUrl: z.string().url(),
});

export const SessionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  speakers: z.array(SpeakerSchema),
  date: z.string().min(1),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  type: SessionTypeSchema,
  language: SessionLanguageSchema,
  tags: z.array(z.string()),
});

export const SessionsFileSchema = z.object({
  show: z.object({
    name: z.string().min(1),
    channel: z.string().min(1),
    channelUrl: z.string().url(),
  }),
  sessions: z.array(SessionSchema),
});

export const AssetSchema = z.object({
  sessionId: z.string().min(1),
  cover: z.string().optional(),
  avatar8bit: z.string().optional(),
  avatarOriginal: z.string().optional(),
});

export const AssetsFileSchema = z.object({
  assets: z.array(AssetSchema),
});

export type SessionType = z.infer<typeof SessionTypeSchema>;
export type SessionLanguage = z.infer<typeof SessionLanguageSchema>;
export type Speaker = z.infer<typeof SpeakerSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type SessionsFile = z.infer<typeof SessionsFileSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type AssetsFile = z.infer<typeof AssetsFileSchema>;
