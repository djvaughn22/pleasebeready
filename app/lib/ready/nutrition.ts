// Calories and protein for the foods in the grocery mix, from the Nutrition
// Facts label of our pick (picks.ts), as printed in grocery retailers' product
// listings. Where listings disagreed we took the lower number, so food never
// looks like more than it is. Counted per unit of the catalog item (one can,
// one jar, one box, one bar). Another brand will differ: the label on the
// package is what counts.
//
// The day: 2,000 calories, the FDA's reference amount for food labels, and
// 50 g of protein, the FDA's Daily Value. Children need less; active adults,
// teens and nursing parents need more. These are planning numbers, not a
// diet: nothing here checks vitamins, minerals, allergies or special diets.
//
// Re-check by ASIN when a pick changes (a test fails if a pick's ASIN no
// longer matches its label here).

export const CALORIES_PER_DAY = 2000;
export const PROTEIN_PER_DAY = 50;
export const LABELS_CHECKED = "2026-11-05";

export type Label = {
  /** Catalog item. */
  id: string;
  /** The pick this label belongs to. */
  asin: string;
  /** Calories in one unit. */
  kcal: number;
  /** Grams of protein in one unit; null when no listing showed it (counted as 0). */
  protein: number | null;
  /** How the unit's numbers were worked out from the label. */
  basis: string;
  /** A retailer listing that showed the label. */
  source: string;
};

export const LABELS: Label[] = [
  { id: "canned-soups-and-stews", asin: "B0014EW4L4", kcal: 340, protein: null,
    basis: "170 cal per 1-cup serving × 2 servings in an 18.8 oz can (one listing shows 370 for the can)",
    source: "https://www.target.com/p/campbell-39-s-chunky-creamy-chicken-38-dumplings-soup-18-8oz/-/A-14770542" },
  { id: "canned-tuna-or-chicken", asin: "B003WT31QQ", kcal: 90, protein: 20,
    basis: "90 cal and 20 g protein for 1 can, drained (113 g); the 48-can case holds the same 5 oz can",
    source: "https://shoprite.com/sm/planning/rsid/514/product/starkist-chunk-light-tuna-in-water-5-oz-id-00080000005281" },
  { id: "canned-beans", asin: "B01ALQKTKS", kcal: 455, protein: 28,
    basis: "130 cal and 8 g protein per ½ cup × 3.5 servings in a 15.5 oz can",
    source: "https://stopandshop.com/groceries/product/goya-black-beans-15-5-oz-can/14334" },
  { id: "canned-vegetables", asin: "B078SZHZ82", kcal: 50, protein: null,
    basis: "Cut green beans: 15–20 cal per ½ cup × about 3.5 servings in a 14.5 oz can, counted at the lower number",
    source: "https://shoprite.com/sm/pickup/rsid/518/product/del-monte-fresh-cut-blue-lake-cut-green-beans-145-oz-id-00024000162865" },
  { id: "canned-fruit", asin: "B0025UCL64", kcal: 210, protein: null,
    basis: "60 cal per ½ cup × 3.5 servings in a 15 oz can (other listings show 70 cal)",
    source: "https://stopandshop.com/groceries/product/del-monte-sliced-peaches-in-100-juice-15-oz-can/12031" },
  { id: "shelf-stable-milk", asin: "B07TD93FXL", kcal: 150, protein: 8,
    basis: "150 cal and 8 g protein per 8 fl oz box",
    source: "https://stopandshop.com/groceries/product/horizon-organic-whole-milk-shelf-stable-8-oz-box/398509" },
  { id: "peanut-butter", asin: "B07DTYVDJ6", kcal: 6650, protein: 245,
    basis: "190 cal and 7 g protein per 2 Tbsp (32 g) × about 35 servings in a 40 oz jar",
    source: "https://foodlion.com/groceries/product/skippy-creamy-peanut-butter-40-oz-jar/6753" },
  { id: "pretzels-and-crackers", asin: "B002UM3M6K", kcal: 1960, protein: 28,
    basis: "70 cal and 1 g protein per 5 crackers × about 28 servings in a 16 oz box",
    source: "https://www.heb.com/product-detail/premium-original-saltine-crackers/138699" },
  { id: "granola-or-protein-bars", asin: "B0BF4CFT62", kcal: 95, protein: 1.5,
    basis: "190 cal and 3 g protein per 2 bars (Oats 'n Honey; Peanut Butter is 200 cal), counted per bar",
    source: "https://www.shaws.com/shop/product-details.960000453.html" },
];

/**
 * Labels for other products we list for the same food (picks.ts), so a swap is
 * counted by calories too: a 12.5 oz can of chicken is not a 5 oz can of tuna.
 * Same rules: retailer copies of the label, the lower number when they disagree.
 */
export const OTHER_LABELS: Label[] = [
  { id: "canned-soups-and-stews", asin: "B0014EOUU2", kcal: 180, protein: 6,
    basis: "90 cal and 3 g protein per 1-cup serving × about 2 servings in an 18.8 oz can",
    source: "https://giantfoodstores.com/groceries/product/campbells-chunky-savory-vegetable-soup-18-8-oz-can/7052" },
  { id: "canned-beans", asin: "B01MQRSTKC", kcal: 330, protein: 21,
    basis: "110 cal and 7 g protein per ½ cup × about 3 servings in a 15 oz can (other listings show 120 cal and 8 g)",
    source: "https://shoprite.com/product/bushs-best-reduced-sodium-black-beans-id-00039400018834" },
  { id: "canned-tuna-or-chicken", asin: "B0D81L6MD5", kcal: 160, protein: 30,
    basis: "80 cal and 15 g protein per 3 oz drained serving × about 2 servings in a 12.5 oz can (one listing shows 3.5 servings)",
    source: "https://stopandshop.com/groceries/product/swanson-less-sodium-premium-white-chunk-chicken-breast-in-water-12-5-oz-can/319010" },
];

const BY_ID = new Map(LABELS.map((l) => [l.id, l]));
const BY_ASIN = new Map([...LABELS, ...OTHER_LABELS].map((l) => [l.asin, l]));
/** The label of our first pick for a food: the numbers the plan counts in. */
export const labelFor = (id: string) => BY_ID.get(id);
/** Any product's label, ours or another we list. */
export const labelForAsin = (asin: string) => BY_ASIN.get(asin);
