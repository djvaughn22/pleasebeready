// Household planner catalog — the single source for every recommendation.
//
// Rules for editing:
//  - Every item cites at least one entry in sources.ts. Re-read that page
//    before changing the advice, and bump its `checked` date.
//  - Only these figures come from a source: 1 gallon of water per person per
//    day (Red Cross, Ready.gov), 3 days to take with you and 2 weeks at home
//    (Red Cross), and a 7-day supply of medicines (Red Cross). Mark those
//    `official`. Anything else the sources list without a number is a
//    `suggestion`; say so in `reason` and do not make it sound official.
//  - Priority: `essential` = on the Red Cross minimum list or a core Ready.gov
//    kit item; `next` = other listed items; `optional` = "consider" lists.
//  - `cost` is a rough planning figure set here, not an Amazon price, and
//    never a quote. Leave it out for anything that is not a purchase.
//  - `product.asin` must already exist in gear.ts (it is title-verified
//    there). Never add an ASIN here that gear.ts does not hold.

import { areas, levels } from "../readiness";
import type { GearItem } from "../gear";
import type { BucketId, CatalogItem, ScenarioId, Unit } from "./types";

const u = (one: string, many: string = `${one}s`): Unit => ({ one, many });

export type Bucket = { id: BucketId; emoji: string; title: string; blurb: string };

export const buckets: Bucket[] = [
  { id: "water", emoji: "💧", title: "Water", blurb: "Drinking and basic cleaning, plus a backup way to make water safe." },
  { id: "food", emoji: "🥫", title: "Food", blurb: "Food that keeps and needs little or no cooking." },
  { id: "health", emoji: "🩹", title: "First aid and medicine planning", blurb: "A first-aid kit and a plan for everyone's medicines." },
  { id: "power", emoji: "🔦", title: "Light and power", blurb: "Light, batteries and a way to keep phones charged." },
  { id: "sanitation", emoji: "🧼", title: "Sanitation", blurb: "Hygiene supplies for when water or services are interrupted." },
  { id: "warmth", emoji: "🧥", title: "Warmth, shelter and tools", blurb: "Staying warm and dry, and a few basic tools." },
  { id: "comms", emoji: "📻", title: "Communication and documents", blurb: "Hearing alerts, reaching each other, and papers you may need." },
  { id: "family", emoji: "👪", title: "Children, pets and special needs", blurb: "Only what applies to your household." },
];

export const scenarios: { id: ScenarioId; emoji: string; label: string; hint: string }[] = [
  { id: "outage", emoji: "🔦", label: "Power outage", hint: "Light, batteries, keeping food and medicine safe." },
  { id: "weather", emoji: "🌪️", label: "Severe weather", hint: "Storms and winter weather, staying home for several days." },
  { id: "water", emoji: "🚰", label: "Water interruption", hint: "Tap water off or not safe to drink." },
  { id: "evacuation", emoji: "🎒", label: "Evacuation", hint: "Leaving home with a bag for each person." },
];

export const catalog: CatalogItem[] = [
  // ── Water ────────────────────────────────────────────────────────────────
  {
    id: "water", bucket: "water", name: "Drinking and cleaning water",
    unit: u("gallon"), qty: { kind: "daily", subject: "people", n: 1 }, hotWeather: true,
    priority: "essential", basis: "official", cost: 1,
    reason: "One gallon per person per day covers drinking and basic cleaning.",
    tip: "Ready.gov says children, nursing mothers and sick people may need more, and that needs can double in very hot weather. Store-bought water in sealed bottles keeps best; replace water you bottled yourself every six months.",
    sources: ["rc-kit", "rg-water"],
  },
  {
    id: "water-containers", bucket: "water", name: "Containers for stored water",
    unit: u("container"), qty: { kind: "coverOf", itemId: "water", per: 7 },
    priority: "optional", basis: "suggestion", cost: 25,
    raise: { water: "next" },
    reason: "Only needed if you fill your own water instead of buying it bottled. The count assumes 7-gallon containers.",
    tip: "Edit the number if you use a different size.",
    sources: ["rg-water"],
    product: { asin: "B001QC31G6", covers: 1 },
  },
  {
    id: "water-know-how", bucket: "water", name: "Learn how to make water safe",
    unit: u("task"), qty: { kind: "none" },
    priority: "optional", basis: "none",
    scenarioOnly: ["water"], raise: { water: "essential" },
    reason: "CDC: boil clear water at a rolling boil for 1 minute (3 minutes above 6,500 feet), or disinfect it. Follow your health department's notice.",
    sources: ["cdc-water"],
  },
  {
    id: "water-bleach", bucket: "water", name: "Unscented household bleach (for making water safe)",
    unit: u("bottle"), qty: { kind: "fixed", n: 1 },
    priority: "optional", basis: "suggestion", cost: 4,
    raise: { water: "next" },
    reason: "Both Red Cross and CDC list it. Use the amounts on the bottle's label or CDC's table, and let the water stand 30 minutes.",
    tip: "Boiling kills more kinds of germs than bleach does.",
    sources: ["cdc-water", "rc-kit"],
  },
  {
    id: "water-filter", bucket: "water", name: "Backup water filter or purification tablets",
    unit: u("filter or pack", "filters or packs"), qty: { kind: "fixed", n: 1 },
    priority: "optional", basis: "suggestion", cost: 20,
    raise: { water: "next" },
    reason: "CDC lists purification tablets and bleach for disinfecting water. A filter is our added suggestion; check what a given filter removes before relying on it.",
    sources: ["cdc-water"],
    product: { asin: "B006QF3TW4" },
  },

  // ── Food ─────────────────────────────────────────────────────────────────
  {
    id: "food", bucket: "food", name: "Non-perishable, easy-to-prepare food",
    unit: u("person-day"), qty: { kind: "daily", subject: "people", n: 1 },
    priority: "essential", basis: "official", cost: 6,
    reason: "Red Cross: a 3-day supply to take with you and a 2-week supply for home. One person-day is a day of food for one person.",
    tip: "Choose foods your household will eat, and plan around any special diets. Rotate by date.",
    sources: ["rc-kit", "rg-food"],
    product: { asin: "B0898QSCNG" },
  },
  {
    id: "can-opener", bucket: "food", name: "Manual can opener",
    unit: u("can opener"), qty: { kind: "fixed", n: 1 },
    priority: "essential", basis: "suggestion", cost: 10,
    reason: "Ready.gov puts a manual can opener in the basic kit, since canned food is a common choice.",
    sources: ["rg-kit", "rg-food"],
    product: { asin: "B09HKDZ3CV", covers: 1 },
  },
  {
    id: "cups-plates", bucket: "food", name: "Paper plates, cups and utensils",
    unit: u("set"), qty: { kind: "fixed", n: 1 },
    priority: "optional", basis: "suggestion", cost: 8,
    reason: "Ready.gov lists mess kits, paper cups and plates. They save water you would use for washing up.",
    sources: ["rg-kit", "rg-food"],
  },
  {
    id: "comfort-food", bucket: "food", name: "Comfort foods and snacks",
    unit: u("person-day"), qty: { kind: "daily", subject: "people", n: 1 },
    priority: "optional", basis: "suggestion", cost: 1.5,
    reason: "Ready.gov suggests including comfort and stress foods.",
    sources: ["rg-food"],
  },

  // ── First aid and medicine planning ──────────────────────────────────────
  {
    id: "first-aid-kit", bucket: "health", name: "First-aid kit",
    unit: u("kit"), qty: { kind: "fixed", n: 1 },
    priority: "essential", basis: "suggestion", cost: 25,
    reason: "On both the Red Cross and Ready.gov lists. Check it twice a year for expired items.",
    sources: ["rc-kit", "rg-kit"],
    product: { asin: "B000069EYA", covers: 1 },
  },
  {
    id: "rx-supply", bucket: "health", name: "Extra supply of prescription medicines",
    unit: u("day of each person's medicines", "days of each person's medicines"),
    qty: { kind: "fixed", n: 7 }, needs: "takesMeds",
    priority: "essential", basis: "official",
    reason: "Red Cross lists a 7-day supply of medications. Ask your prescriber or pharmacy what is possible; refill rules vary.",
    sources: ["rc-kit", "rg-kit"],
  },
  {
    id: "med-list", bucket: "health", name: "Printed list of medicines, doses and allergies",
    unit: u("list"), qty: { kind: "none" }, needs: "takesMeds",
    priority: "essential", basis: "none",
    reason: "Red Cross lists a medication list and key medical information with your documents. Keep a copy in your kit.",
    sources: ["rc-kit", "rg-disability"],
  },
  {
    id: "med-heat-question", bucket: "health", name: "Ask how long your medicines keep at higher temperatures",
    unit: u("task"), qty: { kind: "none" }, needs: "takesMeds", scenarioOnly: ["outage"],
    priority: "next", basis: "none",
    reason: "Ready.gov suggests finding this out for medicines that are normally refrigerated or sensitive to heat.",
    sources: ["rg-power"],
  },
  {
    id: "otc-meds", bucket: "health", name: "Non-prescription medicines (pain reliever, anti-diarrhea, antacid, laxative)",
    unit: u("set"), qty: { kind: "fixed", n: 1 },
    priority: "next", basis: "suggestion", cost: 20,
    reason: "Ready.gov lists these. Choose ones that suit everyone in your household, and ask a pharmacist if you are unsure.",
    sources: ["rg-kit"],
  },
  {
    id: "masks", bucket: "health", name: "Dust masks or N95 / surgical masks",
    unit: u("mask"), qty: { kind: "each", subject: "people", n: 1 },
    priority: "optional", basis: "suggestion", cost: 1.5,
    reason: "Ready.gov lists a dust mask and Red Cross lists N95 or surgical masks, depending on what is common where you live.",
    sources: ["rg-kit", "rc-kit"],
  },

  // ── Light and power ──────────────────────────────────────────────────────
  {
    id: "flashlights", bucket: "power", name: "Flashlights or headlamps",
    unit: u("light"), qty: { kind: "each", subject: "people", n: 1 },
    priority: "essential", basis: "suggestion", cost: 8,
    reason: "Ready.gov: a flashlight for every household member.",
    sources: ["rg-power", "rc-kit"],
    product: { asin: "B092RHC2FY", covers: 2 },
  },
  {
    id: "batteries", bucket: "power", name: "Extra batteries (for flashlights and radio)",
    unit: u("spare set"), qty: { kind: "each", subject: "people", n: 1 },
    priority: "essential", basis: "suggestion", cost: 6,
    reason: "Red Cross and Ready.gov both list extra batteries. The count is our suggestion; match the sizes your devices use.",
    sources: ["rc-kit", "rg-kit", "rg-winter"],
  },
  {
    id: "power-bank", bucket: "power", name: "Phone power bank",
    unit: u("power bank"), qty: { kind: "each", subject: "adults", n: 1 },
    priority: "essential", basis: "suggestion", cost: 25,
    reason: "Ready.gov: a cell phone with chargers and a backup battery or power bank. One per adult is our suggestion.",
    tip: "Keep it charged. If someone relies on a medical device, ask their provider about backup power too.",
    sources: ["rg-kit", "rg-power"],
    product: { asin: "B0D5CLSMFB", covers: 1 },
  },
  {
    id: "chargers", bucket: "power", name: "Phone chargers and cables (wall and car)",
    unit: u("charger"), qty: { kind: "each", subject: "adults", n: 1 },
    priority: "essential", basis: "suggestion", cost: 10,
    reason: "Red Cross lists a cell phone with chargers. Keep one set in your kit so you never unplug the one you use daily.",
    sources: ["rc-kit", "rg-kit"],
  },
  {
    id: "thermometers", bucket: "power", name: "Fridge and freezer thermometers",
    unit: u("thermometer"), qty: { kind: "fixed", n: 2 },
    priority: "optional", basis: "suggestion", cost: 6,
    raise: { outage: "next" },
    reason: "Ready.gov: an unopened fridge keeps food cold for about 4 hours and a full freezer about 48 hours. A thermometer tells you where you stand.",
    sources: ["rg-power", "rg-food"],
  },
  {
    id: "co-detector", bucket: "power", name: "Carbon monoxide detectors",
    unit: u("detector (one per level)", "detectors (one per level)"), qty: { kind: "fixed", n: 1 },
    priority: "next", basis: "suggestion", cost: 35,
    raise: { outage: "essential", weather: "next" },
    reason: "Ready.gov: working carbon monoxide detectors on every level of your home. Edit the number to match your levels, and replace batteries on schedule.",
    tip: "Run generators and fuel only outdoors, at least 20 feet from windows, doors and attached garages.",
    sources: ["rg-power"],
    product: { asin: "B0CLVRPNZX", covers: 1 },
  },

  // ── Sanitation ───────────────────────────────────────────────────────────
  {
    id: "hygiene", bucket: "sanitation", name: "Soap, toilet paper, toothpaste and personal hygiene items",
    unit: u("person-day"), qty: { kind: "daily", subject: "people", n: 1 },
    priority: "essential", basis: "suggestion", cost: 1.5,
    reason: "Red Cross lists sanitation and personal hygiene items; Ready.gov adds feminine supplies and soap. Counted in person-days so it grows with the plan.",
    sources: ["rc-kit", "rg-kit"],
  },
  {
    id: "wipes", bucket: "sanitation", name: "Moist towelettes, hand sanitizer and disinfecting wipes",
    unit: u("pack"), qty: { kind: "fixed", n: 2 },
    priority: "essential", basis: "suggestion", cost: 5,
    reason: "Ready.gov lists moist towelettes for personal sanitation, and hand sanitizer and disinfecting wipes.",
    sources: ["rg-kit"],
  },
  {
    id: "trash-bags", bucket: "sanitation", name: "Garbage bags and plastic ties",
    unit: u("box"), qty: { kind: "fixed", n: 1 },
    priority: "essential", basis: "suggestion", cost: 6,
    reason: "Ready.gov lists garbage bags and plastic ties for personal sanitation.",
    sources: ["rg-kit"],
  },

  // ── Warmth, shelter and tools ────────────────────────────────────────────
  {
    id: "emergency-blankets", bucket: "warmth", name: "Emergency blanket for each person",
    unit: u("blanket"), qty: { kind: "each", subject: "people", n: 1 },
    priority: "essential", basis: "suggestion", cost: 3,
    reason: "Red Cross lists an emergency blanket in its minimum supplies.",
    sources: ["rc-kit"],
    product: { asin: "B01LYNWRLA", covers: 4 },
  },
  {
    id: "sleeping-bags", bucket: "warmth", name: "Sleeping bag or warm blanket for each person",
    unit: u("bag or blanket", "bags or blankets"), qty: { kind: "each", subject: "people", n: 1 },
    priority: "optional", basis: "suggestion", cost: 20,
    raise: { weather: "next", outage: "next" },
    reason: "Ready.gov and Red Cross list them. Use ones you already own if you can.",
    sources: ["rg-kit", "rc-kit", "rg-winter"],
  },
  {
    id: "clothing", bucket: "warmth", name: "Change of clothes and sturdy shoes for each person",
    unit: u("set"), qty: { kind: "each", subject: "people", n: 1 },
    priority: "optional", basis: "suggestion",
    raise: { evacuation: "next", weather: "next" },
    reason: "Ready.gov: a complete change of clothing for your climate, and sturdy shoes. Most households can use what they already own.",
    sources: ["rg-kit", "rc-kit"],
  },
  {
    id: "multi-tool", bucket: "warmth", name: "Multi-purpose tool, plus a wrench or pliers",
    unit: u("tool set"), qty: { kind: "fixed", n: 1 },
    priority: "essential", basis: "suggestion", cost: 20,
    reason: "Red Cross lists a multi-purpose tool; Ready.gov lists a wrench or pliers for turning off utilities. Learn where your shut-offs are.",
    sources: ["rc-kit", "rg-kit"],
  },
  {
    id: "whistles", bucket: "warmth", name: "Whistle to signal for help",
    unit: u("whistle"), qty: { kind: "each", subject: "people", n: 1 },
    priority: "next", basis: "suggestion", cost: 3,
    reason: "Ready.gov lists a whistle to signal for help. Red Cross lists it for places where it is likely to matter.",
    sources: ["rg-kit", "rc-kit"],
  },
  {
    id: "sheeting-tape", bucket: "warmth", name: "Plastic sheeting, scissors and duct tape",
    unit: u("set"), qty: { kind: "fixed", n: 1 },
    priority: "optional", basis: "suggestion", cost: 20,
    raise: { weather: "next" },
    reason: "Ready.gov lists them for sheltering in place.",
    sources: ["rg-kit", "rc-kit"],
  },
  {
    id: "matches", bucket: "warmth", name: "Matches in a waterproof container",
    unit: u("box"), qty: { kind: "fixed", n: 1 },
    priority: "optional", basis: "suggestion", cost: 4,
    reason: "Ready.gov and Red Cross list matches. Never use a flame or a grill indoors for heat.",
    sources: ["rg-kit", "rc-kit"],
  },
  {
    id: "rain-gloves", bucket: "warmth", name: "Rain gear and work gloves",
    unit: u("set"), qty: { kind: "each", subject: "adults", n: 1 },
    priority: "optional", basis: "suggestion", cost: 15,
    reason: "Red Cross lists them for places where storms or cleanup are common.",
    sources: ["rc-kit"],
  },
  {
    id: "fire-extinguisher", bucket: "warmth", name: "Fire extinguisher",
    unit: u("extinguisher"), qty: { kind: "fixed", n: 1 },
    priority: "optional", basis: "suggestion", cost: 30,
    reason: "Ready.gov lists one in its additional supplies. Learn how to use it before you need it.",
    sources: ["rg-kit"],
    product: { asin: "B01LTICQYE", covers: 1 },
  },

  // ── Communication and documents ──────────────────────────────────────────
  {
    id: "weather-radio", bucket: "comms", name: "Battery or hand-crank radio with NOAA Weather Radio",
    unit: u("radio"), qty: { kind: "fixed", n: 1 },
    priority: "essential", basis: "suggestion", cost: 30,
    reason: "On both the Red Cross and Ready.gov lists, so you can hear alerts if phones or power are down.",
    sources: ["rc-kit", "rg-kit"],
    product: { asin: "B015QIC1PW", covers: 1 },
  },
  {
    id: "contact-list", bucket: "comms", name: "Paper list of family and emergency contacts",
    unit: u("task"), qty: { kind: "none" },
    priority: "essential", basis: "none",
    reason: "Red Cross lists family and emergency contact information. Paper still works when a phone does not.",
    sources: ["rc-kit", "rg-plan"],
  },
  {
    id: "family-plan", bucket: "comms", name: "Agree how you will reach each other and where you will meet",
    unit: u("task"), qty: { kind: "none" },
    priority: "next", basis: "none", raise: { evacuation: "essential", weather: "essential" },
    reason: "Ready.gov: know how you will contact one another and reconnect if you are separated, and pick a familiar meeting place.",
    sources: ["rg-plan"],
  },
  {
    id: "alerts", bucket: "comms", name: "Choose how you will get emergency alerts",
    unit: u("task"), qty: { kind: "none" },
    priority: "next", basis: "none", raise: { weather: "essential" },
    reason: "Ready.gov asks how you will receive alerts and warnings. Ready.gov's winter weather page also says to sign up for your community's warnings.",
    sources: ["rg-plan", "rg-winter"],
  },
  {
    id: "documents", bucket: "comms", name: "Copies of important papers in a waterproof, portable container",
    unit: u("container"), qty: { kind: "fixed", n: 1 },
    priority: "essential", basis: "suggestion", cost: 20,
    reason: "Red Cross lists copies of ID, insurance and medical papers; Ready.gov also suggests saving them electronically.",
    sources: ["rc-kit", "rg-kit", "rg-financial"],
    product: { asin: "B07SPZ93V5", covers: 1 },
  },
  {
    id: "cash", bucket: "comms", name: "Some cash in small bills",
    unit: u("task"), qty: { kind: "none" },
    priority: "essential", basis: "none",
    reason: "Red Cross lists extra cash. Ready.gov notes that ATMs and cards may not work. The amount is up to you.",
    sources: ["rc-kit", "rg-financial"],
  },
  {
    id: "maps", bucket: "comms", name: "Paper map of your area",
    unit: u("map"), qty: { kind: "fixed", n: 1 },
    priority: "essential", basis: "suggestion", cost: 8,
    reason: "Red Cross and Ready.gov both list local maps.",
    sources: ["rc-kit", "rg-kit"],
  },
  {
    id: "spare-keys", bucket: "comms", name: "Extra car and house keys",
    unit: u("set"), qty: { kind: "fixed", n: 1 },
    priority: "optional", basis: "suggestion", cost: 5,
    reason: "Red Cross lists an extra set of car and house keys.",
    sources: ["rc-kit"],
  },
  {
    id: "evacuation-route", bucket: "comms", name: "Pick where you would go and how you would get there",
    unit: u("task"), qty: { kind: "none" }, scenarioOnly: ["evacuation"],
    priority: "essential", basis: "none",
    reason: "Ready.gov: know your evacuation destination and routes, and make sure everyone knows where the go-bag is kept.",
    sources: ["rg-evacuation"],
  },
  {
    id: "go-bag", bucket: "comms", name: "Go-bag for each person",
    unit: u("bag"), qty: { kind: "each", subject: "people", n: 1 }, scenarioOnly: ["evacuation"],
    priority: "essential", basis: "suggestion", cost: 25,
    reason: "Ready.gov suggests a go-bag so you do not scramble. Red Cross counts a 3-day water and food supply for evacuation; the first three days of the quantities above can live in the bag.",
    sources: ["rg-evacuation", "rc-kit"],
    product: { asin: "B000FJQQVI", covers: 2 },
  },

  // ── Children, pets and special needs ─────────────────────────────────────
  {
    id: "baby-food", bucket: "family", name: "Infant formula or baby food, and bottles",
    unit: u("baby-day"), qty: { kind: "daily", subject: "babies", n: 1 }, needs: "baby",
    priority: "essential", basis: "suggestion", cost: 8,
    reason: "Ready.gov and Red Cross list formula, bottles and baby food. Use what your baby already eats.",
    sources: ["rg-kit", "rc-kit", "rg-food"],
  },
  {
    id: "baby-care", bucket: "family", name: "Diapers, wipes and diaper rash cream",
    unit: u("baby-day"), qty: { kind: "daily", subject: "babies", n: 1 }, needs: "baby",
    priority: "essential", basis: "suggestion", cost: 3,
    reason: "Ready.gov lists diapers, wipes and diaper rash cream.",
    sources: ["rg-kit", "rc-kit"],
  },
  {
    id: "kids-activities", bucket: "family", name: "Games, books and activities for children",
    unit: u("set"), qty: { kind: "each", subject: "children", n: 1 }, needs: "child",
    priority: "next", basis: "suggestion", cost: 5,
    reason: "Red Cross lists games and activities for children. They help a long wait go easier.",
    sources: ["rc-kit"],
  },
  {
    id: "pet-food", bucket: "family", name: "Pet food in an airtight, waterproof container",
    unit: u("pet-day"), qty: { kind: "daily", subject: "pets", n: 1 }, needs: "pet",
    priority: "essential", basis: "suggestion", cost: 1.5,
    reason: "Ready.gov: several days' supply of food. We scale it to your plan length.",
    sources: ["rg-pets", "rg-kit"],
  },
  {
    id: "pet-water", bucket: "family", name: "Water and a bowl for pets",
    unit: u("pet-day"), qty: { kind: "daily", subject: "pets", n: 1 }, needs: "pet",
    priority: "essential", basis: "suggestion", cost: 0.3,
    reason: "Ready.gov: a water bowl and several days' supply of water. Ready.gov gives no amount per pet, so ask your vet.",
    sources: ["rg-pets"],
  },
  {
    id: "pet-carrier", bucket: "family", name: "Carrier or crate, collar with ID tag and leash",
    unit: u("pet kit"), qty: { kind: "each", subject: "pets", n: 1 }, needs: "pet",
    priority: "next", basis: "suggestion", cost: 30, raise: { evacuation: "essential" },
    reason: "Ready.gov lists a collar with ID tag, a leash, and a sturdy carrier, ideally one for each pet.",
    sources: ["rg-pets"],
  },
  {
    id: "pet-sanitation", bucket: "family", name: "Litter, waste bags and paper towels",
    unit: u("set"), qty: { kind: "fixed", n: 1 }, needs: "pet",
    priority: "next", basis: "suggestion", cost: 10,
    reason: "Ready.gov lists litter and litter box where it applies, paper towels and trash bags.",
    sources: ["rg-pets"],
  },
  {
    id: "pet-extras", bucket: "family", name: "Extra regular medicine for pets, and a photo of you with your pet",
    unit: u("task"), qty: { kind: "none" }, needs: "pet",
    priority: "next", basis: "none",
    reason: "Ready.gov lists an extra supply of the medicine your pet takes, and a picture of you with your pet for identification if you are separated. Ask your vet about pet first-aid items.",
    sources: ["rg-pets"],
  },
  {
    id: "insurance-copies", bucket: "family", name: "Copies of Medicare, Medicaid and other insurance cards",
    unit: u("task"), qty: { kind: "none" }, needs: "olderAdult",
    priority: "next", basis: "none",
    reason: "Ready.gov's older-adults guide suggests copies of Medicaid, Medicare and other insurance cards.",
    sources: ["rg-older", "rg-disability"],
  },
  {
    id: "support-network", bucket: "family", name: "Ask a few people to be your support network",
    unit: u("task"), qty: { kind: "none" }, needs: "olderAdult",
    priority: "next", basis: "none",
    reason: "Ready.gov: a network of family, friends and others who can help, with at least one holding a spare key and knowing where your supplies are.",
    sources: ["rg-older"],
  },
  {
    id: "evac-transport", bucket: "family", name: "Plan how you would get transportation if you need help leaving",
    unit: u("task"), qty: { kind: "none" }, needs: "olderAdult", scenarioOnly: ["evacuation"],
    priority: "essential", basis: "none",
    reason: "Ready.gov asks older adults to plan transportation and how assistive devices will come with them.",
    sources: ["rg-older"],
  },
  {
    id: "device-plan", bucket: "family", name: "Talk with a provider about a power-outage plan for medical devices and cold medicines",
    unit: u("task"), qty: { kind: "none" }, needs: "electricMedical",
    priority: "essential", basis: "none",
    reason: "Ready.gov: talk to your medical provider about a plan for electric medical devices and refrigerated medicines.",
    sources: ["rg-power", "rg-disability"],
  },
  {
    id: "device-power", bucket: "family", name: "Extra batteries or backup power for medical and assistive devices",
    unit: u("set"), qty: { kind: "fixed", n: 1 }, needs: "electricMedical",
    priority: "essential", basis: "suggestion",
    reason: "Ready.gov lists extra batteries for devices like power wheelchairs, and a list of device styles and serial numbers.",
    sources: ["rg-disability"],
  },
  {
    id: "cold-packs", bucket: "family", name: "Chemical cold packs for temperature-sensitive medicine",
    unit: u("pack"), qty: { kind: "fixed", n: 1 }, needs: "electricMedical",
    priority: "next", basis: "suggestion", cost: 10,
    reason: "Ready.gov lists chemical ice packs for medicines that need to stay cool. Check with the prescriber.",
    sources: ["rg-disability"],
  },
  {
    id: "mobility-backups", bucket: "family", name: "Backup mobility aids and repair supplies",
    unit: u("set"), qty: { kind: "fixed", n: 1 }, needs: "mobility",
    priority: "next", basis: "suggestion",
    reason: "Ready.gov lists items such as an extra cane or walker, a lightweight manual wheelchair as backup, a tire patch kit and a portable air pump.",
    sources: ["rg-disability"],
  },
  {
    id: "sense-backups", bucket: "family", name: "Spare glasses, contact lens solution and hearing-aid batteries",
    unit: u("set"), qty: { kind: "fixed", n: 1 }, needs: "senseComm",
    priority: "next", basis: "suggestion", cost: 15,
    reason: "Ready.gov lists extra eyeglasses, contact lens solution, hearing aids and batteries.",
    sources: ["rg-disability", "rg-kit"],
  },
  {
    id: "comm-aids", bucket: "family", name: "Communication aids: pen and paper, phrase cards, text-display radio",
    unit: u("set"), qty: { kind: "fixed", n: 1 }, needs: "senseComm",
    priority: "next", basis: "suggestion", cost: 5,
    reason: "Ready.gov lists pen and paper for people who are deaf or hard of hearing, laminated phrase cards for speech disabilities, and a weather radio with a text display.",
    sources: ["rg-disability"],
  },
];

// ── Lookups ────────────────────────────────────────────────────────────────

const gearByAsin = new Map<string, GearItem>(
  [...areas.flatMap((a) => a.gear), ...levels.flatMap((l) => l.gear)].map((g) => [g.asin, g]),
);

/** The gear.ts entry for a product, so names stay title-verified in one place. */
export function gearFor(asin: string): GearItem | undefined {
  return gearByAsin.get(asin);
}

export const bucketOrder: BucketId[] = buckets.map((b) => b.id);

export function bucketById(id: BucketId): Bucket {
  const b = buckets.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown bucket ${id}`);
  return b;
}
