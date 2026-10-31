// Our exact products: one Amazon product per entry, by ASIN, for a catalog item.
//
// Rules:
//  - Nothing goes in without evidence from the day it was checked:
//      via "page":   the amazon.com/dp page title was read and matched;
//      via "search": a web search limited to amazon.com returned this ASIN's
//                    product page with this product's name. `seen` keeps the
//                    words that matched, as the record; it is never shown.
//    An HTTP 200 alone is not evidence: old listings get reused for other products.
//  - `checked` is the date of that evidence. Re-check by ASIN at least every
//    quarter and before featuring a product in a post (docs/CATALOG.md).
//  - Names, reasons and uses are our own words. No prices, ratings, reviews,
//    images, stock or claims copied from Amazon. If a maker's claim matters
//    (a rating, "removes viruses"), say it is the maker's.
//  - Roles: "pick" is our first choice for the item; "value" a lower-cost
//    class of product that does the job; "upgrade" a more capable one; "alt"
//    an equal alternative. Never "best": we don't test products ourselves.

export type Role = "pick" | "value" | "upgrade" | "alt";

export type Pick = {
  /** The catalog item this product fills. */
  item: string;
  role: Role;
  asin: string;
  /** Brand and model, in our words. */
  name: string;
  /** One plain line on why this one. */
  why: string;
  /** What it suits, in a few words. */
  use: string;
  via: "page" | "search";
  /** Words from the listing that matched (evidence, not shown). */
  seen: string;
  /** Date of the evidence (ISO). Defaults to CHECKED. */
  checked?: string;
};

/** The day every entry below was checked. */
export const CHECKED = "2026-10-30";

export const roleText: Record<Role, string> = { pick: "Our pick", value: "Budget pick", upgrade: "Upgrade", alt: "Also good" };
const roleOrder: Role[] = ["pick", "value", "alt", "upgrade"];

export const picks: Pick[] = [
  { item: "water-storage-container", role: "pick", asin: "B001QC31G6", name: "Reliance Aqua-Tainer 7-gallon water container", why: "A 7-gallon jug with a spigot for storing your own tap water.", use: "Water at home", via: "page", seen: "Reliance Products Aqua-Tainer 7 Gallon Rigid Water Container (page title)" },
  { item: "water-bricks", role: "pick", asin: "B00VJQLR2O", name: "WaterBrick 3.5-gallon stackable container", why: "Stackable bricks that fit on shelves and under beds.", use: "Small spaces", via: "search", seen: "WaterBrick 1833-0003 Stackable Water and Food Storage Container, 3.5 gal" },
  { item: "55-gallon-water-barrel", role: "pick", asin: "B07YSZ68GV", name: "Augason Farms 55-gallon water storage barrel", why: "One big barrel for long-term water at home. Plan on a pump to get water out.", use: "Two weeks or more", via: "search", seen: "Augason Farms 55-Gallon Water Storage Barrel, BPA Free" },
  { item: "bathtub-water-storage-bladder", role: "pick", asin: "B001AXLUX2", name: "waterBOB bathtub water storage", why: "Fills a bathtub with up to 100 gallons before a storm. Pump included.", use: "Hurricanes", via: "search", seen: "waterBOB Bathtub Emergency Water Storage Bladder Up To 100 Gallon" },
  { item: "personal-water-filter", role: "pick", asin: "B006QF3TW4", name: "LifeStraw personal water filter", why: "A light straw filter for a go-bag or a hike.", use: "Go-bags and hiking", via: "search", seen: "LifeStraw Personal Water Filter for Hiking, Travel and Emergency" },
  { item: "personal-water-filter", role: "alt", asin: "B071Y4F3JD", name: "Sawyer Mini water filter", why: "A small filter with a squeeze pouch and a straw.", use: "Go-bags", via: "search", seen: "SAWYER Mini Water Filtration System Black" },
  { item: "personal-water-filter", role: "upgrade", asin: "B00B1OSU4W", name: "Sawyer Squeeze SP129 water filter", why: "Filters more water with two 32-ounce pouches to fill.", use: "Camping and longer trips", via: "search", seen: "Sawyer Products SP129 Squeeze Water Filtration System" },
  { item: "gravity-water-filter", role: "pick", asin: "B0BX5F7L2X", name: "LifeStraw Family gravity water purifier, 12 L", why: "Purifies larger amounts by gravity, no power needed. The maker rates it for viruses too.", use: "A household", via: "search", seen: "LifeStraw Family Gravity Water Purifier with Virus Removal, 12 L" },
  { item: "3-day-emergency-food-supply", role: "pick", asin: "B014ER40MS", name: "Mountain House 3-day emergency food supply kit", why: "Freeze-dried meals for three days in one box. Add hot water.", use: "Go-bag or a short outage", via: "search", seen: "Mountain House 3-Day Emergency Food Supply Kit" },
  { item: "30-day-food-supply", role: "pick", asin: "B0FH3K7GS3", name: "Augason Farms 30-day emergency food supply", why: "A month of long-life food for one person in one bucket.", use: "Long outages", via: "search", seen: "Augason Farms 30 Day Emergency Food Supply Kit" },
  { item: "freeze-dried-meals", role: "pick", asin: "B0843HYLK9", name: "Mountain House Classic meal bucket", why: "12 pouches of freeze-dried meals. Add water.", use: "Pantry backup", via: "search", seen: "Mountain House Classic Meal Assortment Bucket Freeze Dried ... 24 Servings" },
  { item: "emergency-food-bars-for-the-car", role: "pick", asin: "B001CSAHW0", name: "Datrex 3600 emergency food bars", why: "A sealed 3-day ration of food bars with a long shelf life.", use: "Car and go-bag", via: "search", seen: "Datrex 3600 Emergency Food Bar - 3 Day/72 Hour Bar - Single Pack" },
  { item: "water-pouches-for-the-car", role: "pick", asin: "B0134DAXJ2", name: "Datrex emergency water pouches, 18-pack", why: "Sealed water pouches with a long shelf life.", use: "Car and go-bag", via: "search", seen: "Datrex Emergency Water Packet 4.227 oz - 3 Day/72 Hour Supply (18 Packs)" },
  { item: "manual-can-opener", role: "pick", asin: "B09HKDZ3CV", name: "Mebotem heavy-duty manual can opener", why: "Big handles and an easy-turn knob. No power needed.", use: "Every pantry", via: "search", seen: "Mebotem ... Can Opener Manual Handheld Heavy Duty" },
  { item: "electrolyte-drink-mix", role: "pick", asin: "B0DY2F3W8F", name: "Liquid I.V. Hydration Multiplier, lemon lime, 50 packets", why: "Electrolyte drink packets. Ask a doctor for babies or anyone on fluid limits.", use: "Heat and stomach bugs", via: "search", seen: "Liquid I.V. Hydration Multiplier - Lemon Lime Liquid IV - 50 Pack" },
  { item: "flashlights", role: "pick", asin: "B0DBLB2TS5", name: "GearLight S1000 rechargeable flashlights, 2-pack", why: "Bright flashlights that charge by USB-C, so a power bank keeps them going.", use: "Outages", via: "search", seen: "GearLight S1000 LED Tactical Flashlight ... USB-C ... 2 Pack, (Rechargeable)" },
  { item: "flashlights", role: "value", asin: "B072WHQFJ7", name: "GearLight S1000 flashlights, 2-pack (AAA)", why: "The same light on AAA batteries, sold without batteries.", use: "Kits that sit for months", via: "search", seen: "GearLight 2pack S1000 LED Flashlights (reviews page for B072WHQFJ7); listing: Battery Powered (Batteries Not I" },
  { item: "headlamps", role: "pick", asin: "B092RHC2FY", name: "Energizer LED Headlamp PRO, 2-pack", why: "Light where you look, and batteries included.", use: "Outages and camping", via: "search", seen: "Energizer LED Headlamp PRO (2-Pack)" },
  { item: "headlamps", role: "upgrade", asin: "B0H1R5446C", name: "Black Diamond Spot 400 headlamp", why: "Brighter and waterproof, from an outdoor brand.", use: "Hiking and camping", via: "search", seen: "BLACK DIAMOND Spot 400 Headlamp" },
  { item: "lantern", role: "pick", asin: "B01C5QSENQ", name: "Etekcity CL10 LED lanterns, 4-pack", why: "Four battery lanterns for shared rooms. Batteries included.", use: "Outages", via: "search", seen: "Etekcity LED Camping Lanterns, Battery Included, 4 Pack" },
  { item: "batteries", role: "pick", asin: "B00MNV8E0C", name: "Amazon Basics AA batteries, 48-pack", why: "A big pack of AAs for lights and radios.", use: "Restocking", via: "search", seen: "Amazon Basics 48-Pack AA Alkaline High-Performance Batteries" },
  { item: "aaa-batteries", role: "pick", asin: "B00LH3DMUO", name: "Amazon Basics AAA batteries, 36-pack", why: "AAAs for headlamps, remotes and small lights.", use: "Restocking", via: "search", seen: "Amazon Basics AAA Long-Lasting Alkaline Batteries, 36-Count" },
  { item: "d-batteries", role: "pick", asin: "B00164H4AI", name: "Duracell Coppertop D batteries, 8-pack", why: "D batteries for lanterns, fans and big flashlights.", use: "Outages", via: "search", seen: "Duracell Coppertop D Batteries, 8 Count" },
  { item: "rechargeable-aa-batteries", role: "pick", asin: "B0C2362NC6", name: "Panasonic eneloop AA, 8-pack with charger", why: "Rechargeable AAs and a charger. They hold a charge in storage.", use: "Everyday use", via: "search", seen: "Panasonic eneloop Battery Charger + eneloop AA Rechargeable Batteries (8-Pack)" },
  { item: "coin-cell-batteries-cr2032", role: "pick", asin: "B0002RID4G", name: "Energizer CR2032 batteries, 6-pack", why: "Coin cells for scales, key fobs and thermometers.", use: "Around the house", via: "search", seen: "Energizer 2032 Batteries (6 Pack), 3V Lithium Coin Batteries" },
  { item: "power-bank", role: "pick", asin: "B0D5CLSMFB", name: "Anker PowerCore Slim 10,000mAh power bank", why: "Pocket-size backup charging for a phone.", use: "Everyday bag", via: "search", seen: "Anker Power Bank, 10,000mAh Portable Charger, PowerIQ" },
  { item: "large-power-bank-20-000-mah", role: "pick", asin: "B09SFS9J2K", name: "Anker 20,000mAh power bank", why: "Twice a pocket bank's capacity, with three ports.", use: "Outages and family trips", via: "search", seen: "Anker Power Bank, 20,000mAh Portable Charger with 22.5W ... 2 USB-A, 1 USB-C" },
  { item: "car-phone-charger", role: "pick", asin: "B0BPGSRYFH", name: "Anker 323 car charger", why: "Charges two phones at once: one USB-C, one USB-A.", use: "Every car", via: "search", seen: "Anker 323 52.5W USB C Car Charger with 30W PowerIQ 3.0" },
  { item: "portable-power-station", role: "value", asin: "B0CFV93GZM", name: "Jackery Explorer 300 Plus", why: "Runs phones, lights and a small fan. Light enough to carry.", use: "Short outages", via: "search", seen: "Jackery Explorer 300 Plus Portable Power Station, 288Wh ... LiFePO4" },
  { item: "portable-power-station", role: "upgrade", asin: "B0D7PPG25F", name: "Jackery Explorer 1000 v2", why: "A large battery for small appliances in longer outages.", use: "Longer outages", via: "search", seen: "Jackery Explorer 1000 v2 Portable Power Station, 1070Wh" },
  { item: "generator", role: "value", asin: "B099KNR6W7", name: "Westinghouse iGen2200c inverter generator", why: "A smaller inverter generator with CO shut-off. Outdoors only.", use: "Fridge and essentials", via: "search", seen: "Westinghouse 2200 Peak Watt ... Portable Inverter Generator, Gas Powered, CO Sensor (URL: iGen2200c)" },
  { item: "generator", role: "upgrade", asin: "B099KPDJBD", name: "Westinghouse 9500W dual-fuel generator", why: "Runs on gas or propane, with CO shut-off. Outdoors only, 20+ feet from the house.", use: "Whole-home backup", via: "search", seen: "Westinghouse 9500 Peak Watt Dual Fuel ... CO Sensor" },
  { item: "power-strip", role: "pick", asin: "B0B8SHPS5B", name: "Anker USB-C power strip, 6 outlets", why: "Six outlets plus USB-C and USB-A ports.", use: "Dorms and desks", via: "search", seen: "Anker USB C Power Strip Surge Protector(300J), 6 Outlets, 20W Power Delivery" },
  { item: "battery-powered-fan", role: "pick", asin: "B013BOC6VC", name: "O2COOL Treva 10-inch battery fan", why: "Runs on D batteries or a wall adapter.", use: "Summer outages", via: "search", seen: "Treva 10 in Portable Desktop Battery Fan 2-Speed with AC Adapter" },
  { item: "motion-sensor-night-lights", role: "pick", asin: "B07QJD6J9L", name: "GE motion-sensor night lights, 2-pack", why: "Plug-in lights that turn on when someone walks by.", use: "Hallways and bathrooms", via: "search", seen: "GE Plug in Night Light with Motion Sensor, 2 Pack, 40 Lumens" },
  { item: "weather-radio", role: "pick", asin: "B015QIC1PW", name: "Midland ER310 hand-crank NOAA weather radio", why: "Weather alerts, plus hand-crank and solar charging.", use: "Every home kit", via: "page", seen: "Midland - ER310, Emergency Crank Weather AM/FM Radio" },
  { item: "weather-radio", role: "upgrade", asin: "B0FX3GFYJP", name: "Midland ER310PRO weather radio", why: "The newer ER310 with a bigger battery and Bluetooth.", use: "Longer outages", via: "search", seen: "Midland - ER310PRO, Portable Emergency Bluetooth Weather AM/FM Radio" },
  { item: "hand-crank-weather-radio-with-charger", role: "pick", asin: "B01MFCFKG5", name: "RunningSnail hand-crank radio", why: "A small crank radio with the NOAA weather band and a flashlight.", use: "Go-bags", via: "search", seen: "RunningSnail Hand Crank Radio with Flashlight, NOAA/AM/FM Emergency Radio" },
  { item: "smoke-and-co-alarm", role: "pick", asin: "B0CLVRPNZX", name: "First Alert battery smoke and CO combo alarm (SMCO100)", why: "One battery alarm for smoke and carbon monoxide.", use: "Bedrooms and hallways", via: "search", seen: "First Alert Battery Combination Smoke & Carbon Monoxide Alarm (SMCO100)" },
  { item: "smoke-and-co-alarm", role: "alt", asin: "B000MXJ498", name: "First Alert SCO5CN smoke and CO combo alarm", why: "The earlier battery combo model, still sold.", use: "Bedrooms and hallways", via: "search", seen: "First Alert SCO5CN combination smoke and carbon monoxide alarm" },
  { item: "carbon-monoxide-alarm", role: "pick", asin: "B0GG9WK5RB", name: "First Alert CO605 plug-in CO alarms, 3-pack", why: "Plug-in CO alarms with battery backup, one for each level.", use: "Every floor", via: "search", seen: "FIRST ALERT CO605 Plug-in Carbon Monoxide Detector with Battery Backup, White, Pack of 3" },
  { item: "fire-extinguisher", role: "pick", asin: "B01LTICQYE", name: "First Alert HOME1 fire extinguisher", why: "A rechargeable home extinguisher rated 1-A:10-B:C.", use: "Kitchen and garage", via: "search", seen: "First Alert Fire Extinguisher, Standard Home Use (HOME1)" },
  { item: "fire-extinguisher", role: "alt", asin: "B00002ND64", name: "Kidde FA110 fire extinguisher", why: "A basic single-use 1-A:10-B:C extinguisher.", use: "Extra rooms", via: "search", seen: "Kidde Basic 110 Fire Extinguisher for Home, 1-A:10-B:C, FA110G" },
  { item: "escape-ladder", role: "pick", asin: "B0007OAPT0", name: "First Alert EL52-2 two-story escape ladder", why: "A 14-foot ladder that hooks over a windowsill.", use: "Second-floor bedrooms", via: "search", seen: "First Alert Two-Story Fire Escape Ladder, Steel, Anti-Slip, EL52-2" },
  { item: "whistle", role: "pick", asin: "B004QIY6MK", name: "Fox 40 Classic whistle with breakaway lanyard", why: "A loud pealess whistle on a breakaway cord.", use: "Go-bags and kids", via: "search", seen: "Fox 40 Classic CMG Safety Neon Yellow Whistle + Break-Away Safety Whistle Cord" },
  { item: "masks", role: "pick", asin: "B008MCUZZS", name: "3M 8210 N95 masks, 20-pack", why: "NIOSH-approved N95 masks for dust and smoke.", use: "Smoke and cleanup", via: "search", seen: "3M Particulate Disposable Respirator 8210, N95, Pack of 20, NIOSH APPROVED" },
  { item: "document-bag", role: "pick", asin: "B07SPZ93V5", name: "Flypal fireproof document bag with lock, XL", why: "Keeps IDs and papers together, ready to grab.", use: "Go-bag", via: "search", seen: "Flypal Fireproof Document Bag with lock ... X Large" },
  { item: "fireproof-safe", role: "pick", asin: "B005P12C5A", name: "SentrySafe SFW123GDC fireproof, waterproof safe", why: "A 1.2 cubic foot home safe for papers and small valuables.", use: "Home", via: "search", seen: "SentrySafe ... Digital Keypad, 1.2 Cu Ft (SFW123GDC)" },
  { item: "72-hour-kit", role: "pick", asin: "B000FJQQVI", name: "Ready America 70280 72-hour kit, 2 people", why: "A packed 3-day go-bag for two people to build on.", use: "Starting from nothing", via: "search", seen: "Ready America 70280 Emergency 2-Person 3-Day Survival Backpack" },
  { item: "duct-tape", role: "pick", asin: "B00N150YS4", name: "Gorilla Tape, black, 2-pack", why: "Thick, strong tape for quick repairs and sealing plastic.", use: "Kits and repairs", via: "search", seen: "Gorilla Black Duct Tape, 1.88' x 12 yd, Black, (Pack of 2)" },
  { item: "multi-tool", role: "pick", asin: "B07DD69QN3", name: "Gerber Suspension NXT multi-tool", why: "Pliers, a knife and drivers in one pocket tool.", use: "Go-bag and car", via: "search", seen: "Gerber Suspension NXT 15-in-1 Multitool Pliers" },
  { item: "first-aid-kit", role: "pick", asin: "B000069EYA", name: "First Aid Only 298-piece all-purpose kit", why: "A stocked kit to start from. Add your own medicines.", use: "Home and car", via: "search", seen: "First Aid Only 298 Piece All-Purpose Emergency First Aid Kit" },
  { item: "first-aid-kit", role: "upgrade", asin: "B07CQ8JVC7", name: "Surviveware comprehensive first aid kit", why: "A bigger, organized kit in a tough bag.", use: "Camping and big families", via: "search", seen: "Surviveware Comprehensive Premium Survival First Aid Kit" },
  { item: "first-aid-kit-for-the-car", role: "pick", asin: "B07Q3FVY3P", name: "Protect Life 100-piece travel first aid kit", why: "A small hard-case kit that fits a glove box.", use: "Car", via: "search", seen: "Protect Life Travel First Aid Kit for Car - Small Mini Emergency Kit, 100 Piece" },
  { item: "first-aid-manual", role: "pick", asin: "173674478X", name: "American Red Cross First Aid/CPR/AED manual (2021)", why: "The Red Cross manual to keep with the kit.", use: "First aid kit", via: "search", seen: "First Aid/CPR/AED Participants Manual, Rev. 2021: American Red Cross" },
  { item: "adhesive-bandages", role: "pick", asin: "B00N3AGKQM", name: "Band-Aid family variety pack, 120", why: "Bandages in several sizes and types.", use: "Home first aid", via: "search", seen: "Band-Aid Brand Adhesive Bandage Family Variety Pack ... 120 ct" },
  { item: "thermometer", role: "pick", asin: "B0DV8F226M", name: "Braun digital thermometer (PRT2100US)", why: "A fast digital thermometer for mouth, armpit or rectal use.", use: "Sick days", via: "search", seen: "Braun Digital Thermometer for Adults, Baby, Toddlers & Kids (PRT2100US)" },
  { item: "pill-organizer", role: "pick", asin: "B001THDDFC", name: "Ezy Dose weekly AM/PM pill organizer", why: "Morning and evening slots for each day of the week.", use: "Daily medicines", via: "search", seen: "Ezy Dose Weekly (7-Day) AM/PM Pill Organizer, Small Case" },
  { item: "disinfecting-wipes", role: "pick", asin: "B00B71EKSY", name: "Clorox disinfecting wipes, 3 x 75", why: "Three canisters of disinfecting wipes.", use: "Cold and flu season", via: "search", seen: "Clorox Disinfecting Wipes Value Pack, Cleaning Wipes, 75 Count Each, Pack of 3" },
  { item: "nasal-aspirator", role: "pick", asin: "B00171WXII", name: "Frida Baby NoseFrida nasal aspirator", why: "A tube-and-filter aspirator for stuffy baby noses.", use: "Newborns", via: "search", seen: "FridaBaby Baby Nasal Aspirator NoseFrida the Snotsucker by Frida Baby" },
  { item: "emergency-blankets", role: "pick", asin: "B01LYNWRLA", name: "Swiss Safe mylar emergency blankets, 4-pack", why: "Light foil blankets for the car and go-bags.", use: "Car and go-bag", via: "search", seen: "Swiss Safe 4 Pack Mylar Emergency Blankets" },
  { item: "hand-warmers", role: "pick", asin: "B077RXSZN3", name: "HotHands hand warmers, 10 pair", why: "Air-activated warmers. No power needed.", use: "Winter car and outages", via: "search", seen: "HotHands (10 Pair)" },
  { item: "heated-blanket", role: "pick", asin: "B008BF2MFM", name: "Sunbeam Royal Ultra Fleece heated throw", why: "A heated throw with four settings and auto shut-off.", use: "Cold nights with power", via: "search", seen: "Sunbeam Royal Ultra Fleece Heated Throw Electric Blanket, 50' x 60'" },
  { item: "faucet-covers", role: "pick", asin: "B01251Q67W", name: "Frost King FC1 foam faucet covers, 2-pack", why: "Foam covers for outdoor spigots before a freeze.", use: "First freeze", via: "search", seen: "Frost King FC1 Outdoor Foam Faucet Cover, to Prevent Freeze (2 Pack)" },
  { item: "pipe-insulation", role: "pick", asin: "B01MZEEUDS", name: "Frost King SP512XB6 foam pipe insulation, 6 ft", why: "Self-sealing foam for exposed pipes. This size fits 1-inch copper or 3/4-inch iron.", use: "Cold basements and crawl spaces", via: "search", seen: "Frost King SP512XB6 Self-Sealing Pre-Slit Tubular Polyethylene Foam Pipe Insulation, 1/2' Thick Wall" },
  { item: "box-fan", role: "pick", asin: "B000HHJ2I2", name: "Lasko 3723 20-inch box fan", why: "A 20-inch, three-speed box fan.", use: "Heat waves", via: "search", seen: "Lasko 20 Inch 3-Speed Energy Efficient Box Fan ... White, 3723" },
  { item: "cooling-towels", role: "pick", asin: "B013WSOKMU", name: "Mission Enduracool cooling towel", why: "Cools when wet. Soak it again to reuse.", use: "Hot days outside", via: "search", seen: "Mission Enduracool Techknit Cooling Towel, Coral, Large" },
  { item: "indoor-thermometer-and-humidity-monitor", role: "pick", asin: "B01H1R0K68", name: "ThermoPro TP50 indoor thermometer and humidity monitor", why: "Shows room temperature and humidity at a glance.", use: "Heat and cold checks", via: "search", seen: "ThermoPro TP50 Digital Hygrometer Indoor Thermometer (reviews page for B01H1R0K68)" },
  { item: "jumper-cables", role: "pick", asin: "B079LDQVYW", name: "Energizer jumper cables, 20 ft, 4-gauge", why: "Long, heavy-gauge cables with a carry bag.", use: "Every car", via: "search", seen: "Energizer Jumper Cables ... with Carrying Bag Included (20-Feet (4-Gauge)" },
  { item: "portable-jump-starter", role: "pick", asin: "B015TKUPIC", name: "NOCO Boost GB40 jump starter", why: "Starts a dead battery without a second car. Doubles as a USB charger.", use: "Every car", via: "search", seen: "NOCO Boost GB40 12V 1000A UltraSafe Portable Lithium Jump Starter" },
  { item: "tire-pressure-gauge", role: "pick", asin: "B01J8DLGU2", name: "AstroAI digital tire pressure gauge", why: "An easy-to-read digital gauge with a lit nozzle.", use: "Monthly tire checks", via: "search", seen: "AstroAI Digital Tire Pressure Gauge 150PSI" },
  { item: "tire-inflator", role: "pick", asin: "B0C1GL5T7G", name: "AstroAI tire inflator, 12V and wall power", why: "Inflates tires from the car's 12V socket or a wall outlet.", use: "Car and home", via: "search", seen: "AstroAI Tire Inflator Portable Air Compressor, 12V DC/120V AC Dual Power" },
  { item: "car-emergency-kit", role: "pick", asin: "B01C96AFWU", name: "First Secure car emergency kit", why: "Jumper cables, an air compressor and first aid in one bag.", use: "Trunk", via: "search", seen: "Car Emergency Kit with Air Compressor, Jumper Cables, First Aid (First Secure)" },
  { item: "roadside-warning-triangles", role: "pick", asin: "B072W2MKQL", name: "Performance Tool W1498 warning triangles, 3-pack", why: "Three reflective triangles in a case.", use: "Breakdowns", via: "search", seen: "Performance Tool W1498 Large Early Warning Roadside Emergency Reflective Triangle, 3 Pack with Case" },
  { item: "car-snow-brush-and-scraper", role: "pick", asin: "B000HACYNY", name: "Hopkins SubZero 16511 snowbrush and ice scraper", why: "A snowbrush with an ice scraper and chippers.", use: "Winter car", via: "search", seen: "SubZero 16511 23' Ice Hammer Snowbrush and Ice Scraper" },
  { item: "car-phone-mount", role: "pick", asin: "B08G3R5B7N", name: "iOttie Easy One Touch 5 phone mount", why: "Holds a phone on the dash or windshield, so maps stay in view.", use: "Every driver", via: "search", seen: "iOttie Easy ONE Touch 5 Dashboard and Windshield Universal CAR Mount" },
  { item: "seatbelt-cutter-and-window-breaker", role: "pick", asin: "B01G6C18EC", name: "resqme car escape tool", why: "A keychain seatbelt cutter and side-window breaker. Not for windshields.", use: "Every car", via: "search", seen: "RESQME The Original Emergency Keychain Car Escape Tool, 2-in-1 Seatbelt Cutter and Window Breaker" },
  { item: "tent", role: "pick", asin: "B07QK8KN8S", name: "Coleman Sundome 4-person tent", why: "A simple dome tent with a rainfly.", use: "Family camping", via: "search", seen: "Coleman, Sundome Dome Tent, 4 Person, Blue/Gray" },
  { item: "sleeping-bags", role: "pick", asin: "B0BXMW1TJ9", name: "Coleman Brazos 20\u00b0F sleeping bag", why: "A machine-washable bag rated to 20\u00b0F.", use: "Spring and fall camping", via: "search", seen: "Coleman Brazos Cold-Weather Sleeping Bag, 20\u00b0F/30\u00b0F" },
  { item: "camp-stove", role: "pick", asin: "B00005OU9D", name: "Coleman Classic 2-burner propane stove", why: "Two burners on standard 16-ounce propane cylinders. Outdoors only.", use: "Camping", via: "search", seen: "Coleman Gas Camping Stove (URL: Coleman-2000020943NP-Classic-Propane-Stove)" },
  { item: "cooler", role: "pick", asin: "B0BDGG9TM8", name: "Coleman 62-quart wheeled cooler", why: "A big wheeled cooler for camp, games and outages.", use: "Camping and outages", via: "search", seen: "Coleman Classic Series Insulated Portable Rolling Cooler with Wheels ... 62-Quart" },
  { item: "camp-chairs", role: "pick", asin: "B01M18RYXI", name: "Coleman quad chair with 4-can cooler", why: "A padded folding chair with a cooler in the arm.", use: "Sidelines and camp", via: "search", seen: "Coleman Camping Chair with 4 Can Cooler" },
  { item: "shade-canopy", role: "pick", asin: "B01E45EYJY", name: "CORE 10x10 instant canopy", why: "A pop-up canopy with a wheeled carry bag.", use: "Tournaments and tailgates", via: "search", seen: "Core 10' x 10' Instant Shelter Pop-Up Canopy Tent with Wheeled Carry Bag, Grey" },
  { item: "wagon", role: "pick", asin: "B01DAWKVBM", name: "Mac Sports collapsible wagon", why: "A folding wagon for chairs, coolers and gear. Not for kids to ride in.", use: "Tournaments and the beach", via: "search", seen: "Mac Sports Collapsible Folding Outdoor Utility Wagon, Black" },
  { item: "bug-spray", role: "pick", asin: "B002CMQJYU", name: "Sawyer 20% picaridin insect repellent", why: "A picaridin spray for mosquitoes and ticks.", use: "Camping and the yard", via: "search", seen: "Sawyer Products SP543 Premium Insect Repellent with 20% Picaridin, Pump Spray, 3-Ounce" },
  { item: "pet-crate-for-home", role: "pick", asin: "B000QFT1R2", name: "MidWest iCrate double-door crate (36-inch)", why: "A folding crate with a divider. Choose the size for your dog's adult weight.", use: "New puppy", via: "search", seen: "MidWest 36-Inch Double Door iCrate, for Medium-Large Breeds, 41-70 lbs" },
  { item: "dog-harness", role: "pick", asin: "B01M6YASY1", name: "rabbitgoo no-pull harness", why: "A padded harness with a front clip to reduce pulling.", use: "Daily walks", via: "search", seen: "rabbitgoo Dog Harness No Pull with 2 Leash Clips ... Medium" },
  { item: "puppy-chew-toys", role: "pick", asin: "B0002AR18C", name: "KONG Puppy chew toy", why: "Soft rubber for baby teeth. You can stuff it with treats.", use: "Teething", via: "search", seen: "KONG Puppy, Natural Rubber Teething Chew Toy, for Small Puppies" },
  { item: "puppy-pads", role: "pick", asin: "B00MW8G3YU", name: "Amazon Basics puppy pads, 50-count", why: "Leak-proof pads for house training.", use: "First weeks", via: "search", seen: "Amazon Basics Leak-Proof Dog and Puppy Potty Training Pee Pads ... 22x22', 50 Count" },
  { item: "poop-bags", role: "pick", asin: "B0727NSTFM", name: "Earth Rated poop bags, 315 unscented", why: "Refill rolls of unscented bags.", use: "Every walk", via: "search", seen: "Earth Rated Dog Poop Bags on Refill Rolls, 315 Bags, Unscented" },
  { item: "enzyme-cleaner-for-pet-accidents", role: "pick", asin: "B071W6CQ7S", name: "Nature's Miracle dog stain and odor remover, 32 oz", why: "An enzyme cleaner for pee and other accidents.", use: "House training", via: "search", seen: "Nature's Miracle Dog Stain & Odor Remover, Enzymatic Cleaner, 32 oz" },
  { item: "travel-pet-bowls", role: "pick", asin: "B094DWQN62", name: "CrossMor collapsible dog bowls, 2-pack", why: "Two silicone bowls that fold flat and clip to a bag.", use: "Walks and trips", via: "search", seen: "Collapsible Dog Bowls for Travel Water (2 Pack) Silicone Portable Bowl 32 OZ w Carabiner" },
  { item: "airtight-food-storage-bin", role: "pick", asin: "B08WHZGYM9", name: "IRIS USA airtight pet food bin, 30 lb", why: "Keeps a bag of food fresh and dry. Rolls on wheels.", use: "Pantry", via: "search", seen: "IRIS USA Dog Food Storage Container, Airtight, 30 lb Capacity, Wheels" },
  { item: "pet-car-harness", role: "pick", asin: "B0064ACNLO", name: "Kurgo Tru-Fit car harness", why: "A car harness that clips into the seat belt.", use: "Road trips", via: "search", seen: "Kurgo Enhanced Strength Tru-Fit Dog Car Harness ... Large" },
  { item: "pet-seat-cover", role: "pick", asin: "B0727Y5ZD7", name: "URPOWER waterproof back-seat cover", why: "A hammock cover that keeps mud and fur off the seat.", use: "Muddy dogs", via: "search", seen: "URPOWER Dog Car Seat Cover for Back Seat, 100% Waterproof Hammock for Car" },
  { item: "pet-gate", role: "pick", asin: "B001OC5UNA", name: "Regalo Easy Step extra-tall walk-through gate", why: "A tall gate for doorways. Not for the top of stairs.", use: "Puppies", via: "search", seen: "Regalo Easy Step Extra Tall Walk Thru Baby Gate, Includes 4-Inch Extension" },
  { item: "baby-gate", role: "pick", asin: "B001OC5UNA", name: "Regalo Easy Step extra-tall walk-through gate", why: "A tall gate for doorways. Not for the top of stairs.", use: "Babies and toddlers", via: "search", seen: "(same listing as pet-gate)" },
  { item: "basic-tool-kit", role: "pick", asin: "B0D2PN4785", name: "CRAFTSMAN 57-piece home tool set", why: "Hammer, pliers, screwdrivers, sockets and a tape in one case.", use: "First apartment", via: "search", seen: "CRAFTSMAN 57 Piece Mechanics Tool Set Home Tool Set ... (CMMT99447)" },
  { item: "basic-tool-kit", role: "upgrade", asin: "B0CYFJL7QR", name: "CRAFTSMAN 102-piece tool kit", why: "More sockets and bits, for home and car.", use: "Homeowners", via: "search", seen: "CRAFTSMAN 102-Piece Tool Kit for Home and Car ... (CMMT99449)" },
  { item: "cordless-drill", role: "pick", asin: "B006V6YAPI", name: "BLACK+DECKER 20V MAX drill (LD120VA)", why: "A light drill with a 30-piece bit set.", use: "Home projects", via: "search", seen: "BLACK+DECKER 20V MAX POWERCONNECT ... Cordless Drill Driver ... (LD120VA)" },
  { item: "tape-measure", role: "pick", asin: "B00002X2GQ", name: "STANLEY PowerLock 25-foot tape measure", why: "The classic 25-foot tape.", use: "Every toolbox", via: "search", seen: "STANLEY Tape Measure, Chrome, 25-Foot (33-425)" },
  { item: "wd-40-or-lubricant", role: "pick", asin: "B07WXMY143", name: "WD-40 Multi-Use with Smart Straw", why: "Loosens stuck parts and quiets squeaks. The straw flips up.", use: "Toolbox", via: "search", seen: "WD-40 Multi-Use Product with Smart Straw Sprays 2 Ways" },
  { item: "kitchen-trash-bags-13-gallon", role: "pick", asin: "B01H3W4AM6", name: "Hefty Strong 13-gallon kitchen bags, 90 count", why: "A big box of drawstring kitchen bags.", use: "Monthly restock", via: "search", seen: "Hefty Strong 13G Tall Kitchen Trash Bags, White, Unscented, 90ct" },
  { item: "tape-gun", role: "pick", asin: "B0006HVM7C", name: "Scotch ST-181 tape gun", why: "A padded-grip dispenser for 2-inch packing tape.", use: "Moving day", via: "search", seen: "Scotch Packaging Tape Dispenser Holds up to 2' Wide (ST-181)" },
  { item: "air-mattress", role: "pick", asin: "B00FAW4O0A", name: "SoundAsleep Dream Series queen air mattress", why: "A raised queen air bed with a built-in pump.", use: "Guests", via: "search", seen: "SoundAsleep Dream Series Raised Queen Air Mattress, Built-in Pump" },
  { item: "food-thermometer", role: "pick", asin: "B07R18W3W1", name: "ThermoPro TP19 instant-read thermometer", why: "A fast thermometer for meat and leftovers.", use: "Holiday cooking", via: "search", seen: "ThermoPro TP19 Waterproof Digital Meat Thermometer ... Instant Read" },
  { item: "grab-bars", role: "pick", asin: "B00084F76K", name: "Moen 8724 24-inch grab bar", why: "A steel grab bar. Mount it into studs or with the maker's anchors.", use: "Tub and shower", via: "search", seen: "Moen Home Care Bathroom Safety 24 Inch Stainless Steel ... Grab Bar ... 8724" },
  { item: "shower-chair", role: "pick", asin: "B002VWK0WI", name: "Drive Medical shower chair with back", why: "A shower chair with a backrest and suction feet.", use: "Safer bathing", via: "search", seen: "Drive Medical Shower Chair with Back and Suction Feet, Gray" },
  { item: "key-safe", role: "pick", asin: "B09QMNYPZG", name: "Master Lock 5400EC key lock box", why: "A code box for a spare key, so helpers can get in.", use: "Caregivers", via: "search", seen: "Master Lock Key Lock Box with Code ... Holds 5 Keys, 5400EC" },
  { item: "reacher-grabber", role: "pick", asin: "B07L44NW69", name: "Vive 32-inch folding reacher", why: "A folding reacher with a rotating jaw.", use: "Less bending", via: "search", seen: "Vive 32' Grabber Reacher Tool - Foldable Pickup Stick with Rotating Jaw" },
];

const byItem = new Map<string, Pick[]>();
for (const p of picks) byItem.set(p.item, [...(byItem.get(p.item) ?? []), p]);
for (const list of byItem.values()) list.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));

/** Every exact product for a catalog item, our pick first. */
export const picksFor = (itemId: string): Pick[] => byItem.get(itemId) ?? [];

/** The product a catalog item's main Amazon button opens, if it has one. */
export const primaryPick = (itemId: string): Pick | undefined => byItem.get(itemId)?.[0];

export const hasPick = (itemId: string) => byItem.has(itemId);

export const pickByAsin = (asin: string) => picks.find((p) => p.asin === asin);

export const checkedOn = (p: Pick) => p.checked ?? CHECKED;
