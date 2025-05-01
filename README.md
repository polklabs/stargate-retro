# Stargate Retro

HTML Webpages recreated and inspired by computers and UI in the stargate show.

## How to install

Copy `/retro` folder into `/home/pi/sg1_v4/web/`

```
sg1_v4/web/
├── index.htm
├── main.css
├── etc...
└── retro/ <--- Copy Folder Here
    ├── css/
    ├── js/
    ├── dial.html
    └── etc...
```

#### Finished Pages

- [Dial](http://stargate.local/retro/dial.html) - `/retro/dial.html`
- [Address Book](http://stargate.local/retro/address_book.html) - `/retro/address_book.html`

### Customizations

| File | Property | Default | Description | Alt Example |
| ---- | -------- | ------- | ----------- | ----------- |
| dial.js | RING_ANIMATION | `true` | Should the ring spin when dialing out |
| dial.js | AUTHORIZATION_CODE_RANDOMIZE | `true` | Generate a random authorization code on page load |
| dial.js | AUTHORIZATION_CODE | `77892757892387` | Fixed code to use if *AUTHORIZATION_CODE_RANDOMIZE* is `false` |
| dial.js | USER | `SGT. W HARRIMAN` | Use name in bottom right of screen |
| dial.js | DEFAULT_GATE_NAME | `STARGATE` | Gate name if it cannot be fetched from server |
| dial.js | TEXT_OFFLINE | `OFFLINE` | Text to use when gate is offline |
| dial.js | TEXT_IDLE | `IDLE` | Text to use when gate is idle |
| dial.js | TEXT_DIALING | `DIALING` | Text to use when gate is dialing out |
| dial.js | TEXT_INCOMING | `INCOMING` | Text to use when gate is dialing in |
| dial.js | TEXT_ENGAGED | `ENGAGED` | Text to use when wormhole is active  |
| *.css |  --color | <span style="color:#37bfde">#37bfde</span> | Most borders and text | #2B6EC8 |
| *.css | --color-dark | <span style="color:#4a7297">#4a7297</span> | Some smaller borders  | #2B6EC8 |
| *.css |  --color-danger |<span style="color:#c70036">#c70036</span> | Invalid glyphs, dialing lock, and stargate state color | #B2020B |
| *.css |  --color-good |<span style="color:#07ff0b">#07ff0b</span> | Address book hover color, dialing chevron OK text | #275e9c |
| *.css |  --color-alt |<span style="color:white">white</span> | Secondary text color |
| *.css |  --background-color |<span style="color:#020f25">#020f25</span> | Background Color | #000000 | 
| *.css |  --glyph-color |<span style="color:#fffea5">#fffea5</span> | Glyph color also used for some text - must also generate new [SVG filter](https://codepen.io/sosuke/pen/Pjoqqp) to apply color |
| *.css |  --color-wormhole-danger-1 |<span style="color:yellow">yellow</span> | 3 Part gradient for active wormhole - when connected to blackhole |
| *.css |  --color-wormhole-danger-2 |<span style="color:orange">orange</span> | 3 Part gradient for active wormhole - when connected to blackhole |
| *.css |  --color-wormhole-danger-3 |<span style="color:red">red</span> | 3 Part gradient for active wormhole - when connected to blackhole |
| *.css |  --color-wormhole-1 |<span style="color:royalblue">royalblue</span> | 3 Part gradient for active wormhole |
| *.css |  --color-wormhole-2 |<span style="color:cyan">cyan</span> | 3 Part gradient for active wormhole |
| *.css |  --color-wormhole-3 |<span style="color:cornflowerblue">cornflowerblue</span> | 3 Part gradient for active wormhole |
| crt.css | .crt.flicker | unset | Uncomment to add screen flicker effect |
| crt.css | .crt -> textShadow | unset | Uncomment to add awesome subtle crt effect that will melt your computer |


---

### Developers

Instead of pixels or percentages, the css is defined in terms of vmin. This allows creating a ui at a fixed square aspect ratio that can scale. Update the vmin value in the respective scss file. The scss file has a function to generate a clamp forcing a max size for the entire UI.

To generate css run: `sass --watch scss:retro/css`

For a basic web server to proxy the stargate software run: `python server.py`