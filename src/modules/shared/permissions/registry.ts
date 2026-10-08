import { ROLE_MODULE } from '@/modules/role/permissions';
import { USER_MODULE } from '@/modules/user/permissions';
import { DESTINATION_MODULE } from '@/modules/destination/permissions';
import { TOUR_MODULE } from '@/modules/tour/permissions';
import { ITINERARY_STOP_MODULE } from '@/modules/itinerary-stop/permissions';
import { TRANSPORT_UNIT_MODULE } from '@/modules/transport-unit/permissions';
import { DEPARTURE_MODULE } from '@/modules/departure/permissions';
import { DEPARTURE_UNIT_MODULE } from '@/modules/departure-unit/permissions';
import { CUSTOMER_MODULE } from '@/modules/customer/permissions';
import { BOOKING_MODULE } from '@/modules/booking/permissions';
import { PASSENGER_MODULE } from '@/modules/passenger/permissions';
import { PAYMENT_MODULE } from '@/modules/payment/permissions';

export const PERMISSION_REGISTRY = [
  ROLE_MODULE,
  USER_MODULE,
  DESTINATION_MODULE,
  TOUR_MODULE,
  ITINERARY_STOP_MODULE,
  TRANSPORT_UNIT_MODULE,
  DEPARTURE_MODULE,
  DEPARTURE_UNIT_MODULE,
  CUSTOMER_MODULE,
  BOOKING_MODULE,
  PASSENGER_MODULE,
  PAYMENT_MODULE,
] as const;
