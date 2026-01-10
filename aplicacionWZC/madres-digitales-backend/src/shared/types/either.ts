export interface Either<L, R> {
  _tag: 'Left' | 'Right';
  value: L | R;
}

export interface Left<L, R> extends Either<L, R> {
  _tag: 'Left';
  value: L;
}

export interface Right<L, R> extends Either<L, R> {
  _tag: 'Right';
  value: R;
}

export const left = <L, R>(value: L): Either<L, R> => ({
  _tag: 'Left',
  value,
});

export const right = <L, R>(value: R): Either<L, R> => ({
  _tag: 'Right',
  value,
});

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L, R> => {
  return either._tag === 'Left';
};

export const isRight = <L, R>(either: Either<L, R>): either is Right<L, R> => {
  return either._tag === 'Right';
};

export const fold = <L, R, T>(
  either: Either<L, R>,
  onLeft: (left: L) => T,
  onRight: (right: R) => T,
): T => {
  return isLeft(either) ? onLeft(either.value as L) : onRight(either.value as R);
};

export const map = <L, R, T>(
  either: Either<L, R>,
  fn: (right: R) => T,
): Either<L, T> => {
  return isLeft(either) ? either : right(fn(either.value as R));
};

export const flatMap = <L, R, T>(
  either: Either<L, R>,
  fn: (right: R) => Either<L, T>,
): Either<L, T> => {
  return isLeft(either) ? either : fn(either.value as R);
};

export const getOrElse = <L, R>(
  either: Either<L, R>,
  defaultValue: R,
): R => {
  return isLeft(either) ? defaultValue : either.value as R;
};

export const getLeft = <L, R>(either: Either<L, R>): L | undefined => {
  return isLeft(either) ? either.value as L : undefined;
};

export const getRight = <L, R>(either: Either<L, R>): R | undefined => {
  return isRight(either) ? either.value as R : undefined;
};