import Link from "next/link"

export default function MuayThaiPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Muay Thai</h1>
      <p className="mb-4">Training notes and favorite drills.</p>
      <p className="mb-4">.</p>
      <img src="/images/muay-thai/kick.jpg" alt="Muay Thai Kick" className="mb-4 rounded" />
      <Link href="/about" className="text-blue-500">← Back to About</Link>
    </div>
  )
}
