import dbus from "dbus-next";
import { Vibrant } from "node-vibrant/node";
import type { HSBKColor } from "./types.ts"

export default class SpotifyMprisColorObserver {
    private dbus_properties: dbus.ClientInterface;
    private current_img: string;

    async init() {
        const obj = await dbus.sessionBus().getProxyObject(
            'org.mpris.MediaPlayer2.spotify',
            '/org/mpris/MediaPlayer2'
        );

        this.dbus_properties = obj.getInterface('org.freedesktop.DBus.Properties');
    }

    onColor(cb: (color: HSBKColor) => void) {
        this.dbus_properties.on('PropertiesChanged', async () => {
            const metadata = await this.dbus_properties.Get('org.mpris.MediaPlayer2.Player', 'Metadata');
            if (this.current_img == metadata.value['mpris:artUrl'].value) {
                return;
            }

            this.current_img = metadata.value['mpris:artUrl'].value;
            const color = await this.getCurrentColor();
            if (!color) return;
            cb(color);
        });
    }

    private hexToHsbk(hex: string, kelvin = 3500): HSBKColor {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let h = 0;
        if (delta !== 0) {
            if (max === r) {
                h = 60 * (((g - b) / delta) % 6);
            } else if (max === g) {
                h = 60 * (((b - r) / delta) + 2);
            } else {
                h = 60 * (((r - g) / delta) + 4);
            }
        }
        if (h < 0) h += 360;
        const s = max === 0 ? 0 : delta / max;
        const v = max;
        return { hue: h, saturation: s, brightness: v, kelvin: kelvin };
    };

    private async getCurrentColor() {
        try {
            const palette = await Vibrant.from(this.current_img).getPalette();
            // @ts-ignore
            return this.hexToHsbk(palette.Vibrant.hex);
        } catch (err) {
            return null;
        }
    }
}

