import type {S3Client} from "@aws-sdk/client-s3";
import {
    GetObjectAttributesCommand,
    ObjectAttributes as S3ObjectAttributes
} from "@aws-sdk/client-s3";
import type {Timestamp} from "@softwareventures/timestamp";
import {fromJsDate} from "@softwareventures/timestamp";
import {notNull} from "@softwareventures/nullable";
import type {NotFound} from "./not-found";
import {sendCommand} from "./send-command";

export interface FetchObjectAttributesOptions {
    readonly client: S3Client;
    readonly bucket: string;
    readonly key: string;
}

export interface ObjectAttributes {
    readonly type: "ObjectAttributes";
    readonly key: string;
    readonly sizeBytes: number;
    readonly lastModified: Timestamp;
    readonly sha256: string | undefined;
}

export interface FetchObjectAttributesError {
    readonly type: "FetchObjectAttributesError";
    readonly error: unknown;
}

export async function fetchObjectAttributes(
    options: FetchObjectAttributesOptions
): Promise<ObjectAttributes | NotFound | FetchObjectAttributesError> {
    return sendCommand({
        client: options.client,
        command: new GetObjectAttributesCommand({
            Bucket: options.bucket,
            Key: options.key,
            ObjectAttributes: [S3ObjectAttributes.CHECKSUM, S3ObjectAttributes.OBJECT_SIZE]
        })
    }).then(
        output =>
            output.type === "NotFound"
                ? output
                : output.type === "SendCommandError"
                ? {type: "FetchObjectAttributesError", error: output.error}
                : {
                      type: "ObjectAttributes",
                      key: options.key,
                      sizeBytes: notNull(output.output.ObjectSize),
                      lastModified: fromJsDate(notNull(output.output.LastModified)),
                      sha256: output.output.Checksum?.ChecksumSHA256
                  },
        (error: unknown) => ({type: "FetchObjectAttributesError", error} as const)
    );
}
