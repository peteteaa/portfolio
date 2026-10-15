"use client";

import { useRouter } from "next/navigation";
import BlackjackTable from "@/components/blackjack/BlackjackTable";

// Direct links to /blackjack get the same full-screen table; on the homepage and in the terminal it opens
// as an animated overlay instead (components/blackjack/BlackjackOverlay).
export default function BlackjackPage() {
  const router = useRouter();
  return (
    <div className="h-screen">
      <BlackjackTable onClose={() => router.push("/")} closeLabel="◀ HOME" />
    </div>
  );
}
