// Test en-dash parsing specifically
const text = "JPEG/JPG format, 10KB–200KB, recent passport-size photo";
console.log("Testing en-dash pattern...");
console.log("Input:", text);

// Test the regex patterns
const sizePatterns = [
  /(\d+(?:\.\d+)?)\s*(kb|mb|gb)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*(kb|mb|gb)/i,
];

for (const pattern of sizePatterns) {
  const match = text.match(pattern);
  console.log("Pattern:", pattern);
  console.log("Match:", match);
  if (match) {
    console.log("Min size:", `${match[1]} ${match[2].toUpperCase()}`);
    console.log("Max size:", `${match[3]} ${match[4].toUpperCase()}`);
  }
}

// Test individual character
console.log("\nCharacter analysis:");
console.log("En-dash character code:", "10KB–200KB".charCodeAt(4));
console.log("Regular dash character code:", "10KB-200KB".charCodeAt(4));