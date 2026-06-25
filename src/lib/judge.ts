import { QuestionType } from "@prisma/client"

export type JudgeResult = {
  isCorrect: boolean
  correctAnswer: unknown
}

function normalizeBlankAnswer(answer: string): string {
  return answer
    .trim()
    .replace(/\s+/g, "")
    .replace(/[，。、；：！？【】《》“”‘’]/g, "")
    .replace(/[,. ;:!?\[\]<>"']/g, "")
}

export function judgeAnswer(
  type: QuestionType,
  userAnswer: unknown,
  correctAnswer: unknown
): JudgeResult {
  switch (type) {
    case QuestionType.SINGLE_CHOICE:
    case QuestionType.JUDGE: {
      const isCorrect = String(userAnswer).trim() === String(correctAnswer).trim()
      return { isCorrect, correctAnswer }
    }

    case QuestionType.MULTIPLE_CHOICE: {
      const userArr = (Array.isArray(userAnswer) ? userAnswer : [userAnswer]).map(String).sort()
      const correctArr = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer])
        .map(String)
        .sort()
      const isCorrect =
        userArr.length === correctArr.length && userArr.every((v, i) => v === correctArr[i])
      return { isCorrect, correctAnswer }
    }

    case QuestionType.BLANK: {
      const blankAnswer = correctAnswer as {
        answers: string[]
        mode: "any" | "all"
      }

      if (blankAnswer.mode === "all") {
        const userArr = Array.isArray(userAnswer) ? userAnswer.map((item) => normalizeBlankAnswer(String(item))) : []
        const correctArr = blankAnswer.answers.map(normalizeBlankAnswer)
        const isCorrect =
          userArr.length === correctArr.length && userArr.every((value, index) => value === correctArr[index])
        return { isCorrect, correctAnswer }
      }

      const userStr = normalizeBlankAnswer(String(userAnswer))
      const normalizedAccepted = blankAnswer.answers.map(normalizeBlankAnswer)
      const isCorrect = normalizedAccepted.includes(userStr)
      return { isCorrect, correctAnswer }
    }

    case QuestionType.ORDERING: {
      const userArr = Array.isArray(userAnswer) ? userAnswer.map(String) : []
      const correctArr = Array.isArray(correctAnswer) ? correctAnswer.map(String) : []
      const isCorrect =
        userArr.length === correctArr.length && userArr.every((v, i) => v === correctArr[i])
      return { isCorrect, correctAnswer }
    }

    case QuestionType.READING:
    default:
      return { isCorrect: false, correctAnswer }
  }
}
