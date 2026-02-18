import type { HeaderOpts } from "./types.ts";

export default abstract class Command {
    abstract headerOpts(): HeaderOpts;
    abstract serializePayload(buf: Buffer<ArrayBuffer>): void;
}

