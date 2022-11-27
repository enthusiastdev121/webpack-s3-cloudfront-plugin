import {asyncMap} from "@softwareventures/async-iterable";
import type {ListObjectsError, ListObjectsOptions} from "./list-objects";
import {listObjects} from "./list-objects";
import type {FetchObjectAttributesError, ObjectAttributes} from "./fetch-object-attributes";
import {fetchObjectAttributes} from "./fetch-object-attributes";

export function listObjectsWithAttributes(
    options: ListObjectsOptions
): AsyncIterable<ObjectAttributes | ListObjectsError | FetchObjectAttributesError> {
    return asyncMap(listObjects(options), async entry =>
        entry.type === "ListObjectsError"
            ? entry
            : fetchObjectAttributes({
                  client: options.client,
                  bucket: options.bucket,
                  key: entry.key
              })
    );
}
