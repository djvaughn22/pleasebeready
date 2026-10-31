#!/usr/bin/env python3
"""Brand images for PleaseBeReady's social profiles and post templates.

Writes one HTML file per image into src/, then renders each to PNG with
headless Chrome at its exact size:

    python3 docs/social/brand/make.py

Colors are the site's: page #0b1220, cards #141d2e, border #26324c, text
#e8edf5, muted #94a3b8, brand orange #F97316, lane accents from lanes.ts.
The mark (orange tile, navy bag, orange check) and the Archivo wordmark are
the same as app/components/Brand.tsx. Solid fills only: no gradients, glow or
see-through layers. Minimal words: the mark and colors carry the brand.
"""
import os, subprocess, pathlib

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "src"
SRC.mkdir(exist_ok=True)

BASE = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&display=block"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:%(w)dpx;height:%(h)dpx;background:#0b1220;color:#e8edf5;font-family:'Noto Sans',sans-serif;overflow:hidden}
.wm{font-family:Archivo,sans-serif;font-weight:900;letter-spacing:-0.02em}.wm b{color:#F97316;font-weight:900}
.d{font-family:Archivo,sans-serif}
.muted{color:#94a3b8}.green{color:#F97316}
.chip{display:inline-block;border:3px solid #26324c;border-top-width:8px;background:#141d2e;border-radius:999px;font-weight:800}
.card{background:#141d2e;border:2px solid #26324c;border-radius:28px}
</style></head><body>%(body)s</body></html>"""

CHIPS = [("Emergency", "#F97316"), ("Home", "#60A5FA"), ("Pets", "#A78BFA"), ("Car", "#22D3EE"), ("Camping", "#7DD3FC"), ("Parties", "#E879F9")]

def chips(size, gap):
    return "".join(f'<span class="chip" style="border-top-color:{c};font-size:{size}px;padding:{size*0.45:.0f}px {size*0.9:.0f}px;margin:{gap}px">{t}</span>' for t, c in CHIPS)

def center(inner):
    return f'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">{inner}</div>'

BAG = ('<svg viewBox="0 0 96 96" width="%(s)d" height="%(s)d"><rect width="96" height="96" rx="24" fill="#F97316"/>'
       '<path d="M37 43V31a11 11 0 0 1 22 0v12" fill="none" stroke="#0b1220" stroke-width="5.5" stroke-linecap="round"/>'
       '<path d="M19 37h58l-4.2 37.4a7 7 0 0 1-7 6.2H30.2a7 7 0 0 1-7-6.2Z" fill="#0b1220"/>'
       '<circle cx="37" cy="44" r="2.5" fill="#F97316"/><circle cx="59" cy="44" r="2.5" fill="#F97316"/>'
       '<path d="M36.5 63l8 8L61 54.5" fill="none" stroke="#F97316" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>')

def brand(size):
    """Mark and wordmark side by side; size is the wordmark's font size."""
    return (f'<div style="display:flex;align-items:center;gap:{size*0.35:.0f}px">{BAG % {"s": size*1.35}}'
            f'<span class="wm" style="font-size:{size}px">PleaseBe<b>Ready</b></span></div>')

CHECK = '<svg viewBox="0 0 100 100" width="%d" height="%d"><path d="M22 53 L42 72 L79 31" fill="none" stroke="%s" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>'

images = {
    # Avatars: everything important sits inside the middle 70% so a circle crop keeps it.
    "avatar-check": (1080, 1080, '<div style="position:absolute;inset:0;background:#F97316;display:flex;align-items:center;justify-content:center">'
        + (BAG % {"s": 760}).replace('<rect width="96" height="96" rx="24" fill="#F97316"/>', "") + '</div>'),
    "avatar-wordmark": (1080, 1080, center(
        f'{BAG % {"s": 300}}<div class="wm" style="font-size:132px;line-height:1.02;margin-top:40px">PleaseBe<b>Ready</b></div>')),
    # Facebook shows 820x312 on desktop and crops the sides on phones: keep it centered.
    "cover-facebook": (1640, 624, center(f'{brand(96)}<div style="margin-top:34px">{chips(30, 8)}</div>')),
    # YouTube: only the middle 1546x423 shows on every device.
    "banner-youtube": (2560, 1440, center(
        '<div style="width:1546px;height:423px;display:flex;flex-direction:column;align-items:center;justify-content:center">'
        f'{brand(120)}<div style="margin-top:30px">{chips(34, 9)}</div></div>')),
    "cover-pinterest": (1920, 1080, center(f'{brand(140)}<div style="margin-top:44px">{chips(38, 10)}</div>')),
    # Email: header for a 600px-wide email at 2x, and the signature image at 2x.
    "email-header": (1200, 240, center(brand(84))),
    "email-signature": (640, 120, '<div style="position:absolute;inset:0;display:flex;align-items:center;padding-left:8px">'
        f'{brand(48)}</div>'),
}

def listing(items, size):
    return "".join(f'<div style="display:flex;gap:22px;align-items:flex-start;margin:{size*0.42:.0f}px 0"><span style="flex:none">{CHECK % (size*1.15, size*1.15, "#F97316")}</span><span style="font-size:{size}px;font-weight:700;line-height:1.25">{t}</span></div>' for t in items)

# Post templates, filled with real kit content (see app/lib/shop/kits.ts and guides.ts).
images["pin-power-outage"] = (1000, 1500,
    '<div style="position:absolute;inset:0;padding:80px 72px;display:flex;flex-direction:column">'
    '<div style="display:flex;justify-content:space-between;align-items:center"><div class="green" style="font-size:34px;font-weight:900;letter-spacing:0.12em">POWER OUTAGE KIT</div>' + (BAG % {"s": 96}) + '</div>'
    '<div style="font-size:76px;font-weight:900;line-height:1.05;margin-top:18px">What to have for 3 days without power</div>'
    f'<div style="margin-top:34px">{listing(["A flashlight for each person", "Extra batteries in the right sizes", "A power bank for each phone", "A battery or hand-crank radio", "1 gallon of water per person per day", "Food that needs no cooking", "A cooler and a fridge thermometer", "A first aid kit"], 40)}</div>'
    '<div style="margin-top:auto" class="card"><div style="padding:30px 34px"><div style="font-size:32px;font-weight:800">Amounts for your group, and a list to save:</div>'
    '<div class="green" style="font-size:36px;font-weight:900;margin-top:8px">pleasebeready.com/kits/power-outage</div></div></div></div>')

images["slide-winter-storm-1"] = (1080, 1350,
    '<div style="position:absolute;inset:0;padding:96px 84px;display:flex;flex-direction:column">'
    '<div style="font-size:36px;font-weight:900;letter-spacing:0.12em;color:#FBBF24">WINTER STORM</div>'
    '<div style="font-size:104px;font-weight:900;line-height:1.02;margin-top:24px">3 days at home, ready before the snow</div>'
    '<div class="muted" style="font-size:44px;font-weight:700;margin-top:36px;line-height:1.3">Warmth, light, water and food. Swipe for the list.</div>'
    '<div style="margin-top:auto">' + brand(44) + '</div></div>')

images["slide-winter-storm-2"] = (1080, 1350,
    '<div style="position:absolute;inset:0;padding:90px 84px;display:flex;flex-direction:column">'
    '<div style="font-size:36px;font-weight:900;letter-spacing:0.12em;color:#FBBF24">AT HOME</div>'
    f'<div style="margin-top:20px">{listing(["Blankets and warm layers for everyone", "Hand warmers, no power needed", "Flashlights and extra batteries", "A power bank and a weather radio", "1 gallon of water per person per day", "Smoke and CO alarms, tested", "Faucet covers before the freeze"], 44)}</div>'
    '<div class="muted" style="margin-top:auto;font-size:30px;font-weight:700">From Ready.gov Winter Weather. Full kit: pleasebeready.com/kits/winter-storm</div></div>')

images["reel-cover-new-puppy"] = (1080, 1920,
    # TikTok and Reels cover the bottom and right edges with buttons: text stays top and middle.
    '<div style="position:absolute;inset:0;padding:240px 90px;display:flex;flex-direction:column">'
    '<div style="font-size:40px;font-weight:900;letter-spacing:0.12em;color:#A78BFA">NEW PUPPY</div>'
    '<div style="font-size:130px;font-weight:900;line-height:1.0;margin-top:24px">The first-month list</div>'
    '<div class="muted" style="font-size:52px;font-weight:700;margin-top:40px;line-height:1.3">Crate, bowls, leash and ID, chew toys, cleanup.</div>'
    '<div style="margin-top:80px">' + brand(52) + '</div></div>')

chrome = "google-chrome"
env = {k: v for k, v in os.environ.items() if k != "TMPDIR"}  # a long TMPDIR breaks Chrome's socket path
for name, (w, h, body) in images.items():
    html = SRC / f"{name}.html"
    html.write_text(BASE % {"w": w, "h": h, "body": body}, encoding="utf-8")
    out = HERE / f"{name}.png"
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=4000",
                    f"--window-size={w},{h}", f"--screenshot={out}", html.as_uri()],
                   env=env, check=True, capture_output=True, timeout=60)
    print(f"{out.name} {w}x{h}")
