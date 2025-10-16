// Test specific lines that aren't being detected
const testLines = [
  "Class 10th Marksheet/Pass Certificate: PDF format, 50KB–300KB, mandatory",
  "Class 12th Marksheet/Admit Card/Certificate: PDF format, 50KB–300KB, mandatory if passed or appearing"
];

const docPatterns = [
  // Pattern 1: Document with (if applicable): "Document (if applicable): details"
  /^([A-Za-z][A-Za-z\s]+?)\s*\(if applicable\):\s*(.+)$/i,
  // Pattern 2: JEE-style format: "Document Type: JPEG/JPG format, size, description"
  /^([A-Za-z][A-Za-z\s/()]+?):\s*((?:JPEG|JPG|PDF|PNG).+?)$/i,
  // Pattern 3: General document with colon and details: "Document type: details"
  /^([A-Za-z0-9][A-Za-z0-9\s/]+?):\s*(.+)$/i,
  // Pattern 4: More specific for marksheet/certificate types
  /^([A-Za-z0-9\s/]+(?:Marksheet|Certificate|Card|Admit|Pass).*?):\s*(.+)$/i,
];

console.log("Testing Class marksheet patterns:");

testLines.forEach((line, index) => {
  console.log(`\nLine ${index + 1}: "${line}"`);
  
  docPatterns.forEach((pattern, patternIndex) => {
    const match = line.match(pattern);
    if (match) {
      console.log(`  ✅ Pattern ${patternIndex + 1} matched:`);
      console.log(`     Full match: "${match[0]}"`);
      console.log(`     Group 1: "${match[1] || 'N/A'}"`);
      console.log(`     Group 2: "${match[2] || 'N/A'}"`);
      console.log(`     Group 3: "${match[3] || 'N/A'}"`);
    }
  });
});