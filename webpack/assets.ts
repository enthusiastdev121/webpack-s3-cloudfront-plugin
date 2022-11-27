import type {Compilation} from "webpack";
import {mapFn} from "@softwareventures/iterable";
import {chain} from "@softwareventures/chain";
import {notNull} from "@softwareventures/nullable";

export interface Asset {
    readonly key: string;
    readonly immutable: boolean;
    readonly buffer: () => Buffer;
}

export function collectAssets(compilation: Compilation): Map<string, Asset> {
    return chain(compilation.assetsInfo)
        .map(
            mapFn(([key, info]) => ({
                key,
                asset: notNull(compilation.assets[key]),
                info
            }))
        )
        .map(
            mapFn(
                ({key, asset, info}) =>
                    [
                        key,
                        {
                            key,
                            buffer: () => asset.buffer(),
                            immutable: info.immutable ?? false
                        }
                    ] as const
            )
        )
        .map(entries => new Map(entries)).value;
}
