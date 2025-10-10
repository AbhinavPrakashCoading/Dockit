/**
 * Demo: Scalable Discovery System
 * Tests the multi-layered discovery system with various exam types
 */

console.log('🚀 Scalable Discovery System Demo\n');

// Test scenarios for different exam types and discovery challenges
const testScenarios = [
  {
    name: 'IBPS Clerk 2025 - Banking Exam',
    query: 'IBPS Clerk 2025 application form requirements',
    expectedRequirements: [
      'photo',
      'signature', 
      'left-thumb-impression',
      'handwritten-declaration',
      'educational-certificate'
    ],
    category: 'government-banking',
    description: 'Tests banking-specific requirement detection'
  },
  {
    name: 'New Unknown Exam',
    query: 'XYZ State Public Service Commission 2025 application requirements',
    expectedRequirements: [
      'photo',
      'signature',
      'educational-certificate',
      'category-certificate'
    ],
    category: 'government-general',
    description: 'Tests discovery for completely unknown exam using ML inference'
  },
  {
    name: 'JEE Advanced 2025 - Engineering',
    query: 'JEE Advanced 2025 application documents needed',
    expectedRequirements: [
      'photo',
      'signature',
      'class-12-marksheet',
      'jee-main-scorecard'
    ],
    category: 'engineering',
    description: 'Tests engineering exam pattern recognition'
  },
  {
    name: 'NEET 2025 - Medical',
    query: 'NEET 2025 application form documents required',
    expectedRequirements: [
      'photo',
      'signature',
      'class-12-marksheet',
      'category-certificate'
    ],
    category: 'medical',
    description: 'Tests medical exam requirement patterns'
  },
  {
    name: 'Ambiguous Query',
    query: 'government job application documents',
    expectedRequirements: [
      'photo',
      'signature',
      'educational-certificate'
    ],
    category: 'general',
    description: 'Tests handling of vague queries with fallback mechanisms'
  }
];

async function testDiscoverySystem() {
  console.log('🔬 Testing Scalable Discovery System...\n');

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 Test ${i + 1}: ${scenario.name}`);
    console.log(`🎯 Description: ${scenario.description}`);
    console.log(`❓ Query: "${scenario.query}"`);
    console.log(`📂 Expected Category: ${scenario.category}`);
    console.log(`📄 Expected Requirements: ${scenario.expectedRequirements.join(', ')}`);
    console.log(`${'='.repeat(60)}`);

    try {
      // Test the scalable discovery API
      const response = await fetch('http://localhost:3000/api/scalable-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: scenario.query,
          context: {
            year: '2025',
            region: 'India'
          },
          action: 'natural_language_discovery'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('\n📊 DISCOVERY RESULTS:');
      console.log(`✅ Success: ${result.success}`);
      console.log(`🏷️  Exam Identified: ${result.examName}`);
      console.log(`📂 Category: ${result.schema?.category || 'unknown'}`);
      console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`✔️ Validation Score: ${(result.validationScore * 100).toFixed(1)}%`);
      console.log(`🔗 Sources: ${result.sources?.length || 0} (${result.metadata?.officialSources || 0} official)`);
      console.log(`🛤️  Discovery Path: ${result.discoveryPath?.join(' → ') || 'unknown'}`);
      console.log(`🔍 Discovery Method: ${result.metadata?.discoveryMethod || 'unknown'}`);
      console.log(`⭐ Quality Score: ${(result.schema?.qualityScore * 100).toFixed(1)}%`);

      if (result.schema?.requirements) {
        console.log(`\n📝 REQUIREMENTS DETECTED (${result.schema.requirements.length}):`);
        result.schema.requirements.forEach((req, index) => {
          const isExpected = scenario.expectedRequirements.includes(req.id);
          const indicator = isExpected ? '✅' : '🆕';
          console.log(`  ${indicator} ${index + 1}. ${req.name} (${req.id})`);
          if (req.description) {
            console.log(`     📄 ${req.description}`);
          }
          if (req.formats) {
            console.log(`     📋 Formats: ${req.formats.join(', ')}`);
          }
        });

        // Analysis
        const detectedIds = result.schema.requirements.map(r => r.id);
        const expectedFound = scenario.expectedRequirements.filter(expected => 
          detectedIds.includes(expected)
        );
        const unexpectedFound = detectedIds.filter(detected => 
          !scenario.expectedRequirements.includes(detected)
        );
        const missing = scenario.expectedRequirements.filter(expected => 
          !detectedIds.includes(expected)
        );

        console.log(`\n📈 ANALYSIS:`);
        console.log(`✅ Expected Found: ${expectedFound.length}/${scenario.expectedRequirements.length} (${expectedFound.join(', ') || 'none'})`);
        if (missing.length > 0) {
          console.log(`❌ Missing: ${missing.join(', ')}`);
        }
        if (unexpectedFound.length > 0) {
          console.log(`🆕 Additional: ${unexpectedFound.join(', ')}`);
        }

        const accuracy = expectedFound.length / scenario.expectedRequirements.length;
        console.log(`🎯 Detection Accuracy: ${(accuracy * 100).toFixed(1)}%`);
      }

      if (result.recommendations?.length > 0) {
        console.log(`\n💡 RECOMMENDATIONS:`);
        result.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }

      if (result.nextSteps?.length > 0) {
        console.log(`\n📋 NEXT STEPS:`);
        result.nextSteps.forEach((step, index) => {
          console.log(`  ${index + 1}. ${step}`);
        });
      }

      // Overall assessment
      const overallScore = (result.confidence + result.validationScore + (result.schema?.qualityScore || 0)) / 3;
      console.log(`\n🏆 OVERALL ASSESSMENT:`);
      if (overallScore > 0.8) {
        console.log(`🟢 EXCELLENT: High-quality discovery with ${(overallScore * 100).toFixed(1)}% overall score`);
      } else if (overallScore > 0.6) {
        console.log(`🟡 GOOD: Decent discovery with ${(overallScore * 100).toFixed(1)}% overall score`);
      } else {
        console.log(`🔴 NEEDS IMPROVEMENT: Low score ${(overallScore * 100).toFixed(1)}% - requires manual verification`);
      }

    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.log(`\n💡 Server not running. Please start the development server:`);
        console.log(`   npm run dev`);
        console.log(`   (or) npx next dev`);
        break;
      }
    }

    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Discovery System Demo Complete!');
  console.log(`${'='.repeat(60)}`);
}

async function testSystemCapabilities() {
  console.log('\n🔧 Testing System Capabilities...\n');

  const capabilities = [
    {
      name: 'Cache Performance',
      description: 'Test caching by running same query twice',
      test: async () => {
        const query = 'IBPS Clerk application requirements';
        
        console.log('🔍 First request (cache miss)...');
        const start1 = Date.now();
        await fetch('http://localhost:3000/api/scalable-discovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, action: 'natural_language_discovery' })
        });
        const time1 = Date.now() - start1;
        
        console.log('🔍 Second request (cache hit)...');
        const start2 = Date.now();
        await fetch('http://localhost:3000/api/scalable-discovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, action: 'natural_language_discovery' })
        });
        const time2 = Date.now() - start2;
        
        console.log(`⏱️  First request: ${time1}ms`);
        console.log(`⏱️  Second request: ${time2}ms`);
        console.log(`🚀 Speed improvement: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
      }
    },
    {
      name: 'Fallback Layers',
      description: 'Test different discovery layers',
      test: async () => {
        const layers = [
          ['cache'],
          ['knowledge'],
          ['search'],
          ['ml']
        ];
        
        for (const layerSet of layers) {
          console.log(`🔄 Testing layer: ${layerSet.join(', ')}`);
          try {
            const response = await fetch('http://localhost:3000/api/scalable-discovery', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: 'Test exam requirements',
                fallbackLevels: layerSet,
                action: 'natural_language_discovery'
              })
            });
            
            const result = await response.json();
            console.log(`  ✅ Success: ${result.success}, Method: ${result.metadata?.discoveryMethod}`);
          } catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
          }
        }
      }
    }
  ];

  for (const capability of capabilities) {
    console.log(`\n🧪 ${capability.name}`);
    console.log(`📝 ${capability.description}`);
    try {
      await capability.test();
    } catch (error) {
      console.log(`❌ Capability test failed: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔧 Checking server status...');
  
  try {
    const healthCheck = await fetch('http://localhost:3000/api/scalable-discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'health check', action: 'natural_language_discovery' })
    });
    
    if (healthCheck.ok) {
      console.log('✅ Server is running!\n');
      
      // Run main discovery tests
      await testDiscoverySystem();
      
      // Run capability tests
      await testSystemCapabilities();
      
    } else {
      throw new Error('Server responded with error');
    }
  } catch (error) {
    console.log('❌ Server not accessible');
    console.log('\n💡 Please start the development server:');
    console.log('   cd "c:\\Users\\Abhinav Prakash\\Dockit-1"');
    console.log('   npm run dev');
    console.log('\nThen run this demo again:');
    console.log('   node demo-scalable-discovery.js');
  }
}

main().catch(console.error);