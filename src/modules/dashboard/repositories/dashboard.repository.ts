export interface PriorityPendingPaymentDto {
  payment: {
    id: string;
    code: string;
    amount: string;
    currency: string;
    method: string;
    reference: string | null;
    createdAt: Date;
  };
  booking: {
    id: string;
    code: string;
  };
  customer: {
    fullName: string;
  };
}

export interface UpcomingDepartureDto {
  departure: {
    id: string;
    code: string;
    departureDate: Date;
    bookedSlots: number;
    totalCapacity: number;
  };
  tour: {
    id: string;
    name: string;
  };
}

export interface PendingBalanceBookingDto {
  booking: {
    id: string;
    code: string;
    totalAmount: string;
    paidAmount: string;
    slotsReserved: number;
  };
  customer: {
    fullName: string;
  };
  departure: {
    id: string;
    code: string;
    departureDate: Date;
  };
}

export interface DashboardMetricsDto {
  monthSales: number;
  monthBookingsCount: number;
  verifiedAmount: number;
  pendingAmount: number;
  pendingPaymentsCount: number;
  totalCapacity: number;
  totalBooked: number;
  activeDeparturesCount: number;
  globalOccupationRate: number;
  priorityPendingPayments: PriorityPendingPaymentDto[];
  upcomingDepartures: UpcomingDepartureDto[];
  pendingBalanceBookings: PendingBalanceBookingDto[];
}

export interface DashboardRepository {
  getMetrics(): Promise<DashboardMetricsDto>;
}
