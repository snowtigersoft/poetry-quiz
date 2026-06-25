import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { QuestionStatus } from "@prisma/client"
import PracticeClient from "./PracticeClient"

export const dynamic = "force-dynamic"

export default async function PracticeSetPage({
  params,
}: {
  params: Promise<{ setId: string }>
}) {
  const { setId } = await params

  const practiceSet = await db.practiceSet.findUnique({
    where: { id: setId },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          question: {
            include: {
              options: { orderBy: { sortOrder: "asc" } },
              tags: { include: { tag: true } },
            },
          },
        },
        where: {
          question: { status: QuestionStatus.PUBLISHED },
        },
      },
    },
  })

  if (!practiceSet) notFound()

  const questions = practiceSet.questions.map((psq) => psq.question)

  return (
    <PracticeClient
      practiceSetId={practiceSet.id}
      practiceSetTitle={practiceSet.title}
      questions={questions}
    />
  )
}
