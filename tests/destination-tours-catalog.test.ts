import { describe, it, expect, vi } from 'vitest';
import { DestinationFindService } from '@/modules/destination/services/destination-find.service';
import type { DestinationRepository } from '@/modules/destination/repositories/destination.repository';
import type { DestinationRow } from '@/modules/destination/models/destination.model';
import { TourCatalogService } from '@/modules/tour/services/tour-catalog.service';
import type { TourRepository, CatalogTourItem } from '@/modules/tour/repositories/tour.repository';

describe('Destination and Tours Catalog Linking', () => {
  const mockDestinationRow: DestinationRow = {
    id: '01931000-0000-7000-8000-000000000001',
    code: 'DES000001',
    categoryId: '01931000-0000-7000-8000-000000000002',
    name: 'Península de Araya',
    slug: 'peninsula-de-araya',
    description: '<p>Hermosas playas y castillo histórico</p>',
    imageUrl: 'https://images.unsplash.com/sample',
    state: 'Sucre',
    city: 'Araya',
    country: 'Venezuela',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDestinationRepo: DestinationRepository = {
    create: vi.fn(),
    findById: vi.fn(async (id: string) => (id === mockDestinationRow.id ? mockDestinationRow : null)),
    findOrFail: vi.fn(async (id: string) => (id === mockDestinationRow.id ? mockDestinationRow : null as unknown as DestinationRow)),
    findBySlug: vi.fn(async (slug: string) => (slug === mockDestinationRow.slug ? mockDestinationRow : null)),
    update: vi.fn(),
    updateStatus: vi.fn(),
    search: vi.fn(),
    getActive: vi.fn(async () => [mockDestinationRow]),
    findByCategoryId: vi.fn(),
  };

  const findService = new DestinationFindService(mockDestinationRepo);

  it('DestinationFindService finds destination by UUID id', async () => {
    const dest = await findService.findByIdOrSlug('01931000-0000-7000-8000-000000000001');
    expect(dest).not.toBeNull();
    expect(dest?.id).toBe(mockDestinationRow.id);
    expect(dest?.name).toBe('Península de Araya');
    expect(mockDestinationRepo.findById).toHaveBeenCalledWith('01931000-0000-7000-8000-000000000001');
  });

  it('DestinationFindService finds destination by slug', async () => {
    const dest = await findService.findByIdOrSlug('peninsula-de-araya');
    expect(dest).not.toBeNull();
    expect(dest?.slug).toBe('peninsula-de-araya');
    expect(mockDestinationRepo.findBySlug).toHaveBeenCalledWith('peninsula-de-araya');
  });

  it('TourCatalogService executes query filtering by destinationId', async () => {
    const mockCatalogTours: CatalogTourItem[] = [
      {
        id: 'tour-1',
        name: 'ARAYA FULL DAY',
        slug: 'araya-full-day',
        code: 'TUR000001',
        description: 'Paseo en lancha y visita al castillo',
        shortDescription: 'Full day saliendo de Cumaná',
        basePrice: '45.00',
        currency: 'USD',
        durationDays: 1,
        imageUrl: null,
        includesFood: true,
        includesLodging: false,
        status: 'active',
        createdAt: new Date(),
        destinationName: 'Península de Araya',
        categoryName: 'Playa',
        categorySlug: 'playa',
        upcomingDeparturesCount: 2,
        nextDepartureDate: new Date('2026-11-01'),
        nextDepartureSlots: 15,
      },
    ];

    const mockTourRepo: Partial<TourRepository> = {
      getCatalogTours: vi.fn(async (filters) => {
        if (filters?.destinationId === mockDestinationRow.id) {
          return mockCatalogTours;
        }
        return [];
      }),
    };

    const catalogService = new TourCatalogService(mockTourRepo as TourRepository);

    const toursForDestination = await catalogService.execute({
      destinationId: mockDestinationRow.id,
    });

    expect(toursForDestination).toHaveLength(1);
    expect(toursForDestination[0].name).toBe('ARAYA FULL DAY');
    expect(mockTourRepo.getCatalogTours).toHaveBeenCalledWith({
      destinationId: mockDestinationRow.id,
    });

    const toursForOther = await catalogService.execute({
      destinationId: 'other-dest-id',
    });
    expect(toursForOther).toHaveLength(0);
  });
});
