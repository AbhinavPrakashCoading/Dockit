/**
 * Simple Node.js server to test demo functionality
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3030;

// Mock demo HTML to test sub-type detection
const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Sub-Type Detection Demo</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f9fafb;
        }
        .demo-card { 
            background: white; 
            border-radius: 12px; 
            padding: 24px; 
            margin: 16px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            color: #1f2937;
            margin-bottom: 32px;
        }
        .upload-zone { 
            border: 2px dashed #d1d5db; 
            border-radius: 8px; 
            padding: 32px; 
            text-align: center;
            background: #fafafa;
            cursor: pointer;
            transition: all 0.2s;
        }
        .upload-zone:hover { 
            border-color: #7c3aed;
            background: #f3f4f6;
        }
        .result-card {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            margin: 12px 0;
        }
        .confidence-high { background: #dcfce7; color: #166534; }
        .confidence-medium { background: #fef3c7; color: #92400e; }
        .confidence-low { background: #fee2e2; color: #991b1b; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
        }
        .reasons-list {
            background: #f8fafc;
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
        }
        .processing-rec {
            background: #eff6ff;
            border-left: 3px solid #3b82f6;
            padding: 8px 12px;
            margin: 4px 0;
            border-radius: 0 4px 4px 0;
        }
        .tech-stack {
            display: flex;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
            margin: 16px 0;
            padding: 16px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 14px;
            color: #64748b;
        }
        button {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }
        button:hover { background: #6d28d9; }
    </style>
</head>
<body>
    <div class="demo-card">
        <div class="header">
            <h1>🧠 AI Document Sub-Type Detection Demo</h1>
            <p>Upload documents to see our enhanced AI system detect specific document variants with confidence scoring and processing recommendations.</p>
            
            <div class="tech-stack">
                <span>👁️ Computer Vision</span>
                <span>📄 OCR Analysis</span>
                <span>⚡ Sub-Type Detection</span>
                <span>🧠 ML Classification</span>
                <span>📊 Confidence Scoring</span>
            </div>
        </div>

        <div class="upload-zone" onclick="showDemo()">
            <p><strong>📁 Click to see demo results</strong></p>
            <p>Or in a real app: drag and drop documents here to analyze them</p>
        </div>

        <div id="results" style="display: none;">
            <div class="demo-card">
                <h3>📄 Document Analysis Results</h3>
                
                <!-- Example 1: 10th Marksheet -->
                <div class="result-card">
                    <h4>📋 test_marksheet_10th.jpg</h4>
                    <div style="margin: 8px 0;">
                        <span class="badge confidence-high">🎓 Education Certificate → Class 10 Marksheet</span>
                        <span class="badge confidence-high">92% confidence</span>
                    </div>
                    
                    <div class="reasons-list">
                        <strong>🔍 Detection Analysis:</strong>
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Text patterns matched: 3/4 patterns</li>
                            <li>Keywords found: "Class X", "Secondary School", "Marksheet"</li>
                            <li>File size within expected range (350KB ≤ 2048KB)</li>
                            <li>Dimension ratio matches certificate format</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 12px;">
                        <strong>⚙️ Processing Recommendations:</strong>
                        <div class="processing-rec">📈 Enhance text clarity for mark verification</div>
                        <div class="processing-rec">🔒 Preserve original dimensions for authenticity</div>
                        <div class="processing-rec">💾 Use lossless compression to maintain seal quality</div>
                    </div>
                </div>

                <!-- Example 2: Aadhaar Card -->
                <div class="result-card">
                    <h4>🆔 aadhaar_scan.png</h4>
                    <div style="margin: 8px 0;">
                        <span class="badge confidence-high">🆔 Personal ID Document → Aadhaar Card</span>
                        <span class="badge confidence-high">95% confidence</span>
                    </div>
                    
                    <div class="reasons-list">
                        <strong>🔍 Detection Analysis:</strong>
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Text patterns matched: 4/4 patterns</li>
                            <li>Keywords found: "Aadhaar", "Unique Identification", "Government of India"</li>
                            <li>Number pattern detected: 1234 5678 9012 format</li>
                            <li>QR code detected in image</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 12px;">
                        <strong>⚙️ Processing Recommendations:</strong>
                        <div class="processing-rec">📱 Preserve QR code integrity</div>
                        <div class="processing-rec">👤 Maintain photo quality for verification</div>
                        <div class="processing-rec">🔢 Ensure number visibility</div>
                    </div>
                </div>

                <!-- Example 3: Passport Photo -->
                <div class="result-card">
                    <h4>📸 passport_photo.jpg</h4>
                    <div style="margin: 8px 0;">
                        <span class="badge confidence-high">📷 Photograph → Passport Size Photo</span>
                        <span class="badge confidence-medium">88% confidence</span>
                    </div>
                    
                    <div class="reasons-list">
                        <strong>🔍 Detection Analysis:</strong>
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Dimension ratio matches expected (0.78 vs 0.78)</li>
                            <li>File size within expected range (45KB ≤ 1024KB)</li>
                            <li>Aspect ratio within 15% tolerance</li>
                            <li>No text content (typical for photos)</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 12px;">
                        <strong>⚙️ Processing Recommendations:</strong>
                        <div class="processing-rec">📏 Resize to 35x45mm (413x531 pixels at 300 DPI)</div>
                        <div class="processing-rec">🎨 Ensure white/light background</div>
                        <div class="processing-rec">🗜️ Compress to under 1MB while maintaining quality</div>
                    </div>
                </div>

                <div class="demo-card" style="background: #f0f9ff; border: 1px solid #0ea5e9;">
                    <h3>🎯 System Capabilities</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
                        <div>
                            <strong>📋 Document Types:</strong>
                            <ul style="margin: 8px 0; padding-left: 20px; font-size: 14px;">
                                <li>Education Certificates</li>
                                <li>Personal ID Documents</li>
                                <li>Photographs</li>
                                <li>Caste/Category Certificates</li>
                                <li>Domicile Certificates</li>
                                <li>Disability Certificates</li>
                                <li>Special Documents</li>
                                <li>Signatures</li>
                            </ul>
                        </div>
                        <div>
                            <strong>🔍 Sub-Type Examples:</strong>
                            <ul style="margin: 8px 0; padding-left: 20px; font-size: 14px;">
                                <li>10th/12th Marksheets</li>
                                <li>Graduation/PG Certificates</li>
                                <li>Aadhaar/PAN/Passport</li>
                                <li>Passport/Postcard Size Photos</li>
                                <li>SC/ST/OBC Certificates</li>
                                <li>Diploma Certificates</li>
                                <li>Voter ID/Driving License</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-top: 16px; padding: 12px; background: white; border-radius: 6px;">
                        <strong>✅ Key Benefits:</strong>
                        <p style="margin: 8px 0; font-size: 14px;">
                            • Documents classified by fundamental nature, not exam context<br>
                            • Sub-type detection enables specific processing optimizations<br>
                            • Confidence scoring provides reliable classification<br>
                            • Processing suggestions optimize handling for each document type<br>
                            • Scalable architecture for adding new document variants
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showDemo() {
            document.getElementById('results').style.display = 'block';
            document.querySelector('.upload-zone').innerHTML = '<p><strong>✅ Demo Results Loaded</strong></p><p>Sub-type detection analysis complete!</p>';
            document.querySelector('.upload-zone').style.background = '#f0fdf4';
            document.querySelector('.upload-zone').style.borderColor = '#22c55e';
        }
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(demoHTML);
});

server.listen(port, () => {
  console.log(\`\\n🚀 Demo server running at http://localhost:\${port}\\n\`);
  console.log('📋 This demo shows how the sub-type detection system works');
  console.log('🎯 Features demonstrated:');
  console.log('  • Document classification by fundamental nature');
  console.log('  • Sub-type detection within categories');
  console.log('  • Confidence scoring and reasoning');
  console.log('  • Processing recommendations');
  console.log('  • Multi-factor analysis (text, dimensions, patterns)');
  console.log('\\n🌐 Open the URL above to see the demo in action!\\n');
});