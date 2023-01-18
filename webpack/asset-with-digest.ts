import {createHash} from "crypto";
import type {Asset} from "./assets";

export interface AssetWithDigest extends Asset {
    readonly sha256: Uint8Array;
}

export function digestAsset<TAsset extends Asset>(asset: TAsset): TAsset & AssetWithDigest {
    const hash = createHash("sha256");
    hash.update(asset.buffer());

    return {
        ...asset,
        sha256: hash.digest()
    };
}
