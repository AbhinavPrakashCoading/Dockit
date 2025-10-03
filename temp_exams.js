// Clean exam array - only supported exams with schemas
const exams = [
  { 
    id: 'upsc', 
    name: 'UPSC', 
    category: 'Civil Services', 
    logo: '🏛️', 
    color: 'bg-blue-100 text-blue-600',
    schema: upscSchema,
    requiredDocuments: ['photo', 'signature', 'idProof', 'ageProof', 'educationCertificate', 'experienceCertificate']
  },
  { 
    id: 'ssc', 
    name: 'SSC', 
    category: 'Government', 
    logo: '📋', 
    color: 'bg-green-100 text-green-600',
    schema: sscSchema,
    requiredDocuments: ['photo', 'signature', 'idProof', 'ageProof', 'educationCertificate']
  },
  { 
    id: 'ielts', 
    name: 'IELTS', 
    category: 'Language Proficiency', 
    logo: '🌐', 
    color: 'bg-purple-100 text-purple-600',
    schema: ieltsSchema,
    requiredDocuments: ['photo', 'signature', 'passport', 'identityProof']
  }
  // Add new supported exams here following the same pattern:
  // {
  //   id: 'exam_id',
  //   name: 'EXAM NAME',
  //   category: 'Category',
  //   logo: '📄',
  //   color: 'bg-color-100 text-color-600',
  //   schema: examSchema, // Import the schema at the top
  //   requiredDocuments: ['doc1', 'doc2'] // Define required documents
  // }
];