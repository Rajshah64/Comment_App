import { IsBoolean } from 'class-validator';

export class ToggleNotificationDto {
  @IsBoolean()
  is_read: boolean;
}
