import { useEffect, useState } from "react"
import { db, auth } from "../firebase"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import {
  Calendar,
  momentLocalizer,
  type Event,
  type View,
} from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const localizer = momentLocalizer(moment)

interface TaskEvent extends Event {
  id: string
  title: string
  start: Date
  end: Date
}

interface Gap {
  start: Date
  end: Date
  duration: string
}

interface TaskCalendarProps {
  userId?: string
}

export default function TaskCalendar({ userId }: TaskCalendarProps) {
  const [events, setEvents] = useState<TaskEvent[]>([])
  const [gaps, setGaps] = useState<Gap[]>([])
  const [outsideTasks, setOutsideTasks] = useState<TaskEvent[]>([])
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<View>("day")

  useEffect(() => {
    const currentUid = userId || auth.currentUser?.uid
    if (!currentUid) return

    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", currentUid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskEvents: TaskEvent[] = snapshot.docs.map((doc) => {
        const t = doc.data()
        const start = moment(`${t.date} ${t.inTime}`, [
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD hh:mm A",
        ]).toDate()
        const end = moment(`${t.date} ${t.outTime}`, [
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD hh:mm A",
        ]).toDate()

        return {
          id: doc.id,
          title: `${t.task} (${t.client || t.title})`,
          start,
          end,
        }
      })

      setEvents(taskEvents)
      calculateGapsAndOutside(taskEvents, currentDate)
    })

    return () => unsubscribe()
  }, [userId, currentDate])

  const calculateGapsAndOutside = (tasks: TaskEvent[], date: Date) => {
    const todayKey = moment(date).format("YYYY-MM-DD")
    const todayEvents = tasks
      .filter((ev) => moment(ev.start).format("YYYY-MM-DD") === todayKey)
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    const WORK_START = moment(todayKey).hour(10).minute(0).toDate()
    const WORK_END = moment(todayKey).hour(19).minute(0).toDate()

    let cursor = WORK_START
    const foundGaps: Gap[] = []
    const outside: TaskEvent[] = []

    todayEvents.forEach((ev) => {
      // Detect outside working hours
      if (ev.start < WORK_START || ev.end > WORK_END) {
        outside.push(ev)
      }

      // Free slot calculation
      if (ev.start > cursor) {
        const gapStart = cursor
        const gapEnd = ev.start
        const durationMin = moment(gapEnd).diff(moment(gapStart), "minutes")
        if (durationMin >= 30) {
          foundGaps.push({
            start: gapStart,
            end: gapEnd,
            duration: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`,
          })
        }
      }
      cursor = ev.end
    })

    if (cursor < WORK_END) {
      const durationMin = moment(WORK_END).diff(moment(cursor), "minutes")
      if (durationMin >= 30) {
        foundGaps.push({
          start: cursor,
          end: WORK_END,
          duration: `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`,
        })
      }
    }

    setGaps(foundGaps)
    setOutsideTasks(outside)
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>
            Task Timeline{" "}
            {userId && userId !== auth.currentUser?.uid && "(Team Member)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            views={["day", "week", "month"]}
            min={new Date(1970, 1, 1, 10, 0)}
            max={new Date(1970, 1, 1, 19, 0)}
            toolbar={true}
          />
        </CardContent>
      </Card>

      {/* Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle>
            Free Slots – {moment(currentDate).format("ddd, MMM D")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Free slots */}
          {gaps.length > 0 ? (
            <ul className="space-y-3">
              {gaps.map((gap, i) => (
                <li
                  key={i}
                  className="p-3 rounded-lg border bg-muted flex flex-col"
                >
                  <span className="font-medium">
                    {moment(gap.start).format("hh:mm A")} –{" "}
                    {moment(gap.end).format("hh:mm A")}
                  </span>
                  <Badge variant="secondary" className="mt-1 w-fit">
                    {gap.duration}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No free slots today
            </p>
          )}

          {/* Outside hours */}
          <div>
            <h3 className="font-semibold text-base mb-2">
              Outside Working Hours
            </h3>
            {outsideTasks.length > 0 ? (
              <ul className="space-y-2">
                {outsideTasks.map((t) => (
                  <li
                    key={t.id}
                    className="p-2 rounded-md border bg-red-50 text-red-700"
                  >
                    <p className="font-medium">{t.title}</p>
                    <span className="text-xs">
                      {moment(t.start).format("hh:mm A")} –{" "}
                      {moment(t.end).format("hh:mm A")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No outside tasks
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
