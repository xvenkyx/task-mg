import { useEffect, useState } from "react"
import { db } from "../firebase"
import { collection, getDocs } from "firebase/firestore"
import TaskList from "./TaskList"
import TaskCalendar from "./TaskCalendar"

interface User {
  uid: string
  email: string
  role: string
  name?: string
}

export default function TeamDashboard() {
  const [members, setMembers] = useState<User[]>([])
  const [selected, setSelected] = useState<string>("")

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"))
      const data = snap.docs.map((d) => d.data() as User)
      const onlyMembers = data.filter((u) => u.role === "member")
      setMembers(onlyMembers)
      if (onlyMembers.length > 0) setSelected(onlyMembers[0].uid)
    }
    loadUsers()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Team Dashboard</h2>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="border p-2 rounded bg-white shadow-sm"
      >
        {members.map((m) => (
          <option key={m.uid} value={m.uid}>
            {m.name || m.email} {/* ✅ show name if available */}
          </option>
        ))}
      </select>

      {selected && (
        <>
          <TaskList userId={selected} />
          <TaskCalendar userId={selected} />
        </>
      )}
    </div>
  )
}
