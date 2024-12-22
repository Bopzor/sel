type Falsy = null | undefined | false | 0 | -0 | 0n;

export function when<Value, True>(value: Value | Falsy, ifTrue: (value: Value) => True): True | undefined;

export function when<Value, True, False>(
  value: Value | Falsy,
  ifTrue: (value: Value) => True,
  ifFalse: () => False,
): True | False;

export function when(value: unknown, ifTrue: (value: unknown) => unknown, ifFalse?: () => unknown) {
  if (value) {
    return ifTrue(value);
  } else {
    return ifFalse?.();
  }
}
