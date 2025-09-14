import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function useUserRole() {
  const [role, setRole] = useState<"manager" | "member" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // if no user logged in → stop loading, return null
    if (!auth.currentUser) {
      setRole(null);
      setLoading(false);
      return;
    }

    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid);

    getDoc(ref)
      .then(async (snap) => {
        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          // default role = member
          await setDoc(ref, {
            uid,
            email: auth.currentUser?.email,
            name: auth.currentUser?.displayName, // ✅ store name
            role: "member",
          });

          setRole("member");
        }
      })
      .catch((err) => {
        console.error("Error fetching role:", err);
        setRole(null); // fallback
      })
      .finally(() => {
        setLoading(false);
      });
  }, [auth.currentUser]);

  return { role, loading };
}
