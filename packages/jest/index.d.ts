export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toSnapshot(): CustomMatcherResult;
    }
  }
}
