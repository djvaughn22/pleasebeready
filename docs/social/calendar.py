#!/usr/bin/env python3
"""The first 30 days of PleaseBeReady social posts (Nov 2 to Dec 1, 2026).

    python3 docs/social/calendar.py

Writes calendar-2026-11.csv (every field, one row per day, a tracked link per
platform) and calendar-2026-11.md (the readable version). Nothing here is
posted anywhere; DJ approves and posts.

Rules (see SOCIAL-LAUNCH.md): facts only from the guides' sources, no fear,
no prices or deals, no "best", no made-up tests or customers. Film only what
you really have. If a post names or shows a specific product, end the caption
with: "Shopping links on our site may earn us a commission."
"""
import csv, datetime, pathlib

HERE = pathlib.Path(__file__).resolve().parent
SITE = "https://pleasebeready.com"
PLATFORMS = {"ig": "Instagram", "tt": "TikTok", "fb": "Facebook", "pin": "Pinterest", "yt": "YouTube", "th": "Threads"}
START = datetime.date(2026, 11, 2)

# (theme, destination path, campaign, hook, format, video or slides, caption, pin title, pin description, threads, youtube title, tags, names a product)
DAYS = [
    ("Launch", "/", "launch", "What do you want to be ready for?", "Reel",
     "Screen recording: type 'five days without electricity', open the kit, set 4 people, tap Save this kit. 15 seconds.",
     "Type what you're getting ready for, like “five days without electricity” or “birthday party for 20,” and get a kit with the amounts worked out for your group. Save it as a list on your phone. No account needed. PleaseBeReady.com",
     "Shopping lists for whatever is coming",
     "Kits for power outages, winter storms, a new puppy, a teen's first car, camping, parties and more. Set how many people and how long, then save the list.",
     "We built a site that turns “five days without electricity” or “party for 20” into a shopping list with the amounts worked out. No account. PleaseBeReady.com",
     "Type what you're getting ready for. Get the list.", "#checklist #shoppinglist #beprepared", False),
    ("Smoke and CO alarms", "/kits/home-maintenance", "alarms", "Clocks changed. Test the alarms.", "Reel",
     "Press the test button on a real smoke alarm at home, then on the CO alarm. Text: 'Test monthly. Replace batteries the way the maker says.'",
     "The clocks changed this weekend, a good reminder to press the test button on every smoke and CO alarm. Replace batteries the way the maker says. More quick home jobs in our home maintenance kit.",
     "Home safety: test your smoke and CO alarms",
     "Press the test button on every smoke and carbon monoxide alarm, and replace batteries the way the maker says. More quick jobs for the house in the home maintenance kit.",
     "Clocks went back. Go press the test button on every smoke and CO alarm. Two minutes.",
     "Clocks changed? Test your smoke alarms", "#homesafety #smokealarm #homemaintenance", False),
    ("Power outage kit", "/kits/power-outage", "outage", "A light for every person", "Reel",
     "Lay out on a table what you really own: one flashlight per person, batteries, a power bank per phone, a radio, water, a cooler. Text overlays name each one.",
     "Power outage basics: a flashlight for each person, extra batteries, a power bank for each phone, a battery or crank radio, and food and water that don't need the fridge. Search “power outage” on PleaseBeReady.com for amounts for your house.",
     "Power outage kit: what to have for 3 days",
     "A flashlight for each person, extra batteries, a power bank for each phone, a radio, water, no-cook food, and a cooler with a fridge thermometer. Set your group size for exact amounts.",
     "Outage list, short version: a light per person, batteries, a power bank per phone, a radio, water, no-cook food, a cooler.",
     "Power outage kit in 30 seconds", "#poweroutage #emergencyprep #checklist", False),
    ("Food in an outage", "/guides/power-outage", "outage-food", "Fridge: 4 hours. Full freezer: 48.", "Reel",
     "Close the fridge door with text 'Keep it closed'. Show a fridge thermometer. Text: '40°F or warmer for 2+ hours: throw it out.'",
     "In an outage, keep the fridge and freezer closed. A fridge keeps food cold about 4 hours; a full freezer about 48 (Ready.gov). A fridge thermometer tells you what to keep. When in doubt, throw it out.",
     "Power outage food safety: what to keep, what to toss",
     "Keep the doors closed: about 4 hours for the fridge, about 48 for a full freezer (Ready.gov). Throw out food that has been at 40°F or warmer for 2 hours or more.",
     "Power out? Fridge about 4 hours, full freezer about 48, if you keep the doors shut (Ready.gov). 40°F for 2+ hours: toss it.",
     "How long food lasts in a power outage", "#poweroutage #foodsafety #emergencyprep", False),
    ("Winter car kit", "/kits/roadside-emergency", "car", "What lives in the trunk all winter", "Reel",
     "Pack a bin in the trunk: jumper cables, scraper, blanket, phone charger, a bag of cat litter, water, snacks. Show the full gas gauge.",
     "Winter trunk kit, from Ready.gov's list: jumper cables, an ice scraper, a blanket, a phone charger, sand or cat litter for traction, water and snacks. Keep the tank full. Search “car kit” on PleaseBeReady.com.",
     "Winter car emergency kit checklist",
     "Jumper cables, an ice scraper, a blanket, a phone charger, sand or cat litter for traction, water and snacks, and a full tank (Ready.gov). The full kit has amounts and links.",
     "Trunk check before the first snow: jumper cables, scraper, blanket, phone charger, cat litter, water, snacks.",
     "Winter car kit checklist", "#wintercar #roadside #winterprep", False),
    ("Pet emergency kit", "/kits/pet-emergency", "pets", "Your pet needs a go-bag too", "Reel",
     "Pack a pet bag: food in an airtight container, bowl, water, leash, medicine, records, and a printed photo of you with your pet.",
     "Pet go-kit, per Ready.gov: several days of food in an airtight container, water and a bowl, medicine, a spare leash and ID tag, a carrier, cleanup supplies, and a photo of you with your pet. Search “pet emergency” on PleaseBeReady.com.",
     "Pet emergency kit checklist for dogs and cats",
     "Food in an airtight container, water and a bowl, medicine, a spare leash and ID tag, a carrier, cleanup supplies, records, and a photo of you with your pet (Ready.gov).",
     "The thing people forget in a pet go-bag: a photo of you with your pet. Ready.gov suggests it to show they're yours.",
     "Pet emergency kit: what to pack", "#petprep #dogsofinstagram #emergencyprep", False),
    ("Pick a kit", "/kits", "week1", "31 kits. Pick one this week.", "Reel",
     "Scroll the kits page on a phone. Tap New puppy, Teen driver, Holiday dinner.",
     "Power outage, winter storm, new puppy, teen driver, holiday dinner, first apartment… pick one and save it as a list on your phone. PleaseBeReady.com/kits",
     "31 ready-made shopping lists: outages, pets, cars, parties, moving",
     "Pick a kit, set how many people and how long, and save it as a list. Outages, winter storms, pets, cars, travel, parties, moving and more.",
     "Which one are you getting ready for this month? Outage, winter storm, holiday guests, a road trip…",
     "31 ready-made shopping lists", "#checklist #organized #beprepared", False),
    ("Water math", "/guides/emergency-water", "water", "4 people × 3 days = 12 gallons", "Reel",
     "Line up gallon jugs to count to 12. Text: '1 gallon per person per day (Ready.gov)'.",
     "How much water to store: 1 gallon per person per day (Ready.gov). For 4 people and 3 days, that's 12 gallons. The Red Cross suggests 2 weeks at home. Our water guide has the math and how to store it.",
     "How much water to store for emergencies, with the math",
     "1 gallon per person per day, for drinking and washing up (Ready.gov). 4 people for 3 days is 12 gallons; for 2 weeks, 56. How to store it and how to make water safe.",
     "Emergency water math: people × days × 1 gallon. Family of 4, 3 days: 12 gallons. 2 weeks: 56.",
     "How much water should you store?", "#emergencyprep #water #preparedness", False),
    ("Make water safe", "/guides/emergency-water", "water-safe", "1/8 teaspoon. 1 gallon. 30 minutes.", "Reel",
     "Show a plain, unscented bleach label (5.25–6%), a 1/8 teaspoon, a gallon jug and a 30-minute timer. Never show scented bleach.",
     "Backup way to make water safe (Ready.gov): 1/8 teaspoon of plain, unscented bleach per gallon. Stir and wait 30 minutes. It should smell slightly of bleach. Never use scented or color-safe bleach.",
     "How to make water safe with bleach: the Ready.gov method",
     "1/8 teaspoon of plain, unscented household bleach (5.25–6%) per gallon. Stir, wait 30 minutes; it should smell slightly of bleach. Never scented or color-safe (Ready.gov).",
     "Water safety backup (Ready.gov): 1/8 tsp unscented bleach per gallon, stir, wait 30 minutes. Never scented bleach.",
     "How to treat water with bleach in an emergency", "#emergencyprep #water #preparedness", False),
    ("No-cook pantry", "/kits/two-week-pantry", "pantry", "A pantry that works with the power out", "Carousel",
     "Slides: canned meat, fruit and veg / peanut butter, crackers, cereal / shelf-stable milk / the manual can opener.",
     "A pantry that works with the power out: canned meat, fruit and vegetables, peanut butter, crackers, cereal, shelf-stable milk, and a manual can opener. Buy what your family already eats (Ready.gov). Search “pantry” on PleaseBeReady.com.",
     "Two-week emergency pantry list: no-cook foods",
     "Canned meat, fruit and vegetables, peanut butter, crackers, cereal, shelf-stable milk and a manual can opener. Buy what your family already eats (Ready.gov).",
     "The pantry item everyone forgets: a manual can opener.",
     "No-cook emergency pantry list", "#pantry #emergencyfood #mealprep", False),
    ("First freeze", "/kits/winter-storm", "freeze", "Before the first hard freeze", "Reel",
     "Put a faucet cover on an outdoor spigot and foam insulation on an exposed pipe.",
     "Before the first hard freeze: faucet covers on outdoor spigots, foam insulation on exposed pipes, and weather stripping where you feel drafts. Quick jobs. Our winter storm kit has the rest.",
     "Get your home ready for the first freeze",
     "Faucet covers, pipe insulation and weather stripping before the first hard freeze. The winter storm kit has the rest: warmth, light, water and food for 3 days.",
     "First hard freeze coming? Faucet covers on, pipe insulation on, hose off the spigot.",
     "Winterize pipes in 2 minutes", "#winterprep #homemaintenance #diy", False),
    ("Winter storm kit", "/kits/winter-storm", "winter", "3 days at home, ready before the snow", "Carousel",
     "Use slide-winter-storm-1 and -2, then a screenshot of the kit page.",
     "Winter storm list for 3 days at home: blankets and layers, hand warmers, flashlights and batteries, a power bank and radio, 1 gallon of water per person per day, food that needs no cooking, and tested smoke and CO alarms. Search “winter storm” on PleaseBeReady.com.",
     "Winter storm checklist for 3 days at home",
     "Layers and blankets, hand warmers, flashlights and batteries, a power bank and radio, water, no-cook food, and tested smoke and CO alarms. From Ready.gov's winter guidance.",
     "Snow in the forecast? Layers, light, water, no-cook food, and test the CO alarm.",
     "Winter storm checklist", "#winterstorm #winterprep #emergencyprep", False),
    ("Cold weather signs", "/guides/winter-storm", "cold-signs", "Hypothermia signs to know", "Carousel",
     "Text-only slides, no acted scenes: hypothermia signs, then frostbite signs, then 'call your local emergency number'.",
     "Hypothermia signs (Ready.gov): shivering, exhaustion, confusion, fumbling hands, memory loss, slurred speech, drowsiness. Below 95°F is an emergency; call your local emergency number. Frostbite: numbness, white or grayish-yellow, firm or waxy skin.",
     "Signs of frostbite and hypothermia (Ready.gov)",
     "Hypothermia: shivering, exhaustion, confusion, fumbling hands, memory loss, slurred speech, drowsiness. Frostbite: numbness, white or grayish-yellow, firm or waxy skin. From Ready.gov.",
     "Know the signs: shivering, confusion, fumbling hands, slurred speech, drowsiness. Below 95°F is an emergency (Ready.gov).",
     "Frostbite and hypothermia: the signs", "#wintersafety #coldweather #winterprep", False),
    ("Lists: bought, ready, restock", "/lists", "lists", "Bought. Ready. Restock.", "Reel",
     "Screen recording of a saved list: tick Bought, mark Ready, add a note, tap Share.",
     "Save any kit as a list on your phone. Tick what you bought, mark what's put away, flag what runs out, add notes, and send it to whoever's shopping. No account needed.",
     "Save and share shopping lists for any situation",
     "Save a kit as a list, tick what you bought, mark what's put away, flag what runs out, and share it with whoever's shopping. No account needed.",
     "Our lists have three marks: bought, ready (put away) and restock. Buying it isn't the same as having it where you need it.",
     "The shopping list with a 'ready' button", "#shoppinglist #organized #checklist", False),
    ("Holiday dinner", "/kits/holiday-dinner", "dinner", "Hosting 12? Check these first.", "Reel",
     "Pull out a roasting pan, a food thermometer and serving dishes; count the chairs; stack leftover containers.",
     "Hosting Thanksgiving? Before you shop: a roasting pan, a food thermometer, enough serving dishes and chairs, foil, and containers so guests can take leftovers home. Our holiday dinner kit works it out for your headcount.",
     "Thanksgiving hosting checklist, beyond the food",
     "Roasting pan, food thermometer, serving dishes, chairs, foil and leftover containers, worked out for your headcount.",
     "Thanksgiving hosts: count the chairs now, not Thursday morning.",
     "Thanksgiving hosting checklist", "#thanksgiving #hosting #friendsgiving", False),
    ("Overnight guests", "/kits/overnight-guests", "guests", "Guests for 3 nights: the list", "Reel",
     "Make up a guest bed: sheets, an extra blanket, towels on the bed, a basket of toiletries, a card with the Wi-Fi password.",
     "Family staying over? A bed and fresh towels for each guest, enough coffee and decaf for the crowd, a night-light for the hallway, and the Wi-Fi password where they can see it. Search “holiday guests” on PleaseBeReady.com.",
     "Overnight guest checklist for the holidays",
     "A bed and fresh towels for each guest, coffee and decaf, a night-light, a guest basket and the Wi-Fi password where they can see it.",
     "Best thing to leave in a guest room: the Wi-Fi password on a card. Second best: a night-light.",
     "Getting ready for holiday guests", "#holidayguests #hosting #guestroom", False),
    ("Cold and flu shelf", "/kits/cold-and-flu", "flu", "Stock the sick-day shelf now", "Reel",
     "A shelf with tissues, a thermometer, electrolyte packets, broth, crackers and tea. Text: 'and the medicines your doctor is fine with'.",
     "Cold and flu season: stock the shelf before someone's sick. Tissues, a thermometer, fluids, broth and crackers, tea, and the medicines your doctor is fine with. Search “cold and flu” on PleaseBeReady.com.",
     "Cold and flu season checklist: stock up before you need it",
     "Tissues, a thermometer, fluids, broth, crackers, tea and the medicines your doctor is fine with, on one shelf before anyone gets sick.",
     "Nobody wants to drive to the store with a fever. Thermometer, tissues, fluids, crackers: buy them while you're well.",
     "Sick-day shelf checklist", "#fluseason #coldandflu #stockup", False),
    ("Family road trip", "/kits/family-road-trip", "roadtrip", "Holiday drive with kids: pack this up front", "Reel",
     "Fill a front-seat organizer: snacks, wipes, a trash bag, a charger for every row, headphones, activity books.",
     "Long holiday drive with kids: snacks and water within reach, a charger for every row, wipes and a trash bag, motion sickness relief, and something to do. Search “road trip” on PleaseBeReady.com for amounts for your crew.",
     "Family road trip checklist for holiday travel",
     "Snacks and water within reach, a charger for every row, wipes and a trash bag, motion sickness relief and something to do, worked out for your family.",
     "Road trip rule: if a kid can't reach it, it's packed wrong.",
     "Road trip with kids: car essentials", "#roadtrip #familytravel #holidaytravel", False),
    ("Road trip with a dog", "/kits/dog-travel", "dogtrip", "Taking the dog for Thanksgiving?", "Reel",
     "Pack a dog travel bag: bowls, water, leash, waste bags, car harness, seat cover, food, a copy of vaccination records.",
     "Taking the dog along? Water and a bowl for stops, a car harness or crate, a seat cover, waste bags, food and medicine, and a copy of vaccination records. Check that where you're staying takes pets. Search “road trip with dogs” on PleaseBeReady.com.",
     "Road trip with a dog: packing checklist",
     "Water and a bowl for stops, a car harness or crate, a seat cover, waste bags, food, medicine and vaccination records. Confirm your stay takes pets.",
     "Holiday travel with a dog: confirm the place you're staying takes pets before you go.",
     "Road trip with a dog checklist", "#dogtravel #roadtripwithdog #petsofinstagram", False),
    ("Teen driver", "/kits/teen-driver", "teen", "Before your teen drives in winter", "Reel",
     "Hands only: pack the trunk kit, mount the phone holder, save the insurance and roadside numbers in the phone.",
     "New driver in the house? Jumper cables, a tire gauge, a first aid kit, a flashlight, a phone mount for hands-free maps, and the insurance and roadside numbers saved in their phone. Search “teen driver” on PleaseBeReady.com.",
     "Teen driver's first car: emergency kit checklist",
     "Jumper cables, a tire gauge and inflator, a first aid kit, a flashlight, a phone mount, a blanket and water, and the insurance and roadside numbers in their phone.",
     "Add to a new driver's phone today: the insurance company, roadside help, and a parent's number as a favorite.",
     "Teen driver car kit", "#teendriver #newdriver #carsafety", False),
    ("Thanksgiving week", "/kits", "tg-week", "Thanksgiving week: 3 lists", "Reel",
     "Search 'thanksgiving' then 'holiday guests' then 'road trip' on the site, one tap each.",
     "Thanksgiving week, three lists: the dinner, the guests, the drive. Type what you're doing on PleaseBeReady.com and save the list to your phone.",
     "Thanksgiving week checklists: dinner, guests and travel",
     "Three kits for the week: the holiday dinner, overnight guests and the family road trip. Amounts for your headcount; save each as a list.",
     "Thanksgiving week is three lists: dinner, guests, the drive.",
     "Thanksgiving week checklists", "#thanksgiving #holidayprep #checklist", False),
    ("Leftovers", "/kits/holiday-dinner", "leftovers", "Containers before Thursday", "Reel",
     "A stack of containers and foil pans with lids, labels and a marker.",
     "Buy the leftover containers before Thursday: foil pans with lids and containers so guests can take food home. A food thermometer helps with the bird. Search “thanksgiving” on PleaseBeReady.com.",
     "Thanksgiving leftovers: what to have ready",
     "Foil pans with lids, containers for guests to take food home, labels, and a food thermometer for the cooking.",
     "Thanksgiving tip: buy leftover containers now. Guests take food home; your fridge thanks you.",
     "Get these before Thanksgiving", "#thanksgiving #leftovers #hosting", False),
    ("Car check before the drive", "/guides/car-emergency-kit", "travel-car", "Driving tomorrow? 5-minute car check", "Reel",
     "Check tire pressure with a gauge, top up washer fluid, put a charger and a blanket in the car, show a full tank.",
     "Driving for the holiday? Five-minute check: tire pressure, washer fluid, a phone charger, a blanket and water in the trunk, and a full tank. Ready.gov's car list is in our guide.",
     "Before a holiday road trip: 5-minute car check",
     "Tire pressure, washer fluid, a phone charger, a blanket and water in the trunk, and a full tank. Plus Ready.gov's car kit list.",
     "Before the holiday drive: tires, washer fluid, charger, blanket, full tank.",
     "5-minute car check before a road trip", "#roadtrip #holidaytravel #carcare", False),
    ("Household basics", "/kits/household-restock", "restock", "Full house tomorrow: check the basics", "Reel",
     "Open the closet: count toilet paper, paper towels, trash bags, dish soap, dishwasher detergent, hand soap.",
     "Full house tomorrow? Check the basics tonight: toilet paper, paper towels, trash bags, dish soap and hand soap. Our household restock kit works out a month for your house.",
     "Before guests arrive: household basics checklist",
     "Toilet paper, paper towels, trash bags, dish soap, dishwasher detergent and hand soap, worked out for a month for your household.",
     "The night before hosting: count the toilet paper. Then the trash bags.",
     "Night-before-hosting checklist", "#hosting #household #stockup", False),
    ("Thanksgiving", "/lists", "thanksgiving", "Write down what ran out today", "Single image",
     "One card: 'What ran out today? That's next year's list.'",
     "Happy Thanksgiving. One thing for later: note what ran out today (chairs, ice, containers) so next year's list writes itself. Save it on PleaseBeReady.com.",
     "", "",
     "Happy Thanksgiving. What ran out at your house today?",
     "", "#thanksgiving #happythanksgiving", False),
    ("Shop your list", "/kits", "black-friday", "Shopping today? Bring a list.", "Reel",
     "Screen recording: open a saved list in a store aisle, tick items as bought.",
     "If you're shopping today, shop your list: the winter car kit, the outage basics, the pantry. Save one on PleaseBeReady.com and tick things off as you go.",
     "Black Friday shopping list for winter",
     "Shop the list, not the noise: the winter car kit, outage basics and pantry. Save one and tick things off as you buy them.",
     "Black Friday idea: buy the boring stuff on your list. Batteries, a power bank, a first aid kit.",
     "Shop your list, not the hype", "#blackfriday #shoppinglist #winterprep", False),
    ("First aid kit", "/kits/first-aid-kit", "firstaid", "Open your first aid kit. What's missing?", "Reel",
     "Open the home first aid kit and check each item; add a written list of everyone's medicines.",
     "Open the first aid kit and check it: bandages, gauze and tape, ointment, cold packs, gloves, tweezers, a thermometer, and a written list of everyone's medicines. Search “first aid” on PleaseBeReady.com.",
     "Home first aid kit checklist",
     "Bandages, gauze and tape, ointment, cold packs, gloves, tweezers, a thermometer, a first aid manual, and a written list of everyone's medicines.",
     "Write everyone's medicines and doses on paper and keep the list in the first aid kit. Phones die.",
     "What goes in a home first aid kit", "#firstaid #homesafety #checklist", False),
    ("December lists", "/kits", "week4", "Which list do you need next?", "Reel",
     "Quick cuts of kit pages: winter storm, holiday travel, guests, moving day.",
     "December lists: winter storms, holiday travel, guests. What are you getting ready for? Tell us and we'll post the list.",
     "Winter checklists: storms, travel and guests",
     "Kits for winter storms, holiday road trips, overnight guests and more. Set your numbers and save the list.",
     "What are you getting ready for in December? Reply and we'll post the list.",
     "December readiness checklists", "#winterprep #holidaytravel #checklist", False),
    ("Weather radio", "/kits/five-day-emergency", "radio", "Weather alerts without cell service", "Reel",
     "Show a crank or solar weather radio you own; crank it and tune the weather band.",
     "Ready.gov's basic kit lists a NOAA weather radio with tone alert. It picks up weather alerts without cell service, and crank or solar models charge without power. Search “emergency kit” on PleaseBeReady.com. Shopping links on our site may earn us a commission.",
     "Why a NOAA weather radio belongs in your emergency kit",
     "Ready.gov's basic kit lists a NOAA weather radio with tone alert. It works without cell service; crank and solar models charge without power.",
     "A weather radio picks up alerts without cell service. Ready.gov puts one in the basic kit.",
     "Why every kit needs a weather radio", "#emergencyprep #weatherradio #beprepared", True),
    ("Basic emergency kit", "/kits/five-day-emergency", "kit", "December 1: build the basic kit", "Carousel",
     "One flat-lay photo of Ready.gov's basic list, then one slide per group: water and food, light and radio, first aid, tools.",
     "Ready.gov's basic kit in one photo: water, food, a radio, a flashlight, first aid, batteries, a whistle, masks, plastic sheeting and duct tape, wipes and trash bags, pliers, a can opener, maps and a phone charger. Search “emergency kit” on PleaseBeReady.com.",
     "Ready.gov basic emergency kit checklist",
     "Water, food, a radio, a flashlight, first aid, batteries, a whistle, masks, plastic sheeting and duct tape, wipes and trash bags, pliers, a can opener, maps and a phone charger.",
     "Ready.gov's basic emergency kit is 14 things. Most are already in your house.",
     "Basic emergency kit: Ready.gov's list", "#emergencykit #beprepared #preparedness", False),
]

assert len(DAYS) == 30, len(DAYS)

def link(path, src, campaign):
    sep = "&" if "?" in path else "?"
    return f"{SITE}{path}{sep}utm_source={src}&utm_medium=social&utm_campaign={campaign}"

rows = []
for i, d in enumerate(DAYS):
    theme, path, camp, hook, fmt, shots, caption, pin_t, pin_d, threads, yt, tags, product = d
    date = START + datetime.timedelta(days=i)
    if product: assert "commission" in caption, theme
    for text, limit in ((hook, 60), (caption, 400), (pin_t, 100), (pin_d, 500), (threads, 500), (yt, 100)):
        assert len(text) <= limit, (theme, len(text), limit)
    row = {"day": i + 1, "date": date.isoformat(), "weekday": date.strftime("%a"), "theme": theme, "destination": path,
           "campaign": camp, "hook (on-screen text)": hook, "Instagram format": fmt, "video or slides": shots,
           "caption (Instagram, TikTok, Facebook)": caption, "Pinterest title": pin_t, "Pinterest description": pin_d,
           "Threads": threads, "YouTube Shorts title": yt, "hashtags": tags,
           "names a product (needs commission line)": "yes" if product else "no"}
    for k, name in PLATFORMS.items():
        row[f"{name} link"] = link(path, k, camp)
    rows.append(row)

with open(HERE / "calendar-2026-11.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)

md = ["# PleaseBeReady: first 30 days of posts (Nov 2 – Dec 1, 2026)", "",
      "Generated by `calendar.py`; edit the script, not this file. **Nothing here has been posted.** Every field and the tracked link for each platform are in `calendar-2026-11.csv`.", "",
      "One idea a day. Film it once, post it everywhere: Instagram Reel, TikTok and YouTube Short use the same vertical video; Facebook and Threads get the caption; Pinterest gets a tall pin made from `brand/src/pin-power-outage.html` as a template.", "",
      "| Day | Date | Theme | Hook | Goes to |", "|---|---|---|---|---|"]
for r in rows:
    md.append(f"| {r['day']} | {r['weekday']} {r['date'][5:]} | {r['theme']} | {r['hook (on-screen text)']} | `{r['destination']}` |")
md += ["", "## Each day in full", ""]
for r in rows:
    md += [f"### Day {r['day']} · {r['weekday']} {r['date']} · {r['theme']}", "",
           f"- **Goes to:** {SITE}{r['destination']} (campaign `{r['campaign']}`)",
           f"- **Hook:** {r['hook (on-screen text)']}",
           f"- **{r['Instagram format']}:** {r['video or slides']}",
           f"- **Caption:** {r['caption (Instagram, TikTok, Facebook)']}"]
    if r["Pinterest title"]: md.append(f"- **Pin:** {r['Pinterest title']} — {r['Pinterest description']}")
    md.append(f"- **Threads:** {r['Threads']}")
    if r["YouTube Shorts title"]: md.append(f"- **YouTube Shorts title:** {r['YouTube Shorts title']}")
    md += [f"- **Hashtags:** {r['hashtags']}", ""]
(HERE / "calendar-2026-11.md").write_text("\n".join(md), encoding="utf-8")
print(f"{len(rows)} days, {len(rows) * len(PLATFORMS)} tracked links")
