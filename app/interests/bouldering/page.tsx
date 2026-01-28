import Link from "next/link"

export default function BoulderingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bouldering</h1>
      <p className="mb-4">Notes about bouldering, favorite gyms, and projects.</p>
      <Link href="/about" className="text-blue-500">← Back to About</Link>
    </div>
  )
}
