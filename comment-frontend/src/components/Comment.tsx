"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAuth } from "@/context/AuthContext";
import { Comment as CommentType } from "@/hooks/useComments";
import CommentForm from "./CommentForm";
import {
  MessageCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  Clock,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

interface CommentProps {
  comment: CommentType;
  depth?: number;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onEdit: (id: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRestore: (id: string) => Promise<boolean>;
}

export default function Comment({
  comment,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
  onRestore,
}: CommentProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isOwner = user?.id === comment.author_id;
  const isDeleted = !!comment.deleted_at;
  const canEdit = isOwner && !isDeleted;
  const canDelete = isOwner && !isDeleted;

  // Calculate if edit/delete is still allowed (15 minute window)
  const createdAt = new Date(comment.created_at);
  const now = new Date();
  const timeDiff = now.getTime() - createdAt.getTime();
  const within15Minutes = timeDiff < 15 * 60 * 1000;

  const handleReply = async (content: string) => {
    const success = await onReply(comment.id, content);
    if (success) {
      setShowReplyForm(false);
    }
    return success;
  };

  const handleEdit = async (content: string) => {
    const success = await onEdit(comment.id, content);
    if (success) {
      setShowEditForm(false);
    }
    return success;
  };

  const handleDelete = async () => {
    const success = await onDelete(comment.id);
    if (success) {
      setShowDeleteDialog(false);
    }
    return success;
  };

  // Reddit-style indentation with connecting lines
  const marginLeft = depth > 0 ? `${depth * 20}px` : "0px";
  const hasChildren = comment.children && comment.children.length > 0;

  // Show minimal deleted message for non-owners or if comment is deleted
  if (isDeleted && !isOwner) {
    return (
      <div style={{ marginLeft }} className="relative">
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
            style={{ left: `${depth * 20 - 10}px` }}
          />
        )}
        <div className="flex items-center space-x-2 text-gray-500 text-sm py-2 pl-2">
          <Trash2 className="w-4 h-4" />
          <span>This comment has been deleted</span>
        </div>
      </div>
    );
  }

  // Don't show deleted comments to owners in main feed - they'll see them in profile
  if (isDeleted) {
    return null;
  }

  return (
    <div className="relative">
      {/* Threading line for nested comments */}
      {depth > 0 && (
        <div
          className="absolute top-0 bottom-0 w-px bg-gray-200"
          style={{ left: `${depth * 20 - 10}px` }}
        />
      )}

      <div style={{ marginLeft }} className="relative">
        <div className="py-2 px-2 hover:bg-gray-50 transition-colors rounded-md">
          <div className="flex space-x-3">
            {/* Collapse/Expand button for comments with children */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600 shrink-0"
              >
                {collapsed ? (
                  <ArrowRight className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
              </Button>
            )}

            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                {comment.author_id.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-gray-900">
                  u/{comment.author_id.slice(0, 8)}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 flex items-center">
                      <Edit3 className="w-3 h-3 mr-1" />
                      edited
                    </span>
                  </>
                )}
              </div>

              {showEditForm ? (
                <div className="mt-2">
                  <CommentForm
                    onSubmit={handleEdit}
                    placeholder="Edit your comment..."
                    isReply={true}
                    onCancel={() => setShowEditForm(false)}
                    initialContent={comment.content}
                    submitLabel="Update"
                  />
                </div>
              ) : (
                <p className="mt-1 text-gray-900 whitespace-pre-wrap text-sm">
                  {comment.content}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center mt-2 space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-500 hover:text-blue-600 px-2 py-1 h-auto text-xs"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Reply
                </Button>

                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 px-2 py-1 h-auto"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && within15Minutes && (
                        <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && within15Minutes && (
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      {!within15Minutes && isOwner && (
                        <DropdownMenuItem disabled className="text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          Time limit exceeded
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Reply form */}
              {showReplyForm && (
                <div className="mt-3 ml-4 border-l-2 border-gray-200 pl-4">
                  <CommentForm
                    onSubmit={handleReply}
                    placeholder="Write a reply..."
                    isReply={true}
                    onCancel={() => setShowReplyForm(false)}
                    submitLabel="Reply"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nested comments */}
        {hasChildren && !collapsed && (
          <div className="space-y-1">
            {comment.children?.map((child) => (
              <Comment
                key={child.id}
                comment={child}
                depth={depth + 1}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ))}
          </div>
        )}

        {/* Collapsed indicator */}
        {hasChildren && collapsed && (
          <div className="ml-4 text-xs text-gray-500 py-1">
            [{comment.children?.length} replies hidden]
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? You can restore it
              within 15 minutes from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
