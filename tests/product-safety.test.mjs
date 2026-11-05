import { strict as assert } from 'node:assert'
import { allergyOptions, analyzeIngredients } from '../src/lib/allergen-detection.ts'
import { productProfiles, getProductSafetyStatus } from '../src/lib/product-safety.ts'

const expectations = {
  'almond-milk': [['Орехи'], ['Соя', 'Злаки / глютен']],
  'apple-juice': [[], []],
  bread: [['Злаки / глютен'], ['Кунжут', 'Молоко', 'Лактоза', 'Соя']],
  butter: [['Молоко', 'Лактоза'], []],
  cheese: [['Молоко', 'Лактоза'], []],
  chocolate: [['Молоко', 'Лактоза', 'Соя'], ['Орехи', 'Арахис']],
  cookies: [['Злаки / глютен', 'Яйца', 'Молоко', 'Лактоза'], ['Орехи', 'Соя']],
  cornflakes: [[], ['Молоко', 'Лактоза', 'Соя']],
  'cottage-cheese': [['Молоко', 'Лактоза'], []],
  'gluten-free-bread': [[], ['Кунжут', 'Яйца']],
  'granola-nuts': [['Злаки / глютен', 'Орехи', 'Арахис'], ['Соя']],
  granola: [['Злаки / глютен'], ['Орехи', 'Соя']],
  kefir: [['Молоко', 'Лактоза'], []],
  'lactose-free-milk': [['Молоко'], ['Соя']],
  'milk-chocolate': [['Молоко', 'Лактоза', 'Соя'], ['Орехи']],
  milk: [['Молоко', 'Лактоза'], []],
  oatmeal: [['Злаки / глютен'], ['Молоко', 'Лактоза', 'Орехи']],
  pasta: [['Злаки / глютен'], []],
  rice: [[], []],
  'soy-drink': [['Соя'], ['Орехи']],
  'yogurt-lactose-free': [['Молоко'], []],
  'yogurt-natural': [['Молоко', 'Лактоза'], []],
  yogurt: [['Молоко', 'Лактоза'], ['Злаки / глютен', 'Орехи']],
}
assert.equal(allergyOptions.length, 15) // 14 allergen categories plus lactose intolerance
assert.equal(Object.keys(productProfiles).length, 23)
for (const [id, [contains, traces]] of Object.entries(expectations)) {
  const profile = productProfiles[id]
  assert.ok(profile, id)
  for (const allergy of allergyOptions) {
    const expected = contains.includes(allergy) ? 'danger' : traces.includes(allergy) ? 'caution' : 'safe'
    assert.equal(getProductSafetyStatus(profile, [allergy]), expected, `${id}: ${allergy}`)
  }
}
assert.equal(getProductSafetyStatus(productProfiles.bread, ['Соя', 'Злаки / глютен']), 'danger')
assert.equal(getProductSafetyStatus(productProfiles['lactose-free-milk'], ['Лактоза']), 'safe')
assert.equal(getProductSafetyStatus(productProfiles['lactose-free-milk'], ['Молоко']), 'danger')
for (const [word, allergy] of [['яйцо','Яйца'], ['креветки','Ракообразные'], ['арахис','Арахис'], ['кунжут','Кунжут'], ['горчица','Горчица'], ['сельдерей','Сельдерей'], ['сульфиты','Сульфиты'], ['люпин','Люпин'], ['мидии','Моллюски'], ['пшеница','Злаки / глютен']]) {
  assert.equal(analyzeIngredients(word, [allergy]).status, 'danger', `${word}: ${allergy}`)
}
assert.equal(analyzeIngredients('мука пшеничная; может содержать сою', ['Соя']).status, 'caution')
console.log('All product matrix and allergen scanner checks passed')
