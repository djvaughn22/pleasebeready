// Product art: flat two-tone drawings, one per kind of product, used until
// Amazon's API allows real product photos. Each drawing uses the lane color
// for its body, navy for detail and a light tone for highlights, on a 64×64
// grid, so every card reads as one set. Items without their own drawing get
// their category's.

import type { ReactNode } from "react";
import type { CategoryId } from "../../lib/stockup/types";

const INK = "#0b1220";
const HI = "#f8fafc";
type Draw = (c: string) => ReactNode;
const s = { stroke: INK, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const D = {
  jug: (c) => <><path d="M24 10h16v6l6 6v30a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V22l6-6z" fill={c} {...s} /><path d="M24 10h16" {...s} /><path d="M24 30h16M24 38h16" stroke={HI} strokeWidth="3" strokeLinecap="round" /></>,
  bricks: (c) => <><rect x="10" y="34" width="22" height="20" rx="3" fill={c} {...s} /><rect x="32" y="34" width="22" height="20" rx="3" fill={c} {...s} /><rect x="21" y="14" width="22" height="20" rx="3" fill={c} {...s} /><rect x="28" y="9" width="8" height="5" rx="1" fill={INK} /><path d="M16 44h10M38 44h10M27 24h10" stroke={HI} strokeWidth="3" strokeLinecap="round" /></>,
  can: (c) => <><rect x="16" y="14" width="32" height="40" rx="5" fill={c} {...s} /><path d="M16 22h32M16 46h32" {...s} /><rect x="22" y="28" width="20" height="12" rx="2" fill={HI} /></>,
  bucket: (c) => <><path d="M14 18h36l-4 36H18z" fill={c} {...s} /><rect x="12" y="12" width="40" height="8" rx="3" fill={c} {...s} /><rect x="22" y="28" width="20" height="14" rx="2" fill={HI} /><path d="M26 33h12M26 37h8" {...s} strokeWidth="2" /></>,
  juice: (c) => <><path d="M18 18l4-6h20l4 6v38H18z" fill={c} {...s} /><path d="M38 12l4-6" {...s} /><rect x="24" y="28" width="16" height="16" rx="3" fill={HI} /></>,
  plate: (c) => <><circle cx="34" cy="34" r="20" fill={c} {...s} /><circle cx="34" cy="34" r="11" fill={HI} /><path d="M10 12v14M7 12v8a3 3 0 0 0 6 0v-8M10 26v28" {...s} /></>,
  pan: (c) => <><circle cx="28" cy="34" r="16" fill={c} {...s} /><circle cx="28" cy="34" r="9" fill={HI} /><path d="M43 30l15-6" {...s} strokeWidth="5" /></>,
  roll: (c) => <><rect x="12" y="16" width="30" height="34" rx="4" fill={HI} {...s} /><ellipse cx="42" cy="33" rx="10" ry="17" fill={c} {...s} /><circle cx="42" cy="33" r="4" fill={INK} /></>,
  spray: (c) => <><path d="M22 26h20v28a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z" fill={c} {...s} /><path d="M26 26v-8h12v8M26 14h16l6 4" {...s} /><rect x="27" y="36" width="10" height="12" rx="2" fill={HI} /></>,
  pump: (c) => <><rect x="18" y="26" width="28" height="30" rx="6" fill={c} {...s} /><path d="M32 26v-8M24 12h14v6" {...s} /><rect x="24" y="34" width="16" height="12" rx="2" fill={HI} /></>,
  aid: (c) => <><rect x="10" y="18" width="44" height="34" rx="6" fill={c} {...s} /><path d="M24 18v-6h16v6" {...s} /><rect x="22" y="27" width="20" height="16" rx="3" fill={HI} /><path d="M32 30v10M27 35h10" {...s} /></>,
  battery: (c) => <><rect x="20" y="14" width="24" height="42" rx="4" fill={c} {...s} /><rect x="27" y="8" width="10" height="6" rx="1" fill={INK} /><path d="M34 24l-6 10h8l-6 10" {...s} stroke={HI} /></>,
  flashlight: (c) => <><path d="M8 28h22l8-6h14v20H38l-8-6H8z" fill={c} {...s} /><rect x="16" y="29" width="8" height="6" rx="1" fill={INK} /><path d="M56 26l4-2M56 32h5M56 38l4 2" {...s} /><rect x="40" y="25" width="10" height="14" rx="2" fill={HI} /></>,
  radio: (c) => <><rect x="8" y="22" width="48" height="32" rx="6" fill={c} {...s} /><path d="M16 22l28-12" {...s} /><circle cx="22" cy="38" r="8" fill={HI} {...s} /><path d="M36 32h12M36 38h12M36 44h12" {...s} /></>,
  powerbank: (c) => <><rect x="16" y="10" width="32" height="46" rx="7" fill={c} {...s} /><path d="M34 20l-8 14h10l-8 14" {...s} stroke={HI} strokeWidth="3.5" /></>,
  station: (c) => <><rect x="8" y="20" width="48" height="34" rx="6" fill={c} {...s} /><path d="M20 20v-8h24v8" {...s} /><rect x="14" y="28" width="18" height="12" rx="2" fill={HI} /><circle cx="44" cy="34" r="3" fill={INK} /><circle cx="44" cy="45" r="3" fill={INK} /><path d="M14 46h18" {...s} /></>,
  lantern: (c) => <><path d="M24 12h16M32 6v6" {...s} /><rect x="20" y="12" width="24" height="8" rx="2" fill={c} {...s} /><rect x="22" y="20" width="20" height="26" rx="3" fill={HI} {...s} /><path d="M32 26v14" stroke={c} strokeWidth="4" strokeLinecap="round" /><rect x="18" y="46" width="28" height="10" rx="3" fill={c} {...s} /></>,
  headlamp: (c) => <><ellipse cx="32" cy="34" rx="24" ry="14" fill="none" {...s} strokeWidth="5" /><rect x="22" y="14" width="20" height="16" rx="5" fill={c} {...s} /><circle cx="32" cy="22" r="5" fill={HI} /></>,
  bolt: (c) => <><rect x="12" y="16" width="40" height="34" rx="6" fill={c} {...s} /><path d="M35 22l-9 13h10l-8 11" {...s} stroke={HI} strokeWidth="3.5" /><path d="M18 50v6M46 50v6" {...s} /></>,
  camera: (c) => <><rect x="10" y="20" width="36" height="28" rx="6" fill={c} {...s} /><path d="M46 28l10-6v24l-10-6" fill={c} {...s} /><circle cx="28" cy="34" r="7" fill={HI} {...s} /></>,
  drill: (c) => <><path d="M12 18h30a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6H32l-4 18H18l4-18h-10z" fill={c} {...s} /><path d="M48 26h10" {...s} /><rect x="16" y="48" width="14" height="8" rx="2" fill={INK} /></>,
  bottle: (c) => <><rect x="26" y="8" width="12" height="8" rx="2" fill={INK} /><path d="M24 16h16v4l4 6v28a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V26l4-6z" fill={c} {...s} /><rect x="24" y="32" width="16" height="12" rx="2" fill={HI} /></>,
  whistle: (c) => <><path d="M10 26h28a14 14 0 1 1-14 18H14a4 4 0 0 1-4-4z" fill={c} {...s} /><circle cx="38" cy="40" r="5" fill={HI} /><path d="M50 18l6-6" {...s} /></>,
  mask: (c) => <><path d="M14 24c10-6 26-6 36 0v14c-6 10-30 10-36 0z" fill={HI} {...s} /><path d="M14 28H6M50 28h8M14 34H8M50 34h6" {...s} /><path d="M20 30h24" stroke={c} strokeWidth="4" strokeLinecap="round" /></>,
  alarm: (c) => <><circle cx="32" cy="32" r="22" fill={c} {...s} /><circle cx="32" cy="32" r="10" fill={HI} {...s} /><circle cx="32" cy="32" r="3" fill={INK} /></>,
  extinguisher: (c) => <><rect x="22" y="20" width="20" height="38" rx="8" fill={c} {...s} /><path d="M28 20v-6h8v6M36 12h10l4 8" {...s} /><rect x="26" y="32" width="12" height="10" rx="2" fill={HI} /></>,
  filter: (c) => <><rect x="26" y="6" width="12" height="52" rx="6" fill={c} {...s} /><path d="M26 18h12M26 46h12" {...s} /><path d="M32 24v16" stroke={HI} strokeWidth="4" strokeLinecap="round" /></>,
  toolbox: (c) => <><rect x="8" y="24" width="48" height="30" rx="5" fill={c} {...s} /><path d="M24 24v-8h16v8M8 36h48" {...s} /><rect x="28" y="32" width="8" height="8" rx="1" fill={HI} {...s} /></>,
  wrench: (c) => <><path d="M44 8a12 12 0 0 0-11 16L10 47a5 5 0 0 0 7 7l23-23A12 12 0 0 0 56 20l-7 4-5-5 4-7z" fill={c} {...s} /></>,
  bed: (c) => <><rect x="8" y="30" width="48" height="16" rx="4" fill={c} {...s} /><rect x="12" y="22" width="16" height="10" rx="4" fill={HI} {...s} /><path d="M8 46v8M56 46v8" {...s} /></>,
  tent: (c) => <><path d="M32 10L6 54h52z" fill={c} {...s} /><path d="M32 30l-8 24h16z" fill={HI} {...s} /></>,
  dice: (c) => <><rect x="12" y="12" width="40" height="40" rx="8" fill={c} {...s} /><circle cx="23" cy="23" r="4" fill={HI} /><circle cx="32" cy="32" r="4" fill={HI} /><circle cx="41" cy="41" r="4" fill={HI} /></>,
  babybottle: (c) => <><path d="M26 14h12l2-6h-16z" fill={HI} {...s} /><rect x="22" y="14" width="20" height="6" rx="2" fill={INK} /><rect x="20" y="20" width="24" height="36" rx="7" fill={c} {...s} /><path d="M26 30h6M26 38h6M26 46h6" stroke={HI} strokeWidth="3" strokeLinecap="round" /></>,
  paw: (c) => <><ellipse cx="32" cy="42" rx="13" ry="11" fill={c} {...s} /><circle cx="16" cy="28" r="6" fill={c} {...s} /><circle cx="26" cy="16" r="6" fill={c} {...s} /><circle cx="38" cy="16" r="6" fill={c} {...s} /><circle cx="48" cy="28" r="6" fill={c} {...s} /></>,
  balloon: (c) => <><ellipse cx="32" cy="26" rx="16" ry="19" fill={c} {...s} /><path d="M32 45l-3 4h6zM32 49c-4 6 4 8 0 12" {...s} /><ellipse cx="26" cy="20" rx="4" ry="6" fill={HI} /></>,
  backpack: (c) => <><path d="M14 24a12 12 0 0 1 12-12h12a12 12 0 0 1 12 12v30H14z" fill={c} {...s} /><path d="M26 12V8h12v4" {...s} /><rect x="22" y="34" width="20" height="14" rx="3" fill={HI} {...s} /></>,
  cloud: (c) => <><path d="M18 40a10 10 0 0 1 2-20 14 14 0 0 1 26 2 9 9 0 0 1 0 18z" fill={c} {...s} /><path d="M24 48v6M32 48v8M40 48v6" {...s} /></>,
  car: (c) => <><path d="M8 40l6-16h36l6 16v10H8z" fill={c} {...s} /><path d="M18 26l-3 10h34l-3-10z" fill={HI} /><circle cx="20" cy="50" r="6" fill={INK} /><circle cx="44" cy="50" r="6" fill={INK} /></>,
  pencil: (c) => <><path d="M14 50l4-14 26-26 10 10-26 26z" fill={c} {...s} /><path d="M14 50l4-14 10 10z" fill={HI} {...s} /></>,
  rail: (c) => <><rect x="8" y="16" width="48" height="8" rx="4" fill={c} {...s} /><path d="M16 24v6M48 24v6" {...s} /><path d="M24 58V40c0-8 12-8 12 0" fill="none" {...s} strokeWidth="5" /></>,
  box: (c) => <><path d="M8 22l24-10 24 10v26L32 58 8 48z" fill={c} {...s} /><path d="M8 22l24 10 24-10M32 32v26" {...s} /><path d="M20 17l24 10" stroke={HI} strokeWidth="4" /></>,
  folder: (c) => <><path d="M8 18h18l4 6h26v28H8z" fill={c} {...s} /><rect x="16" y="30" width="32" height="14" rx="2" fill={HI} /></>,
  tarp: (c) => <><path d="M8 20h48l-6 32H14z" fill={c} {...s} /><circle cx="14" cy="26" r="2.5" fill={INK} /><circle cx="50" cy="26" r="2.5" fill={INK} /><path d="M20 34h24" stroke={HI} strokeWidth="3" strokeLinecap="round" /></>,
  tape: (c) => <><circle cx="30" cy="34" r="20" fill={c} {...s} /><circle cx="30" cy="34" r="8" fill={HI} {...s} /><path d="M48 40h10v8H44" fill={c} {...s} /></>,
  map: (c) => <><path d="M8 16l16-6 16 6 16-6v38l-16 6-16-6-16 6z" fill={c} {...s} /><path d="M24 10v38M40 16v38" {...s} /><path d="M14 32c6-6 10 6 16 0s10 4 16-2" stroke={HI} strokeWidth="3" fill="none" strokeLinecap="round" /></>,
  blanket: (c) => <><rect x="10" y="14" width="44" height="38" rx="5" fill={c} {...s} /><path d="M10 26h44M10 40h44" stroke={HI} strokeWidth="4" /></>,
  bag: (c) => <><path d="M14 20h36l-4 36H18z" fill={c} {...s} /><path d="M24 20c0-12 16-12 16 0" fill="none" {...s} /><path d="M24 34h16" stroke={HI} strokeWidth="3" strokeLinecap="round" /></>,
  opener: (c) => <><rect x="8" y="26" width="30" height="10" rx="5" fill={c} {...s} /><circle cx="46" cy="30" r="10" fill={HI} {...s} /><circle cx="46" cy="30" r="3" fill={INK} /><path d="M38 44l12 12" {...s} strokeWidth="5" stroke={c} /></>,
  wipes: (c) => <><rect x="8" y="18" width="48" height="32" rx="8" fill={c} {...s} /><rect x="20" y="24" width="24" height="10" rx="5" fill={HI} {...s} /><path d="M26 29h12" {...s} /></>,
  cooler: (c) => <><rect x="8" y="22" width="48" height="32" rx="5" fill={c} {...s} /><path d="M8 32h48" {...s} /><path d="M24 22v-6h16v6" {...s} /><rect x="26" y="38" width="12" height="6" rx="2" fill={HI} /></>,
  table: (c) => <><rect x="6" y="20" width="52" height="8" rx="3" fill={c} {...s} /><path d="M14 28l-4 26M50 28l4 26M14 40h36" {...s} /></>,
  chair: (c) => <><path d="M18 10h28v24H18z" fill={c} {...s} /><path d="M14 34h36v6H14z" fill={c} {...s} /><path d="M18 40l-4 16M46 40l4 16M18 40l28 16M46 40L18 56" {...s} /></>,
  phone: (c) => <><rect x="8" y="26" width="48" height="28" rx="6" fill={c} {...s} /><path d="M12 26c0-14 40-14 40 0" fill={HI} {...s} /><path d="M20 36h4M30 36h4M40 36h4M20 44h4M30 44h4M40 44h4" {...s} /></>,
  tube: (c) => <><path d="M20 10h24l-2 38H22z" fill={c} {...s} /><rect x="26" y="48" width="12" height="8" rx="2" fill={INK} /><rect x="24" y="20" width="16" height="14" rx="2" fill={HI} /></>,
  bowl: (c) => <><path d="M8 30h48l-6 20H14z" fill={c} {...s} /><ellipse cx="32" cy="30" rx="24" ry="5" fill={HI} {...s} /></>,
  tag: (c) => <><circle cx="32" cy="16" r="6" fill="none" {...s} /><path d="M32 22l-14 14 14 20 14-20z" fill={c} {...s} /><circle cx="32" cy="38" r="4" fill={HI} /></>,
  crate: (c) => <><rect x="8" y="16" width="48" height="38" rx="4" fill={c} {...s} /><path d="M20 16v38M32 16v38M44 16v38" stroke={HI} strokeWidth="3" /><path d="M8 16h48v38H8z" fill="none" {...s} /></>,
  crib: (c) => <><rect x="8" y="22" width="48" height="26" rx="3" fill={c} {...s} /><path d="M18 22v26M28 22v26M38 22v26M48 22v26" stroke={HI} strokeWidth="3" /><path d="M8 48v8M56 48v8M8 22v-6M56 22v-6" {...s} /></>,
  cable: (c) => <><rect x="10" y="10" width="16" height="22" rx="4" fill={c} {...s} /><path d="M14 10V4M22 10V4" {...s} /><path d="M18 32v8c0 14 28 14 28 0V30" fill="none" {...s} strokeWidth="4" /><rect x="40" y="18" width="12" height="14" rx="3" fill={c} {...s} /></>,
  bulb: (c) => <><path d="M32 8a16 16 0 0 0-10 28c3 3 4 6 4 10h12c0-4 1-7 4-10A16 16 0 0 0 32 8z" fill={c} {...s} /><rect x="25" y="46" width="14" height="10" rx="2" fill={HI} {...s} /><path d="M28 30l4 6 4-6" stroke={HI} strokeWidth="3" fill="none" /></>,
  measure: (c) => <><rect x="10" y="14" width="36" height="36" rx="8" fill={c} {...s} /><circle cx="28" cy="32" r="8" fill={HI} {...s} /><path d="M46 42h12v8H46" fill={HI} {...s} /></>,
  glove: (c) => <><path d="M20 56V30l-6-8a4 4 0 0 1 6-4l4 4V10a4 4 0 0 1 8 0v12-14a4 4 0 0 1 8 0v14-10a4 4 0 0 1 8 0v34l-4 10z" fill={c} {...s} /></>,
  thermometer: (c) => <><rect x="26" y="6" width="12" height="38" rx="6" fill={HI} {...s} /><circle cx="32" cy="48" r="10" fill={c} {...s} /><path d="M32 16v30" stroke={c} strokeWidth="5" strokeLinecap="round" /></>,
  shovel: (c) => <><path d="M32 6v30" {...s} strokeWidth="5" /><path d="M24 6h16" {...s} strokeWidth="5" /><path d="M14 36h36v10a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z" fill={c} {...s} /></>,
  ladder: (c) => <><path d="M20 6l-6 52M44 6l6 52" {...s} strokeWidth="5" stroke={c} /><path d="M20 6l-6 52M44 6l6 52" {...s} fill="none" /><path d="M19 18h26M17 30h30M16 42h32" {...s} /></>,
  triangle: (c) => <><path d="M32 8l26 46H6z" fill={c} {...s} /><path d="M32 24l12 22H20z" fill={HI} {...s} /></>,
  bandage: (c) => <><rect x="4" y="24" width="56" height="18" rx="9" fill={c} {...s} transform="rotate(-20 32 33)" /><rect x="22" y="25" width="20" height="16" rx="3" fill={HI} transform="rotate(-20 32 33)" /></>,
  cup: (c) => <><path d="M14 14h36l-5 42H19z" fill={c} {...s} /><path d="M16 26h32" stroke={HI} strokeWidth="4" /></>,
  gauge: (c) => <><circle cx="30" cy="30" r="20" fill={c} {...s} /><circle cx="30" cy="30" r="12" fill={HI} /><path d="M30 30l7-7" {...s} /><path d="M44 44l12 12" {...s} strokeWidth="5" /></>,
  hanger: (c) => <><path d="M32 22a6 6 0 1 1 6-6" fill="none" {...s} /><path d="M32 22L6 46h52z" fill={c} {...s} /><path d="M14 46h36" stroke={HI} strokeWidth="3" /></>,
  shower: (c) => <><path d="M14 56V18a8 8 0 0 1 16 0" fill="none" {...s} strokeWidth="4" /><path d="M22 18h20l6 10H16z" fill={c} {...s} /><path d="M22 36v4M32 36v6M42 36v4M27 46v4M37 46v4" stroke={c} strokeWidth="3" strokeLinecap="round" /></>,
  plunger: (c) => <><path d="M32 6v28" {...s} strokeWidth="6" stroke={c} /><path d="M32 6v28" {...s} fill="none" /><path d="M14 52c0-12 8-18 18-18s18 6 18 18z" fill={c} {...s} /></>,
} satisfies Record<string, Draw>;

type Name = keyof typeof D;

const BY_CAT: Record<CategoryId, Name> = {
  water: "jug", food: "can", drinks: "juice", dining: "plate", cooking: "pan", paper: "roll", cleaning: "spray",
  toiletries: "pump", health: "aid", power: "battery", sleep: "bed", outdoors: "tent", fun: "dice", baby: "babybottle",
  pets: "paw", party: "balloon", travel: "backpack", safety: "extinguisher", weather: "cloud", tools: "wrench",
  car: "car", school: "pencil", access: "rail", moving: "box", tasks: "folder",
};

const BY_ITEM: Record<string, Name> = {
  "wet-wipes": "wipes", "baby-wipes": "wipes", "disinfecting-wipes": "wipes", cooler: "cooler", "ice-packs": "cooler",
  "folding-table": "table", "camp-chairs": "chair", "rain-ponchos": "cloud", "large-button-phone": "phone",
  sunscreen: "tube", "antibiotic-ointment": "tube", "diaper-cream": "tube", "bug-spray": "spray",
  "pet-food-and-water-bowls": "bowl", "travel-pet-bowls": "bowl", "leash-and-id-tag": "tag", "collapsible-pet-crate": "crate",
  "pet-crate-for-home": "crate", "crib-or-bassinet": "crib", "crib-sheets": "blanket", "bed-sheets": "blanket", "twin-xl-sheets": "blanket",
  "bath-towels": "blanket", "mattress-topper": "bed", "moving-blankets": "blanket", "non-slip-bath-mat": "blanket",
  "charging-cables": "cable", "car-phone-charger": "cable", "car-charger-for-every-row": "cable", "light-bulbs": "bulb",
  "tape-measure": "measure", "disposable-gloves-for-first-aid": "glove", thermometer: "thermometer", "baby-thermometer": "thermometer",
  "indoor-thermometer-and-humidity-monitor": "thermometer", "fridge-and-freezer-thermometers": "thermometer", "food-thermometer": "thermometer",
  "snow-shovel": "shovel", "ice-melt": "shovel", ladder: "ladder", "roadside-warning-triangles": "triangle",
  "adhesive-bandages": "bandage", "elastic-bandage-wraps": "bandage", cups: "cup", tent: "tent", "tire-pressure-gauge": "gauge",
  hangers: "hanger", "handheld-shower-head": "shower", plunger: "plunger", "car-trunk-organizer": "box", "shower-caddy": "bag",
  "pots-and-pans-starter-set": "pan", "camp-cookware-set": "pan",
  "water-storage-container": "jug", water: "jug", "water-bricks": "bricks", "55-gallon-water-barrel": "jug",
  "3-day-emergency-food-supply": "bucket", "30-day-food-supply": "bucket", "manual-can-opener": "opener",
  flashlights: "flashlight", "work-flashlight-with-magnet": "flashlight", batteries: "battery", "aaa-batteries": "battery",
  "power-bank": "powerbank", "large-power-bank-20-000-mah": "powerbank", "portable-power-station": "station", generator: "station",
  "weather-radio": "radio", "hand-crank-weather-radio-with-charger": "radio", "first-aid-kit": "aid", "pet-first-aid-kit": "aid",
  "first-aid-kit-for-the-car": "aid", whistle: "whistle", masks: "mask", "smoke-and-co-alarm": "alarm", "carbon-monoxide-alarm": "alarm",
  "fire-extinguisher": "extinguisher", lantern: "lantern", "rechargeable-lantern": "lantern", headlamps: "headlamp",
  "portable-jump-starter": "bolt", "jumper-cables": "bolt", "dash-camera": "camera", "cordless-drill": "drill",
  "reusable-water-bottles": "bottle", "kids-water-bottles": "bottle", "personal-water-filter": "filter", "gravity-water-filter": "filter",
  "basic-tool-kit": "toolbox", "document-bag": "folder", "plastic-sheeting": "tarp", tarp: "tarp", "duct-tape": "tape", "packing-tape": "tape",
  "paper-road-map": "map", "emergency-blankets": "blanket", "extra-blankets": "blanket", "car-blanket": "blanket",
  "trash-bags": "bag", "kitchen-trash-bags-13-gallon": "bag", "go-bag": "backpack", "car-emergency-kit": "backpack",
  "motion-sensor-night-lights": "lantern", "sleeping-bags": "bed", "moving-boxes": "box",
};

export function ProductArt({ id, cat, color, size = 72 }: { id: string; cat: CategoryId; color: string; size?: number }) {
  const draw = D[BY_ITEM[id] ?? BY_CAT[cat] ?? "box"];
  return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>{draw(color)}</svg>;
}
