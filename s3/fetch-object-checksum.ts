import type {S3Client} from "@aws-sdk/client-s3";
import {GetObjectAttributesCommand, ObjectAttributes} from "@aws-sdk/client-s3";

export interface FetchObjectChecksumOptions {
    readonly client: S3Client;
    readonly bucket: string;
    readonly key: string;
}

export interface ObjectChecksum {
    readonly type: "ObjectChecksum";
    readonly sha256: string | undefined;
}

export interface FetchObjectChecksumError {
    readonly type: "FetchObjectChecksumError";
    readonly error: unknown;
}

export async function fetchObjectChecksum(
    options: FetchObjectChecksumOptions
): Promise<ObjectChecksum | FetchObjectChecksumError> {
    return options.client
        .send(
            new GetObjectAttributesCommand({
                Bucket: options.bucket,
                Key: options.key,
                ObjectAttributes: [ObjectAttributes.CHECKSUM]
            })
        )
        .then(
            output => ({
                type: "ObjectChecksum",
                sha256: output.Checksum?.ChecksumSHA256
            }),
            (error: unknown) => ({type: "FetchObjectChecksumError", error} as const)
        );
}
