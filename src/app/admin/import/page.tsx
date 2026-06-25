import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import Link from "next/link"
import ImportForm from "./ImportForm"

export default async function AdminImportPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== UserRole.ADMIN) redirect("/")

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link href="/admin" className="mr-3 text-blue-600 hover:text-blue-800">
            ← 返回后台
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">导入题库</h1>
        </div>

        <ImportForm />
      </div>
    </main>
  )
}
