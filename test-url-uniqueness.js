/**
 * Standalone Test for URL Uniqueness
 * Tests if different URLs produce different results
 */

const axios = require('axios');

async function testUrlFetching() {
  console.log('🧪 Testing URL Fetching for Uniqueness\n');
  console.log('=' .repeat(60));

  const testUrls = [
    'https://ibpsonline.ibps.in/clerk25',
    'https://sbi.co.in/careers',
    'https://upsconline.nic.in',
    'https://google.com',
    'https://httpbin.org/html'
  ];

  for (const url of testUrls) {
    console.log(`\n🌐 Testing: ${url}`);
    console.log('-'.repeat(40));

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const content = response.data;
      const preview = content.toString().substring(0, 200).replace(/\s+/g, ' ');
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📏 Content Length: ${content.length} characters`);
      console.log(`📝 Preview: ${preview}...`);
      
      // Check for document-related keywords
      const lowerContent = content.toString().toLowerCase();
      const docKeywords = ['document', 'upload', 'photo', 'signature', 'certificate', 'format', 'size'];
      const foundKeywords = docKeywords.filter(keyword => lowerContent.includes(keyword));
      
      console.log(`🔍 Document Keywords Found: ${foundKeywords.length > 0 ? foundKeywords.join(', ') : 'None'}`);
      
    } catch (error) {
      console.log(`❌ Failed to fetch: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 URL testing completed!');
  console.log('💡 If all URLs return similar content, there might be:');
  console.log('   - Network issues or redirects');
  console.log('   - Caching problems');
  console.log('   - Anti-bot protection');
  console.log('   - CORS or access restrictions');
}

// Run the test
testUrlFetching().catch(console.error);