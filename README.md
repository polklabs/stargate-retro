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
├── main.css
├── etc...
└── retro/ <--- Copy Folder Here
    ├── css/
    ├── js/
    ├── dial.html
    └── etc...
```

Once installed you can update some of the *.css and *.js files with customizations such as different colors or updated text. See [below](#customizations) for customizations

Navigation header at the top of all pages to integrate with v4 software.

To access, enter one of the links below:
- [Dial](http://stargate.local/retro/dial.html) - `/retro/dial.html`

    <img src="screenshots/Screenshot 2025-05-07 154809.png" alt="drawing" width="300"/>
- [Address Book](http://stargate.local/retro/address_book.html) - `/retro/address_book.html`

    <img src="screenshots/Screenshot 2025-05-07 154444.png" alt="drawing" width="300"/>


## Customizations

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
| crt.js | CRT_SCREEN_FLICKER | `false` | Add screen flicker effect at random intervals |
| crt.css | .crt -> textShadow | unset | Uncomment to add awesome subtle crt effect that will melt your computer |

## Future Plans?

- Convert javascript to typescript
    - Depending on integration with v4 software it may be easier to stick with js
- New Pages
    - Dialing from S1
    - Address Book from S2E15 - The Fifth Race
    - Base Power Monitor
    - Malp
    - Popups
        - System Access Denied
        - Self Destruct

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