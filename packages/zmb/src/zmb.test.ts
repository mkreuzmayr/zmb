import { EventEmitter } from 'node:events';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { createEmitter, createZmb, handler } from './index.js';

// pseudo-random id generator
const randomId = () => Math.random().toString(36).slice(2);

// promise resolver for reasons
async function resolve<T>(
  values: Iterable<T | PromiseLike<T>>
): Promise<(Awaited<T> | Error)[]> {
  return Promise.allSettled(values).then((results) =>
    results.map((result) =>
      result.status === 'rejected' ? result.reason : result.value
    )
  );
}

function createUntypedApi() {
  const ee = new EventEmitter();

  return {
    send: (request: unknown, sendResponse: (data: any) => void) => {
      // generate random id to identify the response

      const id = randomId();

      ee.once(id, sendResponse);
      ee.emit('message', { id, request });
    },

    onMessage: (
      callback: (
        request: unknown,
        sendResponse: (data: unknown) => void
      ) => void
    ) => {
      ee.on('message', ({ id, request }) => {
        callback(request, (response) => {
          ee.emit(id, response);
        });
      });
    },
  };
}

test('calculator api via ee', async () => {
  const api = createUntypedApi();

  const zmb = createZmb(api.onMessage, {
    multiply: handler(
      z.object({
        a: z.number(),
        b: z.number(),
      }),
      (data) => {
        return data.a * data.b;
      }
    ),

    divide: handler(
      z.object({
        a: z.number(),
        b: z.number(),
      }),
      (data) => {
        if (data.b === 0) {
          throw new Error('Cannot divide by zero');
        }

        return data.a / data.b;
      }
    ),
  });

  type MessageBus = typeof zmb;

  const messageBus = createEmitter<MessageBus>(api.send);

  const multiplications = await resolve([
    messageBus.multiply({ a: 2, b: 2 }),
    messageBus.multiply({ a: 3, b: 3 }),
    messageBus.multiply({ a: 4, b: 4 }),
  ]);

  const divisions = await resolve([
    messageBus.divide({ a: 2, b: 2 }),
    messageBus.divide({ a: 3, b: 3 }),
    messageBus.divide({ a: 4, b: 4 }),
  ]);

  const failingDivisions = await resolve([
    messageBus.divide({ a: 2, b: 0 }),
    messageBus.divide({ a: 3, b: 0 }),
    messageBus.divide({ a: 4, b: 0 }),
  ]);

  expect(multiplications).toEqual([4, 9, 16]);
  expect(divisions).toEqual([1, 1, 1]);
  expect(failingDivisions).toEqual([
    new Error('Cannot divide by zero'),
    new Error('Cannot divide by zero'),
    new Error('Cannot divide by zero'),
  ]);

  expect(await zmb.divide({ a: 2, b: 2 })).toEqual(1);
  expect(await zmb.divide({ a: 3, b: 3 })).toEqual(1);
  expect(await zmb.divide({ a: 4, b: 4 })).toEqual(1);

  expect(await zmb.multiply({ a: 2, b: 2 })).toEqual(4);
  expect(await zmb.multiply({ a: 3, b: 3 })).toEqual(9);
  expect(await zmb.multiply({ a: 4, b: 4 })).toEqual(16);
});
