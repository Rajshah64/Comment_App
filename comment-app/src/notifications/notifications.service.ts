import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../drizzle/db';
import { notifications, comments } from '../drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  // 1) List notifications
  async list(userId: string, unreadOnly?: boolean) {
    const whereClause = unreadOnly
      ? and(
          eq(notifications.recipient_id, userId),
          eq(notifications.is_read, false),
        )
      : eq(notifications.recipient_id, userId);

    return db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.created_at));
  }

  // 2) Toggle read/unread
  async toggle(id: string, userId: string, is_read: boolean) {
    const [notif] = await db
      .select()
      .from(notifications)
      .where(
        and(eq(notifications.id, id), eq(notifications.recipient_id, userId)),
      );
    if (!notif) throw new NotFoundException('Notification not found');

    const [updatedNotification] = await db
      .update(notifications)
      .set({ is_read })
      .where(eq(notifications.id, id))
      .returning();

    // Emit WebSocket update
    if (updatedNotification) {
      this.notificationsGateway.emitNotificationUpdateToUser(
        userId,
        updatedNotification,
      );
      console.log('Real-time notification update sent to user:', userId);
    }

    return { message: 'Updated' };
  }

  // 3) Auto-insert on reply
  async notifyOnReply(parentId: string, replyId: string) {
    // Fetch parent comment to get its author
    const [parent] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, parentId));
    if (!parent) return; // parent deleted?
    //if (parent.author_id === replyId) return;
    await db.insert(notifications).values({
      recipient_id: parent.author_id,
      comment_id: replyId,
    });
  }
}
