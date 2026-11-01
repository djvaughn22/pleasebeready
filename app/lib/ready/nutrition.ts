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
export const LABELS_CHECKED = "2026-10-31";

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
  { id: "canned-tuna-or-chicken", asin: "B07QJ5NCBP", kcal: 90, protein: 20,
    basis: "90 cal and 20 g protein for 1 can, drained (113 g)",
    source: "https://shoprite.com/sm/planning/rsid/514/product/starkist-chunk-light-tuna-in-water-5-oz-id-00080000005281" },
  { id: "canned-beans", asin: "B01N1O1TF8", kcal: 330, protein: 21,
    basis: "110 cal and 7 g protein per ½ cup × about 3 servings in a 15 oz can (other listings show 130 cal)",
    source: "https://www.shoprite.com/product/bushs-best-black-beans-15-oz-id-00039400018803" },
  { id: "canned-vegetables", asin: "B08WJW4DBS", kcal: 50, protein: null,
    basis: "Counted as green beans, the lower of the pack: 15–20 cal per ½ cup × about 3.5 servings (the corn cans have more)",
    source: "https://shoprite.com/sm/pickup/rsid/518/product/del-monte-fresh-cut-blue-lake-cut-green-beans-145-oz-id-00024000162865" },
  { id: "canned-fruit", asin: "B0025UCJ8O", kcal: 210, protein: 3.5,
    basis: "60 cal and 1 g protein per ½ cup × 3.5 servings in a 15 oz can",
    source: "https://hannaford.com/groceries/soups-canned-goods/canned-fruit/del-monte-fruit-cocktail-in-100-juice-15-oz-can.html" },
  { id: "shelf-stable-milk", asin: "B07TD93FXL", kcal: 150, protein: 8,
    basis: "150 cal and 8 g protein per 8 fl oz box",
    source: "https://stopandshop.com/groceries/product/horizon-organic-whole-milk-shelf-stable-8-oz-box/398509" },
  { id: "peanut-butter", asin: "B000R2Z2S6", kcal: 6460, protein: 238,
    basis: "190 cal and 7 g protein per 2 Tbsp (33 g) × 34 servings in a 40 oz (1,134 g) jar",
    source: "https://www.shoprite.com/product/jif-creamy-peanut-butter-40-oz-id-00051500720011" },
  { id: "pretzels-and-crackers", asin: "B002UM3M6K", kcal: 1960, protein: 28,
    basis: "70 cal and 1 g protein per 5 crackers × about 28 servings in a 16 oz box",
    source: "https://www.heb.com/product-detail/premium-original-saltine-crackers/138699" },
  { id: "granola-or-protein-bars", asin: "B0BF4CFT62", kcal: 95, protein: 1.5,
    basis: "190 cal and 3 g protein per 2 bars (Oats 'n Honey; Peanut Butter is 200 cal), counted per bar",
    source: "https://www.shaws.com/shop/product-details.960000453.html" },
];

const BY_ID = new Map(LABELS.map((l) => [l.id, l]));
export const labelFor = (id: string) => BY_ID.get(id);
