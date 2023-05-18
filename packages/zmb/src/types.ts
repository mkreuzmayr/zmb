// Handler

export type Handler<TProps = unknown, TReturnData = unknown> = (
  data: TProps
) => Promise<TReturnData>;

export type AnyHandler = Handler<any, unknown>;

// Resolver

type ResolverResponse<TReturnData = unknown> =
  | {
      isError: true;
      error: Error;
    }
  | {
      isError: false;
      data: TReturnData;
    };

export type AnyResolverResponse = ResolverResponse<any>;

export type ResolverFunction = (
  request: unknown,
  sendResponse: (response: AnyResolverResponse) => void
) => void;

// Utils

/**
 * @description Prettify will show all the keys in the type with out the heavy nested types
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
