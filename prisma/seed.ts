import { PrismaClient, QuestionType, QuestionStatus, TagType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name_type: { name: "唐诗", type: TagType.THEME } },
      create: { name: "唐诗", type: TagType.THEME },
      update: {},
    }),
    prisma.tag.upsert({
      where: { name_type: { name: "王之涣", type: TagType.POET } },
      create: { name: "王之涣", type: TagType.POET },
      update: {},
    }),
    prisma.tag.upsert({
      where: { name_type: { name: "李白", type: TagType.POET } },
      create: { name: "李白", type: TagType.POET },
      update: {},
    }),
    prisma.tag.upsert({
      where: { name_type: { name: "名句", type: TagType.THEME } },
      create: { name: "名句", type: TagType.THEME },
      update: {},
    }),
  ])

  const q1 = await prisma.question.create({
    data: {
      type: QuestionType.SINGLE_CHOICE,
      stem: '"欲穷千里目，更上一层楼"的作者是谁？',
      answer: ["A"],
      explanation: "这句诗出自王之涣的《登鹳雀楼》。",
      grade: 3,
      difficulty: 1,
      status: QuestionStatus.PUBLISHED,
      options: {
        create: [
          { label: "A", content: "王之涣", sortOrder: 0 },
          { label: "B", content: "李白", sortOrder: 1 },
          { label: "C", content: "杜甫", sortOrder: 2 },
          { label: "D", content: "白居易", sortOrder: 3 },
        ],
      },
    },
  })

  const q2 = await prisma.question.create({
    data: {
      type: QuestionType.BLANK,
      stem: '"床前明月光，__________。"请补全诗句。',
      answer: { answers: ["疑是地上霜", "疑是地上霜。"], mode: "any" },
      explanation: '出自李白的《静夜思》，下一句是"疑是地上霜"。',
      grade: 2,
      difficulty: 1,
      status: QuestionStatus.PUBLISHED,
    },
  })

  const q3 = await prisma.question.create({
    data: {
      type: QuestionType.JUDGE,
      stem: '"春眠不觉晓，处处闻啼鸟"出自唐代诗人孟浩然的《春晓》。',
      answer: "true",
      explanation: '《春晓》是唐代诗人孟浩然的作品。',
      grade: 1,
      difficulty: 1,
      status: QuestionStatus.PUBLISHED,
    },
  })

  const q4 = await prisma.question.create({
    data: {
      type: QuestionType.SINGLE_CHOICE,
      stem: '"静夜思"是哪位诗人的作品？',
      answer: ["B"],
      explanation: '《静夜思》是唐代诗人李白的作品。',
      grade: 2,
      difficulty: 1,
      status: QuestionStatus.PUBLISHED,
      options: {
        create: [
          { label: "A", content: "杜甫", sortOrder: 0 },
          { label: "B", content: "李白", sortOrder: 1 },
          { label: "C", content: "白居易", sortOrder: 2 },
          { label: "D", content: "王维", sortOrder: 3 },
        ],
      },
    },
  })

  const q5 = await prisma.question.create({
    data: {
      type: QuestionType.SINGLE_CHOICE,
      stem: '"锄禾日当午，汗滴禾下土"出自哪首诗？',
      answer: ["C"],
      explanation: '出自李绅的《悯农》。',
      grade: 2,
      difficulty: 1,
      status: QuestionStatus.PUBLISHED,
      options: {
        create: [
          { label: "A", content: "《春晓》", sortOrder: 0 },
          { label: "B", content: "《登鹳雀楼》", sortOrder: 1 },
          { label: "C", content: "《悯农》", sortOrder: 2 },
          { label: "D", content: "《静夜思》", sortOrder: 3 },
        ],
      },
    },
  })

  const questions = [q1, q2, q3, q4, q5]

  const practiceSet = await prisma.practiceSet.create({
    data: {
      title: "小学必背古诗入门",
      description: "适合一到三年级的古诗基础练习",
      grade: 2,
      isPublic: true,
      questions: {
        create: questions.map((question, index) => ({
          questionId: question.id,
          sortOrder: index + 1,
        })),
      },
    },
  })

  await prisma.questionTag.createMany({
    data: [
      { questionId: q1.id, tagId: tags[0].id },
      { questionId: q1.id, tagId: tags[1].id },
      { questionId: q1.id, tagId: tags[3].id },
      { questionId: q2.id, tagId: tags[0].id },
      { questionId: q2.id, tagId: tags[2].id },
    ],
    skipDuplicates: true,
  })

  console.log(`✓ Created ${questions.length} questions`)
  console.log(`✓ Created practice set: ${practiceSet.title}`)
  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
