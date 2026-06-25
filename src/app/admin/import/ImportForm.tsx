"use client"

import { useState } from "react"

export default function ImportForm() {
  const [json, setJson] = useState("")
  const [result, setResult] = useState<{
    success?: number
    errors?: Array<{ index: number; error: string }>
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const data = JSON.parse(json)
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Array.isArray(data) ? data : data.questions ?? data),
      })
      const body = await res.json()
      setResult(body)
    } catch (err) {
      setResult({ errors: [{ index: -1, error: String(err) }] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm text-gray-600">请粘贴 JSON 格式的题目数据，支持单个对象或数组格式。</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="h-64 w-full rounded-lg border border-gray-200 p-3 font-mono text-sm focus:border-blue-400 focus:outline-none"
          placeholder={`[
  {
    "type": "SINGLE_CHOICE",
    "stem": "题干...",
    "options": [...],
    "answer": ["A"],
    "difficulty": 1
  }
]`}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? "导入中..." : "开始导入"}
        </button>
      </form>

      {result && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          {result.success !== undefined && (
            <p className="font-medium text-green-700">✓ 成功导入 {result.success} 道题</p>
          )}
          {result.errors && result.errors.length > 0 && (
            <div className="mt-2">
              <p className="mb-2 font-medium text-red-600">导入失败 {result.errors.length} 条：</p>
              <ul className="space-y-1 text-sm text-red-500">
                {result.errors.map((e, i) => (
                  <li key={`${e.index}-${e.error}-${i}`}>
                    {e.index >= 0 ? `第 ${e.index + 1} 条：${e.error}` : `JSON 解析错误：${e.error}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
