import {map as mapIterable} from "@softwareventures/iterable";

export function mapValues<TKey, TValue, TNewValue>(
    map: Iterable<readonly [TKey, TValue]>,
    f: (value: TValue, key: TKey) => TNewValue
): Iterable<[TKey, TNewValue]> {
    return mapIterable(map, ([key, value]) => [key, f(value, key)]);
}

export function mapValuesFn<TKey, TValue, TNewValue>(
    f: (value: TValue, key: TKey) => TNewValue
): (map: Iterable<readonly [TKey, TValue]>) => Iterable<[TKey, TNewValue]> {
    return map => mapValues(map, f);
}
