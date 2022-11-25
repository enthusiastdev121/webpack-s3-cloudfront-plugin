import type {ListObjectsV2Output, S3Client} from "@aws-sdk/client-s3";
import {ListObjectsV2Command} from "@aws-sdk/client-s3";
import {asyncConcatMapFn, asyncMap, concat} from "@softwareventures/async-iterable";
import {notNull} from "@softwareventures/nullable";
import type {Timestamp} from "@softwareventures/timestamp";
import {fromJsDate} from "@softwareventures/timestamp";
import {chain} from "@softwareventures/chain";

export interface ListObjectsOptions {
    readonly client: S3Client;
    readonly bucket: string;
    readonly prefix?: string | undefined;
}

export interface ListObjectsEntry {
    readonly type: "ListObjectsEntry";
    readonly key: string;
    readonly sizeBytes: number;
    readonly lastModified: Timestamp;
}

export interface ListObjectsError {
    readonly type: "ListObjectsError";
    readonly error: unknown;
}

export function listObjects(
    options: ListObjectsOptions
): AsyncIterable<ListObjectsEntry | ListObjectsError> {
    return listObjectsInternal(options);
}

interface ListObjectsInternalOptions extends ListObjectsOptions {
    readonly continuationToken?: string | undefined;
}

function listObjectsInternal(
    options: ListObjectsInternalOptions
): AsyncIterable<ListObjectsEntry | ListObjectsError> {
    return chain([
        options.client
            .send(
                new ListObjectsV2Command({
                    Bucket: options.bucket,
                    ...(options.prefix == null ? {} : {Prefix: options.prefix}),
                    ...(options.continuationToken == null
                        ? {}
                        : {ContinuationToken: options.continuationToken})
                })
            )
            .then(
                output => ({type: "ListObjectsOutput", output} as const),
                (error: unknown) => ({type: "ListObjectsError", error} as const)
            )
    ]).map(
        asyncConcatMapFn(result =>
            result.type === "ListObjectsError"
                ? [result]
                : result.output.NextContinuationToken == null
                ? extractEntries(result.output)
                : concat([
                      extractEntries(result.output),
                      listObjectsInternal({
                          ...options,
                          continuationToken: result.output.NextContinuationToken
                      })
                  ])
        )
    ).value;
}

function extractEntries(output: ListObjectsV2Output): AsyncIterable<ListObjectsEntry> {
    return asyncMap(output.Contents ?? [], object => ({
        type: "ListObjectsEntry",
        key: notNull(object.Key),
        sizeBytes: notNull(object.Size),
        lastModified: fromJsDate(notNull(object.LastModified))
    }));
}
