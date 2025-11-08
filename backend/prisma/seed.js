import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Features based on landing page packages
  const features = await Promise.all([
    // Core limit features
    prisma.feature.upsert({
      where: { feature_key: 'events_per_month' },
      update: {},
      create: {
        feature_name: 'Events Per Month',
        display_name: 'Events Per Month',
        feature_key: 'events_per_month',
        feature_type: 'limit',
        description: 'Maximum number of events that can be created per month',
        default_value: '2',
        category: 'events',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'guests_per_event' },
      update: {},
      create: {
        feature_name: 'Guests Per Event',
        display_name: 'Guests Per Event',
        feature_key: 'guests_per_event',
        feature_type: 'limit',
        description: 'Maximum number of guests per event',
        default_value: '50',
        category: 'guests',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'media_per_event' },
      update: {},
      create: {
        feature_name: 'Media Per Event',
        display_name: 'Media Per Event',
        feature_key: 'media_per_event',
        feature_type: 'limit',
        description: 'Maximum media uploads per event',
        default_value: '100',
        category: 'media',
        is_active: true
      }
    }),
    
    // Boolean features
    prisma.feature.upsert({
      where: { feature_key: 'qr_code_generation' },
      update: {},
      create: {
        feature_name: 'QR Code Generation',
        display_name: 'QR Code Generation',
        feature_key: 'qr_code_generation',
        feature_type: 'boolean',
        description: 'Generate QR codes for event sharing',
        default_value: 'true',
        category: 'events',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'custom_branding' },
      update: {},
      create: {
        feature_name: 'Custom Branding',
        display_name: 'Custom Branding',
        feature_key: 'custom_branding',
        feature_type: 'boolean',
        description: 'Add custom branding and logo overlay',
        default_value: 'false',
        category: 'branding',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'ai_image_generation' },
      update: {},
      create: {
        feature_name: 'AI Image Generation',
        display_name: 'AI Image Generation',
        feature_key: 'ai_image_generation',
        feature_type: 'boolean',
        description: 'Access to AI-powered image generation and filters',
        default_value: 'false',
        category: 'media',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'live_moderation' },
      update: {},
      create: {
        feature_name: 'Live Moderation',
        display_name: 'Live Slideshow Moderation',
        feature_key: 'live_moderation',
        feature_type: 'boolean',
        description: 'Real-time moderation for live slideshow',
        default_value: 'false',
        category: 'advanced',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'white_label' },
      update: {},
      create: {
        feature_name: 'White Label',
        display_name: 'White-Label Customization',
        feature_key: 'white_label',
        feature_type: 'boolean',
        description: 'Full white-label customization',
        default_value: 'false',
        category: 'branding',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'analytics' },
      update: {},
      create: {
        feature_name: 'Analytics Dashboard',
        display_name: 'Analytics & Reporting',
        feature_key: 'analytics',
        feature_type: 'access',
        description: 'Access to analytics and reporting features',
        default_value: 'basic',
        category: 'advanced',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'api_access' },
      update: {},
      create: {
        feature_name: 'API Access',
        display_name: 'API Access',
        feature_key: 'api_access',
        feature_type: 'boolean',
        description: 'Access to advanced API features',
        default_value: 'false',
        category: 'advanced',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'multi_user_dashboard' },
      update: {},
      create: {
        feature_name: 'Multi-User Dashboard',
        display_name: 'Multi-User Dashboard',
        feature_key: 'multi_user_dashboard',
        feature_type: 'boolean',
        description: 'Multi-user dashboard with roles',
        default_value: 'false',
        category: 'advanced',
        is_active: true
      }
    }),
    
    // Support features
    prisma.feature.upsert({
      where: { feature_key: 'support_level' },
      update: {},
      create: {
        feature_name: 'Support Level',
        display_name: 'Support Level',
        feature_key: 'support_level',
        feature_type: 'access',
        description: 'Level of customer support',
        default_value: 'community',
        category: 'support',
        is_active: true
      }
    }),
    
    // Media hosting
    prisma.feature.upsert({
      where: { feature_key: 'media_hosting_days' },
      update: {},
      create: {
        feature_name: 'Media Hosting',
        display_name: 'Media Hosting Duration',
        feature_key: 'media_hosting_days',
        feature_type: 'limit',
        description: 'Number of days media is hosted',
        default_value: '7',
        category: 'media',
        is_active: true
      }
    }),
    
    // Slideshow features
    prisma.feature.upsert({
      where: { feature_key: 'slideshow_speed' },
      update: {},
      create: {
        feature_name: 'Slideshow Speed',
        display_name: 'Slideshow Speed',
        feature_key: 'slideshow_speed',
        feature_type: 'limit',
        description: 'Slideshow transition speed in milliseconds',
        default_value: '5000',
        category: 'events',
        is_active: true
      }
    }),
    prisma.feature.upsert({
      where: { feature_key: 'slideshow_refresh' },
      update: {},
      create: {
        feature_name: 'Slideshow Refresh',
        display_name: 'Slideshow Refresh',
        feature_key: 'slideshow_refresh',
        feature_type: 'limit',
        description: 'Slideshow refresh rate in milliseconds',
        default_value: '30000',
        category: 'events',
        is_active: true
      }
    })
  ]);

  console.log('✅ Created features');

  // Create Packages with new schema
  const starterPackage = await prisma.package.upsert({
    where: { package_slug: 'starter' },
    update: {},
    create: {
      package_name: 'Starter',
      package_slug: 'starter',
      price: 0,
      monthly_price: 0,
      yearly_price: 0,
      billing_cycle: 'monthly',
      description: 'Perfect for getting started',
      is_popular: false,
      display_order: 1,
      color_scheme: 'slate',
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
      monthly_price: 29,
      yearly_price: 290,
      billing_cycle: 'monthly',
      description: 'Small businesses & personal events',
      is_popular: true,
      display_order: 2,
      color_scheme: 'amber',
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
      monthly_price: 79,
      yearly_price: 790,
      billing_cycle: 'monthly',
      description: 'Event planners & medium businesses',
      is_popular: false,
      display_order: 3,
      color_scheme: 'blue',
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
      monthly_price: 199,
      yearly_price: 1990,
      billing_cycle: 'monthly',
      description: 'Large organizations & agencies',
      is_popular: false,
      display_order: 4,
      color_scheme: 'purple',
      is_active: true
    }
  });

  console.log('✅ Created packages');

  // Create Package Features based on landing page
  console.log('Creating package features...');
  
  // Helper function to create package feature
  const createPackageFeature = async (packageId, featureIndex, value, isUnlimited = false) => {
    await prisma.packageFeature.upsert({
      where: { package_id_feature_id: { package_id: packageId, feature_id: features[featureIndex].id } },
      update: {},
      create: { 
        package_id: packageId, 
        feature_id: features[featureIndex].id, 
        feature_value: value,
        is_unlimited: isUnlimited
      }
    });
  };
  
  // STARTER PLAN (FREE)
  await createPackageFeature(starterPackage.id, 0, '2'); // events_per_month: 2
  await createPackageFeature(starterPackage.id, 1, '50'); // guests_per_event: 50
  await createPackageFeature(starterPackage.id, 2, '100'); // media_per_event: 100
  await createPackageFeature(starterPackage.id, 3, 'true'); // qr_code_generation: true
  await createPackageFeature(starterPackage.id, 4, 'false'); // custom_branding: false (has watermark)
  await createPackageFeature(starterPackage.id, 5, 'false'); // ai_image_generation: false
  await createPackageFeature(starterPackage.id, 6, 'false'); // live_moderation: false
  await createPackageFeature(starterPackage.id, 11, 'community'); // support_level: community
  await createPackageFeature(starterPackage.id, 12, '7'); // media_hosting_days: 7
  await createPackageFeature(starterPackage.id, 13, '5000'); // slideshow_speed: 5000ms
  await createPackageFeature(starterPackage.id, 14, '30000'); // slideshow_refresh: 30000ms
  
  // PRO PLAN ($29)
  await createPackageFeature(proPackage.id, 0, '10'); // events_per_month: 10
  await createPackageFeature(proPackage.id, 1, '300'); // guests_per_event: 300
  await createPackageFeature(proPackage.id, 2, '1000'); // media_per_event: 1000
  await createPackageFeature(proPackage.id, 3, 'true'); // qr_code_generation: true
  await createPackageFeature(proPackage.id, 4, 'true'); // custom_branding: true
  await createPackageFeature(proPackage.id, 5, 'true'); // ai_image_generation: true (Advanced photo filters & AI)
  await createPackageFeature(proPackage.id, 6, 'true'); // live_moderation: true
  await createPackageFeature(proPackage.id, 8, 'basic'); // analytics: basic dashboard
  await createPackageFeature(proPackage.id, 11, 'email'); // support_level: email
  await createPackageFeature(proPackage.id, 12, '30'); // media_hosting_days: 30
  await createPackageFeature(proPackage.id, 13, '3000'); // slideshow_speed: 3000ms
  await createPackageFeature(proPackage.id, 14, '15000'); // slideshow_refresh: 15000ms
  
  // BUSINESS PLAN ($79)
  await createPackageFeature(businessPackage.id, 0, 'unlimited', true); // events_per_month: unlimited
  await createPackageFeature(businessPackage.id, 1, '1000'); // guests_per_event: 1000
  await createPackageFeature(businessPackage.id, 2, '5000'); // media_per_event: 5000
  await createPackageFeature(businessPackage.id, 3, 'true'); // qr_code_generation: true
  await createPackageFeature(businessPackage.id, 4, 'true'); // custom_branding: true
  await createPackageFeature(businessPackage.id, 5, 'true'); // ai_image_generation: true (Priority AI processing)
  await createPackageFeature(businessPackage.id, 6, 'true'); // live_moderation: true (Advanced workflows)
  await createPackageFeature(businessPackage.id, 7, 'true'); // white_label: true
  await createPackageFeature(businessPackage.id, 8, 'realtime'); // analytics: real-time
  await createPackageFeature(businessPackage.id, 11, 'priority'); // support_level: priority email + chat
  await createPackageFeature(businessPackage.id, 12, '90'); // media_hosting_days: 90
  await createPackageFeature(businessPackage.id, 13, '2000'); // slideshow_speed: 2000ms
  await createPackageFeature(businessPackage.id, 14, '10000'); // slideshow_refresh: 10000ms
  
  // ENTERPRISE PLAN ($199)
  await createPackageFeature(enterprisePackage.id, 0, 'unlimited', true); // events_per_month: unlimited
  await createPackageFeature(enterprisePackage.id, 1, 'unlimited', true); // guests_per_event: unlimited
  await createPackageFeature(enterprisePackage.id, 2, 'unlimited', true); // media_per_event: unlimited
  await createPackageFeature(enterprisePackage.id, 3, 'true'); // qr_code_generation: true
  await createPackageFeature(enterprisePackage.id, 4, 'true'); // custom_branding: true
  await createPackageFeature(enterprisePackage.id, 5, 'true'); // ai_image_generation: true
  await createPackageFeature(enterprisePackage.id, 6, 'true'); // live_moderation: true
  await createPackageFeature(enterprisePackage.id, 7, 'true'); // white_label: true
  await createPackageFeature(enterprisePackage.id, 8, 'custom'); // analytics: custom reporting & exports
  await createPackageFeature(enterprisePackage.id, 9, 'true'); // api_access: true
  await createPackageFeature(enterprisePackage.id, 10, 'true'); // multi_user_dashboard: true
  await createPackageFeature(enterprisePackage.id, 11, 'dedicated'); // support_level: phone + SLA + dedicated account manager
  await createPackageFeature(enterprisePackage.id, 12, '365'); // media_hosting_days: 365 (12-month)
  await createPackageFeature(enterprisePackage.id, 13, '1000'); // slideshow_speed: 1000ms
  await createPackageFeature(enterprisePackage.id, 14, '5000'); // slideshow_refresh: 5000ms
  
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

