# darwinapps.pl

Static replacement for the site that used to run on Durable. Plain HTML, CSS
and a little vanilla JavaScript. **No framework, no build step, no
`node_modules`.** Clone the repo, open `index.html`, and you see the site.

## Files

| File | Purpose |
|---|---|
| `index.html` | home page (hero, what we build, vision, contact) |
| `contact.html` | contact: address, map, form |
| `privacy.html` | privacy policy |
| `terms.html` | terms of service |
| `404.html` | error page (hosts pick this up automatically) |
| `assets/config.js` | **the only file to edit for contact details** |
| `assets/style.css` | all styles, in numbered sections |
| `assets/site.js` | menu, theme, form handling, animations |
| `assets/logo.svg` | logo, traced to vector from the original PNG |
| `assets/map-light.svg`, `map-dark.svg` | the office neighbourhood, drawn as plain SVG |
| `assets/og.png` | link preview image for LinkedIn, Slack, Messenger |

## Setting the email address

Open `assets/config.js` and fill in the address:

```js
email: "hello@darwinapps.pl",
```

That is all. It appears automatically in the contact section, the footer and
the form's messages, on every page. While the field is empty those places show
`—` and nothing breaks.

## Connecting the form

The site is static, so the form needs an external service to deliver messages.
It is set up for **Web3Forms** (free, no account needed):

1. Go to <https://web3forms.com>
2. Enter the address that should receive the messages
3. The key arrives by email — paste it into `assets/config.js`:

```js
accessKey: "paste-the-key-here",
```

While the key is empty the form runs in demo mode: it validates the fields and
says plainly that sending is not connected yet. It never fakes success and
never drops a message silently.

Prefer Formspree? Set `formEndpoint` to `https://formspree.io/f/YOUR_ID` and
leave `accessKey` empty.

The form has a built-in honeypot for bots — no captcha, no third-party script,
no cookie banner.

## Deploying

The whole directory is ready to upload. Nothing gets compiled.

**Cloudflare Pages** (free, HTTPS out of the box):

1. <https://dash.cloudflare.com> → Workers & Pages → Create → Pages
2. Upload the project directory, or connect the Git repo
3. Build command: **empty**. Build output directory: **`/`**
4. Custom domains → add `darwinapps.pl` → Cloudflare gives you the DNS records

Netlify, GitHub Pages or plain FTP work just as well.

> **Still to be done by whoever has registrar access:** repointing
> `darwinapps.pl` from Durable to the new host. Until then the site runs on the
> temporary address the host provides (e.g. `darwinapps.pages.dev`).

## Notes on a few decisions

**No stock photography.** The old site used Getty images served from Durable's
CDN — the licence came with that subscription and ends with it. The artwork
here is built from the wing motif in the logo: plain SVG, nothing to license,
and kilobytes instead of megabytes.

**The map is just an SVG.** The old site embedded Mapbox using Durable's API
token. The map is now two static image files drawn from OpenStreetMap data in
the site's own colours, one for each theme. No iframe, no third-party service,
no extra requests. The one-line OpenStreetMap credit under the map stays — the
ODbL licence requires it.

**No analytics, cookies or trackers.** That is why the site needs no cookie
consent banner, and why the privacy policy can honestly say we collect nothing.
If analytics are ever needed, pick a cookie-free option (Plausible, Umami) and
the banner still will not be necessary.

**The logo is an SVG.** The original was a PNG on a white background, which
would have shown as a white square in dark mode. The shape was traced to
vector: crisp at any size, transparent, about 8 kB.

**The hero animation** (the rotating arcs) is done inside the SVG with
`<animateTransform>`, not in CSS. The CSS version worked in Chrome but placed
the arcs on the wrong radius in Safari: the centre of rotation there depends on
`transform-box`/`transform-origin`, which WebKit resolves differently from
Chrome. `<animateTransform>` takes the centre as literal numbers, so there is
nothing left to interpret. **It is not worth "fixing" this back to CSS.** The
trade-off is that such animations ignore the system "reduce motion" setting, so
a few lines in `assets/site.js` stop them by hand.

**Legal text.** The old privacy policy and terms were generated text describing
a SaaS platform with user accounts that does not exist. They were rewritten to
describe what is actually here: a static brochure site with a contact form.
**This is not legal advice** — if the company starts collecting data more
broadly, have a lawyer review them.

**Dark mode** follows the system setting, with a toggle in the header. The
choice is remembered in `localStorage`.
