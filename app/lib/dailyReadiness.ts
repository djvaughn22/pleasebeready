// PleaseBeReady — Daily Readiness Check content adapter for the shared
// Daily Social Engine (see app/lib/dailySocialCore.ts).
//
// One small, concrete preparedness task each day. Selection is a
// deterministic rotation over the task deck: day N since startDate gets
// task N mod deck length, so the whole deck plays before anything repeats.
// The same date always renders the same task on the page, the card, and
// the caption.
//
// Gear references reuse ONLY title-verified ASINs from app/lib/gear.ts
// discipline — nothing is linked that hasn't been checked against the
// live product page.

import {
  activeHashtags,
  captionMarkerForDate,
  daysBetweenDateKeys,
  formatFullDate,
  isValidDateKey,
  type DailySocialBrandConfig,
  type DailySocialPost,
} from "./dailySocialCore";
import type { GearItem } from "./gear";

export const PBR_BRAND: DailySocialBrandConfig = {
  brand: "pleasebeready",
  siteName: "PleaseBeReady.com",
  siteUrl: "https://pleasebeready.com",
  markerPrefix: "Daily Readiness Check",
  hashtags: ["#PleaseBeReady", "#EmergencyPreparedness", "#BeReady", "#Preparedness"],
  startDate: "2026-07-14",
  version: 1,
};

export type ReadinessTask = {
  emoji: string;
  area: string;
  title: string;
  detail: string;
  gear?: GearItem;
};

// The deck. One task = one day. 42 tasks ≈ a six-week cycle.
export const READINESS_TASKS: ReadinessTask[] = [
  // 💧 Water
  { emoji: "💧", area: "Water", title: "Count your water tonight", detail: "One gallon per person per day, three days minimum. Count what's actually on the shelf — most homes are surprised.", gear: { name: "Reliance Aqua-Tainer 7-gallon container", asin: "B001QC31G6" } },
  { emoji: "💧", area: "Water", title: "Fill one container", detail: "Don't plan it — do it. One filled 7-gallon container covers one person for a week of drinking water." },
  { emoji: "💧", area: "Water", title: "Put a filter in your go-bag", detail: "A personal straw filter turns almost any water source into drinking water. It weighs two ounces.", gear: { name: "LifeStraw personal water filter", asin: "B006QF3TW4" } },
  { emoji: "💧", area: "Water", title: "Date your stored water", detail: "Write today's date on every container with a marker. Rotate store-bought every 6–12 months." },
  // 🥫 Food
  { emoji: "🥫", area: "Food", title: "Count your shelf calories", detail: "Two weeks of no-cook food is the goal — roughly 2,000 calories per person per day. Count what you have." },
  { emoji: "🥫", area: "Food", title: "Find your manual can opener", detail: "A shelf of cans and no way to open them is a bad day. If you can't find one in a minute, that's the gap.", gear: { name: "Heavy-duty manual can opener", asin: "B09HKDZ3CV" } },
  { emoji: "🥫", area: "Food", title: "Check five expiration dates", detail: "Pull five cans, check the dates, move the oldest to the front. Two minutes, real progress." },
  { emoji: "🥫", area: "Food", title: "Add one no-cook meal", detail: "Every grocery run, add one shelf-stable meal to the emergency shelf. It compounds fast.", gear: { name: "Mountain House 3-day food supply", asin: "B0898QSCNG" } },
  // 🩹 First Aid
  { emoji: "🩹", area: "First Aid", title: "The 60-second kit test", detail: "Can you put your hands on your first-aid kit in under a minute, in the dark? If not, move it tonight.", gear: { name: "First Aid Only 298-piece kit", asin: "B000069EYA" } },
  { emoji: "🩹", area: "First Aid", title: "Print the medication list", detail: "Everyone's medications and doses, on paper, in the kit. Phones die in exactly the moments this list matters." },
  { emoji: "🩹", area: "First Aid", title: "Restock the basics", detail: "Pain reliever, antihistamine, anti-diarrheal, electrolytes. Check what's expired and write the shopping list." },
  // 🔦 Power & Light
  { emoji: "🔦", area: "Power & Light", title: "Charge every power bank", detail: "A dead power bank is a paperweight. Charge them all tonight and put one where you'd grab it leaving.", gear: { name: "Anker 10,000mAh USB-C power bank", asin: "B0D5CLSMFB" } },
  { emoji: "🔦", area: "Power & Light", title: "Stage a headlamp", detail: "Hands-free light beats a phone flashlight every time. One headlamp on the nightstand, one in the kit.", gear: { name: "Energizer LED headlamps, 2-pack", asin: "B092RHC2FY" } },
  { emoji: "🔦", area: "Power & Light", title: "Test every flashlight", detail: "Click each one tonight. Count your spare batteries while you're at it — AAs disappear." },
  { emoji: "🔦", area: "Power & Light", title: "Make the outage plan", detail: "If the power died right now: what needs electricity first? Fridge, phones, medical gear. Know your order.", gear: { name: "Jackery Explorer 1000 v2 power station", asin: "B0D7PPG25F" } },
  // 🔥 Heat & Shelter
  { emoji: "🔥", area: "Heat & Shelter", title: "Mylar in every car", detail: "Emergency blankets retain 90% of body heat and weigh nothing. One per glovebox, one per go-bag.", gear: { name: "Swiss Safe mylar blankets, 4-pack", asin: "B01LYNWRLA" } },
  { emoji: "🔥", area: "Heat & Shelter", title: "Test the CO detector", detail: "Carbon monoxide is invisible and kills quietly — especially when generators and heaters come out. Test it tonight.", gear: { name: "First Alert smoke + CO combo alarm", asin: "B000MXJ498" } },
  { emoji: "🔥", area: "Heat & Shelter", title: "Hand warmers in the bags", detail: "Cheap, light, and they turn a cold night survivable. A few pairs in each go-bag and car kit.", gear: { name: "HotHands hand warmers, 10 pair", asin: "B077RXSZN3" } },
  // 📻 Communication
  { emoji: "📻", area: "Communication", title: "The paper contact card", detail: "Write your out-of-town contact's number on paper for every wallet. When networks jam, texts to one contact work." },
  { emoji: "📻", area: "Communication", title: "Pick two meeting spots", detail: "One near home, one outside the neighborhood. Text both to the whole family today — done in five minutes." },
  { emoji: "📻", area: "Communication", title: "Radio that survives the grid", detail: "When cell service and power are both down, a hand-crank NOAA radio is your information line.", gear: { name: "Midland ER310 hand-crank weather radio", asin: "B015QIC1PW" } },
  { emoji: "📻", area: "Communication", title: "Turn on emergency alerts", detail: "Check every phone in the house: government emergency alerts ON, including the kids' phones." },
  // 📄 Documents & Cash
  { emoji: "📄", area: "Documents", title: "Photograph your documents", detail: "IDs, insurance cards, deeds. Photos in encrypted cloud storage tonight — it's the fastest version of a document backup." },
  { emoji: "📄", area: "Documents", title: "Waterproof the copies", detail: "Paper copies of the essentials belong in a waterproof bag inside the go-bag.", gear: { name: "Fireproof, waterproof document bag", asin: "B07SPZ93V5" } },
  { emoji: "📄", area: "Documents", title: "Forty dollars, small bills", detail: "When card readers and ATMs are down, cash talks. Small bills — nobody makes change in an outage." },
  { emoji: "📄", area: "Documents", title: "Protect the originals", detail: "Birth certificates, titles, passports: fire and water are the two ways you lose them at home.", gear: { name: "SentrySafe fireproof + waterproof safe", asin: "B005P12C5A" } },
  // 🎒 Go-Bag
  { emoji: "🎒", area: "Go-Bag", title: "Stage a bag by the door", detail: "One bag per person, by the exit you'd actually use. A started bag beats a perfect plan.", gear: { name: "Ready America 72-hour kit, 2-person", asin: "B000FJQQVI" } },
  { emoji: "🎒", area: "Go-Bag", title: "Clothes and real shoes", detail: "A change of clothes and sturdy shoes in every go-bag. Evacuations happen in pajamas more than you'd think." },
  { emoji: "🎒", area: "Go-Bag", title: "Whistle check", detail: "One whistle per bag. Three blasts is the universal distress signal, and a whistle outlasts a voice." },
  // 🚗 Car
  { emoji: "🚗", area: "Car", title: "Open your trunk and look", detail: "Blanket, water, flashlight, first aid — what's actually in there right now? Fill the gaps this week.", gear: { name: "90-piece roadside emergency kit", asin: "B01C96AFWU" } },
  { emoji: "🚗", area: "Car", title: "Half-tank rule starts today", detail: "In an evacuation, gas stations have lines or no power. Below half is the new empty." },
  { emoji: "🚗", area: "Car", title: "Glovebox essentials", detail: "Phone cable, ice scraper, paper map of your region. Three small things that matter when it counts." },
  // 🏠 Home Safety
  { emoji: "🏠", area: "Home Safety", title: "Test every smoke alarm", detail: "Every level of the house, hold the button, hear the beep. Monthly is the rule — today is the day.", gear: { name: "First Alert smoke + CO combo alarm", asin: "B000MXJ498" } },
  { emoji: "🏠", area: "Home Safety", title: "Learn PASS tonight", detail: "Pull, Aim, Squeeze, Sweep. Now go touch your extinguisher so you know exactly where it is.", gear: { name: "First Alert HOME1 fire extinguisher", asin: "B01LTICQYE" } },
  { emoji: "🏠", area: "Home Safety", title: "Find your shutoffs", detail: "Water, gas, electricity. Walk to each one tonight and make sure you could work it in the dark." },
  { emoji: "🏠", area: "Home Safety", title: "Clear two exits", detail: "Two ways out of the house, nothing blocking either. Check them both before bed." },
  // 🤝 Skills & Community
  { emoji: "🤝", area: "Skills", title: "Schedule the CPR class", detail: "Skills outlast supplies. A first aid and CPR class is a few hours that can save someone you love.", gear: { name: "Red Cross First Aid/CPR/AED manual", asin: "173674478X" } },
  { emoji: "🤝", area: "Skills", title: "Meet one neighbor", detail: "Know who nearby has medical training, a generator, or a chainsaw. Community is the best prep there is." },
  { emoji: "🤝", area: "Skills", title: "Run the drill", detail: "Practice the family evacuation once. Where do you meet? Who grabs what? Ten minutes, twice a year." },
  { emoji: "🤝", area: "Skills", title: "Trade two phone numbers", detail: "Two neighbors, numbers exchanged, tonight. In a real emergency the people closest to you matter most." },
  // ⬆️ Level up
  { emoji: "⬆️", area: "Level Up", title: "Step up to two weeks of water", detail: "Once the 72-hour basics are set, bulk water storage is the next real upgrade.", gear: { name: "Augason Farms 55-gal water barrel kit", asin: "B006OW4FVI" } },
  { emoji: "⬆️", area: "Level Up", title: "A month of food, one pail", detail: "Long-shelf-life food pails turn 'two weeks' into 'a month' without a second freezer.", gear: { name: "Augason Farms 30-day food supply", asin: "B071KPGLBK" } },
  { emoji: "⬆️", area: "Level Up", title: "Filter beyond bottles", detail: "A gravity-fed filter makes water independence real — no power, no plumbing, thousands of gallons.", gear: { name: "Boroux gravity-fed water filter", asin: "B0D9WNBTD8" } },
];

export function taskIndexForDate(dateKey: string, offset = 0): number {
  const dayNumber = daysBetweenDateKeys(PBR_BRAND.startDate, dateKey);
  const size = READINESS_TASKS.length;
  return (((dayNumber + offset) % size) + size) % size;
}

export function buildReadinessCaption(dateKey: string, task: ReadinessTask): string {
  return [
    captionMarkerForDate(PBR_BRAND, dateKey),
    "",
    `${task.emoji} Today: ${task.title}.`,
    "",
    task.detail,
    "",
    "One small step a day. The full checklists — and the exact gear for each one — are on the site. Link in bio.",
    "",
    "PleaseBeReady.com",
    "",
    activeHashtags(PBR_BRAND.hashtags).join(" "),
  ].join("\n");
}

export type DailyReadiness = {
  post: DailySocialPost;
  task: ReadinessTask;
};

export function buildDailyReadiness(
  dateKey: string,
  options: { offset?: number } = {},
): DailyReadiness {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const index = taskIndexForDate(dateKey, options.offset ?? 0);
  const task = READINESS_TASKS[index];

  return {
    task,
    post: {
      brand: PBR_BRAND.brand,
      date: dateKey,
      fullDate: formatFullDate(dateKey),
      timezone: "America/Chicago",
      version: PBR_BRAND.version,
      contentId: String(index),
      typeLabel: "Daily Readiness Check",
      title: task.title,
      caption: buildReadinessCaption(dateKey, task),
      hashtags: activeHashtags(PBR_BRAND.hashtags),
      imagePath: `/api/social/daily-readiness/${dateKey}.png`,
      imageFileName: `daily-readiness-${dateKey}-1080x1350.png`,
      pagePath: "/today",
      parityKeys: [task.title, task.detail],
    },
  };
}
