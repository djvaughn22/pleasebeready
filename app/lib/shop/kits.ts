// Ready-made shopping kits. Each kit is a short, hand-picked list over the
// catalog: must-haves, upgrades, cheaper swaps, things people forget and
// things to do. Amounts come from the catalog's planning rules (calc.ts) for
// the kit's starting group, which the visitor can change.
//
// Rules for editing:
//  - Every id must exist in the catalog (shop.test.ts checks).
//  - Intros say what the kit covers in plain words. Any safety advice must
//    already be in the catalog note or readiness.ts, which match their source.
//  - `guide` links an official page; it is a link, not a claim we quote.

import type { Climate, Need, OccasionId } from "../stockup/types";
import type { LaneId } from "./lanes";

export type KitPreset = {
  people: number; kids?: number; babies?: number; pets?: number;
  days: number; nights?: number; meals?: number;
  needs?: Need[]; climate?: Climate[];
};

export type Kit = {
  slug: string;
  emoji: string;
  title: string;
  /** Under the title on cards. */
  short: string;
  intro: string;
  lane: LaneId;
  also?: LaneId[];
  /** The plan type a saved kit becomes. */
  base: OccasionId;
  preset: KitPreset;
  /** Which numbers the kit page lets people change. */
  ask: ("people" | "kids" | "pets" | "days")[];
  essentials: string[];
  upgrades: string[];
  /** A cheaper item that does the job of a pricier one in this kit. */
  budget?: { id: string; instead: string }[];
  forget?: string[];
  todo?: string[];
  guide?: { label: string; href: string };
  /** Search words and phrases. */
  terms: string[];
  /** Months (1–12) to feature it. */
  months?: number[];
};

const READY_KIT = { label: "Ready.gov: Build a Kit", href: "https://www.ready.gov/kit" };

export const kits: Kit[] = [
  {
    slug: "five-day-emergency", emoji: "🔦", title: "Five-day emergency supplies", short: "Ready.gov's basic kit, for five days",
    intro: "Water, food, light, a radio and first aid for five days at home, built from Ready.gov's basic kit list.",
    lane: "emergency", base: "emergency", preset: { people: 4, days: 5 }, ask: ["people", "days"],
    essentials: ["water", "shelf-food", "manual-can-opener", "weather-radio", "flashlights", "batteries", "first-aid-kit", "whistle", "masks",
      "plastic-sheeting", "duct-tape", "wet-wipes", "trash-bags", "zip-ties", "pliers", "paper-road-map", "power-bank", "charging-cables"],
    upgrades: ["headlamps", "water-storage-container", "3-day-emergency-food-supply", "gravity-water-filter", "portable-power-station"],
    budget: [{ id: "unscented-household-bleach", instead: "gravity-water-filter" }, { id: "power-bank", instead: "portable-power-station" }],
    forget: ["meds", "cash-in-small-bills", "document-bag", "contact-lens-supplies-or-spare-glasses"],
    todo: ["family-plan", "local-alerts", "copy-documents", "rotate-supplies"],
    guide: READY_KIT,
    terms: ["emergency kit", "emergency supplies", "emergency", "disaster kit", "disaster", "survival kit", "five day", "5 day", "72 hour", "3 day kit", "basic kit", "prepper", "preparedness", "be prepared"],
  },
  {
    slug: "power-outage", emoji: "🔌", title: "Power outage kit", short: "Three days without power",
    intro: "Days without power: light for every room, phone charging, a radio, and food and water that don't need the fridge.",
    lane: "emergency", also: ["seasonal"], base: "outage", preset: { people: 4, days: 3 }, ask: ["people", "days"],
    essentials: ["flashlights", "headlamps", "batteries", "lantern", "power-bank", "car-phone-charger", "weather-radio", "water", "shelf-food",
      "manual-can-opener", "cooler", "fridge-and-freezer-thermometers", "first-aid-kit"],
    upgrades: ["portable-power-station", "rechargeable-lantern", "large-power-bank-20-000-mah", "power-outage-alert-plug", "generator"],
    budget: [{ id: "power-bank", instead: "portable-power-station" }, { id: "lantern", instead: "rechargeable-lantern" }],
    forget: ["d-batteries", "ice-packs", "extra-blankets", "cash-in-small-bills"],
    todo: ["charge-everything", "freeze-bottles", "fridge-coldest", "food-safety-outage", "label-breakers", "power-device-plan"],
    guide: { label: "Ready.gov: Power Outages", href: "https://www.ready.gov/power-outages" },
    terms: ["power outage", "outage", "without power", "no power", "without electricity", "no electricity", "lost power", "blackout", "power cut", "power out", "power is out", "electricity out", "lights out", "grid down", "generator", "power", "flashlight", "flashlights"],
    months: [6, 7, 8, 9, 11, 12, 1, 2],
  },
  {
    slug: "family-emergency-kit", emoji: "👨‍👩‍👧", title: "Family emergency kit", short: "Three days, with kids",
    intro: "A three-day kit for a family with kids: the Ready.gov basics plus kid food, children's medicine, comfort and something to do.",
    lane: "emergency", also: ["family"], base: "emergency", preset: { people: 4, kids: 2, days: 3 }, ask: ["people", "kids", "days"],
    essentials: ["water", "shelf-food", "applesauce-pouches", "manual-can-opener", "flashlights", "batteries", "weather-radio", "first-aid-kit",
      "children-s-pain-and-fever-reliever", "meds", "power-bank", "wet-wipes", "trash-bags", "whistle", "go-bag"],
    upgrades: ["72-hour-kit", "headlamps", "3-day-emergency-food-supply", "portable-power-station"],
    budget: [{ id: "go-bag", instead: "72-hour-kit" }],
    forget: ["allergy-and-emergency-info-card", "card-games", "coloring-books-and-crayons", "document-bag"],
    todo: ["family-plan", "meeting-places", "talk-with-kids", "comfort-item", "school-contacts", "pack-go-bags"],
    guide: READY_KIT,
    terms: ["family emergency kit", "family emergency", "family kit", "kids emergency", "emergency kit for kids", "family of", "with kids", "children"],
  },
  {
    slug: "tornado", emoji: "🌪️", title: "Tornado kit", short: "For your shelter spot",
    intro: "Keep these in or near your shelter spot: a weather radio, light, water, first aid and copies of your papers.",
    lane: "emergency", also: ["seasonal"], base: "emergency", preset: { people: 4, days: 3 }, ask: ["people"],
    essentials: ["weather-radio", "flashlights", "headlamps", "batteries", "whistle", "water", "first-aid-kit", "power-bank", "document-bag"],
    upgrades: ["large-power-bank-20-000-mah", "two-way-radios", "fireproof-safe"],
    forget: ["meds", "spare-keys", "cash-in-small-bills", "heavy-duty-work-gloves"],
    todo: ["tornado-shelter", "local-alerts", "family-plan", "meeting-places", "copy-documents"],
    guide: { label: "Ready.gov: Tornadoes", href: "https://www.ready.gov/tornadoes" },
    terms: ["tornado", "tornadoes", "twister", "storm shelter", "severe storm", "severe weather", "tornado season", "tornado warning", "storm", "storms"],
    months: [3, 4, 5, 6],
  },
  {
    slug: "hurricane", emoji: "🌀", title: "Hurricane kit", short: "A week at home, or leaving",
    intro: "Hurricane season supplies for a week at home, plus what you need if you're told to leave.",
    lane: "emergency", also: ["seasonal"], base: "hurricane", preset: { people: 4, days: 7 }, ask: ["people", "days"],
    essentials: ["water", "shelf-food", "manual-can-opener", "flashlights", "batteries", "weather-radio", "power-bank", "first-aid-kit", "meds",
      "document-bag", "cash-in-small-bills", "go-bag", "tarp"],
    upgrades: ["generator", "portable-power-station", "bathtub-water-storage-bladder", "water-storage-container", "plywood-panels-for-windows"],
    budget: [{ id: "power-bank", instead: "portable-power-station" }],
    forget: ["waterproof-bin-for-documents", "bug-spray", "trash-bags", "heavy-duty-work-gloves"],
    todo: ["evac-zone", "evac-routes", "fill-gas", "bring-in-furniture", "clear-gutters", "review-insurance", "pack-go-bags"],
    guide: { label: "Ready.gov: Hurricanes", href: "https://www.ready.gov/hurricanes" },
    terms: ["hurricane", "hurricanes", "tropical storm", "hurricane season", "cyclone", "evacuation", "evacuate", "storm", "storms"],
    months: [6, 7, 8, 9, 10, 11],
  },
  {
    slug: "winter-storm", emoji: "❄️", title: "Winter storm kit", short: "Snow, ice and cold for three days",
    intro: "Snow, ice and cold for three days at home: warmth, light, water and food, and a car ready for the roads.",
    lane: "seasonal", also: ["emergency"], base: "winter", preset: { people: 4, days: 3, climate: ["cold"] }, ask: ["people", "days"],
    essentials: ["extra-blankets", "warm-layers", "wool-socks", "hand-warmers", "flashlights", "batteries", "power-bank", "weather-radio", "water",
      "shelf-food", "carbon-monoxide-alarm", "ice-melt", "snow-shovel", "car-snow-brush-and-scraper"],
    upgrades: ["heated-blanket", "portable-power-station", "indoor-safe-space-heater", "generator", "roof-rake"],
    budget: [{ id: "extra-blankets", instead: "heated-blanket" }],
    forget: ["faucet-covers", "pipe-insulation", "car-blanket", "emergency-blankets"],
    todo: ["winterize-car", "service-furnace", "hypothermia-signs", "check-neighbors", "local-alerts"],
    guide: { label: "Ready.gov: Winter Weather", href: "https://www.ready.gov/winter-weather" },
    terms: ["winter storm", "snowstorm", "snow storm", "blizzard", "ice storm", "snow", "ice", "freezing", "freeze", "cold snap", "polar vortex", "winter", "frozen pipes", "snowed in", "cold weather", "storm", "storms"],
    months: [11, 12, 1, 2, 3],
  },
  {
    slug: "heat-wave", emoji: "🌡️", title: "Heat wave kit", short: "Staying cool through hot days",
    intro: "Staying cool and drinking enough through a run of hot days, with or without air conditioning.",
    lane: "seasonal", base: "heat", preset: { people: 4, days: 5, climate: ["hot"] }, ask: ["people", "days"],
    essentials: ["water", "electrolyte-drink-mix", "box-fan", "cooling-towels", "blackout-curtains", "indoor-thermometer-and-humidity-monitor",
      "wide-brim-sun-hats", "light-loose-clothing", "reusable-water-bottles"],
    upgrades: ["window-air-conditioner", "battery-powered-fan", "cooling-vest", "portable-power-station"],
    budget: [{ id: "cooling-towels", instead: "cooling-vest" }],
    forget: ["ice-packs", "sunscreen", "lip-balm-with-spf"],
    todo: ["cooling-center", "heat-illness-signs", "check-neighbors"],
    guide: { label: "Ready.gov: Extreme Heat", href: "https://www.ready.gov/heat" },
    terms: ["heat wave", "heatwave", "extreme heat", "hot weather", "heat", "summer heat", "no ac", "no air conditioning", "ac out", "air conditioning broke"],
    months: [6, 7, 8, 9],
  },
  {
    slug: "water-storage", emoji: "💧", title: "Emergency water", short: "1 gallon per person per day",
    intro: "Plan on 1 gallon per person per day, for drinking and cleaning (Ready.gov). Store at least three days; two weeks is better.",
    lane: "food-and-water", also: ["emergency"], base: "emergency", preset: { people: 4, days: 3 }, ask: ["people", "days"],
    essentials: ["water", "water-storage-container", "water-purification-tablets", "unscented-household-bleach", "reusable-water-bottles"],
    upgrades: ["55-gallon-water-barrel", "gravity-water-filter", "water-bricks", "bathtub-water-storage-bladder"],
    budget: [{ id: "water-storage-container", instead: "55-gallon-water-barrel" }, { id: "personal-water-filter", instead: "gravity-water-filter" }],
    forget: ["collapsible-water-containers", "date-labels-for-food"],
    todo: ["rotate-supplies"],
    guide: { label: "Ready.gov: Water", href: "https://www.ready.gov/water" },
    terms: ["water", "drinking water", "water storage", "store water", "storing water", "how much water", "gallons", "water for", "water supply", "boil water", "water filter", "safe water", "bottled water"],
  },
  {
    slug: "two-week-pantry", emoji: "🥫", title: "Two-week pantry", short: "Food that keeps, for two weeks",
    intro: "Food that keeps without a fridge and needs little or no cooking, for two weeks at home. Buy what your family already eats.",
    lane: "food-and-water", also: ["emergency"], base: "emergency", preset: { people: 4, days: 14 }, ask: ["people", "days"],
    essentials: ["canned-soups-and-stews", "canned-vegetables", "canned-fruit", "canned-tuna-or-chicken", "canned-beans", "peanut-butter",
      "pretzels-and-crackers", "granola-or-protein-bars", "dried-fruit", "nuts-and-seeds", "shelf-stable-milk", "breakfast-cereal", "manual-can-opener"],
    upgrades: ["30-day-food-supply", "3-day-emergency-food-supply", "freeze-dried-meals", "can-rotation-rack"],
    budget: [{ id: "canned-soups-and-stews", instead: "30-day-food-supply" }],
    forget: ["paper-plates", "plastic-utensils", "date-labels-for-food"],
    todo: ["rotate-supplies", "meal-plan"],
    guide: { label: "Ready.gov: Food", href: "https://www.ready.gov/food" },
    terms: ["pantry", "food storage", "emergency food", "two weeks of food", "2 weeks of food", "stock up food", "canned food", "canned goods", "non perishable", "nonperishable", "shelf stable", "food supply", "stockpile"],
  },
  {
    slug: "household-restock", emoji: "🧻", title: "Household restock", short: "A month of the basics",
    intro: "A month of the basics, worked out for your household: paper, trash bags, laundry, cleaning and batteries.",
    lane: "home", also: ["everyday"], base: "home", preset: { people: 4, days: 30 }, ask: ["people", "days"],
    essentials: ["toilet-paper", "paper-towels", "facial-tissues", "kitchen-trash-bags-13-gallon", "dish-soap", "dishwasher-detergent",
      "laundry-detergent", "hand-soap", "all-purpose-cleaner", "disinfecting-wipes", "sponges", "toothpaste", "batteries"],
    upgrades: ["laundry-pods", "microfiber-cloths", "pantry-bins", "cordless-stick-vacuum"],
    budget: [{ id: "laundry-detergent", instead: "laundry-pods" }],
    forget: ["light-bulbs", "aaa-batteries", "coin-cell-batteries-cr2032", "zip-top-bags", "aluminum-foil"],
    terms: ["household", "restock", "stock up", "household supplies", "toilet paper", "paper towels", "trash bags", "cleaning supplies", "monthly", "basics", "groceries", "home supplies", "run out"],
  },
  {
    slug: "new-baby", emoji: "👶", title: "New baby", short: "The first weeks home",
    intro: "The first weeks home: diapers, feeding, sleep, bath time, and a car seat that's installed before the hospital.",
    lane: "family", base: "newbaby", preset: { people: 3, babies: 1, days: 30 }, ask: ["days"],
    essentials: ["diapers", "baby-wipes", "diaper-cream", "baby-bodysuits", "sleepers", "swaddles-or-sleep-sacks", "crib-or-bassinet", "crib-sheets",
      "bibs-and-burp-cloths", "baby-wash", "hooded-baby-towels", "baby-thermometer", "nasal-aspirator", "baby-nail-file", "infant-car-seat"],
    upgrades: ["baby-monitor", "stroller", "baby-carrier", "baby-swing-or-bouncer", "bottle-sterilizer"],
    budget: [{ id: "baby-carrier-wrap", instead: "baby-carrier" }],
    forget: ["frozen-meals", "postpartum-recovery-supplies", "diaper-bag", "nursing-pads"],
    todo: ["install-car-seat", "car-seat-check", "pick-pediatrician"],
    terms: ["new baby", "newborn", "baby", "expecting", "baby registry", "registry", "baby shower", "infant", "pregnant", "due date", "nursery", "diapers", "diaper"],
  },
  {
    slug: "kids-sleepover", emoji: "🛌", title: "Kids' sleepover", short: "One night, a room full of kids",
    intro: "One night, a living room full of kids: somewhere to sleep, snacks, a movie, and breakfast in the morning.",
    lane: "family", also: ["parties"], base: "sleepover", preset: { people: 8, kids: 6, days: 2, nights: 1, meals: 2 }, ask: ["people", "kids"],
    essentials: ["sleeping-bags", "pillows", "pizza", "popcorn", "juice-boxes", "breakfast-cereal", "pancake-mix", "syrup", "paper-plates", "cups", "napkins", "glow-sticks"],
    upgrades: ["sleepover-tents-for-kids", "movie-night-projector", "air-mattress", "kids-sleeping-masks-and-pajama-favors"],
    budget: [{ id: "board-games", instead: "movie-night-projector" }],
    forget: ["toothbrushes", "night-light", "card-games", "friendship-bracelet-kit"],
    todo: ["ask-allergies", "share-pickup", "confirm-headcount"],
    terms: ["sleepover", "slumber party", "pajama party", "overnight party", "kids overnight", "sleeping over"],
  },
  {
    slug: "sports-tournament", emoji: "⚽", title: "Sports tournament weekend", short: "Shade, chairs and a full cooler",
    intro: "A long day or a weekend on the sidelines: shade, chairs, a full cooler, sunscreen and the spare things kids forget.",
    lane: "school-and-sports", base: "sports", preset: { people: 4, kids: 1, days: 2 }, ask: ["people", "days"],
    essentials: ["camp-chairs", "shade-canopy", "cooler", "ice-packs", "water", "sports-drinks", "team-snacks", "granola-or-protein-bars", "sunscreen",
      "hats", "rain-ponchos", "first-aid-kit", "instant-cold-packs", "power-bank"],
    upgrades: ["wagon", "stadium-seat-cushions", "clamp-on-umbrella", "rain-jackets"],
    budget: [{ id: "clamp-on-umbrella", instead: "shade-canopy" }],
    forget: ["spare-uniform-pieces", "shin-guards-and-mouthguards", "athletic-tape", "ball-pump", "orange-slices-and-fruit-cups-for-the-team", "trash-bags"],
    todo: ["tournament-schedule", "share-pickup", "check-forecast"],
    terms: ["tournament", "field hockey", "soccer", "lacrosse", "softball", "baseball", "volleyball", "basketball", "hockey", "swim meet", "track meet", "travel team", "sideline", "game day", "sports weekend", "team snacks", "sports"],
    months: [3, 4, 5, 8, 9, 10],
  },
  {
    slug: "new-puppy", emoji: "🐶", title: "New puppy", short: "The first month with a puppy",
    intro: "The first month with a puppy: a crate, food and bowls, a leash and ID tag, chew toys, and plenty of cleanup supplies.",
    lane: "pets", base: "petprep", preset: { people: 3, pets: 1, days: 30 }, ask: ["pets"],
    essentials: ["pet-crate-for-home", "pet-bed", "pet-food", "pet-food-and-water-bowls", "leash-and-id-tag", "dog-harness", "puppy-chew-toys",
      "pet-treats-for-training", "poop-bags", "puppy-pads", "enzyme-cleaner-for-pet-accidents"],
    upgrades: ["pet-gate", "gps-pet-tracker", "airtight-food-storage-bin", "pet-water-dispenser"],
    forget: ["pet-brush", "pet-nail-clippers", "pet-shampoo", "lint-brush-for-pet-hair"],
    todo: ["first-vet-visit", "microchip-check", "puppy-proof", "pet-vax-records"],
    terms: ["new puppy", "puppy", "puppies", "new dog", "getting a dog", "adopting a dog", "adopt a dog", "rescue dog", "dog adoption", "puppy supplies", "puppy checklist"],
  },
  {
    slug: "dog-travel", emoji: "🐕", title: "Road trip with a dog", short: "Water, a safe ride and a place to stay",
    intro: "A road trip with a dog: water and bowls on the go, a safe way to ride, food and records, and a plan for where you'll stay.",
    lane: "pets", also: ["travel"], base: "roadtrip", preset: { people: 2, pets: 1, days: 3, nights: 2 }, ask: ["people", "pets", "days"],
    essentials: ["travel-pet-bowls", "pet-water", "pet-food", "leash-and-id-tag", "poop-bags", "pet-car-harness", "pet-seat-cover", "pet-treats",
      "pet-medicines", "pet-first-aid-kit"],
    upgrades: ["pet-carrier-or-crate", "gps-pet-tracker", "pet-cooling-mat", "calming-aids-for-pets"],
    budget: [{ id: "pet-car-harness", instead: "pet-carrier-or-crate" }],
    forget: ["enzyme-cleaner-for-pet-accidents", "pet-bed", "pet-toys", "paper-towels"],
    todo: ["vet-check-travel", "pet-friendly-stays", "pet-vax-records", "pet-photo"],
    terms: ["road trip with dog", "road trip with dogs", "traveling with dog", "traveling with a dog", "travel with dog", "dog travel", "dog vacation", "dog in the car", "pet travel", "traveling with pets", "trip with dog", "trip with dogs"],
  },
  {
    slug: "pet-emergency", emoji: "🐾", title: "Pet emergency kit", short: "A grab-and-go kit for pets",
    intro: "A grab-and-go kit for your pet, following Ready.gov: food and water, medicines, records, a leash and carrier, and cleanup supplies.",
    lane: "pets", also: ["emergency"], base: "emergency", preset: { people: 2, pets: 1, days: 5 }, ask: ["pets", "days"],
    essentials: ["pet-food", "pet-water", "pet-medicines", "pet-first-aid-kit", "leash-and-id-tag", "collapsible-pet-crate", "travel-pet-bowls",
      "poop-bags", "cat-litter-box-disposable", "airtight-food-storage-bin"],
    upgrades: ["canned-pet-food", "gps-pet-tracker", "calming-aids-for-pets"],
    forget: ["pet-toys", "pet-bed", "paper-towels"],
    todo: ["pet-photo", "pet-vax-records", "microchip-check", "pet-friendly-stays", "arrange-pet-care"],
    guide: { label: "Ready.gov: Pets and Animals", href: "https://www.ready.gov/pets" },
    terms: ["pet emergency", "pet emergency kit", "pet go bag", "pet evacuation", "dog emergency", "cat emergency", "pet disaster", "pets", "cat", "cats"],
  },
  {
    slug: "roadside-emergency", emoji: "🚙", title: "Roadside emergency kit", short: "What lives in the trunk",
    intro: "What should live in the trunk all year: jumper cables, a tire gauge, a flashlight, first aid, water and a blanket.",
    lane: "car", base: "vehicle", preset: { people: 2, days: 1, nights: 0, meals: 2 }, ask: ["people"],
    essentials: ["jumper-cables", "tire-pressure-gauge", "flashlights", "first-aid-kit-for-the-car", "car-blanket", "water-pouches-for-the-car",
      "emergency-food-bars-for-the-car", "car-phone-charger", "roadside-warning-triangles", "seatbelt-cutter-and-window-breaker", "paper-road-map"],
    upgrades: ["car-emergency-kit", "portable-jump-starter", "tire-inflator", "road-flares-led", "dash-camera"],
    budget: [{ id: "jumper-cables", instead: "portable-jump-starter" }],
    forget: ["ice-scraper-for-each-car", "windshield-washer-fluid", "tire-repair-kit"],
    todo: ["spare-tire-check", "car-papers-check", "roadside-numbers", "winterize-car"],
    guide: { label: "Ready.gov: Car safety", href: "https://www.ready.gov/car" },
    terms: ["car kit", "car emergency", "roadside", "roadside emergency", "trunk", "flat tire", "dead battery", "breakdown", "broke down", "stranded", "emergency car kit", "winter car kit", "car"],
    months: [11, 12, 1, 2],
  },
  {
    slug: "teen-driver", emoji: "🔑", title: "Teen driver's first car", short: "For a new driver",
    intro: "For a new driver's first car: the roadside basics, a hands-free phone mount, and the numbers to call when something goes wrong.",
    lane: "car", also: ["family"], base: "vehicle", preset: { people: 1, days: 1, nights: 0, meals: 2 }, ask: [],
    essentials: ["jumper-cables", "tire-pressure-gauge", "tire-inflator", "first-aid-kit-for-the-car", "flashlights", "car-phone-mount", "car-phone-charger",
      "roadside-warning-triangles", "seatbelt-cutter-and-window-breaker", "car-blanket", "water-pouches-for-the-car"],
    upgrades: ["portable-jump-starter", "dash-camera", "car-emergency-kit", "car-trunk-organizer"],
    budget: [{ id: "jumper-cables", instead: "portable-jump-starter" }],
    forget: ["ice-scraper-for-each-car", "paper-road-map", "spare-keys", "windshield-washer-fluid"],
    todo: ["roadside-numbers", "car-papers-check", "spare-tire-check"],
    terms: ["teen driver", "teenager first car", "teenagers first car", "teens first car", "first car", "new driver", "student driver", "16 year old", "sixteen", "learner", "teen car", "new car"],
  },
  {
    slug: "family-road-trip", emoji: "🚗", title: "Family road trip", short: "Hours in the car with kids",
    intro: "Hours in the car with kids: snacks and drinks within reach, chargers for every row, something to do, and cleanup supplies.",
    lane: "travel", base: "roadtrip", preset: { people: 4, kids: 2, days: 4, nights: 3 }, ask: ["people", "kids", "days"],
    essentials: ["granola-or-protein-bars", "pretzels-and-crackers", "bottled-water", "kids-water-bottles", "cooler", "car-charger-for-every-row", "car-trash-can",
      "wet-wipes", "paper-towels", "first-aid-kit", "motion-sickness-relief", "travel-pillow", "travel-activity-books", "headphones-for-kids"],
    upgrades: ["kids-tablet-case-and-headphones-splitter", "cooler-that-plugs-into-the-car", "roof-cargo-bag", "car-games-and-travel-bingo"],
    budget: [{ id: "cooler", instead: "cooler-that-plugs-into-the-car" }],
    forget: ["snack-containers-for-kids", "car-blanket", "sunshade-for-car"],
    todo: ["offline-maps", "fill-gas", "check-forecast", "hold-mail"],
    terms: ["road trip", "family road trip", "car trip", "long drive", "driving vacation", "drive", "holiday road trip", "holiday travel", "thanksgiving travel", "christmas travel", "car ride with kids"],
    months: [6, 7, 11, 12],
  },
  {
    slug: "weekend-camping", emoji: "⛺", title: "Weekend camping", short: "Two nights at a campsite",
    intro: "Two nights at a campsite: shelter and sleep, a camp kitchen, light, water, and the small things that make camp easy.",
    lane: "outdoors", base: "camping", preset: { people: 4, days: 3, nights: 2 }, ask: ["people", "days"],
    essentials: ["tent", "sleeping-bags", "sleeping-pads", "pillows", "headlamps", "lantern", "camp-stove", "propane-canisters", "camp-cookware-set", "cooler",
      "ice", "camp-water-jug", "lighter-or-matches", "camp-chairs", "first-aid-kit", "bug-spray", "trash-bags"],
    upgrades: ["camping-cot", "tent-footprint", "camp-kitchen-organizer", "camping-hammock", "portable-power-station"],
    budget: [{ id: "sleeping-pads", instead: "camping-cot" }],
    forget: ["s-mores-supplies", "marshmallow-roasting-sticks", "tarp", "rain-ponchos", "multi-tool", "fire-starters", "biodegradable-soap"],
    todo: ["campsite-rules", "check-forecast", "share-route"],
    terms: ["camping", "weekend camping", "camping trip", "campsite", "tent camping", "car camping", "campground", "camp out", "camp", "family camping"],
    months: [5, 6, 7, 8, 9, 10],
  },
  {
    slug: "birthday-party", emoji: "🎂", title: "Birthday party", short: "Cake, plates and favors for a crowd",
    intro: "A birthday for a crowd: cake and candles, plates and cups for everyone, drinks, decorations and favors.",
    lane: "parties", also: ["family"], base: "party", preset: { people: 20, kids: 12, days: 1, nights: 0, meals: 1 }, ask: ["people", "kids"],
    essentials: ["birthday-cake-or-cupcakes", "candles-and-lighter", "number-candles", "paper-plates", "cups", "napkins", "plastic-utensils", "juice-boxes",
      "pizza", "chips", "balloons", "banner", "party-favors", "ice", "trash-bags"],
    upgrades: ["balloon-arch-kit", "helium-tank", "pinata", "photo-backdrop-and-props", "party-plates-with-a-theme"],
    budget: [{ id: "streamers-and-confetti", instead: "balloon-arch-kit" }],
    forget: ["cake-knife-and-server", "gift-bags", "ice-cream", "thank-you-cards", "cooler"],
    todo: ["rsvps", "ask-allergies", "confirm-headcount"],
    terms: ["birthday party", "birthday", "kids birthday", "birthday for", "party for", "bday", "party supplies", "first birthday", "1st birthday", "sweet 16", "party"],
  },
  {
    slug: "backyard-bbq", emoji: "🍔", title: "Backyard barbecue", short: "A cookout for a crowd",
    intro: "A cookout for a crowd: the grill and what goes on it, a cold cooler, plates and napkins, and something for the bugs.",
    lane: "parties", also: ["outdoors"], base: "tailgate", preset: { people: 12, days: 1, nights: 0, meals: 1 }, ask: ["people"],
    essentials: ["charcoal", "lighter-or-matches", "grill-tools", "food-thermometer", "burger-patties", "hamburger-buns", "hot-dogs", "hot-dog-buns",
      "condiments", "chips", "cooler", "ice", "soda-or-sparkling-water", "paper-plates", "cups", "napkins", "plastic-utensils", "trash-bags"],
    upgrades: ["portable-grill", "outdoor-string-lights", "yard-games", "folding-table", "citronella-candles-or-repellent-device"],
    budget: [{ id: "bug-spray", instead: "citronella-candles-or-repellent-device" }],
    forget: ["aluminum-foil", "sunscreen", "serving-utensils", "tablecloths"],
    todo: ["check-forecast", "confirm-headcount", "ask-allergies"],
    terms: ["bbq", "barbecue", "barbeque", "cookout", "cook out", "grill out", "grilling", "backyard party", "hot dogs", "hot dog", "burgers", "4th of july", "fourth of july", "memorial day", "labor day", "summer party", "tailgate"],
    months: [5, 6, 7, 8, 9],
  },
  {
    slug: "overnight-guests", emoji: "🛏️", title: "Overnight guests", short: "Family staying a few nights",
    intro: "Family staying a few nights: a bed and fresh towels for each guest, enough coffee and breakfast, and the Wi-Fi password where they can see it.",
    lane: "parties", also: ["home"], base: "hosting", preset: { people: 6, days: 4, nights: 3 }, ask: ["people", "days"],
    essentials: ["guest-sheets", "pillows", "extra-blankets", "guest-towels", "air-mattress", "toilet-paper", "coffee", "decaf-and-tea-for-guests",
      "breakfast-eggs", "bread-or-buns", "night-light", "guest-bathroom-basket"],
    upgrades: ["mattress-topper", "robe", "wall-charger-with-several-ports", "sleep-masks-and-earplugs"],
    forget: ["travel-toiletry-kit", "charging-cables", "laundry-detergent", "paper-towels"],
    todo: ["guest-wifi", "confirm-headcount", "ask-allergies"],
    terms: ["overnight guests", "guests", "house guests", "holiday guests", "in laws", "inlaws", "family visiting", "company coming", "visitors", "guest room", "out of town guests", "hosting"],
    months: [11, 12],
  },
  {
    slug: "holiday-dinner", emoji: "🦃", title: "Holiday dinner", short: "A big meal for family and friends",
    intro: "A big holiday meal: pans and a thermometer for the cooking, enough seats and serving dishes, and containers for leftovers.",
    lane: "parties", also: ["seasonal"], base: "hosting", preset: { people: 12, days: 1, nights: 0, meals: 1 }, ask: ["people"],
    essentials: ["roasting-pans", "food-thermometer", "aluminum-pans-with-lids", "aluminum-foil", "serving-bowls-and-platters", "serving-utensils",
      "gravy-boat-and-serving-dishes", "tablecloths", "napkins", "folding-chairs", "food-containers", "ice", "coffee", "decaf-and-tea-for-guests", "trash-bags"],
    upgrades: ["disposable-chafing-dishes", "sterno-cans", "insulated-food-carrier", "thermal-carafe", "place-cards"],
    forget: ["oven-mitts", "dish-towels", "dishwasher-detergent", "food-allergy-labels", "cake-carrier"],
    todo: ["meal-plan", "confirm-headcount", "ask-allergies"],
    terms: ["thanksgiving", "holiday dinner", "christmas dinner", "friendsgiving", "easter dinner", "holiday meal", "turkey", "turkey dinner", "hosting thanksgiving", "family dinner", "potluck", "holiday party", "holidays"],
    months: [11, 12],
  },
  {
    slug: "cold-and-flu", emoji: "🤒", title: "Cold and flu shelf", short: "Sick days, before you need them",
    intro: "A sick-day shelf before you need it: tissues, a thermometer, fluids, easy food, and the medicines your doctor is fine with.",
    lane: "health", base: "sick", preset: { people: 4, days: 7 }, ask: ["people", "days"],
    essentials: ["facial-tissues", "thermometer", "pain-and-fever-reliever", "cold-and-flu-medicine", "cough-drops", "electrolyte-drink-mix",
      "saltine-crackers", "bouillon-or-broth", "herbal-tea", "hand-sanitizer", "disinfecting-wipes"],
    upgrades: ["humidifier", "covid-and-flu-home-tests", "heating-pad"],
    forget: ["popsicles", "masks", "lip-balm", "saline-nasal-spray"],
    todo: ["med-list"],
    terms: ["cold and flu", "flu season", "sick", "sick day", "sick days", "cold", "flu", "covid", "stomach bug", "sore throat", "fever", "cough", "illness", "sick kid"],
    months: [10, 11, 12, 1, 2, 3],
  },
  {
    slug: "first-aid-kit", emoji: "🩹", title: "Home first aid kit", short: "Bandages to thermometer, in one box",
    intro: "Bandages, wound care, a few basic medicines, a thermometer and gloves, in one box you can find fast.",
    lane: "health", also: ["emergency"], base: "home", preset: { people: 4, days: 30 }, ask: ["people"],
    essentials: ["first-aid-kit", "adhesive-bandages", "gauze-and-medical-tape", "antibiotic-ointment", "elastic-bandage-wraps", "instant-cold-packs",
      "tweezers-and-tick-remover", "medical-scissors", "disposable-gloves-for-first-aid", "thermometer", "pain-and-fever-reliever", "hydrocortisone-cream", "first-aid-manual"],
    upgrades: ["first-aid-kit-for-the-car", "pulse-oximeter", "burn-gel", "emergency-blankets"],
    forget: ["allergy-medicine", "meds", "eye-drops", "antacids"],
    todo: ["med-list", "learn-cpr"],
    guide: { label: "Red Cross: Survival Kit Supplies", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html" },
    terms: ["first aid kit", "first aid", "medicine cabinet", "bandages", "home first aid", "first aid supplies", "med kit", "medical kit", "injury"],
  },
  {
    slug: "aging-parent", emoji: "🤝", title: "Aging parent at home", short: "A parent who lives alone",
    intro: "For a parent who lives alone: fewer ways to fall, medicines that are easy to manage, light at night, and a simple daily check-in.",
    lane: "caregiving", base: "caregiving", preset: { people: 1, days: 14, needs: ["older", "mobility"] }, ask: [],
    essentials: ["grab-bars", "non-slip-bath-mat", "shower-chair", "handheld-shower-head", "motion-sensor-night-lights", "pill-organizer-with-alarms",
      "flashlights", "smoke-and-co-alarm", "large-button-phone", "key-safe", "reacher-grabber"],
    upgrades: ["medical-alert-system", "raised-toilet-seat", "indoor-thermometer-and-humidity-monitor", "large-print-calendar", "amplified-headphones-or-tv-speaker"],
    forget: ["magnifier", "printed-contact-list", "batteries"],
    todo: ["fall-proofing", "daily-check-in", "med-list", "care-notebook", "caregiver-backup", "test-alarms"],
    guide: { label: "Ready.gov: Older Adults", href: "https://www.ready.gov/older-adults" },
    terms: ["elderly parent", "aging parent", "aging parents", "elderly", "older parent", "older adult", "senior", "seniors", "grandma", "grandpa", "living alone", "lives alone", "caregiver", "caregiving", "fall prevention", "mom", "dad", "parent"],
  },
  {
    slug: "first-apartment", emoji: "🏢", title: "First apartment", short: "Setting up a first place",
    intro: "Setting up a first place: a basic tool kit, kitchen starter gear, bath and bedding, cleaning supplies and the safety basics.",
    lane: "moving", also: ["home"], base: "moving", preset: { people: 1, days: 30, nights: 30 }, ask: ["people"],
    essentials: ["basic-tool-kit", "pots-and-pans-starter-set", "dishes-and-cutlery-for-one", "cutting-board-and-knife", "bed-sheets", "bath-towels",
      "shower-curtain-and-rings", "trash-bags", "all-purpose-cleaner", "toilet-paper", "paper-towels", "plunger", "first-aid-kit", "fire-extinguisher", "power-strip"],
    upgrades: ["cordless-drill", "air-fryer", "cordless-stick-vacuum", "area-rug"],
    budget: [{ id: "broom-and-dustpan", instead: "cordless-stick-vacuum" }],
    forget: ["light-bulbs", "command-hooks-and-strips", "hangers", "doormat", "dish-rack", "laundry-hamper"],
    todo: ["renters-insurance", "change-address", "transfer-utilities", "test-alarms", "spare-keys-made"],
    terms: ["first apartment", "new apartment", "apartment", "first place", "moving out", "apartment essentials", "own place", "studio", "first home", "new home"],
    months: [5, 6, 7, 8, 9],
  },
  {
    slug: "college-move-in", emoji: "🎓", title: "College move-in", short: "A dorm room",
    intro: "A dorm room: twin XL bedding, a shower caddy, storage that fits under the bed, and power where you need it. Check the school's list of what isn't allowed.",
    lane: "moving", also: ["school-and-sports"], base: "college", preset: { people: 1, days: 30, nights: 30 }, ask: [],
    essentials: ["twin-xl-sheets", "mattress-topper", "comforter", "pillows", "bath-towels", "shower-caddy", "shower-shoes", "laundry-hamper", "laundry-pods",
      "hangers", "desk-lamp", "power-strip", "under-bed-storage", "command-hooks-and-strips", "first-aid-kit"],
    upgrades: ["dorm-fridge", "bed-risers", "electric-kettle", "storage-bins"],
    forget: ["meds", "charging-cables", "sleep-masks-and-earplugs", "umbrellas"],
    terms: ["college", "dorm", "college move in", "move in day", "dorm room", "freshman", "university", "college checklist", "off to college"],
    months: [7, 8],
  },
  {
    slug: "moving-day", emoji: "📦", title: "Moving day", short: "Packing up and the first night",
    intro: "Packing up and moving day: boxes and tape, padding, a dolly, labels, and a first-night box so you can find the essentials.",
    lane: "moving", base: "moving", preset: { people: 2, days: 3, nights: 2 }, ask: ["people"],
    essentials: ["moving-boxes", "packing-tape", "tape-gun", "packing-paper", "bubble-wrap", "labels-and-markers", "moving-blankets", "furniture-sliders",
      "hand-truck-or-dolly", "mattress-bags", "small-parts-bags", "first-night-box", "trash-bags"],
    upgrades: ["wardrobe-boxes", "lifting-straps", "stretch-wrap"],
    forget: ["toilet-paper", "paper-towels", "all-purpose-cleaner", "basic-tool-kit"],
    todo: ["book-movers", "change-address", "transfer-utilities", "photo-old-place", "hold-mail", "change-locks"],
    terms: ["moving", "move", "moving house", "moving day", "packing", "moving boxes", "relocating", "relocation", "new house", "house move"],
    months: [5, 6, 7, 8],
  },
  {
    slug: "home-maintenance", emoji: "🔧", title: "Home maintenance basics", short: "A starter tool kit and small jobs",
    intro: "A starter tool kit and supplies for the small jobs every home needs: hanging, tightening, unclogging, sealing and changing bulbs.",
    lane: "tools", base: "home", preset: { people: 2, days: 30 }, ask: [],
    essentials: ["basic-tool-kit", "cordless-drill", "tape-measure", "level", "utility-knife", "stud-finder", "plunger", "caulk-and-sealant",
      "wd-40-or-lubricant", "light-bulbs", "work-flashlight-with-magnet", "ladder", "safety-glasses"],
    upgrades: ["drain-snake", "picture-hanging-kit", "wet-dry-shop-vacuum", "smart-plug"],
    budget: [{ id: "screwdriver-set", instead: "cordless-drill" }],
    forget: ["9-volt-batteries", "superglue", "painters-tape", "zip-ties"],
    todo: ["test-alarms", "learn-shutoffs", "label-breakers", "service-furnace", "clear-gutters"],
    terms: ["home maintenance", "tool kit", "toolkit", "tools", "homeowner", "fix it", "repairs", "repair", "handyman", "new homeowner", "basic tools", "diy"],
  },
];

export const kitBySlug = (slug: string) => kits.find((k) => k.slug === slug);

/** Kits whose main lane or extra lanes include this lane. */
export const kitsInLane = (lane: LaneId) => kits.filter((k) => k.lane === lane || k.also?.includes(lane));

/** Kits to feature this month (1–12), in kit order. */
export const kitsForMonth = (month: number) => kits.filter((k) => k.months?.includes(month));

/** Kits shown first on the home page when nothing seasonal applies. */
export const POPULAR = ["five-day-emergency", "power-outage", "new-puppy", "birthday-party", "teen-driver", "first-apartment"];
