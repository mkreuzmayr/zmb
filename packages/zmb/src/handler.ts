import { z } from 'zod';
import { AnyHandler, ResolverFunction } from './types.js';
import { errorify } from './utils.js';

export function handler<TSchema extends z.ZodTypeAny, TCallback>(
  schema: TSchema,
  callback: (data: z.infer<typeof schema>) => TCallback
) {
  return (data: z.infer<typeof schema>) => {
    const result = schema.parse(data);

    return Promise.resolve(callback(result));
  };
}

export function createZmb<THandler extends Record<string, AnyHandler>>(
  registerResolver: (resolver: ResolverFunction) => void,
  handlers: THandler
) {
  registerResolver(async (request, sendResponse) => {
    const { type, data } = request as {
      type: keyof THandler;
      data: unknown;
    };

    const handler = handlers[type];

    if (!handler) {
      sendResponse({
        isError: true,
        error: new Error(`Handler for type "${String(type)}" not found`),
      });

      return;
    }

    try {
      sendResponse({
        isError: false,
        data: await handler(data),
      });
    } catch (err) {
      const error = errorify(err);

      sendResponse({
        isError: true,
        error,
      });
    }
  });

  return {
    ...handlers,
  };
}
