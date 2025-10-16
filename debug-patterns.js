// Debug line splitting and pattern matching
const jeeInput = `JEE Mains 2025

Documents Required:
Photo: JPEG/JPG format, 10KB–200KB, recent passport-size photo (80% face visible including ears, white/light background), mandatory
Signature: JPEG/JPG format, 4KB–30KB, scanned signature in black ink on white paper, mandatory
ID Proof: PDF format, 50KB–300KB, Aadhaar/Passport/Voter ID/any valid govt-issued ID, mandatory
Class 10th Marksheet/Pass Certificate: PDF format, 50KB–300KB, mandatory
Class 12th Marksheet/Admit Card/Certificate: PDF format, 50KB–300KB, mandatory if passed or appearing
Category Certificate (if applicable): PDF format, 50KB–300KB, SC/ST/OBC/EWS certificate, only if applicable
PwD Certificate (if applicable): PDF format, 50KB–300KB, for differently-abled candidates, only if applicable
`;

console.log("🔍 Debug Line Analysis");
console.log("======================");

const lines = jeeInput.split('\n').filter(line => line.trim());
console.log(`Total lines: ${lines.length}`);

lines.forEach((line, index) => {
    console.log(`Line ${index + 1}: "${line}"`);
    
    // Test the "if applicable" pattern
    const ifApplicablePattern = /^([A-Za-z][A-Za-z\s]+?)\s*\(if applicable\):\s*(.+)$/i;
    const match = line.match(ifApplicablePattern);
    
    if (match) {
        console.log(`  -> Matched "if applicable" pattern:`);
        console.log(`     Document: "${match[1]}"`);
        console.log(`     Details: "${match[2]}"`);
    }
    
    // Test the main pattern
    const mainPattern = /^([A-Za-z][A-Za-z\s/()]+?):\s*((?:JPEG|JPG|PDF|PNG).+?)$/i;
    const mainMatch = line.match(mainPattern);
    
    if (mainMatch) {
        console.log(`  -> Matched main pattern:`);
        console.log(`     Document: "${mainMatch[1]}"`);
        console.log(`     Details: "${mainMatch[2]}"`);
    }
    
    console.log('');
});