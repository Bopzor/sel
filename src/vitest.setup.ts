import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      test(cb: (received: unknown) => void): R;
    }
  }
}

expect.extend({
  test(received: unknown, cb: (received: unknown) => void) {
    cb(received);
    return { pass: true, message: () => 'ok' };
  },
});
