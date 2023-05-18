import type {
  AnyHandler,
  Handler,
  Prettify,
  ResolverFunction,
} from './types.js';

type CreateEmitter<THandler extends Record<string, Handler>> = {
  [KType in keyof THandler]: THandler[KType];
};

export function createEmitter<THandler extends Record<string, AnyHandler>>(
  resolver: ResolverFunction
) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        return (data: unknown) => {
          return new Promise((resolve, reject) => {
            resolver(
              {
                type: prop,
                data,
              },
              (response) => {
                if (!response) {
                  reject(
                    new Error('Failed to resolve response, got undefined')
                  );
                  return;
                }

                if (response.isError) {
                  reject(response.error);
                  return;
                }

                resolve(response.data);
              }
            );
          });
        };
      },
    }
  ) as Prettify<CreateEmitter<THandler>>;
}
