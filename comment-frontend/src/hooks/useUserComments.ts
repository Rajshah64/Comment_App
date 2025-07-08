import { useState, useEffect, useCallback } from "react";
import client from "../lib/apiClient";
import { toast } from "sonner";

export interface UserComment {
  id: string;
  content: string;
  author_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserCommentsData {
  active: UserComment[];
  restorable: UserComment[];
  stats: {
    totalActive: number;
    totalRestorable: number;
  };
}

export function useUserComments() {
  const [data, setData] = useState<UserCommentsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get("/comments/my-comments");
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load your comments");
      console.error("Error fetching user comments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserComments();
  }, [fetchUserComments]);

  const restoreComment = async (id: string) => {
    try {
      await client.patch(`/comments/${id}/restore`);
      toast.success("Comment restored successfully!");
      await fetchUserComments(); // Refresh data
      return true;
    } catch (error) {
      toast.error("Failed to restore comment");
      console.error("Error restoring comment:", error);
      return false;
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await client.delete(`/comments/${id}`);
      toast.success("Comment deleted!");
      await fetchUserComments(); // Refresh data
      return true;
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error("Error deleting comment:", error);
      return false;
    }
  };

  const editComment = async (id: string, content: string) => {
    try {
      await client.patch(`/comments/${id}`, { content });
      toast.success("Comment updated!");
      await fetchUserComments(); // Refresh data
      return true;
    } catch (error) {
      toast.error("Failed to update comment");
      console.error("Error editing comment:", error);
      return false;
    }
  };

  return {
    data,
    loading,
    refetch: fetchUserComments,
    restoreComment,
    deleteComment,
    editComment,
  };
}
