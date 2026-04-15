import {
    Controller,
    Get,
    Param,
    Patch,
    Query,
    ParseIntPipe,
    UseGuards,
    Body,
} from '@nestjs/common';

import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RoleGuard } from '../auth/guard/role-guard.guard';
import { Roles } from '../auth/decorator/role-decorator';

import { QueryPaymentDto } from './dto/query-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Payments (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin')
@Controller('admin/payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Get()
    @ApiOperation({ summary: 'Get all payments (filter, search, pagination ready)' })
    findAll(@Query() query: QueryPaymentDto) {
        return this.paymentService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get payment by ID' })
    @ApiParam({ name: 'id', type: Number })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.findOne(id);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update payment status (SUCCESS / FAILED / PENDING)' })
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePaymentStatusDto,
    ) {
        return this.paymentService.updateStatus(id, dto);
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Confirm payment (set SUCCESS)' })
    confirm(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.confirmPayment(id);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject payment (set FAILED)' })
    reject(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.rejectPayment(id);
    }
}