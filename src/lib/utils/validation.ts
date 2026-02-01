import { z } from 'zod';

export const SUPPORTED_CHAINS = [
  'ethereum',
  'bsc',
  'polygon',
  'arbitrum',
  'optimism',
  'avalanche',
  'base'
] as const;

export type SupportedChain = typeof SUPPORTED_CHAINS[number];

export const CheckRequestSchema = z.object({
  token: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address format'),
  chain: z.enum(SUPPORTED_CHAINS, {
    errorMap: () => ({ message: `Chain must be one of: ${SUPPORTED_CHAINS.join(', ')}` })
  })
});

export type CheckRequest = z.infer<typeof CheckRequestSchema>;

export function validateRequest(body: unknown): { success: true; data: CheckRequest } | { success: false; error: string } {
  const result = CheckRequestSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError.message };
  }
  return { success: true, data: result.data };
}
