import {
    Controller,
    Get,
    Patch,
    Param,
    Req,
    UseGuards,
} from "@nestjs/common";

import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { NotificationService } from "./notification.service";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) {}

    @Get()
    @ApiOperation({ summary: "Get logged-in user's notifications" })
    @ApiResponse({
        status: 200,
        description: "List of notifications",
    })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async getMyNotifications(@Req() req) {
        return this.notificationService.findByUser(req.user.id);
    }

    @Get("unread-count")
    @ApiOperation({ summary: "Get unread notifications count" })
    @ApiResponse({
        status: 200,
        description: "Unread count returned",
        schema: {
            example: { count: 3 },
        },
    })
    async unreadCount(@Req() req) {
        const count = await this.notificationService.unreadCount(req.user.id);
        return { count };
    }


    @Patch(":id/read")
    @ApiOperation({ summary: "Mark a notification as read" })
    @ApiParam({
        name: "id",
        description: "Notification ID",
        example: "uuid-string",
    })
    @ApiResponse({
        status: 200,
        description: "Marked as read successfully",
        schema: {
            example: { success: true },
        },
    })
    @ApiResponse({ status: 404, description: "Notification not found" })
    async markAsRead(
        @Param("id") id: string,
        @Req() req,
    ) {
        return this.notificationService.markAsRead(id, req.user.id);
    }


    @Patch("mark-all-read")
    @ApiOperation({ summary: "Mark all notifications as read" })
    @ApiResponse({
        status: 200,
        description: "All notifications marked as read",
        schema: {
            example: { success: true },
        },
    })
    async markAllAsRead(@Req() req) {
        return this.notificationService.markAllAsRead(req.user.id);
    }
}