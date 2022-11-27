export function removeKeyPrefix(key: string, prefix: string | undefined): string {
    if (prefix == null || prefix === "") {
        return key;
    } else if (key.startsWith(prefix)) {
        return key.slice(prefix.length);
    } else {
        throw new Error("Prefix mismatch");
    }
}
