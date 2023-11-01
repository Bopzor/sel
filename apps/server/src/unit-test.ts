export class UnitTest {
  setup?(): void;

  static create<Test extends UnitTest>(TestClass: { new (): Test }) {
    const test = new TestClass();

    test.setup?.();

    return test;
  }
}
