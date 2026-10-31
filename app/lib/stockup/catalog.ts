// Stock-up planner catalog — the single source for every suggestion.
//
// Rules for editing:
//  - Amounts are planning rules, not facts. Only items with `source` use an
//    amount a source states (1 gallon of water per person per day, Red Cross
//    and Ready.gov). Everything else is our rule of thumb, and the UI says so.
//  - `asin` must already exist in readiness.ts gear (title-verified there).
//    Never add an ASIN here that readiness.ts does not hold. Items without one
//    open a tagged Amazon search for `q` (or the name), which is honest about
//    being a search, not a chosen product.
//  - No prices, ratings, stock or deals live here.
//  - One item, one id. Reuse an item across occasions with `occ`; never add a
//    second copy of the same thing.

import { areas, levels } from "../readiness";
import type { GearItem } from "../gear";
import { extra } from "./data/index";
import type { CatalogItem, CategoryId, Occasion, OccasionId, Per, Priority, Unit } from "./types";

export const occasions: Occasion[] = [
  { id: "home", emoji: "🏠", label: "Household stock-up", hint: "Everyday supplies for a month or more at home.", days: 30, nights: 30, meals: 3, name: "Household stock-up", group: "Everyday" },
  { id: "emergency", emoji: "🔦", label: "Emergency kit", hint: "Storms, outages, water problems or leaving in a hurry.", days: 14, nights: 14, meals: 3, name: "Emergency supplies", group: "Weather and emergencies" },
  { id: "camping", emoji: "⛺", label: "Camping", hint: "Tents, campfire meals and nights outside.", days: 3, nights: 2, meals: 3, name: "Weekend camping", group: "Events and trips" },
  { id: "sleepover", emoji: "🛌", label: "Sleepover", hint: "Snacks, breakfast and somewhere for everyone to sleep.", days: 2, nights: 1, meals: 2, name: "Sleepover", group: "Events and trips" },
  { id: "party", emoji: "🎉", label: "Party or celebration", hint: "Food, drinks, plates and decorations.", days: 1, nights: 0, meals: 1, name: "Birthday party", group: "Events and trips" },
  { id: "roadtrip", emoji: "🚗", label: "Road trip", hint: "Car snacks, comfort and roadside basics.", days: 4, nights: 3, meals: 3, name: "Road trip", group: "Events and trips" },
  { id: "vacation", emoji: "🧳", label: "Trip away", hint: "Packing for hotels, flights and rentals.", days: 7, nights: 6, meals: 3, name: "Vacation", group: "Events and trips" },
  { id: "beach", emoji: "🏖️", label: "Beach or pool day", hint: "Sun, water, shade and snacks.", days: 1, nights: 0, meals: 1, name: "Beach day", group: "Events and trips" },
  { id: "tailgate", emoji: "🏈", label: "Game day or tailgate", hint: "Grill, cooler, chairs and team gear.", days: 1, nights: 0, meals: 1, name: "Game day", group: "Events and trips" },
  { id: "hosting", emoji: "🍽️", label: "Hosting guests", hint: "Holidays and family staying over.", days: 4, nights: 3, meals: 3, name: "Holiday guests", group: "Events and trips" },
  { id: "picnic", emoji: "🧺", label: "Picnic or outing", hint: "A day at the park, a game or a trail.", days: 1, nights: 0, meals: 1, name: "Picnic", group: "Events and trips" },
  { id: "outage", emoji: "🔌", label: "Power outage", hint: "Light, charging and keeping food cold.", days: 3, nights: 3, meals: 3, name: "Power outage kit", group: "Weather and emergencies" },
  { id: "winter", emoji: "❄️", label: "Winter storm", hint: "Snow, ice and cold at home or on the road.", days: 3, nights: 3, meals: 3, name: "Winter storm", implies: ["cold"], group: "Weather and emergencies" },
  { id: "hurricane", emoji: "🌀", label: "Hurricane season", hint: "Wind, rain, outages and maybe leaving.", days: 7, nights: 7, meals: 3, name: "Hurricane season", implies: ["wet"], group: "Weather and emergencies" },
  { id: "heat", emoji: "🌡️", label: "Heat wave", hint: "Staying cool and drinking enough.", days: 5, nights: 5, meals: 3, name: "Heat wave", implies: ["hot"], group: "Weather and emergencies" },
  { id: "wildfire", emoji: "🔥", label: "Wildfire and smoke", hint: "Cleaner indoor air and a bag ready to go.", days: 5, nights: 5, meals: 3, name: "Wildfire season", group: "Weather and emergencies" },
  { id: "flood", emoji: "🌊", label: "Flooding", hint: "Keeping things dry and cleaning up after.", days: 5, nights: 5, meals: 3, name: "Flood prep", implies: ["wet"], group: "Weather and emergencies" },
  { id: "vehicle", emoji: "🚙", label: "Car kit", hint: "What lives in the car all year.", days: 2, nights: 1, meals: 2, name: "Car kit", group: "Everyday" },
  { id: "school", emoji: "🎒", label: "Back to school", hint: "Supplies, lunches and a few spares.", days: 30, nights: 0, meals: 1, name: "Back to school", group: "Everyday" },
  { id: "college", emoji: "🎓", label: "College move-in", hint: "A dorm room or first apartment.", days: 30, nights: 30, meals: 2, name: "College move-in", group: "Life changes" },
  { id: "work", emoji: "💼", label: "Work and commute", hint: "A desk drawer and bag kit.", days: 5, nights: 0, meals: 1, name: "Work kit", group: "Everyday" },
  { id: "moving", emoji: "📦", label: "Moving house", hint: "Packing, moving day and the first night.", days: 3, nights: 2, meals: 3, name: "Moving day", group: "Life changes" },
  { id: "sick", emoji: "🤒", label: "Sick days", hint: "Cold and flu season at home.", days: 7, nights: 7, meals: 3, name: "Sick-day shelf", group: "Everyday" },
  { id: "newbaby", emoji: "👶", label: "New baby", hint: "The first weeks home.", days: 30, nights: 30, meals: 3, name: "New baby", group: "Life changes" },
  { id: "caregiving", emoji: "🤝", label: "Caring for someone", hint: "An older parent or someone recovering at home.", days: 14, nights: 14, meals: 3, name: "Caregiving", group: "Life changes" },
  { id: "petprep", emoji: "🐾", label: "Pet supplies", hint: "Everyday and emergency supplies for pets.", days: 30, nights: 30, meals: 2, name: "Pet supplies", group: "Everyday" },
  { id: "hiking", emoji: "🥾", label: "Day hike", hint: "Water, layers and the basics on the trail.", days: 1, nights: 0, meals: 1, name: "Day hike", group: "Events and trips" },
  { id: "sports", emoji: "⚽", label: "Sports day or tournament", hint: "Sideline gear and snacks for the team.", days: 1, nights: 0, meals: 1, name: "Tournament weekend", group: "Events and trips" },
];

export const categories: { id: CategoryId; emoji: string; title: string }[] = [
  { id: "water", emoji: "💧", title: "Water" },
  { id: "food", emoji: "🥫", title: "Food" },
  { id: "drinks", emoji: "🧃", title: "Drinks" },
  { id: "dining", emoji: "🍽️", title: "Plates, cups and serving" },
  { id: "cooking", emoji: "🍳", title: "Cooking and coolers" },
  { id: "paper", emoji: "🧻", title: "Paper goods and bags" },
  { id: "cleaning", emoji: "🧽", title: "Cleaning and laundry" },
  { id: "toiletries", emoji: "🪥", title: "Toiletries" },
  { id: "health", emoji: "🩹", title: "First aid and medicine" },
  { id: "power", emoji: "🔋", title: "Light and power" },
  { id: "sleep", emoji: "🛏️", title: "Sleeping and shelter" },
  { id: "outdoors", emoji: "🧭", title: "Outdoor gear" },
  { id: "fun", emoji: "🎲", title: "Games and fun" },
  { id: "baby", emoji: "🍼", title: "Baby" },
  { id: "pets", emoji: "🐾", title: "Pets" },
  { id: "party", emoji: "🎈", title: "Party and decorations" },
  { id: "travel", emoji: "🎒", title: "Bags and travel" },
  { id: "safety", emoji: "🧯", title: "Safety and documents" },
  { id: "weather", emoji: "🌦️", title: "Heat, cold and rain" },
  { id: "tools", emoji: "🧰", title: "Tools and home repair" },
  { id: "car", emoji: "🚙", title: "Car and roadside" },
  { id: "school", emoji: "✏️", title: "School and work" },
  { id: "access", emoji: "🦯", title: "Older adults and accessibility" },
  { id: "moving", emoji: "📦", title: "Packing and moving" },
  { id: "tasks", emoji: "✅", title: "Things to do (not to buy)" },
];

const u = (one: string, many: string = `${one}s`): Unit => ({ one, many });

// Occasion groups, so each line stays short.
const ALL: OccasionId[] = occasions.map((o) => o.id);
const PREP: OccasionId[] = ["home", "emergency"];
const OUT: OccasionId[] = ["camping", "beach", "picnic", "tailgate"];
const EAT: OccasionId[] = ["party", "picnic", "tailgate", "hosting", "sleepover", "camping", "beach"];
const GATHER: OccasionId[] = ["party", "tailgate", "hosting", "picnic"];
const AWAY: OccasionId[] = ["camping", "roadtrip", "vacation"];

type Opts = Partial<Pick<CatalogItem, "needs" | "pack" | "note" | "source" | "q" | "id" | "season" | "pro" | "climate">>;

export const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function it(name: string, cat: CategoryId, occ: OccasionId[], per: Per, n: number, unit: Unit, pri: Priority, o: Opts = {}): CatalogItem {
  return { id: o.id ?? slug(name), name, cat, occ, rule: { per, n }, unit, pri, kind: "product", season: "year-round", ...o };
}

const base: CatalogItem[] = [
  // ── Water ────────────────────────────────────────────────────────────────
  it("Drinking and cleaning water", "water", PREP, "personDay", 1, u("gallon"), "essential", {
    id: "water", source: "rg-water", q: "gallon drinking water",
    note: "1 gallon per person per day is the Red Cross and Ready.gov amount. Hot weather, nursing and illness can need more." }),
  it("Bottled water", "water", [...OUT, "party", "roadtrip", "sleepover", "hosting", "vacation", "heat"], "personDay", 3, u("bottle"), "essential", {
    pack: 24, q: "bottled water 16.9 oz 24 pack", note: "Our rule: about three 16.9 oz bottles per person per day out and about." }),
  it("Camp water jug", "water", ["camping", "tailgate"], "group", 1, u("jug"), "useful", {
    q: "camping water jug with spigot", note: "One refillable jug for washing and cooking." }),
  it("Water storage container", "water", PREP, "group", 2, u("container"), "useful", {
    note: "For filling your own water. Two 7-gallon containers hold about 14 gallons." }),
  it("55-gallon water barrel", "water", ["emergency"], "group", 1, u("barrel"), "extra", {
    note: "For long plans with space to store it." }),
  it("Personal water filter", "water", ["emergency", "camping"], "person", 0.25, u("filter"), "useful", {
    note: "Our rule: one backup filter per four people. Check what a filter removes before relying on it." }),
  it("Gravity water filter", "water", ["emergency", "camping"], "group", 1, u("filter"), "extra"),
  it("Water purification tablets", "water", ["emergency", "camping"], "group", 1, u("pack"), "useful", {
    note: "CDC lists tablets and bleach for making water safe. Follow the label." }),
  it("Unscented household bleach", "water", PREP, "group", 1, u("bottle"), "useful", {
    q: "unscented bleach", note: "For cleaning, and for making water safe using CDC's amounts." }),
  it("Reusable water bottles", "water", [...AWAY, "beach", "picnic"], "person", 1, u("bottle"), "useful", { q: "reusable water bottle" }),
  it("Collapsible water bowl or cup", "water", ["camping"], "person", 1, u("cup"), "extra", { q: "collapsible silicone cup" }),

  // ── Food ─────────────────────────────────────────────────────────────────
  it("Non-perishable food", "food", PREP, "personDay", 1, u("person-day"), "essential", {
    id: "shelf-food", q: "non perishable food", note: "One person-day is a day of food for one person. Pick food your household already eats." }),
  it("3-day emergency food supply", "food", ["emergency"], "person", 1, u("kit"), "useful", { note: "A ready-made option; one kit per person." }),
  it("30-day food supply", "food", ["emergency"], "person", 1, u("kit"), "extra"),
  it("Canned soups and stews", "food", ["home", "emergency", "camping"], "personDay", 0.5, u("can"), "useful", { note: "Our rule: half a can per person per day." }),
  it("Canned vegetables", "food", PREP, "personDay", 0.5, u("can"), "useful"),
  it("Canned fruit", "food", PREP, "personDay", 0.3, u("can"), "useful"),
  it("Canned tuna or chicken", "food", ["home", "emergency", "camping"], "personDay", 0.3, u("can"), "useful"),
  it("Canned beans", "food", PREP, "personDay", 0.3, u("can"), "useful"),
  it("Peanut butter", "food", ["home", "emergency", "camping", "roadtrip"], "personDay", 0.07, u("jar"), "useful", { note: "Our rule: one jar per person every two weeks." }),
  it("Rice", "food", ["home"], "personDay", 0.1, u("pound"), "useful", { q: "long grain rice bag" }),
  it("Pasta", "food", ["home", "hosting"], "personDay", 0.1, u("box", "boxes"), "useful"),
  it("Pasta sauce", "food", ["home", "hosting"], "personDay", 0.07, u("jar"), "extra"),
  it("Oatmeal", "food", ["home", "emergency", "camping"], "personDay", 0.1, u("canister"), "useful", { q: "oatmeal canister" }),
  it("Breakfast cereal", "food", ["home", "sleepover", "hosting", "vacation"], "personDay", 0.07, u("box", "boxes"), "useful", { note: "Our rule: a box serves about 14 bowls." }),
  it("Pancake mix", "food", ["sleepover", "camping", "hosting"], "personMeal", 0.05, u("box", "boxes"), "useful", { note: "Our rule: one box per 20 servings." }),
  it("Syrup", "food", ["sleepover", "camping", "hosting"], "group", 1, u("bottle"), "extra"),
  it("Bread or buns", "food", ["home", "camping", "picnic", "tailgate", "hosting", "party"], "personDay", 0.2, u("loaf", "loaves"), "useful"),
  it("Hot dogs", "food", ["camping", "tailgate", "party", "beach"], "person", 2, u("hot dog"), "useful", { pack: 8, note: "Our rule: two per person for a cookout." }),
  it("Hot dog buns", "food", ["camping", "tailgate", "party", "beach"], "person", 2, u("bun"), "useful", { pack: 8 }),
  it("Burger patties", "food", ["tailgate", "party", "camping"], "person", 1.5, u("patty", "patties"), "useful", { note: "Our rule: one and a half per person." }),
  it("Hamburger buns", "food", ["tailgate", "party", "camping"], "person", 1.5, u("bun"), "useful", { pack: 8 }),
  it("Sliced cheese", "food", ["tailgate", "party", "picnic", "camping"], "person", 2, u("slice"), "extra", { pack: 24 }),
  it("Sandwich meat", "food", ["picnic", "roadtrip", "beach", "camping"], "person", 0.25, u("pound"), "useful", { q: "deli lunch meat" }),
  it("Pizza", "food", ["party", "sleepover"], "person", 0.4, u("pizza"), "useful", { q: "frozen pizza", note: "Our rule: about 3 slices each, 8 slices a pizza. Kids often eat less." }),
  it("Chips", "food", [...EAT, "roadtrip"], "person", 0.15, u("bag"), "useful", { q: "chips variety pack", note: "Our rule: a family-size bag feeds about 6–7." }),
  it("Pretzels and crackers", "food", ["roadtrip", "picnic", "home", "emergency", "sleepover"], "personDay", 0.1, u("box", "boxes"), "useful"),
  it("Granola or protein bars", "food", ["roadtrip", "camping", "emergency", "vacation", "beach", "picnic"], "personDay", 2, u("bar"), "useful", { pack: 12 }),
  it("Trail mix", "food", ["camping", "roadtrip", "picnic"], "personDay", 0.15, u("bag"), "useful"),
  it("Jerky", "food", ["camping", "roadtrip", "emergency"], "personDay", 0.2, u("bag"), "extra"),
  it("Dried fruit", "food", ["camping", "roadtrip", "emergency"], "personDay", 0.15, u("bag"), "extra"),
  it("Fresh fruit", "food", ["picnic", "beach", "sleepover", "hosting", "party"], "personDay", 2, u("piece"), "useful", { q: "fruit" }),
  it("Veggie tray", "food", ["party", "tailgate", "hosting"], "person", 0.08, u("tray"), "extra", { note: "Our rule: a large tray serves about 12." }),
  it("Fruit snacks", "food", ["sleepover", "roadtrip", "picnic", "beach"], "kidDay", 2, u("pouch", "pouches"), "useful", { needs: "kids", pack: 40 }),
  it("Juice boxes", "drinks", ["sleepover", "picnic", "party", "beach", "roadtrip"], "kidDay", 2, u("juice box", "juice boxes"), "useful", { needs: "kids", pack: 32 }),
  it("Popcorn", "food", ["sleepover", "hosting", "home"], "person", 1, u("bag"), "useful", { q: "microwave popcorn", note: "One microwave bag each for a movie night." }),
  it("Candy", "food", ["sleepover", "party", "roadtrip"], "person", 0.1, u("bag"), "extra"),
  it("Cookies", "food", ["sleepover", "party", "picnic", "hosting"], "person", 0.15, u("package"), "extra"),
  it("Birthday cake or cupcakes", "food", ["party"], "person", 1, u("serving"), "useful", { note: "One serving each. Bakery cakes list servings on the box." }),
  it("Ice cream", "food", ["party", "sleepover"], "person", 0.12, u("tub"), "extra", { note: "Our rule: a 1.5-quart tub serves about 8." }),
  it("S'mores supplies", "food", ["camping", "sleepover"], "person", 2, u("s'more"), "useful", { q: "smores kit", note: "Two each: crackers, chocolate and marshmallows." }),
  it("Marshmallow roasting sticks", "food", ["camping"], "person", 1, u("stick"), "useful"),
  it("Breakfast eggs", "food", ["camping", "sleepover", "hosting"], "personMeal", 0.5, u("egg"), "extra", { pack: 12 }),
  it("Bacon or sausage", "food", ["camping", "hosting", "sleepover"], "person", 0.2, u("package"), "extra"),
  it("Side dishes", "food", ["hosting", "party", "picnic"], "person", 2, u("serving"), "useful"),
  it("Dips and salsa", "food", ["party", "tailgate", "hosting"], "person", 0.1, u("jar"), "extra"),
  it("Condiments", "food", ["tailgate", "party", "camping", "picnic"], "group", 1, u("set"), "useful", { q: "condiment squeeze bottles", note: "Ketchup, mustard and relish." }),
  it("Salt, pepper and spices", "food", ["camping", "vacation"], "group", 1, u("set"), "extra", { q: "camping spice kit" }),
  it("Cooking oil", "food", ["camping", "home"], "group", 1, u("bottle"), "extra"),
  it("Baby food and formula", "baby", ["home", "emergency", "roadtrip", "vacation", "hosting"], "babyDay", 1, u("day's supply", "days' supply"), "essential", {
    needs: "babies", q: "baby formula", note: "One day's supply per baby per day. Use what your baby already eats." }),
  it("Pet food", "pets", ["home", "emergency", "roadtrip", "vacation", "camping"], "petDay", 1, u("day's portion", "days' portions"), "essential", {
    needs: "pets", q: "dog food", note: "One day's portion per pet per day. Ready.gov says to plan food and water for pets too." }),

  // ── Drinks ───────────────────────────────────────────────────────────────
  it("Soda or sparkling water", "drinks", [...GATHER, "sleepover", "beach"], "person", 2, u("can"), "useful", { pack: 12, q: "sparkling water variety pack", note: "Our rule: two cans each for a few hours." }),
  it("Sports drinks", "drinks", ["tailgate", "beach", "camping", "picnic", "heat"], "personDay", 1, u("bottle"), "extra", { pack: 12 }),
  it("Lemonade or iced tea", "drinks", ["picnic", "party", "beach"], "person", 0.15, u("gallon"), "extra"),
  it("Coffee", "drinks", ["home", "camping", "hosting", "vacation"], "personDay", 0.04, u("bag"), "useful", { q: "ground coffee", note: "Our rule: a 12-ounce bag covers about 25 person-days." }),
  it("Instant coffee or tea", "drinks", ["emergency", "camping"], "adult", 1, u("pack"), "extra"),
  it("Hot cocoa", "drinks", ["sleepover", "camping", "hosting"], "person", 1, u("packet"), "extra", { pack: 12 }),
  it("Milk", "drinks", ["sleepover", "hosting", "home"], "personDay", 0.15, u("gallon"), "useful", { q: "shelf stable milk" }),
  it("Shelf-stable milk", "drinks", ["emergency"], "personDay", 0.25, u("carton"), "extra", { q: "shelf stable milk boxes" }),
  it("Ice", "drinks", [...OUT, "party", "roadtrip", "hosting", "heat"], "personDay", 1, u("pound"), "useful", { q: "bagged ice", note: "Our rule: about a pound per person per day for drinks; more if the cooler holds food." }),

  // ── Plates, cups and serving ─────────────────────────────────────────────
  it("Paper plates", "dining", [...EAT, "emergency"], "personMeal", 1.5, u("plate"), "essential", { pack: 100, note: "Our rule: one and a half per person per meal; people grab seconds." }),
  it("Dessert plates", "dining", ["party", "hosting"], "person", 1, u("plate"), "useful", { pack: 50, q: "paper dessert plates" }),
  it("Cups", "dining", [...EAT, "emergency"], "personMeal", 2, u("cup"), "essential", { pack: 50, q: "disposable cups" }),
  it("Hot cups with lids", "dining", ["camping", "hosting", "tailgate"], "personDay", 1, u("cup"), "extra", { pack: 50 }),
  it("Plastic utensils", "dining", [...EAT, "emergency"], "personMeal", 1.5, u("set"), "essential", { pack: 100, q: "disposable cutlery set" }),
  it("Napkins", "dining", [...EAT, "roadtrip"], "personMeal", 3, u("napkin"), "essential", { pack: 250 }),
  it("Bowls", "dining", ["camping", "sleepover", "hosting", "party"], "personMeal", 0.5, u("bowl"), "useful", { pack: 50, q: "disposable bowls" }),
  it("Tablecloths", "dining", ["party", "picnic", "tailgate", "hosting"], "group", 2, u("tablecloth"), "useful", { q: "disposable tablecloths" }),
  it("Serving bowls and platters", "dining", ["party", "hosting", "tailgate"], "group", 4, u("piece"), "extra", { q: "disposable serving trays" }),
  it("Serving utensils", "dining", ["party", "hosting", "tailgate", "picnic"], "group", 1, u("set"), "useful", { q: "serving utensils set" }),
  it("Drink dispenser", "dining", ["party", "picnic", "hosting"], "group", 1, u("dispenser"), "extra", { q: "drink dispenser" }),
  it("Reusable camp dishes", "dining", ["camping"], "person", 1, u("set"), "extra", { q: "camping dish set", note: "Cuts trash on longer trips." }),
  it("Picnic blanket", "dining", ["picnic", "beach"], "person", 0.25, u("blanket"), "useful", { q: "waterproof picnic blanket", note: "Our rule: one blanket seats about four." }),

  // ── Cooking and coolers ──────────────────────────────────────────────────
  it("Cooler", "cooking", [...OUT, "roadtrip", "party", "heat"], "person", 0.15, u("cooler"), "essential", { q: "large cooler", note: "Our rule: one large cooler for every six or seven people." }),
  it("Ice packs", "cooking", [...OUT, "roadtrip"], "group", 4, u("pack"), "useful", { q: "reusable ice packs for cooler" }),
  it("Manual can opener", "cooking", [...PREP, "camping"], "group", 1, u("can opener"), "essential", { note: "Ready.gov puts one in the basic kit." }),
  it("Camp stove", "cooking", ["camping", "emergency"], "group", 1, u("stove"), "useful", { q: "camping stove propane", note: "Use outdoors only. Never cook with fuel indoors." }),
  it("Propane canisters", "cooking", ["camping", "tailgate", "emergency"], "group", 2, u("canister"), "useful", { q: "1 lb propane cylinder" }),
  it("Portable grill", "cooking", ["tailgate", "camping", "beach"], "group", 1, u("grill"), "useful", { q: "portable grill" }),
  it("Charcoal", "cooking", ["tailgate", "picnic", "camping"], "group", 1, u("bag"), "extra"),
  it("Lighter or matches", "cooking", [...PREP, "camping", "tailgate"], "group", 2, u("lighter"), "essential", { q: "waterproof matches", note: "Keep them dry. Ready.gov lists waterproof matches." }),
  it("Grill tools", "cooking", ["tailgate", "camping"], "group", 1, u("set"), "useful", { q: "grill tool set" }),
  it("Camp cookware set", "cooking", ["camping"], "group", 1, u("set"), "useful", { q: "camping cookware set" }),
  it("Cast iron skillet", "cooking", ["camping"], "group", 1, u("skillet"), "extra"),
  it("Aluminum foil", "cooking", ["camping", "tailgate", "party", "hosting", "home"], "group", 1, u("roll"), "useful", { q: "heavy duty aluminum foil" }),
  it("Food storage bags", "cooking", ["camping", "picnic", "roadtrip", "home", "hosting"], "group", 1, u("box", "boxes"), "useful", { q: "zipper food storage bags" }),
  it("Food containers", "cooking", ["hosting", "party", "home"], "group", 1, u("set"), "extra", { q: "food storage containers set", note: "For leftovers to send home." }),
  it("Cutting board and knife", "cooking", ["camping", "picnic", "vacation"], "group", 1, u("set"), "useful", { q: "camping cutting board knife" }),
  it("Insulated food carrier", "cooking", ["party", "hosting", "tailgate"], "group", 1, u("carrier"), "extra", { q: "insulated casserole carrier" }),
  it("Slow cooker liners", "cooking", ["party", "hosting", "tailgate"], "group", 1, u("pack"), "extra"),
  it("Roasting pans", "cooking", ["hosting"], "group", 2, u("pan"), "extra", { q: "disposable roasting pan" }),
  it("Coffee maker for camp", "cooking", ["camping"], "group", 1, u("maker"), "extra", { q: "camping percolator coffee pot" }),
  it("Food thermometer", "cooking", ["tailgate", "camping", "hosting", "emergency"], "group", 1, u("thermometer"), "useful", { q: "instant read meat thermometer" }),
  it("Fridge and freezer thermometers", "cooking", ["emergency"], "group", 2, u("thermometer"), "useful", { note: "Ready.gov: check food temperatures after an outage." }),

  // ── Paper goods and bags ─────────────────────────────────────────────────
  it("Toilet paper", "paper", ["home", "emergency", "camping", "hosting", "vacation"], "personDay", 0.4, u("roll"), "essential", { pack: 12, note: "Our rule: about 3 rolls per person per week." }),
  it("Paper towels", "paper", [...ALL], "personDay", 0.05, u("roll"), "essential", { pack: 6, note: "Our rule: about a roll per person every three weeks; more for cookouts." }),
  it("Facial tissues", "paper", ["home", "hosting", "roadtrip", "emergency"], "personDay", 0.03, u("box", "boxes"), "useful"),
  it("Trash bags", "paper", ALL, "personDay", 0.5, u("bag"), "essential", { pack: 50, q: "heavy duty trash bags", note: "Our rule: half a bag per person per day; at least one per day." }),
  it("Recycling bags", "paper", ["party", "tailgate", "hosting"], "group", 1, u("box", "boxes"), "extra", { q: "clear recycling bags" }),
  it("Zip-top bags", "paper", ["home", "emergency", "vacation", "camping"], "group", 1, u("box", "boxes"), "useful", { q: "gallon zipper bags", note: "Keep papers and phones dry." }),
  it("Wet wipes", "paper", [...EAT, "roadtrip", "emergency"], "personDay", 5, u("wipe"), "useful", { pack: 80, note: "Ready.gov lists moist towelettes." }),
  it("Plastic grocery or tote bags", "paper", ["roadtrip", "beach", "picnic"], "group", 4, u("bag"), "extra", { q: "reusable tote bags" }),

  // ── Cleaning and laundry ─────────────────────────────────────────────────
  it("Dish soap", "cleaning", ["home", "camping", "hosting"], "group", 1, u("bottle"), "useful", { q: "biodegradable camp soap" }),
  it("Laundry detergent", "cleaning", ["home", "vacation", "hosting"], "personDay", 0.01, u("container"), "useful", { note: "Our rule: a large container lasts one person about 100 days." }),
  it("Disinfecting wipes", "cleaning", ["home", "emergency", "party", "hosting", "roadtrip"], "group", 1, u("canister"), "useful"),
  it("All-purpose cleaner", "cleaning", ["home", "hosting"], "group", 1, u("bottle"), "useful"),
  it("Sponges", "cleaning", ["home", "camping", "hosting"], "group", 1, u("pack"), "useful"),
  it("Dishwasher detergent", "cleaning", ["home", "hosting"], "personDay", 0.25, u("pod"), "extra", { pack: 40, note: "Our rule: about one load a day for four people." }),
  it("Rubber gloves", "cleaning", ["emergency", "home", "party"], "group", 1, u("box", "boxes"), "useful", { q: "disposable gloves" }),
  it("Collapsible wash basin", "cleaning", ["camping"], "group", 1, u("basin"), "extra", { q: "collapsible sink camping" }),
  it("Stain remover", "cleaning", ["party", "hosting", "vacation"], "group", 1, u("bottle"), "extra", { q: "stain remover pen" }),
  it("Lint roller", "cleaning", ["vacation", "hosting"], "group", 1, u("roller"), "extra"),
  it("Travel laundry bag", "cleaning", ["vacation", "camping", "roadtrip"], "person", 1, u("bag"), "extra"),

  // ── Toiletries ───────────────────────────────────────────────────────────
  it("Toothbrushes", "toiletries", ["sleepover", "hosting", "vacation", "camping", "emergency"], "person", 1, u("toothbrush", "toothbrushes"), "useful", { note: "Spares for guests who forget theirs." }),
  it("Toothpaste", "toiletries", ["home", "emergency", "vacation", "camping"], "personDay", 0.02, u("tube"), "useful", { note: "Our rule: a tube lasts one person about 7 weeks." }),
  it("Hand soap", "toiletries", ["home", "emergency", "hosting"], "personDay", 0.02, u("bottle"), "useful"),
  it("Hand sanitizer", "toiletries", [...OUT, "emergency", "roadtrip", "vacation", "party", "heat"], "group", 2, u("bottle"), "essential"),
  it("Shampoo and body wash", "toiletries", ["home", "vacation", "camping", "hosting"], "personDay", 0.03, u("bottle"), "useful", { q: "travel size shampoo body wash" }),
  it("Deodorant", "toiletries", ["home", "vacation", "camping"], "adult", 1, u("stick"), "useful"),
  it("Feminine hygiene supplies", "toiletries", PREP.concat(["vacation", "camping"]), "adult", 1, u("box", "boxes"), "useful", { q: "pads tampons", note: "Ready.gov lists feminine supplies." }),
  it("Guest towels", "toiletries", ["hosting", "sleepover"], "person", 1, u("towel"), "useful", { q: "bath towels set" }),
  it("Travel toiletry kit", "toiletries", ["vacation", "roadtrip"], "person", 1, u("kit"), "useful", { q: "travel toiletry bottles tsa" }),
  it("Lip balm with SPF", "toiletries", ["beach", "camping", "vacation"], "person", 1, u("tube"), "extra"),
  it("Contact lens supplies or spare glasses", "toiletries", ["emergency", "vacation", "camping"], "group", 1, u("set"), "useful", { q: "contact lens case travel", note: "Ready.gov lists glasses and contact lens solution." }),

  // ── First aid and medicine ───────────────────────────────────────────────
  it("First aid kit", "health", ALL, "group", 1, u("kit"), "essential"),
  it("Prescription medicines", "health", ["emergency", "vacation", "camping", "roadtrip"], "person", 1, u("one-week supply", "one-week supplies"), "essential", {
    id: "meds", source: "rc-kit", q: "weekly pill organizer", note: "Red Cross: a 7-day supply. Ask your prescriber or pharmacy what is possible." }),
  it("Pain and fever reliever", "health", ["home", "emergency", "vacation", "camping", "hosting"], "group", 1, u("bottle"), "useful", { q: "pain reliever" }),
  it("Children's pain and fever reliever", "health", ["home", "emergency", "vacation", "sleepover"], "group", 1, u("bottle"), "useful", { needs: "kids", q: "children's fever reducer" }),
  it("Allergy medicine", "health", ["home", "vacation", "camping", "picnic", "emergency"], "group", 1, u("box", "boxes"), "useful"),
  it("Adhesive bandages", "health", [...OUT, "home", "sleepover", "vacation"], "group", 1, u("box", "boxes"), "useful", { q: "assorted bandages" }),
  it("Sunscreen", "health", ["beach", "camping", "picnic", "tailgate", "vacation", "heat"], "personDay", 0.25, u("bottle"), "essential", { note: "Our rule: an 8 oz bottle lasts about four person-days with reapplying." }),
  it("Aloe after-sun gel", "health", ["beach", "vacation"], "group", 1, u("bottle"), "extra"),
  it("Bug spray", "health", ["camping", "picnic", "tailgate", "beach"], "person", 0.25, u("can"), "useful", { q: "insect repellent", note: "Our rule: one can for about four people." }),
  it("Anti-itch cream", "health", ["camping", "picnic"], "group", 1, u("tube"), "extra"),
  it("Thermometer", "health", PREP, "group", 1, u("thermometer"), "useful", { q: "digital thermometer" }),
  it("Tweezers and tick remover", "health", ["camping", "picnic"], "group", 1, u("set"), "useful", { q: "tick remover tool" }),
  it("Motion sickness relief", "health", ["roadtrip", "vacation"], "group", 1, u("box", "boxes"), "extra", { q: "motion sickness bands" }),
  it("Antacids", "health", ["vacation", "hosting", "roadtrip"], "group", 1, u("bottle"), "extra"),
  it("Masks", "health", ["emergency", "wildfire", "sick"], "person", 2, u("mask"), "useful", { q: "n95 masks", note: "Ready.gov lists masks to filter contaminated air. EPA says a well-fitted N95 can reduce wildfire smoke; kids need their own sizes.", pro: true }),
  it("Instant cold packs", "health", ["tailgate", "camping", "beach"], "group", 2, u("pack"), "extra"),
  it("First aid manual", "health", ["emergency"], "group", 1, u("book"), "extra"),
  it("Pill organizer", "health", ["vacation", "roadtrip"], "group", 1, u("organizer"), "extra", { q: "weekly pill organizer travel" }),

  // ── Light and power ──────────────────────────────────────────────────────
  it("Flashlights", "power", [...PREP, "camping", "roadtrip"], "person", 1, u("flashlight"), "essential", { q: "led flashlight", note: "One per person, so nobody is left in the dark." }),
  it("Headlamps", "power", ["camping", "emergency", "sleepover"], "person", 1, u("headlamp"), "useful", { pack: 2 }),
  it("Lantern", "power", ["camping", "emergency", "home"], "group", 2, u("lantern"), "useful", { q: "led camping lantern" }),
  it("Batteries", "power", [...PREP, "camping"], "person", 4, u("battery", "batteries"), "essential", { q: "aa batteries", note: "Check sizes for your lights and radio." }),
  it("Power bank", "power", ["emergency", "camping", "roadtrip", "vacation", "tailgate", "beach", "heat"], "adult", 1, u("power bank"), "useful"),
  it("Car phone charger", "power", ["roadtrip", "emergency"], "group", 2, u("charger"), "useful", { q: "usb c car charger" }),
  it("Charging cables", "power", ["vacation", "roadtrip", "camping", "sleepover"], "group", 2, u("cable"), "useful", { q: "usb c charging cable" }),
  it("Power strip", "power", ["vacation", "hosting", "sleepover"], "group", 1, u("strip"), "extra", { q: "travel power strip" }),
  it("Travel plug adapter", "power", ["vacation"], "group", 1, u("adapter"), "extra", { q: "universal travel adapter", note: "Only for trips abroad." }),
  it("Portable power station", "power", ["emergency", "camping"], "group", 1, u("station"), "extra"),
  it("Generator", "power", ["emergency"], "group", 1, u("generator"), "extra", { note: "Outdoors only, far from windows. Ready.gov warns about carbon monoxide." }),
  it("Battery string lights", "power", ["camping", "party", "sleepover"], "group", 1, u("string"), "extra", { q: "battery string lights" }),
  it("Glow sticks", "power", ["sleepover", "camping", "party"], "kid", 3, u("glow stick"), "extra", { needs: "kids", pack: 100 }),
  it("Night light", "power", ["sleepover", "hosting"], "group", 1, u("night light"), "extra", { q: "plug in night light" }),

  // ── Sleeping and shelter ─────────────────────────────────────────────────
  it("Tent", "sleep", ["camping"], "person", 0.25, u("tent"), "essential", { q: "4 person tent", note: "Our rule: one 4-person tent per four people." }),
  it("Sleeping bags", "sleep", ["camping", "sleepover", "emergency"], "person", 1, u("sleeping bag"), "essential", { note: "Check the temperature rating for your nights." }),
  it("Sleeping pads", "sleep", ["camping"], "person", 1, u("pad"), "useful", { q: "camping sleeping pad" }),
  it("Air mattress", "sleep", ["hosting", "sleepover"], "person", 0.25, u("mattress", "mattresses"), "useful", { q: "queen air mattress", note: "Our rule: one queen mattress for two guests. Skip if you have beds." }),
  it("Pillows", "sleep", ["camping", "sleepover", "hosting"], "person", 1, u("pillow"), "useful", { q: "camping pillow" }),
  it("Extra blankets", "sleep", ["hosting", "sleepover", "emergency", "camping"], "person", 1, u("blanket"), "useful", { q: "fleece blanket" }),
  it("Guest sheets", "sleep", ["hosting"], "person", 0.5, u("set"), "extra", { q: "sheet set" }),
  it("Emergency blankets", "sleep", ["emergency", "roadtrip", "camping"], "person", 1, u("blanket"), "useful", { pack: 4 }),
  it("Hand warmers", "sleep", ["emergency", "camping", "tailgate"], "personDay", 1, u("pair"), "extra", { pack: 10 }),
  it("Tarp", "sleep", ["camping", "emergency"], "group", 1, u("tarp"), "useful", { q: "waterproof tarp" }),
  it("Rain ponchos", "sleep", ["camping", "tailgate", "emergency", "picnic", "vacation"], "person", 1, u("poncho"), "useful"),
  it("Warm layers", "sleep", ["camping", "emergency", "tailgate"], "person", 1, u("layer"), "useful", { q: "fleece jacket", note: "Ready.gov lists a change of clothes and warm layers." }),
  it("Sleep masks and earplugs", "sleep", ["vacation", "camping", "hosting"], "person", 1, u("set"), "extra", { q: "sleep mask earplugs" }),
  it("Shade canopy", "sleep", ["tailgate", "beach", "picnic", "camping"], "person", 0.1, u("canopy", "canopies"), "useful", { q: "10x10 pop up canopy", note: "Our rule: a 10×10 canopy shades about ten." }),
  it("Beach umbrella", "sleep", ["beach"], "person", 0.25, u("umbrella"), "useful"),

  // ── Outdoor gear ─────────────────────────────────────────────────────────
  it("Camp chairs", "outdoors", ["camping", "tailgate", "beach", "picnic"], "person", 1, u("chair"), "useful", { q: "folding camp chair" }),
  it("Folding table", "outdoors", ["camping", "tailgate", "party", "picnic", "hosting"], "person", 0.12, u("table"), "useful", { note: "Our rule: one 6-foot table per eight people." }),
  it("Firewood", "outdoors", ["camping"], "personNight", 0.5, u("bundle"), "useful", { note: "Buy it where you burn it; many parks ban outside firewood." }),
  it("Fire starters", "outdoors", ["camping"], "group", 1, u("pack"), "useful"),
  it("Multi-tool", "outdoors", ["camping", "emergency", "roadtrip"], "group", 1, u("multi-tool"), "useful", { note: "Ready.gov lists a wrench or pliers to turn off utilities." }),
  it("Hatchet or camp saw", "outdoors", ["camping"], "group", 1, u("tool"), "extra", { q: "folding camp saw" }),
  it("Rope or paracord", "outdoors", ["camping", "emergency"], "group", 1, u("bundle"), "extra", { q: "paracord" }),
  it("Duct tape", "outdoors", ["camping", "emergency", "roadtrip"], "group", 1, u("roll"), "useful", { note: "Ready.gov lists plastic sheeting and duct tape." }),
  it("Plastic sheeting", "outdoors", ["emergency"], "group", 1, u("roll"), "extra"),
  it("Whistle", "outdoors", ["camping", "emergency"], "person", 1, u("whistle"), "useful", { q: "safety whistle", note: "Ready.gov lists a whistle to signal for help." }),
  it("Compass and paper map", "outdoors", ["camping", "emergency", "roadtrip"], "group", 1, u("set"), "extra", { q: "compass", note: "Phones lose signal and charge." }),
  it("Day packs", "outdoors", ["camping", "vacation", "picnic"], "person", 1, u("pack"), "extra", { q: "daypack" }),
  it("Hiking socks", "outdoors", ["camping"], "personDay", 1, u("pair"), "extra", { pack: 3 }),
  it("Wagon", "outdoors", ["beach", "tailgate", "picnic", "camping"], "group", 1, u("wagon"), "extra", { q: "collapsible wagon" }),
  it("Beach towels", "outdoors", ["beach", "camping", "vacation"], "person", 1, u("towel"), "essential"),
  it("Sunglasses", "outdoors", ["beach", "vacation", "roadtrip"], "person", 1, u("pair"), "extra"),
  it("Hats", "outdoors", ["beach", "camping", "tailgate", "picnic", "heat"], "person", 1, u("hat"), "useful", { q: "sun hat" }),
  it("Water shoes", "outdoors", ["beach", "camping"], "person", 1, u("pair"), "extra"),
  it("Swim goggles", "outdoors", ["beach", "vacation"], "kid", 1, u("pair"), "extra", { needs: "kids" }),
  it("Life jackets", "outdoors", ["beach", "camping"], "kid", 1, u("life jacket"), "useful", { needs: "kids", q: "kids life jacket coast guard approved", note: "Pick a Coast Guard–approved jacket that fits each child's weight." }),
  it("Dry bag", "outdoors", ["beach", "camping"], "group", 1, u("bag"), "extra", { q: "waterproof dry bag" }),
  it("Phone waterproof pouch", "outdoors", ["beach", "vacation"], "adult", 1, u("pouch", "pouches"), "extra", { q: "waterproof phone pouch" }),
  it("Binoculars", "outdoors", ["camping", "tailgate"], "group", 1, u("pair"), "extra"),

  // ── Games and fun ────────────────────────────────────────────────────────
  it("Board games", "fun", ["sleepover", "hosting", "camping", "vacation", "home"], "group", 2, u("game"), "useful", { q: "family board games" }),
  it("Card games", "fun", ["camping", "roadtrip", "sleepover", "vacation", "picnic", "emergency"], "group", 2, u("deck"), "useful", { q: "card games for family", note: "Ready.gov suggests activities for kids in a kit." }),
  it("Popcorn bowls", "fun", ["sleepover"], "person", 1, u("bowl"), "extra"),
  it("Craft kit", "fun", ["sleepover", "party", "hosting"], "kid", 1, u("kit"), "extra", { needs: "kids", q: "kids craft kit" }),
  it("Coloring books and crayons", "fun", ["roadtrip", "emergency", "hosting", "party"], "kid", 1, u("set"), "useful", { needs: "kids" }),
  it("Travel activity books", "fun", ["roadtrip", "vacation"], "kid", 1, u("book"), "useful", { needs: "kids", q: "kids travel activity book" }),
  it("Headphones for kids", "fun", ["roadtrip", "vacation"], "kid", 1, u("pair"), "extra", { needs: "kids", q: "kids headphones volume limited" }),
  it("Yard games", "fun", ["tailgate", "picnic", "party", "camping"], "group", 1, u("game"), "extra", { q: "cornhole set" }),
  it("Frisbee or ball", "fun", ["beach", "picnic", "camping", "tailgate"], "group", 1, u("set"), "extra", { q: "frisbee" }),
  it("Beach toys", "fun", ["beach"], "kid", 1, u("set"), "useful", { needs: "kids", q: "beach toys set" }),
  it("Pool floats", "fun", ["beach"], "kid", 1, u("float"), "extra", { needs: "kids" }),
  it("Bluetooth speaker", "fun", ["tailgate", "party", "beach", "camping"], "group", 1, u("speaker"), "extra"),
  it("Nail polish and spa kit", "fun", ["sleepover"], "kid", 1, u("kit"), "extra", { needs: "kids", q: "kids spa kit" }),
  it("Team gear", "fun", ["tailgate"], "person", 1, u("item"), "extra", { q: "team fan gear" }),
  it("Books for downtime", "fun", ["vacation", "emergency", "camping", "beach"], "person", 1, u("book"), "extra", { q: "paperback books" }),

  // ── Baby ─────────────────────────────────────────────────────────────────
  it("Diapers", "baby", ALL, "babyDay", 8, u("diaper"), "essential", { needs: "babies", pack: 100, note: "Our rule: about 8 a day for a baby; fewer for toddlers." }),
  it("Baby wipes", "baby", ALL, "babyDay", 20, u("wipe"), "essential", { needs: "babies", pack: 80 }),
  it("Diaper cream", "baby", ["home", "emergency", "vacation", "roadtrip"], "baby", 1, u("tube"), "useful", { needs: "babies" }),
  it("Bottles", "baby", ["vacation", "roadtrip", "emergency", "hosting"], "baby", 4, u("bottle"), "useful", { needs: "babies", q: "baby bottles" }),
  it("Travel crib", "baby", ["vacation", "hosting", "camping"], "baby", 1, u("crib"), "useful", { needs: "babies", q: "travel crib pack and play" }),
  it("Baby carrier", "baby", ["vacation", "camping", "picnic"], "baby", 1, u("carrier"), "extra", { needs: "babies" }),
  it("Baby sunscreen and hat", "baby", ["beach", "picnic", "camping"], "baby", 1, u("set"), "useful", { needs: "babies", q: "baby sunscreen", note: "Ask your pediatrician about sunscreen under 6 months." }),
  it("Spare baby clothes", "baby", ["roadtrip", "party", "picnic", "beach", "tailgate"], "baby", 2, u("outfit"), "useful", { needs: "babies", q: "baby outfit set" }),
  it("Bibs and burp cloths", "baby", ["home", "vacation", "hosting"], "baby", 4, u("piece"), "extra", { needs: "babies" }),
  it("Pacifiers", "baby", ["vacation", "roadtrip", "emergency"], "baby", 2, u("pacifier"), "extra", { needs: "babies" }),

  // ── Pets ─────────────────────────────────────────────────────────────────
  it("Pet water", "pets", ["emergency", "home"], "petDay", 0.5, u("gallon"), "useful", { needs: "pets", q: "pet water bowl", note: "Our rule: half a gallon per pet per day; big dogs drink more." }),
  it("Travel pet bowls", "pets", ["roadtrip", "vacation", "camping", "beach", "picnic"], "pet", 2, u("bowl"), "useful", { needs: "pets", q: "collapsible pet bowl" }),
  it("Leash and ID tag", "pets", ["emergency", "roadtrip", "vacation", "camping", "picnic"], "pet", 1, u("set"), "essential", { needs: "pets", q: "pet id tag", note: "Ready.gov: keep ID and a current photo of your pet." }),
  it("Pet carrier or crate", "pets", ["emergency", "roadtrip", "vacation"], "pet", 1, u("carrier"), "useful", { needs: "pets" }),
  it("Poop bags", "pets", ["home", "roadtrip", "vacation", "camping", "picnic", "emergency"], "petDay", 3, u("bag"), "useful", { needs: "pets", pack: 120 }),
  it("Cat litter", "pets", ["home", "emergency"], "petDay", 0.1, u("box", "boxes"), "useful", { needs: "pets" }),
  it("Pet medicines", "pets", ["emergency", "vacation"], "pet", 1, u("supply", "supplies"), "useful", { needs: "pets", q: "pet pill organizer" }),
  it("Pet treats", "pets", ["home", "roadtrip", "vacation"], "pet", 1, u("bag"), "extra", { needs: "pets" }),

  // ── Party and decorations ────────────────────────────────────────────────
  it("Balloons", "party", ["party"], "group", 24, u("balloon"), "useful", { pack: 24 }),
  it("Banner", "party", ["party"], "group", 1, u("banner"), "useful", { q: "happy birthday banner" }),
  it("Candles and lighter", "party", ["party"], "group", 1, u("set"), "useful", { q: "birthday candles" }),
  it("Party favors", "party", ["party", "sleepover"], "kid", 1, u("favor"), "useful", { needs: "kids", q: "party favors for kids" }),
  it("Gift bags", "party", ["party", "hosting"], "kid", 1, u("bag"), "extra", { needs: "kids", pack: 12 }),
  it("Streamers and confetti", "party", ["party"], "group", 1, u("pack"), "extra", { q: "party streamers" }),
  it("Table centerpieces", "party", ["party", "hosting"], "person", 0.12, u("centerpiece"), "extra", { note: "Our rule: one per table of eight." }),
  it("Name tags", "party", ["party", "hosting"], "person", 1, u("tag"), "extra", { pack: 100 }),
  it("Cake knife and server", "party", ["party"], "group", 1, u("set"), "extra", { q: "cake server set" }),
  it("Photo backdrop and props", "party", ["party"], "group", 1, u("set"), "extra", { q: "photo booth props" }),
  it("Holiday decorations", "party", ["hosting"], "group", 1, u("set"), "extra"),
  it("Place cards", "party", ["hosting"], "person", 1, u("card"), "extra", { pack: 50 }),
  it("Coolers for drinks", "party", ["party", "hosting"], "person", 0.05, u("cooler"), "extra", { q: "beverage tub", note: "Our rule: one drink tub for about 20 people." }),

  // ── Bags and travel ──────────────────────────────────────────────────────
  it("Go-bag", "travel", ["emergency"], "person", 1, u("bag"), "essential", { q: "emergency backpack", note: "Red Cross: a 3-day supply to take with you." }),
  it("72-hour kit", "travel", ["emergency"], "person", 0.5, u("kit"), "extra", { note: "This kit covers two people." }),
  it("Suitcases", "travel", ["vacation"], "person", 0.5, u("suitcase"), "useful", { note: "Our rule: one checked bag for two people." }),
  it("Carry-on bag", "travel", ["vacation"], "person", 1, u("bag"), "useful", { q: "carry on backpack" }),
  it("Packing cubes", "travel", ["vacation", "roadtrip"], "person", 1, u("set"), "extra"),
  it("Duffel bags", "travel", ["camping", "roadtrip", "sleepover"], "person", 1, u("bag"), "extra"),
  it("Travel pillow", "travel", ["vacation", "roadtrip"], "person", 1, u("pillow"), "extra"),
  it("Luggage tags", "travel", ["vacation"], "person", 0.5, u("tag"), "extra"),
  it("Car trash can", "travel", ["roadtrip"], "group", 1, u("can"), "extra", { q: "car trash can" }),
  it("Car seat organizer", "travel", ["roadtrip"], "kid", 0.5, u("organizer"), "extra", { needs: "kids", q: "back seat organizer" }),
  it("Car emergency kit", "travel", ["roadtrip", "emergency"], "group", 1, u("kit"), "useful"),
  it("Tire inflator", "travel", ["roadtrip"], "group", 1, u("inflator"), "extra", { q: "portable tire inflator" }),
  it("Sunshade for car", "travel", ["roadtrip", "beach"], "group", 1, u("shade"), "extra", { q: "windshield sun shade" }),

  // ── Safety and documents ─────────────────────────────────────────────────
  it("Weather radio", "safety", ["emergency", "camping"], "group", 1, u("radio"), "essential", { note: "Ready.gov lists a battery-powered or hand-crank radio with NOAA alerts." }),
  it("Document bag", "safety", ["emergency", "vacation"], "group", 1, u("bag"), "useful", { note: "Copies of IDs, insurance and medical papers." }),
  it("Fireproof safe", "safety", ["home"], "group", 1, u("safe"), "extra"),
  it("Cash in small bills", "safety", ["emergency", "roadtrip", "vacation"], "group", 1, u("envelope"), "useful", { q: "cash envelope wallet", note: "Ready.gov: card readers and ATMs may be down." }),
  it("Fire extinguisher", "safety", ["home", "camping", "tailgate"], "group", 1, u("extinguisher"), "useful"),
  it("Smoke and CO alarm", "safety", ["home", "emergency"], "group", 1, u("alarm"), "useful", { note: "Test monthly. Add one per floor and outside sleeping areas." }),
  it("Spare keys", "safety", ["emergency", "vacation"], "group", 1, u("set"), "extra", { q: "key organizer" }),
  it("Printed contact list", "safety", ["emergency", "sleepover", "vacation"], "group", 1, u("list"), "useful", { q: "waterproof id card holder", note: "Phone numbers on paper, plus parents' numbers for a sleepover." }),
  it("Allergy and emergency info card", "safety", ["sleepover", "party", "vacation"], "kid", 1, u("card"), "useful", { needs: "kids", q: "medical alert card holder", note: "Ask each family about allergies before you shop." }),
  it("Glow tags or reflective bands", "safety", ["camping", "tailgate"], "kid", 1, u("band"), "extra", { needs: "kids", q: "reflective bands kids" }),
  it("Outlet covers and door locks", "safety", ["hosting"], "group", 1, u("pack"), "extra", { needs: "babies", q: "baby proofing kit" }),
];

/** Every entry: the hand-written base above plus the line-format data files. */
export const catalog: CatalogItem[] = [...base, ...extra];

const gearByAsin = new Map<string, GearItem>(
  [...areas.flatMap((a) => a.gear), ...levels.flatMap((l) => l.gear)].map((g) => [g.asin, g]),
);

/** The verified gear entry for an ASIN, from readiness.ts. */
export function gearFor(asin: string): GearItem | undefined {
  return gearByAsin.get(asin);
}

const byId = new Map(catalog.map((c) => [c.id, c]));
export const itemById = (id: string) => byId.get(id);
export const occasionById = (id: OccasionId) => occasions.find((o) => o.id === id) ?? occasions[0];
export const categoryById = (id: CategoryId) => categories.find((c) => c.id === id)!;
