import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: authError,
    } = await authClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdmin = callerRoles?.some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, targetUserId, newPassword } = await req.json();

    if (action === "list") {
      // List all users with their roles
      const { data: users, error: usersError } =
        await adminClient.auth.admin.listUsers();
      if (usersError) throw usersError;

      const { data: allRoles } = await adminClient
        .from("user_roles")
        .select("*");

      const userList = users.users.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.user_metadata?.display_name || null,
        createdAt: u.created_at,
        roles: (allRoles || [])
          .filter((r: any) => r.user_id === u.id)
          .map((r: any) => r.role),
      }));

      return new Response(JSON.stringify({ users: userList }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "targetUserId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "promote") {
      const { error } = await adminClient
        .from("user_roles")
        .upsert(
          { user_id: targetUserId, role: "admin" },
          { onConflict: "user_id,role" }
        );
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "User promoted to admin" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "demote") {
      if (targetUserId === caller.id) {
        return new Response(
          JSON.stringify({ error: "Cannot demote yourself" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", "admin");
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Admin role removed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reset-password") {
      if (!newPassword || newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 6 characters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error } = await adminClient.auth.admin.updateUserById(
        targetUserId,
        { password: newPassword }
      );
      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Password reset successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: list, promote, demote, reset-password" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
