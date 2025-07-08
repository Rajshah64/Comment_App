import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseAuthGuard } from './auth/supabase-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  getProfile(@Req() req: Request) {
    return req['user'];
  }
}
