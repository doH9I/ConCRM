import { connectDatabase, closeDatabase } from '../config/database';

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Connect to database (this will also initialize tables)
    await connectDatabase();
    
    console.log('✅ Database setup completed successfully!');
    console.log('\n📋 Database tables created:');
    console.log('  - users');
    console.log('  - search_history');
    console.log('  - bookings');
    console.log('  - passenger_details');
    console.log('  - payment_transactions');
    
    console.log('\n🔑 Next steps:');
    console.log('  1. Update your .env file with database credentials');
    console.log('  2. Install dependencies: npm install');
    console.log('  3. Start the server: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}