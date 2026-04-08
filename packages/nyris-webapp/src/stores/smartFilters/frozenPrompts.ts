/**
 * Frozen Prompts — Re-exports
 *
 * Each customer's prompts live in their own file under ./prompts/.
 * This file re-exports them all for backward compatibility.
 *
 * To edit prompts for a customer, go to:
 *   prompts/rs-components.ts
 *   prompts/gc-gruppe.ts
 */

export { RS_P2_PROMPT, RS_P3_PROMPT, RS_P5_PROMPT } from './prompts/rs-components';
export { GC_P2_PROMPT, GC_P3_PROMPT, GC_P5_PROMPT } from './prompts/gc-gruppe';
