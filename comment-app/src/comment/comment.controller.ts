import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';

@Controller('comments')
@UseGuards(SupabaseAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateCommentDto) {
    return this.commentService.create(req['user'].id, dto);
  }

  @Patch(':id')
  edit(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: EditCommentDto,
  ) {
    return this.commentService.edit(req['user'].id, id, dto);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.commentService.delete(req['user'].id, id);
  }

  @Patch(':id/restore')
  @UseGuards(SupabaseAuthGuard)
  restoreComment(@Param('id') id: string, @Req() req) {
    return this.commentService.restore(id, req.user.id);
  }

  @Get()
  getAll(@Req() req: Request) {
    return this.commentService.getAll(req['user']?.id);
  }

  @Get('my-comments')
  getMyComments(@Req() req: Request) {
    return this.commentService.getUserComments(req['user'].id);
  }
}
