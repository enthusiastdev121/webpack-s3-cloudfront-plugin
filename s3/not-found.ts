export interface NotFound {
    readonly type: "NotFound";
}

export function notFound(): NotFound {
    return {type: "NotFound"};
}
