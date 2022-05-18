export {};

declare global {
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toSnapshot(): CustomMatcherResult;
    }
  }
}
