import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) throw error;

        setIsAdmin(data?.some((r: any) => r.role === "admin") ?? false);
      } catch (error) {
        console.error("Error fetching role:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { isAdmin, isLoading };
};
