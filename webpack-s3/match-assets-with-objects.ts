import type {S3Client} from "@aws-sdk/client-s3";
import {asyncConcat, asyncExclude, asyncMap} from "@softwareventures/async-iterable";
import type {Asset} from "../webpack/assets";
import type {FetchObjectAttributesError, ObjectAttributes} from "../s3/fetch-object-attributes";
import {fetchObjectAttributes} from "../s3/fetch-object-attributes";
import {listObjectsWithAttributes} from "../s3/list-objects-with-attributes";
import type {ListObjectsError} from "../s3/list-objects";
import {removeKeyPrefix} from "../s3/remove-key-prefix";

export interface MatchWebpackAssetsWithS3ObjectsOptions {
    readonly webpack: {
        readonly assets: Map<string, Asset>;
    };
    readonly s3: {
        readonly client: S3Client;
        readonly bucket: string;
        readonly prefix?: string | undefined;
        readonly includeUnmatched: boolean;
    };
}

export interface WebpackAssetS3ObjectMatch {
    readonly webpackAsset: Asset | null;
    readonly s3Object: ObjectAttributes | null;
}

export function matchWebpackAssetsWithS3Objects(
    options: MatchWebpackAssetsWithS3ObjectsOptions
): AsyncIterable<WebpackAssetS3ObjectMatch | FetchObjectAttributesError | ListObjectsError> {
    const matches: AsyncIterable<
        WebpackAssetS3ObjectMatch | FetchObjectAttributesError | ListObjectsError
    > = asyncMap(options.webpack.assets.values(), async webpackAsset =>
        fetchObjectAttributes({
            client: options.s3.client,
            bucket: options.s3.bucket,
            key: `${options.s3.prefix ?? ""}${webpackAsset.key}`
        }).then(attributes =>
            attributes.type === "FetchObjectAttributesError"
                ? attributes
                : {
                      webpackAsset,
                      s3Object: attributes.type === "NotFound" ? null : attributes
                  }
        )
    );

    if (options.s3.includeUnmatched) {
        const unmatches = asyncExclude(
            listObjectsWithAttributes({
                client: options.s3.client,
                bucket: options.s3.bucket,
                prefix: options.s3.prefix
            }),
            attributes =>
                attributes.type === "ObjectAttributes" &&
                options.webpack.assets.has(removeKeyPrefix(attributes.key, options.s3.prefix))
        );

        return asyncConcat([
            matches,
            asyncMap(unmatches, attributes =>
                attributes.type === "ObjectAttributes"
                    ? {
                          webpackAsset: null,
                          s3Object: attributes
                      }
                    : attributes
            )
        ]);
    } else {
        return matches;
    }
}
