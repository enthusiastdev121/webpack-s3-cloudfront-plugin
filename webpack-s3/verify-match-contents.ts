import type {WebpackAssetS3ObjectMatch} from "./match-assets-with-objects";

export interface AlreadyUploaded {
    readonly type: "AlreadyUploaded";
    readonly match: WebpackAssetS3ObjectMatch;
}

export interface ImmutableConflict {
    readonly type: "ImmutableConflict";
    readonly reason: "Sha256Mismatch" | "S3MissingSha256";
    readonly match: WebpackAssetS3ObjectMatch;
}

export function verifyMatchContents(
    match: WebpackAssetS3ObjectMatch
): WebpackAssetS3ObjectMatch | AlreadyUploaded | ImmutableConflict {
    if (match.webpackAsset == null || match.s3Object == null) {
        return match;
    } else if (
        match.s3Object.sha256 != null &&
        Buffer.compare(
            Buffer.from(match.s3Object.sha256, "base64"),
            match.webpackAsset.sha256()
        ) === 0
    ) {
        return {
            type: "AlreadyUploaded",
            match
        };
    } else if (match.webpackAsset.immutable) {
        return {
            type: "ImmutableConflict",
            reason: match.s3Object.sha256 == null ? "S3MissingSha256" : "Sha256Mismatch",
            match
        };
    } else {
        return match;
    }
}
