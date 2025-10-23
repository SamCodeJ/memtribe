import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Features
  const features = await Promise.all([
    prisma.feature.upsert({
      where: { feature_key: 'events_per_month' },
      update: {},
      create: {
        feature_name: 'Events Per Month',
        feature_key: 'events_per_month',
        feature_type: 'limit',
        description: 'Maximum number of events that can be created per month'
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'guests_per_event' },
      update: {},
      create: {
        feature_name: 'Guests Per Event',
        feature_key: 'guests_per_event',
        feature_type: 'limit',
        description: 'Maximum number of guests per event'
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'media_per_event' },
      update: {},
      create: {
        feature_name: 'Media Per Event',
        feature_key: 'media_per_event',
        feature_type: 'limit',
        description: 'Maximum media uploads per event'
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'ai_image_generation' },
      update: {},
      create: {
        feature_name: 'AI Image Generation',
        feature_key: 'ai_image_generation',
        feature_type: 'boolean',
        description: 'Access to AI-powered image generation'
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'custom_branding' },
      update: {},
      create: {
        feature_name: 'Custom Branding',
        feature_key: 'custom_branding',
        feature_type: 'boolean',
        description: 'Ability to add custom branding and logos'
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'slideshow_speed' },
      update: {},
      create: {
        feature_name: 'Slideshow Speed',
        feature_key: 'slideshow_speed',
        feature_type: 'limit',
        description: 'Slideshow transition speed in milliseconds'
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'slideshow_refresh' },
      update: {},
      create: {
        feature_name: 'Slideshow Refresh',
        feature_key: 'slideshow_refresh',
        feature_type: 'limit',
        description: 'Slideshow refresh rate in milliseconds'
      }
    })
  ]);

  console.log('✅ Created features');

  // Create Packages
  const starterPackage = await prisma.package.upsert({
    where: { package_slug: 'starter' },
    update: {},
    create: {
      package_name: 'Starter',
      package_slug: 'starter',
      price: 0,
      billing_cycle: 'monthly',
      description: 'Perfect for getting started with event management',
      is_active: true
    }
  });

  const proPackage = await prisma.package.upsert({
    where: { package_slug: 'pro' },
    update: {},
    create: {
      package_name: 'Pro',
      package_slug: 'pro',
      price: 29,
      billing_cycle: 'monthly',
      description: 'For small businesses and personal events',
      is_active: true
    }
  });

  const businessPackage = await prisma.package.upsert({
    where: { package_slug: 'business' },
    update: {},
    create: {
      package_name: 'Business',
      package_slug: 'business',
      price: 79,
      billing_cycle: 'monthly',
      description: 'For event planners and medium businesses',
      is_active: true
    }
  });

  const enterprisePackage = await prisma.package.upsert({
    where: { package_slug: 'enterprise' },
    update: {},
    create: {
      package_name: 'Enterprise',
      package_slug: 'enterprise',
      price: 199,
      billing_cycle: 'monthly',
      description: 'For large corporations and agencies',
      is_active: true
    }
  });

  console.log('✅ Created packages');

  // Create Package Features
  // Starter Plan Features
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: starterPackage.id, feature_id: features[0].id } },
    update: {},
    create: { package_id: starterPackage.id, feature_id: features[0].id, feature_value: '2' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: starterPackage.id, feature_id: features[1].id } },
    update: {},
    create: { package_id: starterPackage.id, feature_id: features[1].id, feature_value: '50' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: starterPackage.id, feature_id: features[2].id } },
    update: {},
    create: { package_id: starterPackage.id, feature_id: features[2].id, feature_value: '100' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: starterPackage.id, feature_id: features[3].id } },
    update: {},
    create: { package_id: starterPackage.id, feature_id: features[3].id, feature_value: 'false' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: starterPackage.id, feature_id: features[4].id } },
    update: {},
    create: { package_id: starterPackage.id, feature_id: features[4].id, feature_value: 'false' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: starterPackage.id, feature_id: features[5].id } },
    update: {},
    create: { package_id: starterPackage.id, feature_id: features[5].id, feature_value: '5000' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: starterPackage.id, feature_id: features[6].id } },
    update: {},
    create: { package_id: starterPackage.id, feature_id: features[6].id, feature_value: '30000' }
  });

  // Pro Plan Features
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: proPackage.id, feature_id: features[0].id } },
    update: {},
    create: { package_id: proPackage.id, feature_id: features[0].id, feature_value: '10' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: proPackage.id, feature_id: features[1].id } },
    update: {},
    create: { package_id: proPackage.id, feature_id: features[1].id, feature_value: '300' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: proPackage.id, feature_id: features[2].id } },
    update: {},
    create: { package_id: proPackage.id, feature_id: features[2].id, feature_value: '1000' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: proPackage.id, feature_id: features[3].id } },
    update: {},
    create: { package_id: proPackage.id, feature_id: features[3].id, feature_value: 'true' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: proPackage.id, feature_id: features[4].id } },
    update: {},
    create: { package_id: proPackage.id, feature_id: features[4].id, feature_value: 'true' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: proPackage.id, feature_id: features[5].id } },
    update: {},
    create: { package_id: proPackage.id, feature_id: features[5].id, feature_value: '3000' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: proPackage.id, feature_id: features[6].id } },
    update: {},
    create: { package_id: proPackage.id, feature_id: features[6].id, feature_value: '15000' }
  });

  // Business Plan Features
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: businessPackage.id, feature_id: features[0].id } },
    update: {},
    create: { package_id: businessPackage.id, feature_id: features[0].id, feature_value: '0', is_unlimited: true }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: businessPackage.id, feature_id: features[1].id } },
    update: {},
    create: { package_id: businessPackage.id, feature_id: features[1].id, feature_value: '1000' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: businessPackage.id, feature_id: features[2].id } },
    update: {},
    create: { package_id: businessPackage.id, feature_id: features[2].id, feature_value: '5000' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: businessPackage.id, feature_id: features[3].id } },
    update: {},
    create: { package_id: businessPackage.id, feature_id: features[3].id, feature_value: 'true' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: businessPackage.id, feature_id: features[4].id } },
    update: {},
    create: { package_id: businessPackage.id, feature_id: features[4].id, feature_value: 'true' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: businessPackage.id, feature_id: features[5].id } },
    update: {},
    create: { package_id: businessPackage.id, feature_id: features[5].id, feature_value: '2000' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: businessPackage.id, feature_id: features[6].id } },
    update: {},
    create: { package_id: businessPackage.id, feature_id: features[6].id, feature_value: '10000' }
  });

  // Enterprise Plan Features
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: enterprisePackage.id, feature_id: features[0].id } },
    update: {},
    create: { package_id: enterprisePackage.id, feature_id: features[0].id, feature_value: '0', is_unlimited: true }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: enterprisePackage.id, feature_id: features[1].id } },
    update: {},
    create: { package_id: enterprisePackage.id, feature_id: features[1].id, feature_value: '0', is_unlimited: true }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: enterprisePackage.id, feature_id: features[2].id } },
    update: {},
    create: { package_id: enterprisePackage.id, feature_id: features[2].id, feature_value: '0', is_unlimited: true }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: enterprisePackage.id, feature_id: features[3].id } },
    update: {},
    create: { package_id: enterprisePackage.id, feature_id: features[3].id, feature_value: 'true' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: enterprisePackage.id, feature_id: features[4].id } },
    update: {},
    create: { package_id: enterprisePackage.id, feature_id: features[4].id, feature_value: 'true' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: enterprisePackage.id, feature_id: features[5].id } },
    update: {},
    create: { package_id: enterprisePackage.id, feature_id: features[5].id, feature_value: '1000' }
  });
  await prisma.packageFeature.upsert({
    where: { package_id_feature_id: { package_id: enterprisePackage.id, feature_id: features[6].id } },
    update: {},
    create: { package_id: enterprisePackage.id, feature_id: features[6].id, feature_value: '5000' }
  });

  console.log('✅ Created package features');

  // Create a test admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@memtribe.com' },
    update: {},
    create: {
      email: 'admin@memtribe.com',
      password: hashedPassword,
      full_name: 'Admin User',
      role: 'admin',
      subscription_plan: 'enterprise'
    }
  });

  console.log('✅ Created admin user');
  console.log('📧 Email: admin@memtribe.com');
  console.log('🔑 Password: admin123');

  // Create a test regular user
  const testUserPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@memtribe.com' },
    update: {},
    create: {
      email: 'test@memtribe.com',
      password: testUserPassword,
      full_name: 'Test User',
      role: 'user',
      subscription_plan: 'starter'
    }
  });

  console.log('✅ Created test user');
  console.log('📧 Email: test@memtribe.com');
  console.log('🔑 Password: test123');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

