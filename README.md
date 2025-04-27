# Stargate Retro

HTML Webpages recreated and inspired by computers and UI in the stargate show.

### Developers

Instead of pixels or percentages, the css is defined in terms of vmin. This allows creating a ui at a fixed square aspect ratio that can scale. Update the vmin value in the respective scss file. The scss file has a function to generate a clamp forcing a max size for the entire UI.

To generate css run: `sass styles.scss styles.css`.