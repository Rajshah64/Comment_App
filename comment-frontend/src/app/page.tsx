"use client";

import { useAuth } from "@/context/AuthContext";
import { useComments } from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import Notifications from "@/components/Notifications";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    comments,
    loading: commentsLoading,
    createComment,
    editComment,
    deleteComment,
    restoreComment,
    refetch,
  } = useComments();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome to Comment System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Please sign in to continue</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateComment = async (content: string) => {
    return await createComment(content);
  };

  const handleReply = async (parentId: string, content: string) => {
    return await createComment(content, parentId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Comments</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Notifications />
              <Button
                onClick={refetch}
                variant="ghost"
                size="sm"
                disabled={commentsLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${commentsLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {/* Comment Form */}
        <div className="bg-white border-b border-gray-200 p-4">
          <CommentForm onSubmit={handleCreateComment} />
        </div>

        {/* Comments Feed */}
        <div className="bg-white">
          <CommentList
            comments={comments}
            loading={commentsLoading}
            onReply={handleReply}
            onEdit={editComment}
            onDelete={deleteComment}
            onRestore={restoreComment}
          />
        </div>
      </div>
    </div>
  );
}
