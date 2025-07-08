import { useState, useEffect, useCallback } from "react";
import client from "../lib/apiClient";
import { toast } from "sonner";
import { useWebSocket } from "./useWebSocket";

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  children?: Comment[];
}

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get("/comments");
      setComments(response.data);
    } catch (error) {
      toast.error("Failed to load comments");
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use WebSocket with callback to refetch comments
  useWebSocket(fetchComments);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createComment = async (content: string, parent_id?: string) => {
    try {
      await client.post("/comments", { content, parent_id });
      toast.success("Comment posted!");
      // Don't refetch here - WebSocket will handle it
      return true;
    } catch (error) {
      toast.error("Failed to post comment");
      console.error("Error creating comment:", error);
      return false;
    }
  };

  const editComment = async (id: string, content: string) => {
    try {
      await client.patch(`/comments/${id}`, { content });
      toast.success("Comment updated!");
      // Don't refetch here - WebSocket will handle it
      return true;
    } catch (error) {
      toast.error("Failed to update comment");
      console.error("Error editing comment:", error);
      return false;
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await client.delete(`/comments/${id}`);
      toast.success("Comment deleted!");
      // Don't refetch here - WebSocket will handle it
      return true;
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error("Error deleting comment:", error);
      return false;
    }
  };

  const restoreComment = async (id: string) => {
    try {
      await client.patch(`/comments/${id}/restore`);
      toast.success("Comment restored!");
      // Don't refetch here - WebSocket will handle it
      return true;
    } catch (error) {
      toast.error("Failed to restore comment");
      console.error("Error restoring comment:", error);
      return false;
    }
  };

  return {
    comments,
    loading,
    refetch: fetchComments,
    createComment,
    editComment,
    deleteComment,
    restoreComment,
  };
}
