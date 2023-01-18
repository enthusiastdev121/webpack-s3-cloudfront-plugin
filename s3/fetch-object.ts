import type {S3Client} from "@aws-sdk/client-s3";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import type {NotFound} from "./not-found";
import {notFound} from "./not-found";
import {sendCommand} from "./send-command";

export interface S3Object {
    readonly type: "S3Object";
    readonly body: () => Promise<Uint8Array | null>;
}

export interface FetchObjectOptions {
    readonly client: S3Client;
    readonly bucket: string;
    readonly key: string;
}

export interface FetchObjectError {
    readonly type: "FetchObjectError";
    readonly error: unknown;
}

export async function fetchObject(
    options: FetchObjectOptions
): Promise<S3Object | NotFound | FetchObjectError> {
    return sendCommand({
        client: options.client,
        command: new GetObjectCommand({
            Bucket: options.bucket,
            Key: options.key
        })
    }).then(output =>
        output.type === "SendCommandOutput"
            ? {
                  type: "S3Object",
                  body: async () => output.output.Body?.transformToByteArray() ?? null
              }
            : output.httpStatusCode === 404
            ? notFound()
            : {type: "FetchObjectError", error: output.error}
    );
}
