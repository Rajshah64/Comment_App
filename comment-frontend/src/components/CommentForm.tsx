"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle, Send, X } from "lucide-react";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(280, "Comment must be 280 characters or less"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  placeholder?: string;
  isReply?: boolean;
  onCancel?: () => void;
  initialContent?: string;
  submitLabel?: string;
}

export default function CommentForm({
  onSubmit,
  placeholder = "What's on your mind?",
  isReply = false,
  onCancel,
  initialContent = "",
  submitLabel = "Post",
}: CommentFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const handleSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    const success = await onSubmit(data.content);
    if (success) {
      form.reset();
      onCancel?.();
    }
    setIsSubmitting(false);
  };

  const characterCount = form.watch("content").length;
  const isOverLimit = characterCount > 280;

  return (
    <div
      className={`${
        isReply
          ? "border-l-2 border-gray-200 pl-4 ml-8"
          : "border-b border-gray-200"
      } pb-4`}
    >
      <div className="flex space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-blue-500 text-white">
            {user?.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={placeholder}
                        className={`min-h-[80px] resize-none border-none focus:ring-0 text-lg ${
                          isReply ? "bg-gray-50" : "bg-transparent"
                        }`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {!isReply && <MessageCircle className="w-4 h-4" />}
                  <span className={`${isOverLimit ? "text-red-500" : ""}`}>
                    {characterCount}/280
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {isReply && onCancel && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onCancel}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !form.watch("content").trim() ||
                      isOverLimit
                    }
                    size="sm"
                    className="px-6"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {isSubmitting ? "Posting..." : submitLabel}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
