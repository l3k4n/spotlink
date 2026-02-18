import Command from "./command.ts";

export default class GetServiceCommand extends Command {
    constructor() {
        super();
    }

    headerOpts() {
        return {
            size: 36,
            tagged: false,
            source: 2,
            target: BigInt(0),
            res_required: false,
            ack_required: true,
            sequence: 1,
            type: 2,
        };
    }

    serializePayload(_: Buffer<ArrayBuffer>) { }
}
