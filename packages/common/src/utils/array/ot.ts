export namespace ArrayOperationalTransformType {
  export const INSERT = "insert";
  export const UPDATE = "update";
  export const DELETE = "delete";
}

export abstract class ArrayOperationalTransform<T> {
  constructor(readonly type: string) {}
}

export class ArrayInsertMutation<T> extends ArrayOperationalTransform<T> {
  constructor(readonly index: number, readonly value: T) {
    super(ArrayOperationalTransformType.INSERT);
  }
}

export class ArrayDeleteMutation extends ArrayOperationalTransform<any> {
  constructor(readonly value: any, readonly index: number) {
    super(ArrayOperationalTransformType.DELETE);
  }
}

export class ArrayUpdateMutation<T> extends ArrayOperationalTransform<T> {
  constructor(
    readonly originalOldIndex: number,
    readonly patchedOldIndex: number,
    readonly newValue: T,
    readonly index: number
  ) {
    super(ArrayOperationalTransformType.UPDATE);
  }
}

export function diffArray<T>(
  oldArray: Array<T>,
  newArray: Array<T>,
  countDiffs: (a: T, b: T) => number
): ArrayOperationalTransform<T>[] {
  // model used to figure out the proper mutation indices
  const model = [].concat(oldArray);

  // remaining old values to be matched with new values. Remainders get deleted.
  const oldPool = [].concat(oldArray);

  // remaining new values. Remainders get inserted.
  const newPool = [].concat(newArray);

  const mutations: ArrayOperationalTransform<any>[] = [];
  let matches: Array<[T, T]> = [];

  for (let i = 0, n = oldPool.length; i < n; i++) {
    const oldValue = oldPool[i];
    let bestNewValue;

    let fewestDiffCount = Infinity;

    // there may be multiple matches, so look for the best one
    for (let j = 0, n2 = newPool.length; j < n2; j++) {
      const newValue = newPool[j];

      // -1 = no match, 0 = no change, > 0 = num diffs
      let diffCount = countDiffs(oldValue, newValue);

      if (~diffCount && diffCount < fewestDiffCount) {
        bestNewValue = newValue;
        fewestDiffCount = diffCount;
      }

      // 0 = exact match, so break here.
      if (fewestDiffCount === 0) break;
    }

    // subtract matches from both old & new pools and store
    // them for later use
    if (bestNewValue != null) {
      oldPool.splice(i--, 1);
      n--;
      newPool.splice(newPool.indexOf(bestNewValue), 1);

      // need to manually set array indice here to ensure that the order
      // of operations is correct when mutating the target array.
      matches[newArray.indexOf(bestNewValue)] = [oldValue, bestNewValue];
    }
  }

  for (let i = oldPool.length; i--; ) {
    const oldValue = oldPool[i];
    const index = oldArray.indexOf(oldValue);
    mutations.push(new ArrayDeleteMutation(oldValue, index));
    model.splice(index, 1);
  }

  // sneak the inserts into the matches so that they're
  // ordered propertly along with the updates - particularly moves.
  for (let i = 0, n = newPool.length; i < n; i++) {
    const newValue = newPool[i];
    const index = newArray.indexOf(newValue);
    matches[index] = [undefined, newValue];
  }

  // apply updates last using indicies from the old array model. This ensures
  // that mutations are properly applied to whatever target array.
  for (let i = 0, n = matches.length; i < n; i++) {
    const match = matches[i];

    // there will be empty values since we're manually setting indices on the array above
    if (match == null) continue;

    const [oldValue, newValue] = matches[i];
    const newIndex = i;

    // insert
    if (oldValue == null) {
      mutations.push(new ArrayInsertMutation(newIndex, newValue));
      model.splice(newIndex, 0, newValue);
      // updated
    } else {
      const oldIndex = model.indexOf(oldValue);
      mutations.push(
        new ArrayUpdateMutation(
          oldArray.indexOf(oldValue),
          oldIndex,
          newValue,
          newIndex
        )
      );
      if (oldIndex !== newIndex) {
        model.splice(oldIndex, 1);
        model.splice(newIndex, 0, oldValue);
      }
    }
  }

  return mutations;
}

export function patchArray<T>(
  target: Array<T>,
  ots: ArrayOperationalTransform<T>[],
  mapUpdate: (a: T, b: T) => T,
  mapInsert: (b: T) => T = b => b
) {
  if (!ots.length) {
    return target;
  }
  const newTarget = [...target];

  for (const ot of ots) {
    switch (ot.type) {
      case ArrayOperationalTransformType.INSERT: {
        const { value, index } = ot as ArrayInsertMutation<T>;
        newTarget.splice(index, 0, mapInsert(value));
        break;
      }
      case ArrayOperationalTransformType.DELETE: {
        const { index } = ot as ArrayDeleteMutation;
        newTarget.splice(index, 1);
      }
      case ArrayOperationalTransformType.UPDATE: {
        const { patchedOldIndex, newValue, index } = ot as ArrayUpdateMutation<
          T
        >;
        const oldValue = target[patchedOldIndex];
        const patchedValue = mapUpdate(oldValue, newValue);
        if (patchedValue !== oldValue || patchedOldIndex !== index) {
          if (patchedOldIndex !== index) {
            newTarget.splice(patchedOldIndex, 1);
          }
          newTarget.splice(index, 0, patchedValue);
        }
      }
    }
  }

  return newTarget;
}
