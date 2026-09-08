// The Preparedness Bookshelf — a small, hand-curated, editorial list. Every
// title/author/year/ISBN/cover here was checked against Open Library's own
// records (openlibrary.org/works/<key>.json and the availability API)
// before being added — see the comment on each entry for what was verified
// and when. Add or remove books by editing this array; nothing else in the
// app needs to change.

export type ReadinessCategory =
  | "emergency-readiness"
  | "first-aid"
  | "food-water"
  | "home-resilience"
  | "financial"
  | "faith-emotional"
  | "family"
  | "traditional-skills";

export const CATEGORY_LABELS: Record<ReadinessCategory, string> = {
  "emergency-readiness": "Emergency readiness",
  "first-aid": "First aid & medicine",
  "food-water": "Food & water",
  "home-resilience": "Home resilience",
  financial: "Financial preparedness",
  "faith-emotional": "Faith & emotional steadiness",
  family: "Family preparedness",
  "traditional-skills": "Traditional skills",
};

export interface PrepBook {
  slug: string;
  title: string;
  author: string;
  /** First-publication year per Open Library's work record. */
  year: number;
  category: ReadinessCategory;
  /** DJ's own one-or-two-sentence take — not marketing copy. */
  whyUseful: string;
  whatYouLearn: string[];
  /** A verified ISBN-10 or ISBN-13 from Open Library, when the record has one. */
  isbn?: string;
  /** Open Library cover_i, when the record has one — used for the cover image. */
  coverId?: number;
  /** Open Library work key, e.g. "OL46125W" — powers both the cover fallback and the ReadNotRead cross-link. */
  openLibraryWorkKey: string;
  /** From openlibrary.org/availability/v2 — checked at curation time, not live. */
  freeToRead: boolean;
  freeToBorrow: boolean;
  /** Only true for mainstream trade nonfiction with well-known commercial
   * audiobook editions — everything else omits the Audible action rather
   * than guess. This is a curation judgment, not an API-verified fact. */
  hasKnownAudiobook: boolean;
}

export const BOOKS: PrepBook[] = [
  {
    slug: "preppers-blueprint",
    title: "The Prepper's Blueprint",
    author: "Tess Pennington",
    year: 2014,
    category: "emergency-readiness",
    whyUseful:
      "A calm, step-by-step framework for building readiness in stages instead of panic-buying everything at once — good for a household just starting out.",
    whatYouLearn: [
      "How to sequence readiness work over weeks and months, not a single weekend",
      "A room-by-room approach to home preparedness",
      "How to plan for different disaster timelines (72 hours vs. weeks)",
    ],
    isbn: "9781496092588",
    coverId: 11237713,
    openLibraryWorkKey: "OL24581606W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: false,
  },
  {
    slug: "survival-medicine-handbook",
    title: "The Survival Medicine Handbook",
    author: "Joseph Alton & Amy Alton",
    year: 2013,
    category: "first-aid",
    whyUseful:
      "Written by a doctor-and-nurse team specifically for a world without a nearby ER — practical, not squeamish about what to do when you can't just call 911.",
    whatYouLearn: [
      "How to build a real medical kit, not just a first-aid box",
      "What to do for wounds, burns, and fractures when help is far away",
      "When a home remedy is enough and when it genuinely isn't",
    ],
    isbn: "098887251X",
    openLibraryWorkKey: "OL19717554W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: false,
  },
  {
    slug: "where-there-is-no-doctor",
    title: "Where There Is No Doctor",
    author: "David Werner",
    year: 1978,
    category: "first-aid",
    whyUseful:
      "The classic community health handbook written for villages with no doctor at all — the most complete plain-language medical reference of its kind, still updated and used worldwide.",
    whatYouLearn: [
      "How to recognize and respond to common illness and injury without professional help",
      "Basic hygiene, nutrition, and infection-prevention practices",
      "When a situation truly requires evacuation to real medical care",
    ],
    openLibraryWorkKey: "OL43211445W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: false,
  },
  {
    slug: "root-cellaring",
    title: "Root Cellaring",
    author: "Mike & Nancy Bubel",
    year: 1979,
    category: "food-water",
    whyUseful:
      "The standard reference for storing fruits and vegetables the old way — no power, no canning, just cold and the right conditions. Directly useful the moment the power goes out.",
    whatYouLearn: [
      "Which vegetables and fruits actually keep in cold storage, and for how long",
      "How to build or adapt a root cellar in a basement, garage, or buried container",
      "How to plan a harvest around what you can store, not just what you can can",
    ],
    isbn: "0882667408",
    coverId: 3976422,
    openLibraryWorkKey: "OL4127523W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: false,
  },
  {
    slug: "nuclear-war-survival-skills",
    title: "Nuclear War Survival Skills",
    author: "Cresson H. Kearny",
    year: 1980,
    category: "home-resilience",
    whyUseful:
      "A former Oak Ridge National Laboratory researcher's field-tested, no-nonsense guide to shelter, fallout protection, and expedient home-built equipment — the rare prep book built on actual tested experiments, not opinion.",
    whatYouLearn: [
      "How to build expedient fallout shelters from ordinary household materials",
      "How radiation actually works and what genuinely protects against it",
      "How to build simple, effective ventilation and water tools from scratch",
    ],
    isbn: "094248701X",
    coverId: 4806691,
    openLibraryWorkKey: "OL6098798W",
    // Verified via openlibrary.org/availability/v2: is_readable = true.
    freeToRead: true,
    freeToBorrow: false,
    hasKnownAudiobook: false,
  },
  {
    slug: "total-money-makeover",
    title: "The Total Money Makeover",
    author: "Dave Ramsey",
    year: 2003,
    category: "financial",
    whyUseful:
      "The most widely used plain-English debt-payoff plan in print. Financial readiness is preparedness too — an emergency is worse with no cushion and high-interest debt.",
    whatYouLearn: [
      "A concrete, ordered plan for getting out of debt and building savings",
      "How to build a starter emergency fund before tackling everything else",
      "Why perfect optimization matters less than a plan you'll actually follow",
    ],
    isbn: "0785263268",
    coverId: 6873839,
    openLibraryWorkKey: "OL16027047W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: true,
  },
  {
    slug: "your-money-or-your-life",
    title: "Your Money or Your Life",
    author: "Vicki Robin & Joe Dominguez",
    year: 1992,
    category: "financial",
    whyUseful:
      "A deeper, longer-view companion to a debt-payoff plan — reframes spending against actual life energy, which is what makes a family's finances resilient for years, not just one emergency.",
    whatYouLearn: [
      "How to track spending against the hours of life it actually costs",
      "How to calculate a real, honest household budget",
      "How to build toward genuine financial independence, not just solvency",
    ],
    isbn: "0670843318",
    coverId: 6975229,
    openLibraryWorkKey: "OL4275330W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: true,
  },
  {
    slug: "mans-search-for-meaning",
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    year: 1946,
    category: "faith-emotional",
    whyUseful:
      "A psychiatrist and Holocaust survivor's account of finding meaning under the worst conditions imaginable. The single most useful book we know of on staying emotionally steady when everything else is not.",
    whatYouLearn: [
      "Why a sense of purpose is a practical survival tool, not just a comfort",
      "How people kept their footing under extreme, prolonged hardship",
      "A framework (logotherapy) for finding meaning in difficult circumstances",
    ],
    isbn: "0671023373",
    coverId: 8516506,
    openLibraryWorkKey: "OL1268413W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: true,
  },
  {
    slug: "just-in-case",
    title: "Just in Case",
    author: "Kathy Harrison",
    year: 2008,
    category: "family",
    whyUseful:
      "Written by a mother of eight (also a foster parent) about making an ordinary household ready — the most family-and-kids-centered book on this list, not written for a bunker.",
    whatYouLearn: [
      "How to involve the whole family in readiness without scaring young kids",
      "How to build a home emergency binder with the documents you'd actually need",
      "Realistic food and supply rotation for a real household, not a solo prepper",
    ],
    isbn: "9781603420358",
    coverId: 2980963,
    openLibraryWorkKey: "OL5851755W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: false,
  },
  {
    slug: "foxfire-book",
    title: "The Foxfire Book",
    author: "Eliot Wigginton (editor)",
    year: 1972,
    category: "traditional-skills",
    whyUseful:
      "Appalachian folk knowledge collected directly from the people who lived it — log cabin building, hog dressing, home remedies, and more, in their own words. The original source for a lot of modern \"traditional skills\" content.",
    whatYouLearn: [
      "Hearth cooking, preserving, and other pre-electricity home skills",
      "Building techniques (log cabins, chimneys, tools) done by hand",
      "Why these skills mattered and how they were actually practiced",
    ],
    coverId: 8083218,
    openLibraryWorkKey: "OL16524559W",
    // Verified via openlibrary.org/availability/v2: is_lendable = true
    // (borrow_available at time of curation — may require a waitlist).
    freeToRead: false,
    freeToBorrow: true,
    hasKnownAudiobook: false,
  },
  {
    slug: "bushcraft-101",
    title: "Bushcraft 101",
    author: "Dave Canterbury",
    year: 2014,
    category: "traditional-skills",
    whyUseful:
      "A modern, organized field guide to wilderness self-reliance — the '5 Cs' framework (cutting, covering, combustion, containers, cordage) is a genuinely useful way to think about what gear actually matters.",
    whatYouLearn: [
      "How to build and use a basic wilderness survival kit",
      "Fire-building, shelter, and water procurement in the field",
      "A simple framework for prioritizing gear and skills together",
    ],
    isbn: "9781440579776",
    coverId: 9109270,
    openLibraryWorkKey: "OL19984301W",
    freeToRead: false,
    freeToBorrow: false,
    hasKnownAudiobook: true,
  },
];

export function booksByCategory(category: ReadinessCategory | "all"): PrepBook[] {
  return category === "all" ? BOOKS : BOOKS.filter((b) => b.category === category);
}
