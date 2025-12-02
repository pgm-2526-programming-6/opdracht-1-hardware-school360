import { API } from "@core/network/supabase/api";
import { useEffect, useState } from "react";
import useAuth from "./useAuth";

const useUserRole = () => {
  const { auth } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!auth?.session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await API
          .from("profile")
          .select("role")
          .eq("id", auth.session.user.id)
          .single();

        if (error) throw error;
        setRole(data?.role || null);
      } catch (err) {
        console.error("Error fetching user role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [auth?.session?.user?.id]);

  return { 
    role, 
    loading, 
    isTeacher: role === "teacher",
    isStudent: role === "student"
  };
};

export default useUserRole;
