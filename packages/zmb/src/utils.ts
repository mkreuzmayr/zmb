/**
 * @description errorify will try to convert the error to an Error object
 */
export function errorify(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null) {
    return new Error(JSON.stringify(error));
  }

  return new Error('Unknown error');
}
