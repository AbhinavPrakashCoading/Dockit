import React, { useState } from ‘react’;
import { X, Search, Upload, FileText, CheckCircle, AlertCircle, Download, ArrowLeft, ArrowRight, Loader } from ‘lucide-react’;

const DocKitWorkflow = () => {
const [currentStep, setCurrentStep] = useState(null);
const [selectedExam, setSelectedExam] = useState(null);
const [uploadedFiles, setUploadedFiles] = useState({});
const [processingProgress, setProcessingProgress] = useState(0);
const [searchQuery, setSearchQuery] = useState(’’);

// Sample exam data - Indian exams
const exams = [
{ id: 1, name: ‘UPSC’, category: ‘Civil Services’, logo: ‘🏛️’, color: ‘bg-blue-100 text-blue-600’ },
{ id: 2, name: ‘JEE’, category: ‘Engineering’, logo: ‘⚙️’, color: ‘bg-orange-100 text-orange-600’ },
{ id: 3, name: ‘NEET’, category: ‘Medical’, logo: ‘⚕️’, color: ‘bg-green-100 text-green-600’ },
{ id: 4, name: ‘CAT’, category: ‘Management’, logo: ‘💼’, color: ‘bg-purple-100 text-purple-600’ },
{ id: 5, name: ‘GATE’, category: ‘Engineering’, logo: ‘🎓’, color: ‘bg-indigo-100 text-indigo-600’ },
{ id: 6, name: ‘CLAT’, category: ‘Law’, logo: ‘⚖️’, color: ‘bg-red-100 text-red-600’ },
{ id: 7, name: ‘NDA’, category: ‘Defence’, logo: ‘🎖️’, color: ‘bg-green-100 text-green-600’ },
{ id: 8, name: ‘SSC’, category: ‘Government’, logo: ‘📋’, color: ‘bg-blue-100 text-blue-600’ },
{ id: 9, name: ‘IBPS’, category: ‘Banking’, logo: ‘🏦’, color: ‘bg-teal-100 text-teal-600’ },
{ id: 10, name: ‘RRB’, category: ‘Railway’, logo: ‘🚂’, color: ‘bg-orange-100 text-orange-600’ },
{ id: 11, name: ‘CUET’, category: ‘University’, logo: ‘🎓’, color: ‘bg-purple-100 text-purple-600’ },
{ id: 12, name: ‘AIIMS’, category: ‘Medical’, logo: ‘🏥’, color: ‘bg-green-100 text-green-600’ },
];

const documentTypes = [
{ id: ‘id’, name: ‘Government ID’, required: true, icon: ‘🪪’ },
{ id: ‘marksheet’, name: ‘Mark Sheet’, required: true, icon: ‘📄’ },
{ id: ‘certificate’, name: ‘Certificate’, required: true, icon: ‘🏆’ },
{ id: ‘transcript’, name: ‘Transcript’, required: false, icon: ‘📋’ },
{ id: ‘recommendation’, name: ‘Recommendation Letter’, required: false, icon: ‘✉️’ },
];

const schemaComparison = [
{
property: ‘File Size’,
document: ‘Government ID’,
uploaded: ‘180 KB’,
expected: ‘200 KB (minimum)’,
status: ‘mismatch’,
issue: ‘File size below minimum requirement’
},
{
property: ‘Format’,
document: ‘Mark Sheet’,
uploaded: ‘JPG’,
expected: ‘PDF’,
status: ‘mismatch’,
issue: ‘Invalid file format’
},
{
property: ‘Dimensions’,
document: ‘Government ID’,
uploaded: ‘800 x 600 px’,
expected: ‘1200 x 900 px’,
status: ‘match’
},
{
property: ‘Resolution’,
document: ‘Certificate’,
uploaded: ‘150 DPI’,
expected: ‘300 DPI (minimum)’,
status: ‘mismatch’,
issue: ‘Resolution too low’
},
{
property: ‘Color Mode’,
document: ‘Mark Sheet’,
uploaded: ‘RGB’,
expected: ‘RGB’,
status: ‘match’
},
{
property: ‘File Name’,
document: ‘Certificate’,
uploaded: ‘cert.pdf’,
expected: ‘[name]_certificate.pdf’,
status: ‘mismatch’,
issue: ‘Naming convention not followed’
},
];

const fileProgress = [
{ name: ‘Government_ID.pdf’, progress: 100, status: ‘complete’ },
{ name: ‘Marksheet_2024.pdf’, progress: 75, status: ‘processing’ },
{ name: ‘Certificate.pdf’, progress: 45, status: ‘processing’ },
{ name: ‘Transcript.pdf’, progress: 0, status: ‘queued’ },
];

// Filter exams based on search
const filteredExams = exams.filter(exam =>
exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
exam.category.toLowerCase().includes(searchQuery.toLowerCase())
);

const popularExams = exams.slice(0, 4);

const handleFileUpload = (docType, files) => {
setUploadedFiles(prev => ({
…prev,
[docType]: files[0]
}));
};

const startProcessing = () => {
setCurrentStep(‘processing’);
let progress = 0;
const interval = setInterval(() => {
progress += 5;
setProcessingProgress(progress);
if (progress >= 100) {
clearInterval(interval);
setTimeout(() => setCurrentStep(‘validation’), 500);
}
}, 200);
};

return (
<div className="min-h-screen bg-gray-50 p-8">
{/* Main Dashboard Mockup */}
<div className="max-w-7xl mx-auto">
<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
<h1 className="text-2xl font-bold mb-2">Welcome back, Guest!</h1>
<p className="text-gray-600 mb-4">Start your document processing workflow</p>
<button
onClick={() => setCurrentStep(‘exam-selector’)}
className=“bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition”
>
Start New Application
</button>
</div>

```
    {/* Progress Indicator */}
    {selectedExam && (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedExam.logo}</span>
            <div>
              <h3 className="font-semibold">{selectedExam.name}</h3>
              <p className="text-sm text-gray-500">Application in progress</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentStep('upload')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Continue →
          </button>
        </div>
      </div>
    )}
  </div>

  {/* Step 1: Exam Selector Modal */}
  {currentStep === 'exam-selector' && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Choose Your Exam</h2>
          <button
            onClick={() => setCurrentStep(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Popular Exams */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Popular Exams</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularExams.map(exam => (
                <button
                  key={exam.id}
                  onClick={() => {
                    setSelectedExam(exam);
                    setCurrentStep('upload');
                  }}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
                >
                  <div className={`w-16 h-16 ${exam.color} rounded-full flex items-center justify-center mx-auto mb-2 text-3xl`}>
                    {exam.logo}
                  </div>
                  <p className="font-semibold">{exam.name}</p>
                  <p className="text-xs text-gray-500">{exam.category}</p>
                </button>
              ))}
            </div>
          </div>

          {/* All Exams */}
          <div>
            <h3 className="text-lg font-semibold mb-4">All Exams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredExams.map(exam => (
                <button
                  key={exam.id}
                  onClick={() => {
                    setSelectedExam(exam);
                    setCurrentStep('upload');
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition flex items-center gap-4"
                >
                  <div className={`w-12 h-12 ${exam.color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                    {exam.logo}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{exam.name}</p>
                    <p className="text-sm text-gray-500">{exam.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Step 2: Upload Documents Panel */}
  {currentStep === 'upload' && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep('exam-selector')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold">Upload Documents</h2>
              <p className="text-sm text-gray-500">For {selectedExam?.name}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentStep(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {documentTypes.map(docType => (
            <div key={docType.id} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{docType.icon}</span>
                <h3 className="font-semibold">{docType.name}</h3>
                {docType.required && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                )}
              </div>
              
              {uploadedFiles[docType.id] ? (
                <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                      <p className="font-medium text-green-900">{uploadedFiles[docType.id].name}</p>
                      <p className="text-sm text-green-600">Uploaded successfully</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newFiles = { ...uploadedFiles };
                      delete newFiles[docType.id];
                      setUploadedFiles(newFiles);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 10MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(docType.id, e.target.files)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <button
            onClick={() => setCurrentStep('exam-selector')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep('review')}
            disabled={Object.keys(uploadedFiles).length === 0}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Step 3: Review & Adapt Panel */}
  {currentStep === 'review' && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-full md:w-[700px] bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep('upload')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold">Review & Adapt</h2>
              <p className="text-sm text-gray-500">Verify schema mapping</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentStep(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm text-blue-900 font-medium">Schema Comparison</p>
            <p className="text-xs text-blue-700 mt-1">
              We've compared your uploaded documents with the expected schema. Review any mismatches below.
            </p>
          </div>
        </div>

          {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {schemaComparison.map((item, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${
                  item.status === 'match'
                    ? 'border-green-200 bg-green-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{item.property}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.document}</p>
                  </div>
                  {item.status === 'match' ? (
                    <span className="flex items-center gap-1 text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                      <CheckCircle size={14} />
                      Match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded">
                      <AlertCircle size={14} />
                      Mismatch
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Uploaded</p>
                    <p className="text-sm font-medium">{item.uploaded}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Required</p>
                    <p className="text-sm font-medium">{item.expected}</p>
                  </div>
                </div>
                {item.issue && (
                  <div className="pt-2 border-t border-orange-200">
                    <p className="text-xs text-orange-700">⚠️ {item.issue}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Requirements Met</span>
              <span className="text-sm font-bold text-green-600">
                {schemaComparison.filter(i => i.status === 'match').length} / {schemaComparison.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(schemaComparison.filter(i => i.status === 'match').length / schemaComparison.length) * 100}%`
                }}
              />
            </div>
            {schemaComparison.filter(i => i.status === 'mismatch').length > 0 && (
              <p className="text-xs text-orange-600 mt-3">
                ⚠️ Some documents don't meet requirements. You can still proceed, but may face issues during submission.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <button
            onClick={() => setCurrentStep('upload')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Back
          </button>
          <button
            onClick={startProcessing}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Process Documents
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Step 4: Processing Documents Modal */}
  {currentStep === 'processing' && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Processing Documents</h2>
          <p className="text-gray-500 mt-1">Please wait while we process your files</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overall Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold text-purple-600">{processingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>

          {/* Individual File Progress */}
          <div className="space-y-4">
            {fileProgress.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="text-gray-400" size={20} />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  {file.status === 'complete' && (
                    <CheckCircle className="text-green-600" size={20} />
                  )}
                  {file.status === 'processing' && (
                    <Loader className="text-purple-600 animate-spin" size={20} />
                  )}
                  {file.status === 'queued' && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Queued</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        file.status === 'complete' ? 'bg-green-600' : 'bg-purple-600'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{file.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Step 5: Validation Complete Modal */}
  {currentStep === 'validation' && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Success Icon */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Validation Complete!</h2>
          <p className="text-gray-600">All documents have been successfully validated and are ready for download.</p>
        </div>

        {/* Validation Summary */}
        <div className="px-8 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Documents Processed</span>
              <span className="font-semibold">{fileProgress.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Validation Status</span>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle size={16} />
                Passed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Exam</span>
              <span className="font-semibold">{selectedExam?.name}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => {
              setCurrentStep(null);
              setSelectedExam(null);
              setUploadedFiles({});
              setProcessingProgress(0);
            }}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Start New
          </button>
          <button
            onClick={() => {
              alert('ZIP file downloaded!');
            }}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  )}
</div>
```

);
};

export default DocKitWorkflow;
