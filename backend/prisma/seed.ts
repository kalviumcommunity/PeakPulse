import { PrismaClient, VehicleType, ComplaintType, Severity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.refund.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.restaurant.deleteMany();

  // Seed Restaurants
  console.log('🍽️  Seeding restaurants...');
  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: 'Pizza Palace',
        location: 'Downtown - Zone A'
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Burger Kingdom',
        location: 'Midtown - Zone B'
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Sushi Express',
        location: 'Downtown - Zone A'
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Taco Fiesta',
        location: 'Uptown - Zone C'
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Pasta House',
        location: 'Midtown - Zone B'
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Thai Delight',
        location: 'Downtown - Zone A'
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Indian Spice',
        location: 'Uptown - Zone C'
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Mexican Grill',
        location: 'Suburb - Zone D'
      }
    })
  ]);
  console.log(`   ✅ Created ${restaurants.length} restaurants`);

  // Seed Riders
  console.log('🚴 Seeding riders...');
  const riders = await Promise.all([
    prisma.rider.create({
      data: {
        riderCode: 'RDR001',
        name: 'Rahul Kumar',
        vehicleType: VehicleType.BIKE
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR002',
        name: 'Amit Singh',
        vehicleType: VehicleType.SCOOTER
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR003',
        name: 'Priya Sharma',
        vehicleType: VehicleType.BIKE
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR004',
        name: 'Vikram Patel',
        vehicleType: VehicleType.MOTORCYCLE
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR005',
        name: 'Sneha Reddy',
        vehicleType: VehicleType.SCOOTER
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR006',
        name: 'Arjun Mehta',
        vehicleType: VehicleType.BIKE
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR007',
        name: 'Ananya Gupta',
        vehicleType: VehicleType.BICYCLE
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR008',
        name: 'Karthik Rao',
        vehicleType: VehicleType.MOTORCYCLE
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR009',
        name: 'Divya Nair',
        vehicleType: VehicleType.SCOOTER
      }
    }),
    prisma.rider.create({
      data: {
        riderCode: 'RDR010',
        name: 'Rohan Verma',
        vehicleType: VehicleType.BIKE
      }
    })
  ]);
  console.log(`   ✅ Created ${riders.length} riders`);

  // Seed Deliveries
  console.log('📦 Seeding deliveries...');
  const deliveries = [];
  const baseDate = new Date('2024-01-01T08:00:00Z');
  
  for (let i = 0; i < 50; i++) {
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const rider = riders[Math.floor(Math.random() * riders.length)];
    const zone = ['Zone A', 'Zone B', 'Zone C', 'Zone D'][Math.floor(Math.random() * 4)];
    
    const assignedAt = new Date(baseDate.getTime() + i * 3600000);
    const prepTime = 10 + Math.floor(Math.random() * 20);
    const deliveryTime = 15 + Math.floor(Math.random() * 30);
    
    const pickedAt = new Date(assignedAt.getTime() + prepTime * 60000);
    const actualDeliveryTime = new Date(pickedAt.getTime() + deliveryTime * 60000);
    const promisedTime = new Date(assignedAt.getTime() + 45 * 60000);
    
    const slaBreached = actualDeliveryTime > promisedTime;
    const distanceKm = 2 + Math.random() * 10;

    const delivery = await prisma.delivery.create({
      data: {
        orderId: `ORD${String(1000 + i).padStart(5, '0')}`,
        restaurantId: restaurant.id,
        riderId: rider.id,
        customerZone: zone,
        assignedAt,
        pickedAt,
        deliveredAt: actualDeliveryTime,
        promisedTime,
        actualDeliveryTime,
        slaBreached,
        distanceKm: parseFloat(distanceKm.toFixed(2))
      }
    });
    
    deliveries.push(delivery);
  }
  console.log(`   ✅ Created ${deliveries.length} deliveries`);

  // Seed Complaints
  console.log('💬 Seeding complaints...');
  const complaintTypes = [
    ComplaintType.LATE_DELIVERY,
    ComplaintType.WRONG_ORDER,
    ComplaintType.MISSING_ITEMS,
    ComplaintType.POOR_QUALITY,
    ComplaintType.RIDER_BEHAVIOR
  ];
  
  const severities = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL];
  
  const descriptions = [
    'Order arrived 30 minutes late',
    'Wrong items in the order',
    'Missing side dishes',
    'Food was cold and stale',
    'Rider was rude',
    'Incomplete order delivered',
    'Poor packaging, food spilled',
    'Incorrect address delivery attempt'
  ];

  const complaints = [];
  for (let i = 0; i < 15; i++) {
    const delivery = deliveries[Math.floor(Math.random() * deliveries.length)];
    
    try {
      const complaint = await prisma.complaint.create({
        data: {
          deliveryId: delivery.id,
          complaintType: complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          createdAt: new Date(delivery.deliveredAt!.getTime() + 600000)
        }
      });
      complaints.push(complaint);
    } catch (error) {
      // Skip if complaint already exists for this delivery
    }
  }
  console.log(`   ✅ Created ${complaints.length} complaints`);

  // Seed Refunds
  console.log('💸 Seeding refunds...');
  const refundReasons = [
    'Delayed delivery exceeding SLA',
    'Wrong order delivered',
    'Poor food quality',
    'Missing items',
    'Rider misconduct',
    'Restaurant preparation delay'
  ];

  const refunds = [];
  for (let i = 0; i < 10; i++) {
    const delivery = deliveries[Math.floor(Math.random() * deliveries.length)];
    
    try {
      const refund = await prisma.refund.create({
        data: {
          deliveryId: delivery.id,
          refundAmount: 50 + Math.random() * 200,
          refundReason: refundReasons[Math.floor(Math.random() * refundReasons.length)],
          approved: Math.random() > 0.3,
          createdAt: new Date(delivery.deliveredAt!.getTime() + 1200000)
        }
      });
      refunds.push(refund);
    } catch (error) {
      // Skip if refund already exists for this delivery
    }
  }
  console.log(`   ✅ Created ${refunds.length} refunds`);

  console.log('\n✨ Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   Restaurants: ${restaurants.length}`);
  console.log(`   Riders: ${riders.length}`);
  console.log(`   Deliveries: ${deliveries.length}`);
  console.log(`   Complaints: ${complaints.length}`);
  console.log(`   Refunds: ${refunds.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
