import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic mock creators...');

  // Comprehensive mock creator database - 50+ creators across different niches
  const creators = [
    // FITNESS & WELLNESS (15 creators)
    { username: 'sweat_with_sophie', platform: 'instagram', followerCount: 287000, engagementRate: 5.2, contentCategories: ['Fitness', 'Lifestyle'], avgViews: 42000 },
    { username: 'ironmike_fitness', platform: 'youtube', followerCount: 412000, engagementRate: 4.1, contentCategories: ['Fitness', 'Education'], avgViews: 68000 },
    { username: 'yoga_by_luna', platform: 'instagram', followerCount: 156000, engagementRate: 6.8, contentCategories: ['Fitness', 'Lifestyle', 'Travel'], avgViews: 28000 },
    { username: 'gains_with_grace', platform: 'tiktok', followerCount: 523000, engagementRate: 8.4, contentCategories: ['Fitness', 'Food'], avgViews: 125000 },
    { username: 'runwithryan', platform: 'instagram', followerCount: 89000, engagementRate: 4.9, contentCategories: ['Fitness', 'Lifestyle'], avgViews: 15000 },
    { username: 'pilates_princess', platform: 'tiktok', followerCount: 342000, engagementRate: 7.1, contentCategories: ['Fitness', 'Fashion'], avgViews: 78000 },
    { username: 'crossfit_casey', platform: 'youtube', followerCount: 198000, engagementRate: 3.9, contentCategories: ['Fitness', 'Education'], avgViews: 31000 },
    { username: 'mindful_movement_co', platform: 'instagram', followerCount: 67000, engagementRate: 5.5, contentCategories: ['Fitness', 'Lifestyle'], avgViews: 11000 },
    { username: 'hiit_hannah', platform: 'tiktok', followerCount: 445000, engagementRate: 9.2, contentCategories: ['Fitness', 'Entertainment'], avgViews: 156000 },
    { username: 'strength_and_soul', platform: 'instagram', followerCount: 234000, engagementRate: 4.7, contentCategories: ['Fitness', 'Parenting'], avgViews: 38000 },
    { username: 'trainer_marcus', platform: 'youtube', followerCount: 567000, engagementRate: 3.4, contentCategories: ['Fitness', 'Education', 'Tech'], avgViews: 89000 },
    { username: 'wellness_wendy', platform: 'instagram', followerCount: 123000, engagementRate: 6.1, contentCategories: ['Fitness', 'Food', 'Lifestyle'], avgViews: 21000 },
    { username: 'fitfam_dad', platform: 'tiktok', followerCount: 278000, engagementRate: 7.8, contentCategories: ['Fitness', 'Parenting'], avgViews: 67000 },
    { username: 'ballet_body_studio', platform: 'instagram', followerCount: 92000, engagementRate: 5.9, contentCategories: ['Fitness', 'Fashion'], avgViews: 16000 },
    { username: 'outdoor_athlete', platform: 'youtube', followerCount: 345000, engagementRate: 4.3, contentCategories: ['Fitness', 'Travel', 'Lifestyle'], avgViews: 52000 },

    // BEAUTY & FASHION (12 creators)
    { username: 'glam_by_gina', platform: 'instagram', followerCount: 389000, engagementRate: 4.8, contentCategories: ['Beauty', 'Fashion'], avgViews: 56000 },
    { username: 'skincare_scientist', platform: 'youtube', followerCount: 234000, engagementRate: 5.1, contentCategories: ['Beauty', 'Education'], avgViews: 41000 },
    { username: 'makeup_maven_maya', platform: 'tiktok', followerCount: 678000, engagementRate: 8.9, contentCategories: ['Beauty', 'Entertainment'], avgViews: 189000 },
    { username: 'style_by_stella', platform: 'instagram', followerCount: 167000, engagementRate: 5.6, contentCategories: ['Fashion', 'Lifestyle'], avgViews: 29000 },
    { username: 'the_lipstick_lesbian', platform: 'tiktok', followerCount: 445000, engagementRate: 7.3, contentCategories: ['Beauty', 'Lifestyle'], avgViews: 98000 },
    { username: 'sustainable_style_co', platform: 'instagram', followerCount: 112000, engagementRate: 6.2, contentCategories: ['Fashion', 'Lifestyle'], avgViews: 19000 },
    { username: 'hair_by_harrison', platform: 'youtube', followerCount: 289000, engagementRate: 4.4, contentCategories: ['Beauty', 'Education'], avgViews: 47000 },
    { username: 'curvy_couture', platform: 'instagram', followerCount: 198000, engagementRate: 5.8, contentCategories: ['Fashion', 'Lifestyle'], avgViews: 34000 },
    { username: 'nail_art_natalie', platform: 'tiktok', followerCount: 523000, engagementRate: 9.1, contentCategories: ['Beauty', 'Entertainment'], avgViews: 145000 },
    { username: 'menswear_marcus', platform: 'instagram', followerCount: 145000, engagementRate: 4.2, contentCategories: ['Fashion', 'Lifestyle'], avgViews: 22000 },
    { username: 'budget_beauty_queen', platform: 'youtube', followerCount: 312000, engagementRate: 5.3, contentCategories: ['Beauty', 'Education'], avgViews: 54000 },
    { username: 'vintage_vibes_val', platform: 'instagram', followerCount: 78000, engagementRate: 6.7, contentCategories: ['Fashion', 'Lifestyle'], avgViews: 14000 },

    // FOOD & COOKING (10 creators)
    { username: 'chef_carlos_eats', platform: 'youtube', followerCount: 456000, engagementRate: 4.6, contentCategories: ['Food', 'Education'], avgViews: 72000 },
    { username: 'baking_with_bella', platform: 'tiktok', followerCount: 389000, engagementRate: 8.7, contentCategories: ['Food', 'Entertainment'], avgViews: 112000 },
    { username: 'healthy_eats_hannah', platform: 'instagram', followerCount: 234000, engagementRate: 5.4, contentCategories: ['Food', 'Fitness'], avgViews: 39000 },
    { username: 'ramen_obsessed', platform: 'tiktok', followerCount: 567000, engagementRate: 9.4, contentCategories: ['Food', 'Travel'], avgViews: 178000 },
    { username: 'vegan_kitchen_vibes', platform: 'youtube', followerCount: 198000, engagementRate: 4.8, contentCategories: ['Food', 'Lifestyle'], avgViews: 34000 },
    { username: 'bbq_pitmaster_pete', platform: 'instagram', followerCount: 156000, engagementRate: 5.1, contentCategories: ['Food', 'Lifestyle'], avgViews: 27000 },
    { username: 'meal_prep_master', platform: 'tiktok', followerCount: 445000, engagementRate: 7.9, contentCategories: ['Food', 'Fitness'], avgViews: 98000 },
    { username: 'cocktail_curator', platform: 'instagram', followerCount: 89000, engagementRate: 6.3, contentCategories: ['Food', 'Lifestyle'], avgViews: 16000 },
    { username: 'pasta_la_vista', platform: 'youtube', followerCount: 267000, engagementRate: 4.2, contentCategories: ['Food', 'Travel'], avgViews: 43000 },
    { username: 'budget_bites', platform: 'tiktok', followerCount: 312000, engagementRate: 8.1, contentCategories: ['Food', 'Education'], avgViews: 89000 },

    // TECH & GAMING (8 creators)
    { username: 'tech_talk_tom', platform: 'youtube', followerCount: 534000, engagementRate: 3.9, contentCategories: ['Tech', 'Education'], avgViews: 87000 },
    { username: 'gaming_with_gia', platform: 'tiktok', followerCount: 678000, engagementRate: 8.2, contentCategories: ['Gaming', 'Entertainment'], avgViews: 167000 },
    { username: 'gadget_guru', platform: 'youtube', followerCount: 389000, engagementRate: 4.1, contentCategories: ['Tech', 'Education'], avgViews: 62000 },
    { username: 'esports_eddie', platform: 'tiktok', followerCount: 445000, engagementRate: 7.6, contentCategories: ['Gaming', 'Entertainment'], avgViews: 112000 },
    { username: 'code_with_chloe', platform: 'youtube', followerCount: 234000, engagementRate: 5.2, contentCategories: ['Tech', 'Education'], avgViews: 41000 },
    { username: 'retro_gamer_rick', platform: 'instagram', followerCount: 156000, engagementRate: 5.8, contentCategories: ['Gaming', 'Lifestyle'], avgViews: 28000 },
    { username: 'startup_steve', platform: 'youtube', followerCount: 189000, engagementRate: 4.4, contentCategories: ['Tech', 'Business'], avgViews: 32000 },
    { username: 'mobile_gaming_mia', platform: 'tiktok', followerCount: 523000, engagementRate: 8.8, contentCategories: ['Gaming', 'Entertainment'], avgViews: 145000 },

    // TRAVEL & LIFESTYLE (10 creators)
    { username: 'wanderlust_wendy', platform: 'instagram', followerCount: 345000, engagementRate: 4.9, contentCategories: ['Travel', 'Lifestyle'], avgViews: 52000 },
    { username: 'adventure_awaits_adam', platform: 'youtube', followerCount: 467000, engagementRate: 4.3, contentCategories: ['Travel', 'Fitness'], avgViews: 74000 },
    { username: 'luxury_travel_life', platform: 'instagram', followerCount: 234000, engagementRate: 5.1, contentCategories: ['Travel', 'Fashion'], avgViews: 38000 },
    { username: 'budget_backpacker', platform: 'tiktok', followerCount: 389000, engagementRate: 7.8, contentCategories: ['Travel', 'Education'], avgViews: 98000 },
    { username: 'van_life_victor', platform: 'youtube', followerCount: 312000, engagementRate: 5.6, contentCategories: ['Travel', 'Lifestyle'], avgViews: 56000 },
    { username: 'digital_nomad_nina', platform: 'instagram', followerCount: 178000, engagementRate: 5.3, contentCategories: ['Travel', 'Business'], avgViews: 29000 },
    { username: 'family_travel_fun', platform: 'youtube', followerCount: 256000, engagementRate: 4.7, contentCategories: ['Travel', 'Parenting'], avgViews: 42000 },
    { username: 'solo_female_traveler', platform: 'tiktok', followerCount: 445000, engagementRate: 8.4, contentCategories: ['Travel', 'Lifestyle'], avgViews: 118000 },
    { username: 'hidden_gems_hunter', platform: 'instagram', followerCount: 134000, engagementRate: 6.1, contentCategories: ['Travel', 'Food'], avgViews: 24000 },
    { username: 'cruise_life_chris', platform: 'youtube', followerCount: 198000, engagementRate: 4.2, contentCategories: ['Travel', 'Lifestyle'], avgViews: 33000 },

    // PARENTING & FAMILY (5 creators)
    { username: 'mom_life_melissa', platform: 'instagram', followerCount: 267000, engagementRate: 5.7, contentCategories: ['Parenting', 'Lifestyle'], avgViews: 46000 },
    { username: 'dad_jokes_daily', platform: 'tiktok', followerCount: 523000, engagementRate: 9.3, contentCategories: ['Parenting', 'Entertainment'], avgViews: 156000 },
    { username: 'gentle_parenting_guide', platform: 'youtube', followerCount: 189000, engagementRate: 5.1, contentCategories: ['Parenting', 'Education'], avgViews: 32000 },
    { username: 'twins_and_wins', platform: 'instagram', followerCount: 145000, engagementRate: 6.4, contentCategories: ['Parenting', 'Lifestyle'], avgViews: 26000 },
    { username: 'homeschool_haven', platform: 'youtube', followerCount: 112000, engagementRate: 4.8, contentCategories: ['Parenting', 'Education'], avgViews: 19000 },
  ];

  // Clear existing data (in correct order for foreign keys)
  await prisma.contract.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.searchQuery.deleteMany({});
  await prisma.creatorContent.deleteMany({});
  await prisma.creator.deleteMany({});
  console.log('Cleared existing data');

  // Insert all creators
  for (const creator of creators) {
    await prisma.creator.create({
      data: {
        username: creator.username,
        platform: creator.platform,
        followerCount: creator.followerCount,
        engagementRate: creator.engagementRate,
        contentCategories: creator.contentCategories,
        avgViews: creator.avgViews,
        verificationStatus: 'verified',
        annualEarnings: 0,
        currentFeeTier: 'launch',
        minimumDealAmount: Math.floor(creator.followerCount / 100) * 10, // Rough rate estimate
        profileCompletion: 85,
        // Add some algorithm metrics for realism
        nicheStabilityScore: 0.7 + Math.random() * 0.25,
        brandSafetyScore: 0.8 + Math.random() * 0.18,
      },
    });
  }

  console.log(`Created ${creators.length} mock creators`);

  // Create demo brand managers
  const passwordHash = await bcrypt.hash('demo1234', 10);

  await prisma.brandManager.deleteMany({});

  await prisma.brandManager.create({
    data: {
      email: 'demo@brand.com',
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      companyName: 'Demo Brand Co',
      role: 'Marketing Manager',
      industry: 'Consumer Goods',
    },
  });

  await prisma.brandManager.create({
    data: {
      email: 'test@acme.com',
      passwordHash,
      firstName: 'Test',
      lastName: 'Account',
      companyName: 'Acme Inc',
      role: 'Brand Director',
      industry: 'Health & Wellness',
    },
  });

  // Update creators with login credentials for demo purposes
  const sophie = await prisma.creator.findFirst({
    where: { username: 'sweat_with_sophie' },
  });
  if (sophie) {
    await prisma.creator.update({
      where: { id: sophie.id },
      data: {
        email: 'sophie@creator.com',
        passwordHash,
      },
    });
  }

  const tom = await prisma.creator.findFirst({
    where: { username: 'tech_talk_tom' },
  });
  if (tom) {
    await prisma.creator.update({
      where: { id: tom.id },
      data: {
        email: 'tom@creator.com',
        passwordHash,
      },
    });
  }

  // Create admin user
  await prisma.admin.deleteMany({});
  await prisma.admin.create({
    data: {
      email: 'admin@mngr.com',
      passwordHash,
      name: 'Platform Admin',
      role: 'super_admin',
    },
  });

  console.log('');
  console.log('============================================');
  console.log('Seeding complete!');
  console.log('============================================');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Brand 1: demo@brand.com / demo1234');
  console.log('  Brand 2: test@acme.com / demo1234');
  console.log('');
  console.log('  Creator 1: sophie@creator.com / demo1234 (sweat_with_sophie)');
  console.log('  Creator 2: tom@creator.com / demo1234 (tech_talk_tom)');
  console.log('');
  console.log('  Admin: admin@mngr.com / demo1234');
  console.log('');
  console.log(`Total creators: ${creators.length}`);
  console.log('');
  console.log('Creator breakdown by niche:');
  console.log('  - Fitness & Wellness: 15');
  console.log('  - Beauty & Fashion: 12');
  console.log('  - Food & Cooking: 10');
  console.log('  - Tech & Gaming: 8');
  console.log('  - Travel & Lifestyle: 10');
  console.log('  - Parenting & Family: 5');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
