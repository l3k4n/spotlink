export interface HeaderOpts {
    size: number;
    tagged: boolean;
    source: number;
    target: bigint;
    res_required: boolean;
    ack_required: boolean;
    sequence: number;
    type: number;
}

export interface HSBKColor {
    hue: number;
    saturation: number;
    brightness: number;
    kelvin: number;
}
