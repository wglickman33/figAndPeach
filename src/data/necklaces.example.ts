/**
 * Necklace catalog template — copy to `necklaces.ts` when building the form.
 * Edit names, descriptions, prices, and image paths here to update the product picker.
 */
export type Necklace = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // path under public/, e.g. "/necklaces/pearl-strand.jpg"
};

export const NECKLACE_LENGTHS = [14, 16, 18, 20] as const;
export const CLASP_TYPES = ["Toggle", "Lobster", "Spring Ring"] as const;

export const necklaces: Necklace[] = [
  {
    id: "example-1",
    name: "Example Necklace",
    description: "Short description shown on the product picker.",
    price: 48,
    image: "/necklaces/placeholder.jpg",
  },
];
