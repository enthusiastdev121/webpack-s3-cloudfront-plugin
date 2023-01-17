import {map as mapIterable} from "@softwareventures/iterable";
import {hasProperty} from "unknown";

export type MapLike<TKey, TValue> =
    | Iterable<readonly [TKey, TValue]>
    | (TKey extends string ? Readonly<Record<TKey, TValue>> : never);

export function entries<TKey, TValue>(
    map: MapLike<TKey, TValue>
): Iterable<readonly [TKey, TValue]> {
    if (hasProperty(map, Symbol.iterator)) {
        return map;
    } else {
        return Object.entries(map) as unknown as ReadonlyArray<[TKey, TValue]>;
    }
}

export function mapOf<TKey, TValue>(map: MapLike<TKey, TValue>): Map<TKey, TValue> {
    return new Map(entries(map));
}

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
