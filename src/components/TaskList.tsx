import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Edit, Trash2, Search } from "lucide-react";
import moment from "moment";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface Task {
  id: string;
  client?: string;
  title?: string; // legacy
  task: string;
  technology: string;
  date: string;
  inTime: string;
  outTime: string;
  status: string;
  feedback?: string;
}

interface TaskListProps {
  userId?: string;
}

export default function TaskList({ userId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState(moment().format("YYYY-MM"));

  useEffect(() => {
    const currentUid = userId || auth.currentUser?.uid;
    if (!currentUid) return;

    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", currentUid),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
      }));
      setTasks(data);
    });

    return () => unsubscribe();
  }, [userId, auth.currentUser?.uid]); // ✅ include uid so listener resets on login/logout

  const handleDelete = async (id: string) => {
    try {
      // ✅ Optimistic update
      setTasks((prev) => prev.filter((t) => t.id !== id));

      await deleteDoc(doc(db, "tasks", id));
      toast.success("🗑 Task deleted!");
    } catch {
      toast.error("❌ Failed to delete task!");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm(task);
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      // ✅ Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId ? ({ ...t, ...editForm } as Task) : t
        )
      );

      await updateDoc(doc(db, "tasks", editingId), { ...editForm });
      toast.success("✏️ Task updated!");
      setEditingId(null);
      setEditForm({});
    } catch {
      toast.error("❌ Failed to update task!");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const clientName = t.client || t.title || "";
    const matchesSearch =
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.task.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : t.status === statusFilter;

    const matchesTech =
      techFilter === "All" ? true : t.technology === techFilter;

    const matchesMonth = moment(t.date).format("YYYY-MM") === monthFilter;

    return matchesSearch && matchesStatus && matchesTech && matchesMonth;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Task List{" "}
        {userId && userId !== auth.currentUser?.uid && "(Team Member)"}
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="flex items-center border rounded px-2 w-full sm:w-1/3 bg-white shadow-sm">
          <Search className="text-gray-400 mr-2" size={18} />
          <Input
            type="text"
            placeholder="Search by client or task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-0 shadow-none"
          />
        </div>

        <div className="flex gap-3">
          <Input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <Select
            onValueChange={(val) => setStatusFilter(val)}
            value={statusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Not Done">Not Done</SelectItem>
              <SelectItem value="Rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(val) => setTechFilter(val)}
            value={techFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tech</SelectItem>
              <SelectItem value="Java Full Stack">Java Full Stack</SelectItem>
              <SelectItem value="QA Analyst">QA Analyst</SelectItem>
              <SelectItem value="Security Analyst">Security Analyst</SelectItem>
              <SelectItem value="iOS Developer">iOS Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Technology</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t, index) => {
                const prevDate =
                  index > 0
                    ? moment(filteredTasks[index - 1].date).format("YYYY-MM-DD")
                    : null;
                const currDate = moment(t.date).format("YYYY-MM-DD");
                const showSeparator = prevDate !== currDate;
                return (
                  <React.Fragment key={t.id}>
                    {showSeparator && (
                      <TableRow
                        key={`${currDate}-separator`}
                        className="bg-blue-50 dark:bg-blue-900/40"
                      >
                        <TableCell
                          colSpan={8}
                          className="font-semibold text-blue-900 dark:text-blue-200 py-3"
                        >
                          {moment(currDate).format("dddd, MMMM D, YYYY")}
                        </TableCell>
                      </TableRow>
                    )}

                    {editingId === t.id ? (
                      <TableRow key={t.id} className="bg-muted/50">
                        <TableCell>
                          <Input
                            type="date"
                            value={editForm.date || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, date: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={editForm.client || editForm.title || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                client: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={editForm.task || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, task: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={editForm.technology || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                technology: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Input
                              type="time"
                              value={editForm.inTime || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  inTime: e.target.value,
                                })
                              }
                            />
                            <Input
                              type="time"
                              value={editForm.outTime || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  outTime: e.target.value,
                                })
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(val) =>
                              setEditForm({ ...editForm, status: val })
                            }
                            value={editForm.status || ""}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scheduled">
                                Scheduled
                              </SelectItem>
                              <SelectItem value="Done">Done</SelectItem>
                              <SelectItem value="Not Done">Not Done</SelectItem>
                              <SelectItem value="Rescheduled">
                                Rescheduled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={editForm.feedback || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                feedback: e.target.value,
                              })
                            }
                            rows={1}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={handleSave}
                            className="mr-2"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">
                          {moment(t.date).format("MMM D, YYYY")}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {t.client || t.title}
                        </TableCell>
                        <TableCell>{t.task}</TableCell>
                        <TableCell>{t.technology}</TableCell>
                        <TableCell>
                          {t.inTime} – {t.outTime}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.status === "Done"
                                ? "success"
                                : t.status === "Scheduled"
                                ? "secondary"
                                : t.status === "Rescheduled"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="italic text-muted-foreground">
                          {t.feedback || "-"}
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(t)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 italic">
                  No tasks match your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
