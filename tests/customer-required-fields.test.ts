import { describe, it, expect } from 'vitest';
import { createCustomerSchema } from '@/modules/customer/validation/create-customer.schema';
import { updateCustomerSchema } from '@/modules/customer/validation/update-customer.schema';

describe('Customer Form Required Fields Validation', () => {
  const validBaseCustomer = {
    id: '0192d6e3-8b74-7291-a1bf-15d2be6a4cb1',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos@ejemplo.com',
    phone: '+58 412 1234567',
    documentType: 'cedula' as const,
    documentNumber: 'V-19456789',
    source: 'admin' as const,
  };

  describe('createCustomerSchema', () => {
    it('should succeed when all required fields (documentType, documentNumber, email, phone) are valid', () => {
      const result = createCustomerSchema.safeParse(validBaseCustomer);
      expect(result.success).toBe(true);
    });

    it('should fail when documentType is missing, null or empty', () => {
      const withoutDocType = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        documentType: null,
      });
      expect(withoutDocType.success).toBe(false);
      expect(withoutDocType.error?.flatten().fieldErrors.documentType).toContain(
        'El tipo de documento es obligatorio.'
      );

      const emptyDocType = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        documentType: '',
      });
      expect(emptyDocType.success).toBe(false);
      expect(emptyDocType.error?.flatten().fieldErrors.documentType).toContain(
        'El tipo de documento es obligatorio.'
      );
    });

    it('should fail when documentNumber is missing, null, or empty string', () => {
      const withoutDocNumber = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        documentNumber: null,
      });
      expect(withoutDocNumber.success).toBe(false);
      expect(withoutDocNumber.error?.flatten().fieldErrors.documentNumber).toContain(
        'El número de documento es obligatorio.'
      );

      const emptyDocNumber = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        documentNumber: '   ',
      });
      expect(emptyDocNumber.success).toBe(false);
      expect(emptyDocNumber.error?.flatten().fieldErrors.documentNumber).toContain(
        'El número de documento es obligatorio.'
      );
    });

    it('should fail when email is missing, null, empty or invalid', () => {
      const withoutEmail = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        email: null,
      });
      expect(withoutEmail.success).toBe(false);
      expect(withoutEmail.error?.flatten().fieldErrors.email).toContain(
        'El correo electrónico es obligatorio.'
      );

      const emptyEmail = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        email: '',
      });
      expect(emptyEmail.success).toBe(false);
      expect(emptyEmail.error?.flatten().fieldErrors.email).toContain(
        'El correo electrónico es obligatorio.'
      );

      const invalidEmail = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        email: 'notanemail',
      });
      expect(invalidEmail.success).toBe(false);
      expect(invalidEmail.error?.flatten().fieldErrors.email).toContain(
        'Correo electrónico no válido.'
      );
    });

    it('should fail when phone is missing, null, or empty', () => {
      const withoutPhone = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        phone: null,
      });
      expect(withoutPhone.success).toBe(false);
      expect(withoutPhone.error?.flatten().fieldErrors.phone).toContain(
        'El teléfono / WhatsApp es obligatorio.'
      );

      const emptyPhone = createCustomerSchema.safeParse({
        ...validBaseCustomer,
        phone: '   ',
      });
      expect(emptyPhone.success).toBe(false);
      expect(emptyPhone.error?.flatten().fieldErrors.phone).toContain(
        'El teléfono / WhatsApp es obligatorio.'
      );
    });
  });

  describe('updateCustomerSchema', () => {
    const validUpdate = {
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'carlos@ejemplo.com',
      phone: '+58 412 1234567',
      documentType: 'passport' as const,
      documentNumber: 'PA987654',
      source: 'admin' as const,
    };

    it('should succeed when all required fields are provided', () => {
      const result = updateCustomerSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should fail when any of the 4 required fields is missing or empty', () => {
      expect(
        updateCustomerSchema.safeParse({ ...validUpdate, documentType: '' }).success
      ).toBe(false);
      expect(
        updateCustomerSchema.safeParse({ ...validUpdate, documentNumber: '' }).success
      ).toBe(false);
      expect(
        updateCustomerSchema.safeParse({ ...validUpdate, email: '' }).success
      ).toBe(false);
      expect(
        updateCustomerSchema.safeParse({ ...validUpdate, phone: '' }).success
      ).toBe(false);
    });
  });
});
