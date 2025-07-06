import {
  Controller,
  Get,
  Query,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { NotificationsService } from './notifications.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { ToggleNotificationDto } from './dto/toggle-notifications.dto';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(private ns: NotificationsService) {}

  @Get()
  list(@Req() req: Request, @Query() q: ListNotificationsDto) {
    return this.ns.list(req['user'].id, q.unreadOnly);
  }

  @Patch(':id/read')
  markRead(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ToggleNotificationDto,
  ) {
    return this.ns.toggle(id, req['user'].id, dto.is_read);
  }
}
