import { z } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { taskDraftResponseSchema } from '../schemas/ai.schema.js';

export async function draftTask(idea: string) {
  if (!env.OPENAI_API_KEY) {
    throw new AppError(
      'AI is not set up yet. Please write the task yourself.',
      503,
    );
  }

  let response: Response;

  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        store: false,
        max_output_tokens: 800,
        instructions:
          'Turn the idea into a short task title and description. ' +
          'Use the same language as the idea. ' +
          'Do not invent facts or requirements. ' +
          'If details are missing, ask questions in the description.',
        input: idea,
        text: {
          format: {
            type: 'json_schema',
            name: 'task_draft',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['title', 'description'],
              additionalProperties: false,
            },
          },
        },
      }),
    });
  } catch {
    throw new AppError('Could not reach AI. Please try again.', 503);
  }

  if (!response.ok) {
    throw new AppError('AI could not write a draft. Please try again.', 502);
  }

  const responseSchema = z.object({
    status: z.literal('completed'),
    output: z.array(
      z.object({
        type: z.string(),
        content: z
          .array(
            z.object({
              type: z.string(),
              text: z.string().optional(),
            }),
          )
          .optional(),
      }),
    ),
  });

  try {
    const data = responseSchema.parse(await response.json());

    const content = data.output
      .filter((item) => item.type === 'message')
      .flatMap((item) => item.content ?? []);

    if (content.some((item) => item.type === 'refusal')) {
      throw new Error('AI refused the request');
    }

    const answer = content
      .filter((item) => item.type === 'output_text')
      .map((item) => item.text ?? '')
      .join('');

    return taskDraftResponseSchema.parse(JSON.parse(answer));
  } catch {
    throw new AppError(
      'AI could not return a valid draft. Please try again.',
      502,
    );
  }
}
