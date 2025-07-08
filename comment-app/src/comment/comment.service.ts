import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../drizzle/db';
import { comments, notifications } from '../drizzle/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CommentService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(userId: string, dto: CreateCommentDto) {
    console.log('userId:', userId);
    console.log('Create DTO:', dto);

    const inserted = await db
      .insert(comments)
      .values({
        content: dto.content,
        author_id: userId,
        parent_id: dto.parent_id || null,
      })
      .returning();

    // If this is a reply, create notification and emit WebSocket event
    if (inserted[0].parent_id) {
      console.log(
        'Creating reply notification for parent:',
        inserted[0].parent_id,
      );

      // Get parent comment to find the recipient
      const [parentComment] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, inserted[0].parent_id));

      if (parentComment && parentComment.author_id !== userId) {
        // Create notification in database
        const [notification] = await db
          .insert(notifications)
          .values({
            recipient_id: parentComment.author_id,
            comment_id: inserted[0].id,
          })
          .returning();

        // Emit real-time notification via WebSocket
        this.notificationsGateway.emitNotificationToUser(
          parentComment.author_id,
          {
            ...notification,
            comment: {
              id: inserted[0].id,
              content: inserted[0].content,
              author_id: inserted[0].author_id,
            },
          },
        );

        console.log(
          'Real-time notification sent to user:',
          parentComment.author_id,
        );
      }
    }

    return inserted[0];
  }

  async edit(userId: string, commentId: string, dto: EditCommentDto) {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment) throw new NotFoundException();
    if (comment.author_id !== userId) throw new ForbiddenException();

    const diffMinutes =
      (Date.now() - new Date(comment.created_at).getTime()) / 60000;
    if (diffMinutes > 15) throw new ForbiddenException('Edit window expired');

    await db
      .update(comments)
      .set({
        content: dto.content,
        updated_at: new Date(),
      })
      .where(eq(comments.id, commentId));

    return await db.select().from(comments).where(eq(comments.id, commentId));
  }

  async delete(userId: string, commentId: string) {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment) throw new NotFoundException();
    if (comment.author_id !== userId) throw new ForbiddenException();

    const diffMinutes =
      (Date.now() - new Date(comment.created_at).getTime()) / 60000;
    if (diffMinutes > 15) throw new ForbiddenException('Delete window expired');

    await db
      .update(comments)
      .set({ deleted_at: new Date() })
      .where(eq(comments.id, commentId));
    return await db.select().from(comments).where(eq(comments.id, commentId));
  }

  async restore(commentId: string, userId: string) {
    const [comment] = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.author_id, userId),
          isNotNull(comments.deleted_at),
        ),
      );

    if (!comment)
      throw new NotFoundException('Comment not found or not deleted');

    const now = new Date();
    const deletedAt = new Date(comment.deleted_at!);
    const diffMins = (now.getTime() - deletedAt.getTime()) / 1000 / 60;

    if (diffMins > 15) {
      throw new ForbiddenException('Restore window expired');
    }

    return await db
      .update(comments)
      .set({ deleted_at: null })
      .where(eq(comments.id, commentId))
      .returning();
  }

  async getAll(currentUserId?: string) {
    // Get all comments (including deleted ones)
    const all = await db.select().from(comments);

    // Filter comments based on visibility rules
    const visibleComments = all.filter((comment) => {
      // If not deleted, show to everyone
      if (!comment.deleted_at) return true;

      // If deleted, only show to the author (so they can restore)
      return comment.author_id === currentUserId;
    });

    return this.nestComments(visibleComments, null);
  }

  async getUserComments(userId: string) {
    // Get all comments by this user
    const userComments = await db
      .select()
      .from(comments)
      .where(eq(comments.author_id, userId));

    const now = new Date();

    // Categorize comments
    const activeComments = userComments.filter(
      (comment) => !comment.deleted_at,
    );

    const deletedComments = userComments.filter((comment) => {
      if (!comment.deleted_at) return false;

      // Check if within 15-minute restore window
      const deletedAt = new Date(comment.deleted_at);
      const timeDiff = now.getTime() - deletedAt.getTime();
      return timeDiff < 15 * 60 * 1000; // Within 15 minutes
    });

    return {
      active: activeComments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
      restorable: deletedComments.sort(
        (a, b) =>
          new Date(b.deleted_at!).getTime() - new Date(a.deleted_at!).getTime(),
      ),
      stats: {
        totalActive: activeComments.length,
        totalRestorable: deletedComments.length,
      },
    };
  }

  private nestComments(commentsList: any[], parentId: string | null): any[] {
    return commentsList
      .filter((c) => c.parent_id === parentId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .map((c) => ({
        ...c,
        children: this.nestComments(commentsList, c.id),
      }));
  }
}
