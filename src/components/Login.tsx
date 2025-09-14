import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const login = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      onLogin(res.user);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-sm w-full text-center">
        {/* App Branding */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Task Scheduler</h1>
        <p className="text-gray-500 mb-6">
          Sign in to manage your tasks and schedules
        </p>

        {/* Google Login Button */}
        <button
          onClick={login}
          className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 hover:shadow-md text-gray-700 font-medium py-3 rounded-lg transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Footer Note */}
        <p className="text-xs text-gray-400 mt-6">
          Only authorized company accounts are allowed.
        </p>
      </div>
    </div>
  );
}
