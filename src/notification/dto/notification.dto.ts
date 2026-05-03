import { ApiProperty } from "@nestjs/swagger";

export class NotificationDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({ enum: ["order", "delivery", "system"] })
    type: string;

    @ApiProperty()
    message: string;

    @ApiProperty()
    isRead: boolean;

    @ApiProperty({ required: false })
    link?: string;

    @ApiProperty()
    created_at: Date;
}