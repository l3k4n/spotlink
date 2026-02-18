import Command from "./command.ts";
import type { HeaderOpts, HSBKColor } from "./types.ts";

export default class SetColorCommand extends Command {
    private hue: number;
    private saturation: number;
    private brightness: number;
    private kelvin: number;
    private duration: number;

    constructor(color: HSBKColor, duration: number = 0) {
        super();

        this.validateColor(color);

        this.hue = Math.floor(Math.round(0x10000 * color.hue) / 360) % 0x10000;
        this.saturation = Math.floor(Math.round(0xFFFF * color.saturation))
        this.brightness = Math.floor(Math.round(0xFFFF * color.saturation))
        this.kelvin = color.kelvin
        this.duration = duration;
    }

    headerOpts(): HeaderOpts {
        return {
            size: 49,
            tagged: false,
            source: 2,
            target: BigInt(0),
            res_required: false,
            ack_required: true,
            sequence: 1,
            type: 102,
        };
    }

    serializePayload(buf: Buffer<ArrayBuffer>) {
        buf.writeUint8(0, 0);
        buf.writeUint16LE(this.hue, 1);
        buf.writeUint16LE(this.saturation, 3);
        buf.writeUint16LE(this.brightness, 5);
        buf.writeUint16LE(this.kelvin, 7);
        buf.writeUint32LE(this.duration, 9);
    }

    private validateColor({ hue, saturation, brightness, kelvin }: HSBKColor) {
        if (hue < 0 || hue > 360) {
            throw new Error(`Invalid hue: ${hue}. Must be 0-360.`);
        }
        if (saturation < 0 || saturation > 1) {
            throw new Error(`Invalid saturation: ${saturation}. Must be 0-1.`);
        }
        if (brightness < 0 || brightness > 1) {
            throw new Error(`Invalid brightness: ${brightness}. Must be 0-1.`);
        }
        if (kelvin < 1500 || kelvin > 9000) {
            throw new Error(`Invalid kelvin: ${kelvin}. Must be 1500-9000.`);
        }
    }
}
