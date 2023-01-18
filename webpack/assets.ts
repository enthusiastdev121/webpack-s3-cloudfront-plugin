import {createHash} from "crypto";
import type {Compilation} from "webpack";
import {mapFn} from "@softwareventures/iterable";
import {chain} from "@softwareventures/chain";
import {notNull} from "@softwareventures/nullable";
import {mapOf} from "../collections/map";

export interface Asset {
    readonly key: string;
    readonly immutable: boolean;
    readonly buffer: () => Buffer;
    readonly sha256: () => Buffer;
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
            mapFn(({key, asset, info}) => ({
                key,
                asset,
                info,
                buffer: () => asset.buffer()
            }))
        )
        .map(
            mapFn(
                ({key, asset, info, buffer}) =>
                    [
                        key,
                        {
                            key,
                            immutable: info.immutable ?? false,
                            buffer,
                            sha256: () => createHash("sha256").update(buffer()).digest()
                        }
                    ] as const
            )
        )
        .map(mapOf).value;
}
