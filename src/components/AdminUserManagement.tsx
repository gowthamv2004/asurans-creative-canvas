import { useState, useEffect } from "react";
import { Shield, ShieldOff, Users, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserItem {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  roles: string[];
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-roles", {
        body: { action: "list" },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setUsers(data.users || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (
    userId: string,
    action: "promote" | "demote"
  ) => {
    setActionLoading(userId);
    try {
      const { data, error } = await supabase.functions.invoke("manage-roles", {
        body: { action, targetUserId: userId },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast.success(data.message);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = searchTerm
    ? users.filter(
        (u) =>
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">
            User Management
          </h3>
        </div>
        <Badge variant="outline">{users.length} users</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-secondary/50 border-white/10"
        />
      </div>

      <div className="space-y-2">
        {filteredUsers.map((user) => {
          const isAdmin = user.roles.includes("admin");
          const isProcessing = actionLoading === user.id;

          return (
            <div
              key={user.id}
              className="glass-card p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || user.email}
                  </p>
                  {isAdmin && (
                    <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                {isAdmin ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleRoleChange(user.id, "demote")}
                    className="gap-1 text-xs"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ShieldOff className="w-3 h-3" />
                    )}
                    Demote
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleRoleChange(user.id, "promote")}
                    className="gap-1 text-xs"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Shield className="w-3 h-3" />
                    )}
                    Promote
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
