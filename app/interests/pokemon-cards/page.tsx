import Link from "next/link"

export default function PokemonCardsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pokemon Cards</h1>
      <p className="mb-4">A page about Pokemon card collecting and favorite pulls.</p>
      <Link href="/about" className="text-blue-500">← Back to About</Link>
    </div>
  )
}
