# Stargate Retro

<img src="screenshots/Screenshot%202025-05-07%20154406.png" alt="drawing" width="400"/>

HTML Webpages recreated and inspired by computers and UI in the stargate show. I have taken some liberties and made changes that make sense to me and to better integrate with StargateSoftware_V4. 

Please submit bugs and I will fix them when I have time. New features will be based on what I feel like making but I'm open to suggestions.

| Browser | Compatibility | Emoji |
| ------- | ------------- | ----- |
| Firefox | Fully tested  | ⭐ 💯 |
| Chrome  | Quick test, should work | ✅ |
| Safari  | Unknown, don't have apple stuff| ❓ |
| Mobile  | Use at your own risk | ⚠️ |
| Nintendo DS | Just Why? | 💀 |

### Table of Contents
1. [How to install](#how-to-install)
2. [Customization](#customizations)
3. [Future Plans](#future-plans)
4. [Webhooks](#webhooks)
5. [Credits](#development)
6. [Development](#development)

## How to install

Copy `/retro` folder into `/home/pi/sg1_v4/web/`

```
sg1_v4/web/
├── index.htm
├── chevrons/
├── etc...
└── retro/ <--- Copy Folder Here
    ├── css/
    ├── js/
    ├── dial.html
    └── etc...
```

Once installed you can update some of the *.css and *.js files with customizations such as different colors or updated text. See [below](#customizations) for customizations. (More to come later)

Navigation header at the top of all pages to integrate with v4 software. As it is not fully integrated with the v4 software you will not be able to get back to my pages (from the original UI) without a direct link.

<img src="screenshots/Screenshot 2025-05-12 102711.png" alt="nav screenshot" width="300">

---

#### To access, enter one of the links below:
- [Dial](http://stargate.local/retro/dial.html) - `/retro/dial.html`
    - On incoming wormholes: GDO window will popup. It will scan then display a recognized code. This can be adjusted or disabled in config.js

    <img src="screenshots/Screenshot 2025-05-07 154809.png" alt="drawing" width="300"/>
    <img src="screenshots/Screenshot 2025-05-20 161401.png" alt="drawing" width="300"/>

- [Dial 9 chevrons](http://stargate.local/retro/dial9.html) - `/retro/dial9.html`
    - A variant of the dialing page that has boxes for 9 chevrons

- [Address Book](http://stargate.local/retro/address_book.html) - `/retro/address_book.html`

    <img src="screenshots/Screenshot 2025-05-07 154444.png" alt="drawing" width="300"/>
- [Symbol Overview](http://stargate.local/retro/symbol_overview.html) - `/retro/symbol_overview.html`

    <img src="screenshots/Screenshot 2025-05-22 163110.png" alt="drawing" width="300"/>
- [System Info](http://stargate.local/retro/info.html) - `/retro/info.html`

    <img src="screenshots/Screenshot 2025-05-21 202059.png" alt="drawing" width="300"/>


## Customizations

| File | Page | Property | Default | Description | Alt Example |
| ---- | ---- | -------- | ------- | ----------- | ----------- |
| config.js | All | POTATO_MODE | `false` | Disables options to make the page more performant on low end systems like a raspberry pi 3B+. Effects `CRT_SCREEN_FLICKER`, `CRT_SCAN_LINE`, `CRT_PIXEL` and more |  |
| config.js | All | FILL_SCREEN | `false` | Will attempt to make the page fill the screen |  |
| config.js | All | CHEVRON_9_DIALING | `false` | Should links to dial page default to 9 chevron variant |  |
| config.js | All | CHEVRON_9_DIALING_AUTO_SWITCH | `true` | Should longer addresses auto switch to use new 9 chevron page |  |
| config.js | Dial | RING_ANIMATION | `true` | Should the ring spin when dialing out |
| config.js | Dial/Symbols | AUTHORIZATION_CODE_RANDOMIZE | `true` | Generate a random authorization code on page load |
| config.js | Dial/Symbols | AUTHORIZATION_CODE | `77892757892387` | Fixed code to use if *AUTHORIZATION_CODE_RANDOMIZE* is `false` |
| config.js | Dial/Symbols/Info | USER | `SGT. W HARRIMAN` | Use name in bottom right of screen |
| config.js | Dial | DEFAULT_GATE_NAME | `STARGATE` | Gate name if it cannot be fetched from server |
| config.js | Dial | TEXT_OFFLINE | `OFFLINE` | Text to use when gate is offline |
| config.js | Dial | TEXT_IDLE | `IDLE` | Text to use when gate is idle |
| config.js | Dial | TEXT_DIALING | `DIALING` | Text to use when gate is dialing out |
| config.js | Dial | TEXT_INCOMING | `INCOMING` | Text to use when gate is dialing in |
| config.js | Dial | TEXT_ENGAGED | `ENGAGED` | Text to use when wormhole is active  |
| config.js | Dial | TEXT_RECOGNIZED | `RECOGNIZED` | Text to use when GDO code is valid  |
| config.js | Dial | TEXT_ANALYZING | `ANALYZING` | Text to use when GDO code is being checked  |
| config.js | Dial | GDO_AUTO | `true` | Should the GDO window auto open after establishing an incoming wormhole  |
| config.js | Dial | GDO_DELAY | `3` | How long after establishing incoming wormhole before GDO window opens  |
| config.js | Dial | GDO_SIGNALS | *see config* | Names that will appear as GDO code senders  |
| config.js | Info | INFO_FLUX | `[-40, 40]` | Gauge needle fluctuation at idle `MAX -90 to 90` |
| config.js | Info | INFO_FLUX_ACTIVE | `[-90, 90]` | Gauge needle fluctuation for active gate `MAX -90 to 90` |
| config.js | Info | INFO_FLUX_UPDATES | `[1.5, 0.9]` | How often needle moves at idle vs active gate (seconds)  |
| config.js | Info | INFO_OUTPUT | `[10, 30]` | Output bar fluctuation at idle `MAX 0 to 100` |
| config.js | Info | INFO_OUTPUT_ACTIVE | `[25, 100]` | Output bar fluctuation for active gate `MAX 0 to 100` |
| config.js | Info | INFO_OUTPUT_UPDATES | `[1.8, 0.7]` | How often bars moves at idle vs active gate (seconds)  |
| config.js | Info | INFO_WAVEFORM | `[0.3, 0.6]` | Waveform amplitude fluctuation at idle `MAX 0 to 1`  |
| config.js | Info | INFO_WAVEFORM_ACTIVE | `[0.7, 1]` | Waveform amplitude fluctuation for active gate `MAX 0 to 1`  |
| config.js | Info | INFO_WAVEFORM_UPDATES | `[20, 2.5]` | How often amplitude changes at idle vs active gate (seconds)  |
| *.css | All |  --color | <span style="color:#37bfde">#37bfde</span> | Most borders and text | #2B6EC8 |
| *.css | All | --color-dark | <span style="color:#4a7297">#4a7297</span> | Some smaller borders  | #2B6EC8 |
| *.css | All |  --color-danger |<span style="color:#c70036">#c70036</span> | Invalid glyphs, dialing lock, and stargate state color | #B2020B |
| *.css | All |  --color-good |<span style="color:#07ff0b">#07ff0b</span> | Address book hover color, dialing chevron OK text | #275e9c |
| *.css | All |  --color-alt |<span style="color:white">white</span> | Secondary text color |
| *.css | All |  --background-color |<span style="color:#020f25">#020f25</span> | Background Color | #000000 | 
| *.css | All |  --glyph-color |<span style="color:#fffea5">#fffea5</span> | Glyph color also used for some text - must also generate new [SVG filter](https://codepen.io/sosuke/pen/Pjoqqp) to apply color |
| *.css | All |  --color-wormhole-danger-1 |<span style="color:yellow">yellow</span> | 3 Part gradient for active wormhole - when connected to blackhole |
| *.css | All |  --color-wormhole-danger-2 |<span style="color:orange">orange</span> | 3 Part gradient for active wormhole - when connected to blackhole |
| *.css | All |  --color-wormhole-danger-3 |<span style="color:red">red</span> | 3 Part gradient for active wormhole - when connected to blackhole |
| *.css | All |  --color-wormhole-1 |<span style="color:royalblue">royalblue</span> | 3 Part gradient for active wormhole |
| *.css | All |  --color-wormhole-2 |<span style="color:cyan">cyan</span> | 3 Part gradient for active wormhole |
| *.css | All |  --color-wormhole-3 |<span style="color:cornflowerblue">cornflowerblue</span> | 3 Part gradient for active wormhole |
| config.js | All | CRT_SCREEN_FLICKER | `false` | Add screen flicker effect at random intervals |
| config.js | All | CRT_SCAN_LINE | `true` | Add screen tear like scan line animation |
| config.js | All | CRT_PIXEL | `true` | Add screen door effect to make page look more like a crt monitor |
| crt.css | All | .crt -> textShadow | unset | Uncomment to add awesome subtle crt effect that will melt your computer |

## Future Plans?

- Code Updates:
    - Convert javascript to typescript
        - Depending on integration with v4 software it may be easier to stick with js
    - OR Update javascript with jquery
- New Pages
    - Dialing from S1
    - Address Book from S2E15 - The Fifth Race
    - Malp
    - Popups
        - System Access Denied
        - Self Destruct
    - Add IRIS animation and control
- Add loading screen
    - Like a old DOS computer booting up
    - Could be used to hide initial API calls while applying customizations
- Support for other languages?
    - That will wreak havoc on the page layout

## Webhooks

If you don't use [StargateProject-Software](https://github.com/jonnerd154/StargateProject-software) or your name is *Michał* you can setup this project using webhooks. I have added enough to get started - but probably won't add more features because at that point I'm basically rewriting the github project this is meant to expand on.

To setup with webhooks:
1. Set `USE_WEBHOOKS` to `True` in server.py
2. Update `PROXY_BASE_URL`, this is where POST requests like `/do/dhd_press` will be sent
    - There is an optional `pre_post_hook` method in webhooks.py where you can perform extra actions such as adding the dhd press symbol to the address_buffer_outgoing without needing to make an extra api call.
3. Run: `python server.py`
4. Open URL: `http://localhost:5000/retro/dial.html`

The stargate state that is normally returned from StargateProject-Software is emulated in `webhooks.py`. get_data should already be setup with all the GET requests that my UI needs. You can modify `set_data` and `pre_post_hook` to add any extra functionality may be needed for your stargate.

Example Webhook Dialing Process:
```
POST /sgc/set/dialing_status {"address_buffer_outgoing": [11]}
...
POST /sgc/set/dialing_status {"address_buffer_outgoing": [11,9,18]}
...
POST /sgc/set/dialing_status {"address_buffer_outgoing": [11,9,18,19], "locked_chevrons_outgoing": 1}
...
POST /sgc/set/dialing_status {"address_buffer_outgoing": [11,9,18,19, 20], "locked_chevrons_outgoing": 2}
...
POST /sgc/set/dialing_status {"locked_chevrons_outgoing": 4}
...
POST /sgc/set/dialing_status {"locked_chevrons_outgoing": 5}
...
POST /sgc/set/dialing_status {"address_buffer_outgoing": [11,9,18,19,20,25,1]}
...
POST /sgc/set/dialing_status {"locked_chevrons_outgoing": 7}
...
POST /sgc/set/dialing_status {"wormhole_active": true, "connected_planet": "PJ2-445"}
...
POST /sgc/action/close_wormhole {}
```

## Credits

Stargate SG-1, Stargate Atlantis & Stargate Universe are ™ & © of Metro-Goldwyn-Mayer Studios Inc.  This project is in no way sponsored or endorsed by: SyFy or MGM. This project was created solely as a hobby project and to help other Stargate fans run their own Stargate Command Computer and to keep the passion and love for Stargate alive.

TheStargateProject.com is a fan-based project and is not intended to infringe upon any copyrights or registered trademarks.

# Development

Instead of pixels or percentages, the css is defined in terms of vmin. This allows creating a ui at a fixed square aspect ratio that can scale. Update the vmin value in the respective scss file. The scss file has a function to generate a clamp forcing a max size for the entire UI.

To generate css run: `sass --watch scss:retro/css`

For a basic web server to proxy the stargate software run: `python server.py`

Easiest to develop just using vmin then convert to vmin-clamp() after. Find regex `([-0-9.]+)vmin` and replace `vmin-clamp($1)`