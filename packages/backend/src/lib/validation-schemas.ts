import { z } from 'zod';

export const whisperSchema = z.object({
  tokenId: z.coerce.number().int().min(0),
  text: z.string().trim().min(3).max(100),
  backgroundColor: z.string().trim().optional(),
  textColor: z.string().trim().optional()
});

export type WhisperDto = z.infer<typeof whisperSchema>