import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../drizzle/db';
import { comments } from '../drizzle/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
@Injectable()
export class CommentService {
  constructor(private readonly notificationsService: NotificationsService) {}

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

    if (inserted[0].parent_id) {
      console.log('notifyOnReply called for parent:', inserted[0].parent_id);
      await this.notificationsService.notifyOnReply(
        inserted[0].parent_id,
        inserted[0].id,
      );
      console.log('notifyOnReply completed');
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

  async getAll() {
    const all = await db
      .select()
      .from(comments)
      .where(isNull(comments.deleted_at));
    return this.nestComments(all, null);
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
        replies: this.nestComments(commentsList, c.id),
      }));
  }
}
