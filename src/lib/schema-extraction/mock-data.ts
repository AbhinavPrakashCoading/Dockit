/**
 * Mock Exam Data for Testing Schema Extraction
 * Provides realistic exam content to test different scenarios
 */

export const mockExamData = {
  'https://ibpsonline.ibps.in/clerk25': {
    title: 'IBPS Clerk 2025 Recruitment',
    content: `
      <html>
      <head><title>IBPS Clerk 2025 - Online Application</title></head>
      <body>
        <h1>Institute of Banking Personnel Selection</h1>
        <h2>Clerk (CRP-XIV) 2025 - Online Application Process</h2>
        
        <div class="document-requirements">
          <h3>Document Upload Requirements</h3>
          <p><strong>Important Instructions for Document Upload:</strong></p>
          
          <ol>
            <li><strong>Photograph:</strong> Recent passport size color photograph
              <ul>
                <li>Format: JPG/JPEG only</li>
                <li>File size: 20KB to 50KB</li>
                <li>Dimensions: 200 x 230 pixels</li>
                <li>Background: Light colored preferably white</li>
              </ul>
            </li>
            
            <li><strong>Signature:</strong> Signature of the candidate in black ink
              <ul>
                <li>Format: JPG/JPEG only</li>
                <li>File size: 10KB to 40KB</li>
                <li>Dimensions: 140 x 60 pixels</li>
              </ul>
            </li>
            
            <li><strong>Left Thumb Impression:</strong>
              <ul>
                <li>Format: JPG/JPEG only</li>
                <li>File size: 10KB to 40KB</li>
                <li>Clear and complete impression required</li>
              </ul>
            </li>
            
            <li><strong>Educational Documents:</strong>
              <ul>
                <li>10th Marksheet (PDF format, max 500KB)</li>
                <li>12th Marksheet (PDF format, max 500KB)</li>
                <li>Graduation Certificate (PDF format, max 500KB)</li>
              </ul>
            </li>
          </ol>
          
          <p><strong>Note:</strong> All documents are mandatory for successful application submission.</p>
        </div>
      </body>
      </html>
    `
  },

  'https://sbi.co.in/careers': {
    title: 'SBI PO Recruitment 2025',
    content: `
      <html>
      <head><title>State Bank of India - Probationary Officer Recruitment</title></head>
      <body>
        <h1>State Bank of India</h1>
        <h2>Probationary Officer Recruitment 2025</h2>
        
        <div class="upload-section">
          <h3>Upload Required Documents</h3>
          
          <div class="photo-requirements">
            <h4>1. Photograph Specifications:</h4>
            <ul>
              <li>Recent color photograph (JPEG format only)</li>
              <li>Size: 4KB to 40KB</li>
              <li>Minimum dimensions: 200 x 200 pixels</li>
              <li>Professional studio photograph preferred</li>
            </ul>
          </div>
          
          <div class="signature-requirements">
            <h4>2. Signature Specifications:</h4>
            <ul>
              <li>Clear handwritten signature (JPEG format)</li>
              <li>Maximum size: 30KB</li>
              <li>Dimensions: 140 x 60 pixels exactly</li>
            </ul>
          </div>
          
          <div class="document-requirements">
            <h4>3. Supporting Documents:</h4>
            <ul>
              <li>Category certificate (SC/ST/OBC) - PDF format, up to 300KB</li>
              <li>Educational certificates - PDF format, maximum 1MB per file</li>
              <li>Experience certificate (if applicable) - PDF format, max 500KB</li>
              <li>Disability certificate (if applicable) - PDF format, max 300KB</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `
  },

  'https://upsconline.nic.in': {
    title: 'UPSC Civil Services Examination 2025',
    content: `
      <html>
      <head><title>Union Public Service Commission - Civil Services Examination</title></head>
      <body>
        <h1>Union Public Service Commission</h1>
        <h2>Civil Services Examination 2025 - Preliminary</h2>
        
        <div class="application-guidelines">
          <h3>Document Upload Guidelines</h3>
          
          <table class="requirements-table">
            <tr>
              <th>Document Type</th>
              <th>Format</th>
              <th>Size Limit</th>
              <th>Dimensions</th>
            </tr>
            <tr>
              <td>Photograph</td>
              <td>JPG/PNG</td>
              <td>3KB - 50KB</td>
              <td>Passport size (35mm x 45mm)</td>
            </tr>
            <tr>
              <td>Signature</td>
              <td>JPG only</td>
              <td>1KB - 30KB</td>
              <td>As per specimen</td>
            </tr>
            <tr>
              <td>Identity Proof</td>
              <td>PDF</td>
              <td>Maximum 2MB</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Address Proof</td>
              <td>PDF</td>
              <td>Up to 1MB</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Educational Certificates</td>
              <td>PDF</td>
              <td>Max 500KB each</td>
              <td>-</td>
            </tr>
          </table>
          
          <p><strong>Important:</strong> All documents must be self-attested and clearly legible.</p>
        </div>
      </body>
      </html>
    `
  },

  'https://google.com': {
    title: 'Google Search',
    content: `
      <html>
      <head><title>Google</title></head>
      <body>
        <h1>Google</h1>
        <p>Search the world's information, including webpages, images, videos and more.</p>
        <div class="search-box">
          <input type="text" placeholder="Search Google" />
          <button>Google Search</button>
          <button>I'm Feeling Lucky</button>
        </div>
        <footer>
          <p>About Google | Privacy | Terms</p>
        </footer>
      </body>
      </html>
    `
  }
};

export default mockExamData;