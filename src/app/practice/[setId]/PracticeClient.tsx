"use client"

import { useState } from "react"
import Link from "next/link"
import { QuestionWithOptions } from "@/types/question"
import { judgeAnswer } from "@/lib/judge"
import { QuestionType } from "@prisma/client"

type Props = {
  practiceSetId: string
  practiceSetTitle: string
  questions: QuestionWithOptions[]
}

export default function PracticeClient({ practiceSetId, practiceSetTitle, questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [showExplanation, setShowExplanation] = useState(false)

  const currentQuestion = questions[currentIndex]

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="mb-4 text-5xl">📭</div>
          <p className="text-gray-500">此题组暂无题目</p>
          <Link href="/practice" className="mt-4 block text-amber-600 hover:underline">
            返回练习入口
          </Link>
        </div>
      </div>
    )
  }

  const currentAnswer = answers[currentQuestion.id]
  const currentResult = results[currentQuestion.id]
  const isAnswered = currentQuestion.id in results

  function handleAnswer(answer: unknown) {
    if (isAnswered) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
  }

  function handleSubmit() {
    const hasAnswer =
      currentAnswer !== undefined && (!Array.isArray(currentAnswer) || currentAnswer.length > 0)
    if (!hasAnswer) return

    const { isCorrect } = judgeAnswer(
      currentQuestion.type as QuestionType,
      currentAnswer,
      currentQuestion.answer
    )
    setResults((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }))

    void fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        practiceSetId,
        questionId: currentQuestion.id,
        answer: currentAnswer,
      }),
    }).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save attempt", error)
      }
    })
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setShowExplanation(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-amber-50">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <Link href="/practice" className="text-sm text-amber-600">
          ← 退出
        </Link>
        <div className="mx-4 truncate text-sm font-medium text-gray-700">{practiceSetTitle}</div>
        <div className="shrink-0 text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </div>
      </header>

      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-amber-400 transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <p className="mb-6 text-lg font-medium leading-relaxed text-gray-900">{currentQuestion.stem}</p>

          {(currentQuestion.type === "SINGLE_CHOICE" ||
            currentQuestion.type === "MULTIPLE_CHOICE") && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected =
                  currentQuestion.type === "SINGLE_CHOICE"
                    ? currentAnswer === opt.label
                    : Array.isArray(currentAnswer) && currentAnswer.includes(opt.label)

                let btnClass =
                  "w-full rounded-xl border-2 px-4 py-3 text-left text-base transition-colors "
                if (isAnswered) {
                  const correctAnswers = Array.isArray(currentQuestion.answer)
                    ? currentQuestion.answer
                    : [currentQuestion.answer]
                  const isCorrectOption = (correctAnswers as string[]).includes(opt.label)
                  if (isCorrectOption) {
                    btnClass += "border-green-500 bg-green-50 text-green-800"
                  } else if (isSelected) {
                    btnClass += "border-red-400 bg-red-50 text-red-800"
                  } else {
                    btnClass += "border-gray-200 bg-gray-50 text-gray-500"
                  }
                } else {
                  btnClass += isSelected
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                }

                return (
                  <button
                    key={opt.id}
                    className={btnClass}
                    onClick={() => {
                      if (currentQuestion.type === "MULTIPLE_CHOICE") {
                        const prev = Array.isArray(currentAnswer) ? currentAnswer : []
                        if ((prev as string[]).includes(opt.label)) {
                          handleAnswer((prev as string[]).filter((v) => v !== opt.label))
                        } else {
                          handleAnswer([...(prev as string[]), opt.label])
                        }
                      } else {
                        handleAnswer(opt.label)
                      }
                    }}
                    disabled={isAnswered}
                  >
                    <span className="mr-2 font-medium">{opt.label}.</span>
                    {opt.content}
                  </button>
                )
              })}
            </div>
          )}

          {currentQuestion.type === "JUDGE" && (
            <div className="flex gap-4">
              {["正确", "错误"].map((opt) => {
                const val = opt === "正确" ? "true" : "false"
                const isSelected = currentAnswer === val
                let btnClass =
                  "flex-1 rounded-xl border-2 py-3 text-base font-medium transition-colors "
                if (isAnswered) {
                  const correctVal =
                    currentQuestion.answer === true || currentQuestion.answer === "true"
                      ? "true"
                      : "false"
                  if (val === correctVal) {
                    btnClass += "border-green-500 bg-green-50 text-green-800"
                  } else if (isSelected) {
                    btnClass += "border-red-400 bg-red-50 text-red-800"
                  } else {
                    btnClass += "border-gray-200 bg-gray-50 text-gray-500"
                  }
                } else {
                  btnClass += isSelected
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                }
                return (
                  <button
                    key={opt}
                    className={btnClass}
                    onClick={() => handleAnswer(val)}
                    disabled={isAnswered}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {currentQuestion.type === "BLANK" && (
            <div>
              <input
                type="text"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:border-amber-400 focus:outline-none"
                placeholder="请填写答案..."
                value={typeof currentAnswer === "string" ? currentAnswer : ""}
                onChange={(e) => handleAnswer(e.target.value)}
                disabled={isAnswered}
              />
            </div>
          )}
        </div>

        {isAnswered && (
          <div
            className={`mb-4 rounded-2xl border p-4 ${
              currentResult ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
          >
            <p className={`mb-1 font-semibold ${currentResult ? "text-green-700" : "text-red-700"}`}>
              {currentResult ? "✓ 回答正确！" : "✗ 回答错误"}
            </p>
            {!currentResult && (
              <p className="text-sm text-gray-600">
                正确答案：
                {Array.isArray(currentQuestion.answer)
                  ? (currentQuestion.answer as string[]).join("、")
                  : String(currentQuestion.answer)}
              </p>
            )}
          </div>
        )}

        {isAnswered && showExplanation && currentQuestion.explanation && (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="mb-1 text-sm font-semibold text-blue-700">解析</p>
            <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 flex gap-3 border-t bg-white px-4 py-3">
        {!isAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={
              currentAnswer === undefined || (Array.isArray(currentAnswer) && currentAnswer.length === 0)
            }
            className="flex-1 rounded-xl bg-amber-500 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:bg-gray-300"
          >
            提交答案
          </button>
        ) : (
          <>
            {currentQuestion.explanation && (
              <button
                onClick={() => setShowExplanation((v) => !v)}
                className="flex-1 rounded-xl border-2 border-blue-400 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                {showExplanation ? "收起解析" : "查看解析"}
              </button>
            )}
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 rounded-xl bg-amber-500 py-3 font-semibold text-white transition-colors hover:bg-amber-600"
              >
                下一题 →
              </button>
            ) : (
              <Link
                href="/practice"
                className="flex-1 rounded-xl bg-green-500 py-3 text-center font-semibold text-white transition-colors hover:bg-green-600"
              >
                完成练习 ✓
              </Link>
            )}
          </>
        )}
      </footer>
    </div>
  )
}
