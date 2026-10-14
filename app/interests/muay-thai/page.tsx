import Link from "next/link"

export default function MuayThaiPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Muay Thai</h1>
      <p className="mb-4">Training notes and favorite drills.</p>
      <Link href="/about" className="text-blue-500">← Back to About</Link>
    </div>
  )
}
