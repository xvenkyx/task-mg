import { useState, useEffect } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";
import TaskCalendar from "./components/TaskCalendar";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserRole } from "./hooks/useUserRole";
import TeamDashboard from "./components/TeamDashboard";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<string>("form");
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || roleLoading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      {user ? (
        <>
          <Navbar
            user={{ displayName: user.displayName, email: user.email }}
            onSignOut={() => setUser(null)}
            currentView={currentView}
            setCurrentView={setCurrentView}
            role={role}
          />

          <div className="p-6">
            {currentView === "form" && <AddTask />}
            {currentView === "table" && <TaskList />}
            {currentView === "calendar" && <TaskCalendar />}
            {role === "manager" && currentView === "team" && <TeamDashboard />}
          </div>

          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </>
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;
