import {Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {RoleGuard} from "../auth/guard/role-guard.guard";
import {Roles} from "../auth/decorator/role-decorator";
import {DeliveryTrackingService} from "./delivery_tracking.service";
import {FilterDeliveryDto} from "./dto/filter-delivery.dto";
import {AssignDriverDto} from "./dto/assign-driver.dto";
import {UpdateStatusDto} from "./dto/update-status.dto";
import {FailDeliveryDto} from "./dto/fail-delivery.dto";

@ApiTags('[Admin] Delivery Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin')
@Controller('admin/delivery-tracking')
// @Controller('delivery-tracking')
export class DeliveryTrackingController {
    constructor(private readonly service: DeliveryTrackingService) {}

    @Get()
    findAll(@Query() filter: FilterDeliveryDto) {
        return this.service.findAll(filter);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id/assign-driver')
    assignDriver(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignDriverDto
    ) {
        return this.service.assignDriver(id, dto);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusDto
    ) {
        return this.service.updateStatus(id, dto);
    }

    @Patch(':id/fail')
    markFailed(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: FailDeliveryDto
    ) {
        return this.service.markFailed(id, dto);
    }

    @Patch(':id/delivered')
    markDelivered(@Param('id', ParseIntPipe) id: number) {
        return this.service.markDelivered(id);
    }

}
