export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
  explain: string
}

export interface Module {
  id: string
  num: number
  sg: string
  title: string
  tagline: string
  /** the primitive's one-word role, used as a memory hook */
  mnemonic: string
  baseline: string
  why: string
  whenNot: string
  quality: string
  composition: string
  reference: string
  lab: string
  selfCheck: string[]
  quiz: QuizQuestion[]
}

export interface GlossaryTerm {
  term: string
  group: string
  def: string
  moduleId?: string
}
