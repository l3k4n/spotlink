import Controller from "./controller.ts";
import SpotifyMprisColorObserver from "./mpris.ts";
import SetColorCommand from "./setcolor.ts";

const observer = new SpotifyMprisColorObserver();
await observer.init();

const ctrlr = new Controller();
ctrlr.discoverClients()

ctrlr.send(new SetColorCommand({ hue: 120, saturation: 1, brightness: 1, kelvin: 3500 }))

observer.onColor((color) => {
    console.log("sending color", color);
    // ctrlr.send(new SetColorCommand( { hue: 120, saturation: 1, brightness: 1, kelvin: 3500 }))
    ctrlr.send(new SetColorCommand(color));
});

// setTimeout(() => {
//
//
// }, 3000)
// ct.send(new GetServiceCommand())
