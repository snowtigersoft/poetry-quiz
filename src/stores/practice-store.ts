import { create } from "zustand"
import { QuestionWithOptions } from "@/types/question"

type PracticeState = {
  questions: QuestionWithOptions[]
  currentIndex: number
  answers: Record<string, unknown>
  results: Record<string, boolean>
  showExplanation: boolean
  practiceSetId: string | null
  practiceSetTitle: string

  setQuestions: (questions: QuestionWithOptions[], setId?: string, title?: string) => void
  setAnswer: (questionId: string, answer: unknown) => void
  setResult: (questionId: string, isCorrect: boolean) => void
  nextQuestion: () => void
  prevQuestion: () => void
  goToQuestion: (index: number) => void
  toggleExplanation: () => void
  reset: () => void
}

export const usePracticeStore = create<PracticeState>((set) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  results: {},
  showExplanation: false,
  practiceSetId: null,
  practiceSetTitle: "",

  setQuestions: (questions, setId, title) =>
    set({
      questions,
      currentIndex: 0,
      answers: {},
      results: {},
      showExplanation: false,
      practiceSetId: setId ?? null,
      practiceSetTitle: title ?? "",
    }),

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  setResult: (questionId, isCorrect) =>
    set((state) => ({
      results: { ...state.results, [questionId]: isCorrect },
    })),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
      showExplanation: false,
    })),

  prevQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
      showExplanation: false,
    })),

  goToQuestion: (index) => set({ currentIndex: index, showExplanation: false }),

  toggleExplanation: () => set((state) => ({ showExplanation: !state.showExplanation })),

  reset: () =>
    set({
      questions: [],
      currentIndex: 0,
      answers: {},
      results: {},
      showExplanation: false,
      practiceSetId: null,
      practiceSetTitle: "",
    }),
}))
