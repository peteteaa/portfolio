import dynamic from "next/dynamic"

const AboutClient = dynamic(() => import("@/components/AboutClient"))

export default function AboutPage() {
  return <AboutClient />
}
