export const allergyOptions = ['Молоко', 'Лактоза', 'Яйца', 'Рыба', 'Ракообразные', 'Орехи', 'Арахис', 'Соя', 'Злаки / глютен', 'Сельдерей', 'Горчица', 'Кунжут', 'Сульфиты', 'Люпин', 'Моллюски'] as const
export type Allergy = typeof allergyOptions[number]
export type SafetyStatus = 'safe' | 'caution' | 'danger'

export type DetectedMatch = {
  word: string
  allergen: Allergy
  trace: boolean
  start: number
  end: number
}

export type ScanAnalysis = {
  status: SafetyStatus
  matches: DetectedMatch[]
  containsAllergens: Allergy[]
  traceAllergens: Allergy[]
  activeMatches: DetectedMatch[]
}

// Маркеры: основы слов, по которым в тексте состава определяется общий аллерген.
const ALLERGEN_MARKERS: Record<Allergy, string[]> = {
  Молоко: ['молок', 'сливк', 'сливочн', 'сыворот', 'казеин', 'творог', 'сыр', 'кефир', 'йогурт', 'пахта'],
  Лактоза: ['молок', 'лактоз', 'сливк', 'сливочн', 'сыворот', 'творог', 'сыр', 'кефир', 'йогурт', 'пахта'],
  Яйца: ['яйц', 'яичн', 'яич', 'меланж', 'альбумин'],
  Рыба: ['рыб', 'лосос', 'треск', 'тунц', 'сельд', 'анчоус', 'скумбр', 'семг', 'форел'],
  Ракообразные: ['ракообраз', 'кревет', 'краб', 'омар', 'лангуст', 'раков'],
  Орехи: ['орех', 'миндал', 'фундук', 'кешью', 'фисташ', 'пекан', 'грецк', 'макадам'],
  Арахис: ['арахис'],
  Соя: ['соя', 'сою', 'сои', 'соев', 'тофу', 'эдамам'],
  'Злаки / глютен': ['глютен', 'пшениц', 'пшенич', 'рожь', 'ржан', 'ячмен', 'овес', 'овся', 'полб', 'манн'],
  Сельдерей: ['сельдер'],
  Горчица: ['горчиц', 'горчич'],
  Кунжут: ['кунжут', 'сезам'],
  Сульфиты: ['сульфит', 'сульфид', 'диоксид'],
  Люпин: ['люпин'],
  Моллюски: ['моллюск', 'миди', 'устриц', 'кальмар', 'осьминог', 'гребеш', 'улит'],
}

// Фразы, после которых перечисленные аллергены считаются возможными следами, а не ингредиентами.
const TRACE_PATTERN = /может содержать|возможн[а-я]* следы|следы|перекрест/

function normalize(text: string) {
  return text.toLocaleLowerCase('ru').replaceAll('ё', 'е')
}

function findAllergens(word: string): Allergy[] {
  return allergyOptions.filter((allergen) =>
    ALLERGEN_MARKERS[allergen].some((marker) => word.startsWith(marker)),
  )
}

// Находит маркеры аллергенов в тексте состава и сверяет их с активным профилем пользователя.
export function analyzeIngredients(text: string, activeAllergies: Allergy[]): ScanAnalysis {
  const normalized = normalize(text)
  const traceStart = normalized.search(TRACE_PATTERN)
  const seen = new Set<string>()
  const matches: DetectedMatch[] = []

  for (const token of normalized.matchAll(/[а-я]+/g)) {
    const word = token[0]
    const start = token.index ?? 0
    for (const allergen of findAllergens(word)) {
      const trace = traceStart !== -1 && start >= traceStart
      const key = `${allergen}:${word}:${trace}`
      if (seen.has(key)) continue
      seen.add(key)
      matches.push({ word, allergen, trace, start, end: start + word.length })
    }
  }

  const direct = matches.filter((match) => !match.trace)
  const traces = matches.filter((match) => match.trace)
  const dangerMatches = direct.filter((match) => activeAllergies.includes(match.allergen))
  const cautionMatches = traces.filter((match) => activeAllergies.includes(match.allergen))
  const status: SafetyStatus = dangerMatches.length ? 'danger' : cautionMatches.length ? 'caution' : 'safe'

  return {
    status,
    matches,
    containsAllergens: [...new Set(direct.map((match) => match.allergen))],
    traceAllergens: [...new Set(traces.map((match) => match.allergen))].filter(
      (allergen) => !direct.some((match) => match.allergen === allergen),
    ),
    activeMatches: [...dangerMatches, ...cautionMatches],
  }
}
