import { ApiProperty } from "@nestjs/swagger";

export class MarkAsReadResponseDto {
    @ApiProperty()
    success: boolean;
}