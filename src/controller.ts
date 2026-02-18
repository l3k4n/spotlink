import dgram from "dgram";
import Command from "./command.ts";
import type { HeaderOpts } from "./types.ts";
import GetServiceCommand from "./getservice.ts";

export default class Controller {
    private socket = dgram.createSocket('udp4');
    private clients = new Set<{ port: number, address: string }>();

    discoverClients() {
        const tmp_sock = dgram.createSocket("udp4");
        tmp_sock.bind(() => tmp_sock.setBroadcast(true));

        tmp_sock.on("message", (_, rinfo) => {
            console.log(`client discovered ${rinfo.address}:${rinfo.port}`);
            this.clients.add({ port: rinfo.port, address: rinfo.address });
        });

        const buf = this.createRequestMsg(new GetServiceCommand());
        tmp_sock.send(buf, 0, buf.length, 56700, '255.255.255.255', (err) => {
            if (err) console.error(err);
        });

        setTimeout(() => tmp_sock.close(), 5000);
    }


    send(cmd: Command) {
        const buf = this.createRequestMsg(cmd);

        this.socket.on("message", (msg, rinfo) => {
            console.log("Received", rinfo.port, this.readHeaderOpts(msg));
        });


        this.clients.forEach(({ address, port }) => {
            this.socket.send(buf, 0, buf.length, port, address, (err) => {
                if (err) console.error(err);
            });
        })
    }

    private createRequestMsg(cmd: Command): Buffer<ArrayBuffer> {
        const opts = cmd.headerOpts();
        const buf = Buffer.alloc(opts.size);

        this.serializeHeader(opts, buf.subarray(0, 36));
        cmd.serializePayload(buf.subarray(36, opts.size));

        return buf;
    }

    private serializeHeader(opts: HeaderOpts, buf: Buffer<ArrayBuffer>) {
        function print(label: string, buf: Buffer): void {
            const str = Array.from(buf)
                .map(b => b.toString(2).padStart(8, '0'))
                .join(' ');
            console.log(label, "->", str);
        }

        this.setFrameHeader(buf.subarray(0, 8), opts.size, opts.tagged, opts.source);
        this.setFrameAddress(buf.subarray(8, 24), opts.target, opts.res_required, opts.ack_required, opts.sequence);
        this.setProtocolHeader(buf.subarray(24, 36), opts.type);

        print("frame head", buf.subarray(0, 8));
        print("frame addr", buf.subarray(8, 24));
        print("proto head", buf.subarray(24, 36));
    }

    private setFrameHeader(buf: Buffer, messageSize: number, tagged: boolean, source: number): void {
        if (source === 0 || source === 1) {
            throw new Error("0 and 1 are reserved values of `source`");
        }

        buf.writeUint16LE(messageSize, 0);
        buf.writeUint16LE(1024, 2);
        buf.writeInt8(buf.readUInt8(3) | 0x10, 3);
        buf.writeInt8(buf.readUInt8(3) | (tagged ? 0x20 : 0), 3);
        buf.writeUInt8(buf.readUInt8(3) & 0x3f, 3);
        buf.writeUint32LE(source, 4);
    }

    private setFrameAddress(buf: Buffer, target: bigint, res_required: boolean, ack_required: boolean, sequence: number): void {
        buf.writeBigUint64LE(target, 0);
        buf.fill(0, 8, 14);
        buf.writeUInt8(res_required ? 0x80 : 0, 14);
        buf.writeUInt8(buf.readUInt8(14) | (ack_required ? 0x40 : 0), 14);
        buf.writeUInt8(buf.readUInt8(14) & 0xc0, 14);
        buf.writeUInt8(sequence, 15);
    }

    private setProtocolHeader(buf: Buffer, type: number): void {
        buf.fill(0, 0, 8);
        buf.writeUint16LE(type, 8);
        buf.fill(0, 10, 12);
    }

    private readHeaderOpts(raw: Buffer<ArrayBuffer>) {
        return {
            size: raw.readUint16LE(0),
            tagged: !!((raw.readUint8(3) >> 5) & 0b1),
            source: raw.readUint32LE(4),
            target: "UNKNOWN",
            res_required: !!(raw.readUint8(22) & 0b1),
            ack_required: !!((raw.readUint8(22) >> 1) & 0b1),
            sequence: raw.readUint8(23),
            type: raw.readUint16LE(32),
        };
    }

}


