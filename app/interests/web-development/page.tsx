import Link from "next/link"

export default function WebDevPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Web Development</h1>
      <p className="mb-4">Projects, tech stack, and notes on building interfaces.</p>
      <Link href="/about" className="text-blue-500">← Back to About</Link>
    </div>
  )
}
