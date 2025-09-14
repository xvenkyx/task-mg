import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

interface NavbarProps {
  user: {
    displayName: string | null;
    email: string | null;
  };
  onSignOut: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  role: "manager" | "member" | null;
}

export default function Navbar({
  user,
  onSignOut,
  currentView,
  setCurrentView,
  role,
}: NavbarProps) {
  return (
    <div className="flex justify-between items-center px-6 py-3 bg-background border-b shadow-sm">
      {/* Left: App Title */}
      <h1 className="text-lg font-semibold">Task Scheduler</h1>

      {/* Middle: Navigation Tabs */}
      <Tabs value={currentView} onValueChange={setCurrentView}>
        <TabsList className="gap-2">
          <TabsTrigger
            value="form"
            className={`data-[state=active]:bg-green-600 data-[state=active]:text-white border border-green-600`}
          >
            Add Task
          </TabsTrigger>
          <TabsTrigger
            value="table"
            className={`data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-blue-600`}
          >
            Task List
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className={`data-[state=active]:bg-purple-600 data-[state=active]:text-white border border-purple-600`}
          >
            Calendar
          </TabsTrigger>
          {role === "manager" && (
            <TabsTrigger
              value="team"
              className={`data-[state=active]:bg-orange-600 data-[state=active]:text-white border border-orange-600`}
            >
              Team View
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* Right: User Info + Sign Out */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user.displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => {
            signOut(auth);
            onSignOut();
          }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
