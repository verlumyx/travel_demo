// Schema barrel - re-export every module model here.
// drizzle-kit and db.query.* only see what is exported from this file.

export * from '@/modules/role/models/role.model';
export * from '@/modules/user/models/user.model';
export * from '@/modules/user/models/auth.model';
export * from '@/modules/category/models/category.model';
export * from '@/modules/destination/models/destination.model';
export * from '@/modules/tour/models/tour.model';
export * from '@/modules/itinerary-stop/models/itinerary-stop.model';
export * from '@/modules/transport-unit/models/transport-unit.model';
export * from '@/modules/departure/models/departure.model';
export * from '@/modules/departure-unit/models/departure-unit.model';
export * from '@/modules/customer/models/customer.model';
export * from '@/modules/booking/models/booking.model';
export * from '@/modules/passenger/models/passenger.model';
export * from '@/modules/payment/models/payment.model';
export * from '@/modules/payment-method/models/payment-method.model';
export * from '@/modules/system-log/models/system-log.model';
