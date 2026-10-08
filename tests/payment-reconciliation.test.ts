import { describe, it, expect } from 'vitest';

describe('Payment Reconciliation & Booking Status Transitions', () => {
  const calculateBookingStatus = (
    totalRequired: number,
    verifiedPayments: Array<{ amount: number }>,
    initialStatus: string = 'pending',
  ) => {
    const totalPaid = verifiedPayments.reduce((acc, p) => acc + p.amount, 0);

    let newStatus = initialStatus;
    if (initialStatus !== 'cancelled') {
      if (totalPaid >= totalRequired) {
        newStatus = 'paid';
      } else if (totalPaid > 0) {
        newStatus = 'partial_payment';
      } else {
        newStatus = 'pending';
      }
    }

    return {
      totalPaid,
      status: newStatus,
    };
  };

  it('should remain pending when no verified payments exist', () => {
    const totalRequired = 300;
    const verifiedPayments: Array<{ amount: number }> = [];

    const result = calculateBookingStatus(totalRequired, verifiedPayments);
    expect(result.status).toBe('pending');
    expect(result.totalPaid).toBe(0);
  });

  it('should transition to partial_payment when a verified partial payment is registered', () => {
    const totalRequired = 300;
    const verifiedPayments = [{ amount: 100 }];

    const result = calculateBookingStatus(totalRequired, verifiedPayments);
    expect(result.status).toBe('partial_payment');
    expect(result.totalPaid).toBe(100);
  });

  it('should transition to paid when accumulated verified payments equal or exceed total required', () => {
    const totalRequired = 300;
    const verifiedPayments = [
      { amount: 100 },
      { amount: 200 },
    ];

    const result = calculateBookingStatus(totalRequired, verifiedPayments);
    expect(result.status).toBe('paid');
    expect(result.totalPaid).toBe(300);
  });

  it('should transition to paid even if customer slightly overpays', () => {
    const totalRequired = 300;
    const verifiedPayments = [
      { amount: 150 },
      { amount: 160 },
    ];

    const result = calculateBookingStatus(totalRequired, verifiedPayments);
    expect(result.status).toBe('paid');
    expect(result.totalPaid).toBe(310);
  });

  it('should not change status if the booking was cancelled', () => {
    const totalRequired = 300;
    const verifiedPayments = [{ amount: 300 }];

    const result = calculateBookingStatus(totalRequired, verifiedPayments, 'cancelled');
    expect(result.status).toBe('cancelled');
    expect(result.totalPaid).toBe(300);
  });
});
