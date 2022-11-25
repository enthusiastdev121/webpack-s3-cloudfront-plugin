import {asyncMap} from "@softwareventures/async-iterable";
import type {ListObjectsEntry, ListObjectsError, ListObjectsOptions} from "./list-objects";
import {listObjects} from "./list-objects";
import type {FetchObjectChecksumError} from "./fetch-object-checksum";
import {fetchObjectChecksum} from "./fetch-object-checksum";

export interface ListObjectsEntryWithChecksum extends ListObjectsEntry {
    readonly sha256: string | undefined;
}

export function listObjectsWithChecksum(
    options: ListObjectsOptions
): AsyncIterable<ListObjectsEntryWithChecksum | ListObjectsError | FetchObjectChecksumError> {
    return asyncMap(listObjects(options), async entry =>
        entry.type === "ListObjectsError"
            ? entry
            : fetchObjectChecksum({
                  client: options.client,
                  bucket: options.bucket,
                  key: entry.key
              }).then(checksum =>
                  checksum.type === "FetchObjectChecksumError"
                      ? checksum
                      : {
                            ...entry,
                            sha256: checksum.sha256
                        }
              )
    );
}
