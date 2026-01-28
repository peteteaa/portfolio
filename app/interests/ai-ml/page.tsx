import Link from "next/link"

export default function AIMLPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI & ML</h1>
      <p className="mb-4">Explorations in machine learning, models, and experiments.</p>
      <Link href="/about" className="text-blue-500">← Back to About</Link>
    </div>
  )
}
