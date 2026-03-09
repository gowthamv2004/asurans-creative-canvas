import { useState, useEffect } from "react";
import { Upload, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadedFile {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}

const AdminUploadsView = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("reference-images")
        .list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });

      if (error) throw error;

      // List files in subdirectories (user folders)
      const allFiles: UploadedFile[] = [];

      for (const item of data || []) {
        if (item.id === null || !item.metadata) {
          // It's a folder, list its contents
          const { data: subFiles } = await supabase.storage
            .from("reference-images")
            .list(item.name, { limit: 200, sortBy: { column: "created_at", order: "desc" } });

          for (const file of subFiles || []) {
            if (file.metadata) {
              const { data: urlData } = supabase.storage
                .from("reference-images")
                .getPublicUrl(`${item.name}/${file.name}`);

              allFiles.push({
                name: file.name,
                url: urlData.publicUrl,
                createdAt: file.created_at || "",
                size: file.metadata?.size || 0,
              });
            }
          }
        } else {
          const { data: urlData } = supabase.storage
            .from("reference-images")
            .getPublicUrl(item.name);

          allFiles.push({
            name: item.name,
            url: urlData.publicUrl,
            createdAt: item.created_at || "",
            size: item.metadata?.size || 0,
          });
        }
      }

      setFiles(allFiles);
    } catch (err) {
      console.error("Error fetching uploads:", err);
      toast.error("Failed to load uploaded images");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleDownload = async (file: UploadedFile) => {
    try {
      const res = await fetch(file.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    } catch {
      toast.error("Failed to download");
    }
  };

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
          <Upload className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">
            User Uploaded Reference Images
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">{files.length} files</span>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No uploaded reference images found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file, idx) => (
            <div key={idx} className="glass-card overflow-hidden rounded-xl group">
              <div className="aspect-square overflow-hidden">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 space-y-2">
                <p className="text-sm truncate">{file.name}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ""}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUploadsView;
