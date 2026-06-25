export type LocalAttempt = {
  localId: string
  questionId: string
  questionVersion: number
  answer: unknown
  isCorrect: boolean
  durationMs?: number
  createdAt: string
  syncedAt?: string
}

export type LocalQuestionState = {
  questionId: string
  answeredCount: number
  correctCount: number
  wrongCount: number
  lastAnswer: unknown
  lastCorrect: boolean | null
  lastAnsweredAt: string | null
  mastery: number
}
