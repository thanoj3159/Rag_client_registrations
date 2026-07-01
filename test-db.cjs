const { savePendingClient, confirmClientPayment } = require('./database/db.cjs');

async function test() {
  try {
    console.log('Testing savePendingClient...');
    const client = await savePendingClient('Test User', 'test@example.com', '9876543210', 'order_test_123');
    console.log('Saved:', client);
    
    console.log('\nTesting confirmClientPayment...');
    const confirmed = await confirmClientPayment('order_test_123', 'pay_test_456');
    console.log('Confirmed:', confirmed);
    
    console.log('\n✅ All tests passed!');
  } catch (e) {
    console.error('❌ Test failed:', e.message);
  }
  process.exit(0);
}

test();