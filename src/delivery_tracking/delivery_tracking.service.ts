import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeliveryResult,
  DeliveryStatus,
  DeliveryTracking,
} from '../common/entities/delivery-tracking.entity';
import { Repository } from 'typeorm';
import { DriverProfile } from '../common/entities/driver_profile.entity';
import { FilterDeliveryDto } from './dto/filter-delivery.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FailDeliveryDto } from './dto/fail-delivery.dto';
import { Order, OrderStatus } from '../common/entities/order.entity';
import { NotificationGateway } from '../notification/notification.gateway';
import { Notification } from '../common/entities/notifications.entity';
import {
  OrderItem,
  OrderItemStatus,
} from '../common/entities/order-item.entity';

@Injectable()
export class DeliveryTrackingService {
  constructor(
    @InjectRepository(DeliveryTracking)
    private trackingRepo: Repository<DeliveryTracking>,

    @InjectRepository(DriverProfile)
    private driverRepo: Repository<DriverProfile>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    private readonly notificationGateway: NotificationGateway,
  ) {}

  async findAll(filterDeliveryDto: FilterDeliveryDto) {
    return this.trackingRepo.find({
      where: {
        status: filterDeliveryDto.status as any,
        order_id: filterDeliveryDto.orderId as any,
        driverProfile: filterDeliveryDto.driverProfileId
          ? { id: filterDeliveryDto.driverProfileId }
          : undefined,
      },
      relations: {
        order: true,
        driverProfile: { user: true },
      },
    });
  }

  async findOne(id: number) {
    const tracking = await this.trackingRepo.findOne({
      where: { id },
      relations: {
        order: true,
        driverProfile: { user: true },
      },
    });
    if (!tracking) throw new NotFoundException('Tracking not found');

    return tracking;
  }

  async assignDriver(id: number, asssignDriverDto: AssignDriverDto) {
    const tracking = await this.findOne(id);

    const driver = await this.driverRepo.findOne({
      where: { id: asssignDriverDto.driverProfileId },
      relations: ['user'],
    });

    if (!driver) throw new NotFoundException('Driver not found');

    tracking.driverProfile = driver;
    await this.trackingRepo.save(tracking);

    return tracking;
  }

  async updateStatus(id: number, updateStatusDto: UpdateStatusDto) {
    const tracking = await this.findOne(id);

    tracking.status = updateStatusDto.status;

    return this.trackingRepo.save(tracking);
  }

  async markFailed(id: number, dto: FailDeliveryDto) {
    try {
      const tracking = await this.trackingRepo.findOne({
        where: { id },
        relations: {
          driverProfile: true,
          order: { user: true },
        },
      });

      if (!tracking) throw new NotFoundException('Tracking not found');

      tracking.result = DeliveryResult.CANCELLED;
      tracking.failure_reason = dto.reason;
      tracking.status = DeliveryStatus.CANCELLED;

      if (tracking.driverProfile) {
        tracking.driverProfile.is_available = true;
        await this.driverRepo.save(tracking.driverProfile);
      }

      if (tracking.order) {
        tracking.order.status = OrderStatus.CANCELLED;
        await this.orderRepo.save(tracking.order);
      }

      const savedTracking = await this.trackingRepo.save(tracking);

      const userId = tracking.order?.user?.id;

      if (userId) {
        await this.notificationRepo.save({
          userId,
          type: 'delivery',
          message: `Order #${tracking.order.id} failed`,
          orderId: tracking.order.id,
          deliveryTrackingId: tracking.id,
          isRead: false,
        });

        this.notificationGateway.sendToUser(userId, 'delivery_failed', {
          type: 'delivery_failed',
          orderId: tracking.order.id,
          reason: dto.reason,
          message: `Order #${tracking.order.id} failed`,
        });
      }

      return savedTracking;
    } catch (err) {
      console.error('markFailed error:', err);
      throw err;
    }
  }

  async markDelivered(id: number) {
    try {
      const tracking = await this.trackingRepo.findOne({
        where: { id },
        relations: {
          driverProfile: true,
          order: { user: true },
        },
      });

      if (!tracking) {
        throw new NotFoundException('Tracking not found');
      }

      tracking.status = DeliveryStatus.DELIVERED;
      tracking.result = DeliveryResult.SUCCESS;

      if (tracking.order) {
        tracking.order.status = OrderStatus.COMPLETED;
        await this.orderRepo.save(tracking.order);

        await this.orderItemRepo
          .createQueryBuilder()
          .update()
          .set({ status: OrderItemStatus.FULFILLED })
          .where('order_id = :orderId', {
            orderId: tracking.order.id,
          })
          .execute();
      }

      if (tracking.driverProfile) {
        tracking.driverProfile.is_available = true;
        await this.driverRepo.save(tracking.driverProfile);
      }

      const savedTracking = await this.trackingRepo.save(tracking);

      const userId = tracking.order?.user?.id;

      if (userId) {
        await this.notificationRepo.save({
          userId,
          type: 'delivery',
          message: `Order #${tracking.order.id} delivered successfully`,
          orderId: tracking.order.id,
          deliveryTrackingId: tracking.id,
          isRead: false,
        });

        this.notificationGateway.sendToUser(userId, 'delivery_success', {
          type: 'delivery_success',
          orderId: tracking.order.id,
          message: `Order #${tracking.order.id} delivered successfully`,
        });
      }

      return savedTracking;
    } catch (err) {
      console.error('markDelivered error:', err);
      throw err;
    }
  }
}
