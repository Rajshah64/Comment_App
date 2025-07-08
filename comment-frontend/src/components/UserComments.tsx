"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserComments, UserComment } from "@/hooks/useUserComments";
import {
  ArrowLeft,
  MessageSquare,
  Trash2,
  RotateCcw,
  Edit3,
  Filter,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Save,
  X,
} from "lucide-react";

interface UserCommentsProps {
  onBack: () => void;
}

type FilterType = "all" | "active" | "restorable";

export default function UserComments({ onBack }: UserCommentsProps) {
  const { data, loading, restoreComment, deleteComment, editComment } =
    useUserComments();
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string>("");
  const [editingId, setEditingId] = useState<string>("");
  const [editContent, setEditContent] = useState("");
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  // Real-time countdown for restorable comments
  useEffect(() => {
    if (!data?.restorable.length) return;

    const updateTimers = () => {
      const newTimeLeft: { [key: string]: number } = {};

      data.restorable.forEach((comment) => {
        if (comment.deleted_at) {
          const deletedAt = new Date(comment.deleted_at).getTime();
          const now = new Date().getTime();
          const elapsed = now - deletedAt;
          const remaining = Math.max(0, 15 * 60 * 1000 - elapsed);
          newTimeLeft[comment.id] = remaining;
        }
      });

      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [data?.restorable]);

  const formatTimeLeft = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleRestore = async (id: string) => {
    await restoreComment(id);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedCommentId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteComment(selectedCommentId);
    setDeleteDialogOpen(false);
    setSelectedCommentId("");
  };

  const handleEditStart = (comment: UserComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditSave = async () => {
    if (editContent.trim()) {
      await editComment(editingId, editContent.trim());
      setEditingId("");
      setEditContent("");
    }
  };

  const handleEditCancel = () => {
    setEditingId("");
    setEditContent("");
  };

  const getFilteredComments = () => {
    if (!data) return [];

    switch (filter) {
      case "active":
        return data.active;
      case "restorable":
        return data.restorable;
      default:
        return [...data.active, ...data.restorable];
    }
  };

  const canEdit = (comment: UserComment) => {
    const createdAt = new Date(comment.created_at).getTime();
    const now = new Date().getTime();
    const timeDiff = now - createdAt;
    return timeDiff < 15 * 60 * 1000 && !comment.deleted_at;
  };

  const canDelete = (comment: UserComment) => {
    const createdAt = new Date(comment.created_at).getTime();
    const now = new Date().getTime();
    const timeDiff = now - createdAt;
    return timeDiff < 15 * 60 * 1000 && !comment.deleted_at;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your comments...</span>
        </div>
      </div>
    );
  }

  const filteredComments = getFilteredComments();

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">My Comments</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{data?.stats.totalActive} Active</Badge>
            {data?.stats.totalRestorable ? (
              <Badge variant="destructive">
                {data.stats.totalRestorable} Restorable
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="h-4 w-4 text-gray-500" />
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Comments (
            {(data?.stats.totalActive || 0) +
              (data?.stats.totalRestorable || 0)}
            )
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Active ({data?.stats.totalActive || 0})
          </Button>
          {data?.stats.totalRestorable ? (
            <Button
              variant={filter === "restorable" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("restorable")}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Restorable ({data.stats.totalRestorable})
            </Button>
          ) : null}
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No comments found
                </h3>
                <p className="text-gray-500 text-center">
                  {filter === "active" &&
                    "You haven't posted any active comments yet."}
                  {filter === "restorable" &&
                    "No deleted comments can be restored."}
                  {filter === "all" && "You haven't posted any comments yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredComments.map((comment) => (
              <Card
                key={comment.id}
                className={comment.deleted_at ? "border-orange-200" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-sm font-medium">
                        Comment from{" "}
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </CardTitle>
                      {comment.deleted_at && (
                        <Badge variant="destructive" className="text-xs">
                          Deleted
                        </Badge>
                      )}
                      {comment.updated_at !== comment.created_at && (
                        <Badge variant="secondary" className="text-xs">
                          Edited
                        </Badge>
                      )}
                    </div>

                    {comment.deleted_at && timeLeft[comment.id] > 0 && (
                      <div className="text-xs text-orange-600 font-mono">
                        {formatTimeLeft(timeLeft[comment.id])} left
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {editingId === comment.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px]"
                        placeholder="Edit your comment..."
                      />
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={handleEditSave}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`text-gray-900 whitespace-pre-wrap mb-4 ${
                          comment.deleted_at ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {comment.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {comment.deleted_at ? (
                            timeLeft[comment.id] > 0 ? (
                              <Button
                                size="sm"
                                onClick={() => handleRestore(comment.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restore
                              </Button>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Restore time expired
                              </Badge>
                            )
                          ) : (
                            <>
                              {canEdit(comment) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditStart(comment)}
                                >
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              )}
                              {canDelete(comment) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteClick(comment.id)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          {comment.parent_id ? "Reply" : "Top-level comment"}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? You can restore it
              within 15 minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
