// Buying guides: what to get, how much, how to choose, how to store it, when to
// replace it, what people forget. Each ends at a kit.
//
// Rules for editing:
//  - A section with `from` restates those official pages in our words. Do not
//    add a safety claim there that the page does not make. Sections without
//    `from` are our own practical tips, never safety advice.
//  - `read` is the date we read each page; `updated` is the date the page shows.
//  - Plain words, short lines. No prices, brands as "best", or fear.

export type GuideSource = { id: string; label: string; href: string; read: string; updated?: string };

export type GuideSection = { heading: string; points: string[]; from?: string[] };

export type Guide = {
  slug: string;
  emoji: string;
  title: string;
  /** Under the title on cards and in search results. */
  short: string;
  /** The kit this guide leads to. */
  kit: string;
  intro: string;
  sources: GuideSource[];
  sections: GuideSection[];
};

const READ = "2026-10-30";
const S = {
  water: { id: "water", label: "Ready.gov: Water", href: "https://www.ready.gov/water", read: READ, updated: "2021-02-22" },
  redcross: { id: "redcross", label: "American Red Cross: Survival Kit Supplies", href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html", read: "2026-10-17" },
  power: { id: "power", label: "Ready.gov: Power Outages", href: "https://www.ready.gov/power-outages", read: READ, updated: "2026-06-04" },
  winter: { id: "winter", label: "Ready.gov: Winter Weather", href: "https://www.ready.gov/winter-weather", read: READ, updated: "2026-03-10" },
  car: { id: "car", label: "Ready.gov: Car Safety", href: "https://www.ready.gov/car", read: READ, updated: "2026-03-12" },
  kit: { id: "kit", label: "Ready.gov: Build a Kit", href: "https://www.ready.gov/kit", read: READ, updated: "2026-07-01" },
  pets: { id: "pets", label: "Ready.gov: Pets and Animals", href: "https://www.ready.gov/pets", read: READ, updated: "2026-03-20" },
  food: { id: "food", label: "Ready.gov: Food", href: "https://www.ready.gov/food", read: READ, updated: "2026-03-12" },
} satisfies Record<string, GuideSource>;

export const guides: Guide[] = [
  {
    slug: "emergency-water", emoji: "💧", title: "How much water to store", kit: "water-storage",
    short: "1 gallon per person per day, how to store it, and how to make water safe.",
    intro: "Water is the first thing to get right. Here is how much to keep, what to keep it in, and what to do if it runs out.",
    sources: [S.water, S.redcross],
    sections: [
      { heading: "How much", from: ["water", "redcross"], points: [
        "Plan on 1 gallon per person per day, for drinking and washing up.",
        "Children, nursing mothers, sick people and anyone in a hot climate may need more. Very hot weather can double it.",
        "The Red Cross suggests a 3-day supply to take with you and a 2-week supply at home.",
      ] },
      { heading: "Worked out", points: [
        "4 people for 3 days: 12 gallons. For 2 weeks: 56 gallons.",
        "Count pets separately; they need water too.",
        "The kit page does this math for your group.",
      ] },
      { heading: "What to keep it in", from: ["water"], points: [
        "Store-bought water: keep it sealed in its original container, somewhere cool and dark.",
        "Your own tap water: use food-grade containers. Wash them with dish soap, then sanitize with 1 teaspoon of unscented bleach in a quart of water.",
        "Replace water you bottled yourself every 6 months.",
      ] },
      { heading: "How to choose", points: [
        "A gallon of water weighs about 8 pounds. Pick containers you can lift when full.",
        "A spout or spigot makes big jugs much easier to pour.",
        "Keep a few bottles in the car and near your go-bag, not just in the basement.",
      ] },
      { heading: "If you need to make water safe", from: ["water"], points: [
        "Let cloudy water settle, or strain it through a coffee filter or clean cloth first.",
        "Boil: a rolling boil for 1 full minute, then let it cool.",
        "Bleach: 1/8 teaspoon of plain, unscented household bleach (5.25–6% sodium hypochlorite) per gallon. Stir and wait 30 minutes. It should smell slightly of bleach; if not, repeat and wait 15 more minutes.",
        "Never use scented or color-safe bleach, or bleach with added cleaners.",
      ] },
      { heading: "Don't", from: ["water"], points: [
        "Don't ration drinking water unless officials tell you to.",
        "Soda, coffee, tea and alcohol don't replace water.",
      ] },
    ],
  },
  {
    slug: "power-outage", emoji: "🔌", title: "What to buy for a power outage", kit: "power-outage",
    short: "Light, charging, food and water, and staying safe with generators.",
    intro: "Most outages are short, but a storm can mean days. These are the supplies that matter, and the safety rules that go with them.",
    sources: [S.power, S.kit],
    sections: [
      { heading: "What you need", from: ["power", "kit"], points: [
        "A flashlight for each person, and extra batteries.",
        "Power banks or other backup power for phones and anything else you rely on that needs electricity.",
        "A battery or hand-crank radio for news and weather.",
        "Non-perishable food and water for several days.",
        "A cooler and ice, and a thermometer to check food temperatures.",
        "Carbon monoxide alarms with battery backup on every level of the home.",
      ] },
      { heading: "How to choose", points: [
        "Headlamps let you cook or help someone with both hands.",
        "Use the same battery size across your lights where you can, so spares fit everything.",
        "Bigger power banks charge more times but weigh more. Check you have the right cable for each phone.",
        "A portable power station runs small devices quietly indoors; a generator runs more but needs outdoor space and fuel.",
      ] },
      { heading: "Keeping food safe", from: ["power"], points: [
        "Keep the fridge and freezer closed. A fridge keeps food cold for about 4 hours; a full freezer for about 48 hours.",
        "Throw out food that has been at 40°F or warmer for 2 hours or more, or that smells, looks or feels wrong. When in doubt, throw it out.",
      ] },
      { heading: "Generators and carbon monoxide", from: ["power"], points: [
        "Run a generator outdoors only, at least 20 feet from windows, doors and attached garages.",
        "Keep it dry, use heavy-duty extension cords, and let it cool before refueling.",
        "Camp stoves and charcoal grills are for outdoors too. Never heat your home with a gas stove or oven.",
      ] },
      { heading: "Medical needs", from: ["power"], points: [
        "If someone uses powered medical equipment or refrigerated medicine, ask their provider for an outage plan.",
        "After an outage longer than a day, throw out medicine that should be refrigerated unless the label says otherwise, and call the doctor or pharmacist.",
      ] },
      { heading: "Easy to forget", from: ["power"], points: [
        "Unplug electronics so a surge doesn't damage them when the power comes back.",
        "Find out where heating or cooling centers open near you.",
        "Check whether your home phone works without power.",
      ] },
    ],
  },
  {
    slug: "winter-storm", emoji: "❄️", title: "Winter storm supplies for home and car", kit: "winter-storm",
    short: "Warmth, light and food at home, a winter car kit, and the signs of frostbite.",
    intro: "Get ready before the first big storm: a few days of supplies at home, a car kit, and knowing when cold turns dangerous.",
    sources: [S.winter, S.car],
    sections: [
      { heading: "At home", from: ["winter"], points: [
        "Supplies for several days without power, including medicine and what your pets need.",
        "Extra batteries for radios and flashlights.",
        "Smoke and carbon monoxide alarms with battery backup. Test them.",
        "Insulation, caulk and weather stripping to keep cold air out, and a plan to keep pipes from freezing.",
      ] },
      { heading: "In the car", from: ["winter", "car"], points: [
        "Jumper cables, sand or cat litter for traction, a flashlight, warm clothes, blankets, bottled water and snacks.",
        "An ice scraper and a car phone charger.",
        "Keep the gas tank full.",
      ] },
      { heading: "How to choose", points: [
        "Layers beat one big coat: base layers, wool socks, hats and gloves for each person.",
        "Hand warmers need no power and fit in every coat pocket and the glove box.",
        "Faucet covers and foam pipe insulation are cheap and quick to put on before a freeze.",
      ] },
      { heading: "During the storm", from: ["winter"], points: [
        "Generators and grills go outdoors only, away from windows. Never heat your home with a gas stove or oven.",
        "Stay off the roads if you can. If you are stuck in your car, stay inside it.",
        "Take it easy shoveling snow; overdoing it can bring on a heart attack.",
      ] },
      { heading: "Frostbite and hypothermia", from: ["winter"], points: [
        "Frostbite: numbness, white or grayish-yellow skin, skin that feels firm or waxy. Get to a warm room and soak in warm water. Don't rub it or use a heating pad.",
        "Hypothermia: shivering, exhaustion, confusion, fumbling hands, memory loss, slurred speech or drowsiness. A body temperature below 95°F is an emergency.",
        "For hypothermia, get to a warm room and warm the chest, neck, head and groin first. Stay dry under warm blankets.",
      ] },
      { heading: "Easy to forget", from: ["winter"], points: [
        "Medicine refills before the storm, and pet supplies.",
        "If heating bills are hard to pay, the federal LIHEAP program may help.",
      ] },
    ],
  },
  {
    slug: "emergency-kit", emoji: "🎒", title: "Build a basic emergency kit", kit: "five-day-emergency",
    short: "Ready.gov's list, what to add for your family, and where to keep it.",
    intro: "One kit covers most emergencies: storms, outages, or leaving in a hurry. Start with the basics and add what your family needs.",
    sources: [S.kit, S.redcross],
    sections: [
      { heading: "The basics", from: ["kit"], points: [
        "Water: 1 gallon per person per day for several days, and several days of non-perishable food.",
        "A battery or hand-crank radio, and a NOAA weather radio with tone alert.",
        "A flashlight, extra batteries and a first aid kit.",
        "A whistle to signal for help, and dust masks.",
        "Plastic sheeting, scissors and duct tape.",
        "Moist towelettes, garbage bags and plastic ties.",
        "A wrench or pliers to turn off utilities, and a manual can opener.",
        "Local maps, and a phone with chargers and a backup battery.",
      ] },
      { heading: "Add for your household", from: ["kit"], points: [
        "Prescription and everyday medicines, glasses and contact lens solution.",
        "Baby supplies: formula, bottles, diapers, wipes and diaper cream.",
        "Pet food and extra water.",
        "Cash, and copies of important documents in a waterproof container or saved online.",
        "A sleeping bag or warm blanket for each person, and a change of clothes with sturdy shoes.",
        "Hygiene items, paper plates, cups and utensils, paper and a pencil, and games or books for kids.",
      ] },
      { heading: "How long to plan for", from: ["kit", "redcross"], points: [
        "Ready.gov says several days. The Red Cross suggests 3 days if you leave and 2 weeks at home.",
        "Our five-day kit sits in between. Change the days on the kit page to suit you.",
      ] },
      { heading: "Where to keep it", from: ["kit"], points: [
        "At home, in one spot everyone knows, ready to grab.",
        "At work, enough to stay there 24 hours, with comfortable walking shoes.",
        "In the car, a smaller kit in case you get stranded.",
      ] },
      { heading: "Keep it fresh", from: ["kit"], points: [
        "Store cans in a cool, dry place and boxed food in closed plastic or metal containers.",
        "Replace anything past its date.",
        "Look at it once a year and change it as your family changes.",
      ] },
      { heading: "Ready-made or build your own", points: [
        "A packed 72-hour backpack is a fast start.",
        "Building your own lets you pick food your family eats and fill the gaps a packed kit leaves.",
      ] },
    ],
  },
  {
    slug: "car-emergency-kit", emoji: "🚙", title: "What to keep in your car", kit: "roadside-emergency",
    short: "The trunk kit for flat tires, dead batteries and winter roads.",
    intro: "A small kit in the trunk turns a breakdown into an inconvenience. Here is what Ready.gov lists, plus a few things worth adding.",
    sources: [S.car, S.winter],
    sections: [
      { heading: "The basics", from: ["car"], points: [
        "Jumper cables.",
        "Flares or a reflective triangle.",
        "An ice scraper and a car phone charger.",
        "A blanket and a map.",
        "Cat litter or sand for traction.",
      ] },
      { heading: "For winter", from: ["winter"], points: [
        "Add a flashlight, warm clothes, more blankets, bottled water and snacks.",
        "Keep the gas tank full.",
      ] },
      { heading: "Worth adding", points: [
        "A first aid kit and a tire pressure gauge.",
        "A seatbelt cutter and window breaker within reach of the driver.",
        "A portable jump starter, so you don't need a second car.",
      ] },
      { heading: "Before a long trip", from: ["car"], points: [
        "Have a mechanic check antifreeze, battery, brakes, exhaust, filters, heater and defroster, lights, oil, thermostat, wipers and washer fluid.",
        "In snowy places, winter tires with good tread, and chains if local rules call for them.",
      ] },
      { heading: "On the road", from: ["car"], points: [
        "Don't drive through flooded areas. Six inches of water can make a car lose control or stall.",
        "If a power line falls on your car, stay inside until a trained person removes it.",
        "Turn off cruise control on icy, snowy or slippery roads.",
      ] },
    ],
  },
  {
    slug: "pet-emergency-kit", emoji: "🐾", title: "A pet emergency kit", kit: "pet-emergency",
    short: "Food, water, medicine, ID and a carrier, packed and ready.",
    intro: "If you have to leave, your pets go with you. A packed kit and current ID make that much easier.",
    sources: [S.pets],
    sections: [
      { heading: "What to pack", from: ["pets"], points: [
        "Several days of food in an airtight, waterproof container, and water with a bowl.",
        "An extra supply of any medicine, in a waterproof container.",
        "First aid items your vet suggests.",
        "A backup collar, ID tag, harness or leash.",
        "A carrier or crate, ideally one per pet.",
        "Litter and a litter box if needed, newspapers, paper towels, trash bags and household bleach.",
        "Grooming items, and a favorite toy, treats or bedding.",
        "Copies of registration and other records, and a photo of you with your pet.",
      ] },
      { heading: "ID", from: ["pets"], points: [
        "Microchip your pet and keep the chip's phone number and address current.",
        "List an emergency contact outside your area, and keep an ID tag on the collar.",
      ] },
      { heading: "If you have to leave", from: ["pets"], points: [
        "Take your pets with you.",
        "Many shelters and hotels don't take pets. Find pet-friendly places before you need them.",
        "Set up a buddy system with someone who can care for your pets if you can't.",
        "Get pets used to the carrier: leave it open with treats and familiar bedding.",
        "Bring pets indoors at the first sign of a storm.",
      ] },
      { heading: "Easy to forget", points: [
        "The photo of you with your pet.",
        "A second leash, and records saved on your phone as well as on paper.",
      ] },
    ],
  },
  {
    slug: "emergency-food", emoji: "🥫", title: "Emergency food: what to stock", kit: "two-week-pantry",
    short: "No-cook food your family will eat, how to store it, and food safety after an outage.",
    intro: "Stock food that keeps without a fridge and needs little or no cooking, and that your family already likes.",
    sources: [S.food, S.kit, S.redcross],
    sections: [
      { heading: "What to stock", from: ["food"], points: [
        "Ready-to-eat canned meat, fruit and vegetables, and a manual can opener.",
        "Protein or fruit bars, dry cereal or granola, peanut butter and dried fruit.",
        "Canned juice and shelf-stable milk.",
        "High-energy foods, comfort foods, and food for babies and anyone on a special diet.",
        "Choose foods your household will actually eat.",
      ] },
      { heading: "How much", from: ["food", "redcross"], points: [
        "Ready.gov says at least several days. The Red Cross suggests 2 weeks at home.",
        "The pantry kit works out amounts for your group and length.",
      ] },
      { heading: "Storing it", from: ["kit", "food"], points: [
        "Keep cans somewhere cool and dry, and boxed food in closed plastic or metal containers.",
        "Don't use cans that are swollen, dented or corroded.",
        "Replace anything past its date.",
      ] },
      { heading: "How to choose", points: [
        "Put new cans at the back and use from the front, so nothing expires unseen.",
        "Small cans and single servings mean fewer leftovers with no fridge.",
      ] },
      { heading: "Eating without power", from: ["food"], points: [
        "Canned food can be eaten straight from the can.",
        "Grills and camp stoves are for outdoor use only.",
        "Babies: ready-to-feed formula is easiest. If you must mix it, use bottled or boiled water.",
      ] },
      { heading: "After an outage", from: ["food"], points: [
        "Food in the fridge is usually safe if the power was out 4 hours or less.",
        "Throw out meat, fish, eggs and leftovers that were above 40°F for 2 hours or more, and anything that touched floodwater.",
        "When in doubt, throw it out.",
      ] },
    ],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
export const guideForKit = (kit: string) => guides.find((g) => g.kit === kit);
