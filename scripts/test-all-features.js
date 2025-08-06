// Test script to verify all features work correctly
const testFeatures = async () => {
  console.log('🧪 Testing TradeGenie Features...\n');

  // Test 1: Risk Analysis with different products
  console.log('1️⃣ Testing Risk Analysis...');
  const riskTests = [
    { country: 'Germany', product: 'Electronics' },
    { country: 'Germany', product: 'Automotive' },
    { country: 'Germany', product: 'Pharmaceuticals' },
    { country: 'China', product: 'Electronics' },
    { country: 'Brazil', product: 'Electronics' }
  ];

  for (const test of riskTests) {
    try {
      const response = await fetch('/api/risk-analysis/real-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: test.country,
          product: test.product,
          exportValue: 100000,
          timeline: 'Medium term (6-12 months)'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ ${test.country} + ${test.product}: ${data.data.riskScore}% risk`);
      } else {
        console.log(`❌ ${test.country} + ${test.product}: Failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.country} + ${test.product}: Error - ${error.message}`);
    }
  }

  // Test 2: Tariff API
  console.log('\n2️⃣ Testing Tariff API...');
  try {
    const response = await fetch('/api/tariff?product=Electronics&origin=China&destination=Germany');
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      console.log(`✅ Tariff API: ${data.data[0].tariffRate}% for Electronics China→Germany`);
    } else {
      console.log('❌ Tariff API: Failed');
    }
  } catch (error) {
    console.log(`❌ Tariff API: Error - ${error.message}`);
  }

  // Test 3: Market Intelligence
  console.log('\n3️⃣ Testing Market Intelligence...');
  try {
    const response = await fetch('/api/market-intelligence?region=global&product=Electronics');
    const data = await response.json();
    if (data.success) {
      console.log(`✅ Market Intelligence: ${data.data.summary.totalMarkets} markets found`);
    } else {
      console.log('❌ Market Intelligence: Failed');
    }
  } catch (error) {
    console.log(`❌ Market Intelligence: Error - ${error.message}`);
  }

  // Test 4: Chat API
  console.log('\n4️⃣ Testing Chat API...');
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is the tariff rate for electronics from China to Germany?',
        language: 'en'
      })
    });
    
    const data = await response.json();
    if (data.success && data.response) {
      console.log('✅ Chat API: Working');
    } else {
      console.log('❌ Chat API: Failed');
    }
  } catch (error) {
    console.log(`❌ Chat API: Error - ${error.message}`);
  }

  console.log('\n🎯 Feature Testing Complete!');
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testFeatures;
}
