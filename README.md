# Spotlink

Sync an active spotify session's current track color with LIFX light bulbs on the same network using MPRIS and the LIFX local udp protocol.

## Running

To run it, clone the repo:

1. **Clone the repository**
   ```bash
   git clone https://github.com/l3k4n/spotlink.git
   cd spotlink
2. run `npm start`

How it Works
- MPRIS: Monitors the metadata of your active Spotify player to grab the album art URL.
- Color Extraction: Analyzes the album art to determine the dominant or vibrant colors.
- LIFX Local Control: Communicates with the light bulbs over udp using the [LIFX Lan protocol](https://lan.developer.lifx.com/docs/introduction).
