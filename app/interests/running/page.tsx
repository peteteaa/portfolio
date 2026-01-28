import Link from "next/link"

export default function RunningPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Running</h1>
      <p className="mb-4">Routes, training logs, and race goals.</p>
      <Link href="/about" className="text-blue-500">← Back to About</Link>
    </div>
  )
}
