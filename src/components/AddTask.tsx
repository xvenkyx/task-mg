import { useState } from "react"
import { db, auth } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import toast from "react-hot-toast"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AddTask() {
  const [form, setForm] = useState({
    client: "",
    technology: "",
    task: "",
    date: "",
    inTime: "",
    outTime: "",
    round: "",
    feedback: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    try {
      await addDoc(collection(db, "tasks"), {
        ...form,
        status: "Scheduled",
        assignedTo: auth.currentUser.uid,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast.success("✅ Task added successfully!")

      setForm({
        client: "",
        technology: "",
        task: "",
        date: "",
        inTime: "",
        outTime: "",
        round: "",
        feedback: "",
      })
    } catch (error) {
      console.error(error)
      toast.error("❌ Failed to add task!")
    }
  }

  return (
    <Card className="max-w-xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client */}
          <Input
            name="client"
            value={form.client}
            onChange={handleChange}
            placeholder="Client Name"
            required
          />

          {/* Task Type */}
          <Select
            onValueChange={(val) => setForm({ ...form, task: val })}
            value={form.task}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Task Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Interview Support">Interview Support</SelectItem>
              <SelectItem value="Assessment">Assessment</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="RUC">RUC</SelectItem>
              <SelectItem value="JDC">JDC</SelectItem>
              <SelectItem value="Mock Interview">Mock Interview</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
            </SelectContent>
          </Select>

          {/* Technology */}
          <Select
            onValueChange={(val) => setForm({ ...form, technology: val })}
            value={form.technology}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Java Full Stack">Java Full Stack</SelectItem>
              <SelectItem value="QA Analyst">QA Analyst</SelectItem>
              <SelectItem value="Security Analyst">Security Analyst</SelectItem>
              <SelectItem value="iOS Developer">iOS Developer</SelectItem>
            </SelectContent>
          </Select>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <Input
              type="time"
              name="inTime"
              value={form.inTime}
              onChange={handleChange}
              required
            />
            <Input
              type="time"
              name="outTime"
              value={form.outTime}
              onChange={handleChange}
              required
            />
          </div>

          {/* Round */}
          <Select
            onValueChange={(val) => setForm({ ...form, round: val })}
            value={form.round}
          >
            <SelectTrigger>
              <SelectValue placeholder="Round (only for Interviews)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Screening">Screening</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
            </SelectContent>
          </Select>

          {/* Feedback */}
          <Textarea
            name="feedback"
            value={form.feedback}
            onChange={handleChange}
            placeholder="Feedback or notes"
            rows={3}
          />

          <Button type="submit" className="w-full">
            Add Task
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
