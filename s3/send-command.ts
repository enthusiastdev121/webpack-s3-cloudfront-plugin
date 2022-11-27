import type {S3Client} from "@aws-sdk/client-s3";
import type {ServiceInputTypes, ServiceOutputTypes} from "@aws-sdk/client-s3/dist-types/S3Client";
import type {Command} from "@aws-sdk/types";
import type {SmithyResolvedConfiguration} from "@aws-sdk/smithy-client/dist-types/client";
import type {HttpHandlerOptions} from "@aws-sdk/types/dist-types/http";

export interface SendCommandOptions<
    TInput extends ServiceInputTypes,
    TOutput extends ServiceOutputTypes
> {
    readonly client: S3Client;
    readonly command: Command<
        ServiceInputTypes,
        TInput,
        ServiceOutputTypes,
        TOutput,
        SmithyResolvedConfiguration<HttpHandlerOptions>
    >;
}

export interface SendCommandOutput<T extends ServiceOutputTypes> {
    readonly type: "SendCommandOutput";
    readonly output: T;
}

export interface SendCommandError {
    readonly type: "SendCommandError";
    readonly httpStatusCode?: number;
    readonly error: unknown;
}

export async function sendCommand<
    TInput extends ServiceInputTypes,
    TOutput extends ServiceOutputTypes
>(
    options: SendCommandOptions<TInput, TOutput>
): Promise<SendCommandOutput<TOutput> | SendCommandError> {
    return options.client.send(options.command).then(
        output => {
            if (
                output.$metadata.httpStatusCode == null ||
                output.$metadata.httpStatusCode === 200
            ) {
                return {type: "SendCommandOutput", output};
            } else {
                return {
                    type: "SendCommandError",
                    httpStatusCode: output.$metadata.httpStatusCode,
                    error: new Error(`HTTP ${output.$metadata.httpStatusCode}`)
                };
            }
        },
        (error: unknown) => ({type: "SendCommandError", error})
    );
}
