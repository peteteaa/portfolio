import { redirect } from "next/navigation"

// Web development is no longer an interest page; its projects live on /projects now.
export default function WebDevPage() {
  redirect("/projects")
}
