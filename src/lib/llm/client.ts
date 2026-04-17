import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY || '';

export const getAnthropicClient = () => {
  if (!apiKey) {
    console.warn("WARNING: ANTHROPIC_API_KEY is not set. LLM calls will fail.");
  }
  return new Anthropic({ apiKey: apiKey || 'dummy-key' });
};

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
