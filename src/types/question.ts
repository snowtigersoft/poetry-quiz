import { QuestionType, QuestionStatus } from "@prisma/client"

export type QuestionWithOptions = {
  id: string
  type: QuestionType
  stem: string
  answer: unknown
  explanation: string | null
  source: string | null
  grade: number | null
  difficulty: number
  status: QuestionStatus
  version: number
  options: Array<{
    id: string
    label: string
    content: string
    sortOrder: number
  }>
  tags: Array<{
    tag: {
      id: string
      name: string
      type: string
    }
  }>
}
