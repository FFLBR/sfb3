import type { Allergy, SafetyStatus } from './allergen-detection'

export type ProductAllergens = { allergens: Allergy[]; mayContain: Allergy[] }

// Учебные профили категорий: не являются сведениями о конкретном производителе.
export const productProfiles = {
  'almond-milk': { allergens: ['Орехи'], mayContain: ['Соя', 'Злаки / глютен'] },
  'apple-juice': { allergens: [], mayContain: [] },
  bread: { allergens: ['Злаки / глютен'], mayContain: ['Кунжут', 'Молоко', 'Лактоза', 'Соя'] },
  butter: { allergens: ['Молоко', 'Лактоза'], mayContain: [] },
  cheese: { allergens: ['Молоко', 'Лактоза'], mayContain: [] },
  chocolate: { allergens: ['Молоко', 'Лактоза', 'Соя'], mayContain: ['Орехи', 'Арахис'] },
  cookies: { allergens: ['Злаки / глютен', 'Яйца', 'Молоко', 'Лактоза'], mayContain: ['Орехи', 'Соя'] },
  cornflakes: { allergens: [], mayContain: ['Молоко', 'Лактоза', 'Соя'] },
  'cottage-cheese': { allergens: ['Молоко', 'Лактоза'], mayContain: [] },
  'gluten-free-bread': { allergens: [], mayContain: ['Кунжут', 'Яйца'] },
  'granola-nuts': { allergens: ['Злаки / глютен', 'Орехи', 'Арахис'], mayContain: ['Соя'] },
  granola: { allergens: ['Злаки / глютен'], mayContain: ['Орехи', 'Соя'] },
  kefir: { allergens: ['Молоко', 'Лактоза'], mayContain: [] },
  'lactose-free-milk': { allergens: ['Молоко'], mayContain: ['Соя'] },
  'milk-chocolate': { allergens: ['Молоко', 'Лактоза', 'Соя'], mayContain: ['Орехи'] },
  milk: { allergens: ['Молоко', 'Лактоза'], mayContain: [] },
  oatmeal: { allergens: ['Злаки / глютен'], mayContain: ['Молоко', 'Лактоза', 'Орехи'] },
  pasta: { allergens: ['Злаки / глютен'], mayContain: [] },
  rice: { allergens: [], mayContain: [] },
  'soy-drink': { allergens: ['Соя'], mayContain: ['Орехи'] },
  'yogurt-lactose-free': { allergens: ['Молоко'], mayContain: [] },
  'yogurt-natural': { allergens: ['Молоко', 'Лактоза'], mayContain: [] },
  yogurt: { allergens: ['Молоко', 'Лактоза'], mayContain: ['Злаки / глютен', 'Орехи'] },
} satisfies Record<string, ProductAllergens>

export type ProductProfileId = keyof typeof productProfiles

export function getProductSafetyStatus(product: ProductAllergens, allergies: Allergy[]): SafetyStatus {
  if (product.allergens.some((allergen) => allergies.includes(allergen))) return 'danger'
  if (product.mayContain.some((allergen) => allergies.includes(allergen))) return 'caution'
  return 'safe'
}
