"""
AI Document Verification Pipeline - Python Implementation

This module provides Python implementations of the document verification functions
as specified in the original requirements. It includes:

1. clean_ocr_text() - Normalize OCR text and fix common mistakes
2. detect_document_type() - Detect broad document categories 
3. detect_document_subtype() - Detect specific document subtypes
4. classify_document() - Full pipeline with ML fallback

Examples:
    OCR text: "CENTRAL BOARD OF SECONDARY EDUCATION MARKS STATEMENT CUM CERTIFICATE SECONDARY SCHOOL EXAMINATION"
    Expected output: type="EDUCATIONAL", subtype="CBSE_10_MARKSHEET"

    OCR text: "CENTRAL BOARD OF SECONDARY EDUCATION SENIOR SCHOOL CERTIFICATE EXAMINATION"  
    Expected output: type="EDUCATIONAL", subtype="CBSE_12_MARKSHEET"

    OCR text: "UNIQUE IDENTIFICATION AUTHORITY OF INDIA"
    Expected output: type="ID", subtype="AADHAAR_CARD"
"""

import re
import typing
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum


@dataclass
class DocumentVerificationResult:
    """Result of document verification pipeline"""
    type: str
    subtype: str
    confidence: float
    method: str  # 'rule-based' or 'ml-fallback'
    reasons: List[str]
    raw_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    detected_patterns: Optional[List[str]] = None
    alternative_types: Optional[List[Dict[str, Any]]] = None


class DocumentType(Enum):
    """Supported document types"""
    EDUCATIONAL = "EDUCATIONAL"
    ID = "ID"
    FINANCIAL = "FINANCIAL"
    EMPLOYMENT = "EMPLOYMENT"
    UNKNOWN = "UNKNOWN"


class DocumentSubtype(Enum):
    """Supported document subtypes"""
    # Educational
    CBSE_10_MARKSHEET = "CBSE_10_MARKSHEET"
    CBSE_12_MARKSHEET = "CBSE_12_MARKSHEET"
    ICSE_10_MARKSHEET = "ICSE_10_MARKSHEET"
    ISC_12_MARKSHEET = "ISC_12_MARKSHEET"
    STATE_BOARD_10_MARKSHEET = "STATE_BOARD_10_MARKSHEET"
    STATE_BOARD_12_MARKSHEET = "STATE_BOARD_12_MARKSHEET"
    UNIVERSITY_DEGREE = "UNIVERSITY_DEGREE"
    
    # ID Documents
    AADHAAR_CARD = "AADHAAR_CARD"
    PAN_CARD = "PAN_CARD"
    PASSPORT = "PASSPORT"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    VOTER_ID = "VOTER_ID"
    
    # Financial
    BANK_STATEMENT = "BANK_STATEMENT"
    INCOME_TAX_RETURN = "INCOME_TAX_RETURN"
    
    # Unknown
    UNKNOWN = "UNKNOWN"


# Common OCR mistakes and their corrections
OCR_CORRECTIONS = {
    'CERTIFICSTE': 'CERTIFICATE',
    'CERTIFCATE': 'CERTIFICATE', 
    'CERTIFICAT': 'CERTIFICATE',
    'MARKSHEST': 'MARKSHEET',
    'MARKSHSET': 'MARKSHEET',
    'MARKSHEEET': 'MARKSHEET',
    'EXAMINAT10N': 'EXAMINATION',
    'EXAMINATI0N': 'EXAMINATION',
    'EXAMINATOIN': 'EXAMINATION',
    'CENTRAL B0ARD': 'CENTRAL BOARD',
    'CENTRAL B0RD': 'CENTRAL BOARD',
    'SECENDARY': 'SECONDARY',
    'SECUNDARY': 'SECONDARY',
    'SCONDARY': 'SECONDARY',
    'AUTHCRITY': 'AUTHORITY',
    'AUTHORTY': 'AUTHORITY',
    'AUTHORIT1': 'AUTHORITY',
    'IDENT1FICATION': 'IDENTIFICATION',
    'IDENTIF1CATION': 'IDENTIFICATION',
    'IDENTJFICATION': 'IDENTIFICATION',
    'GQVERNMENT': 'GOVERNMENT',
    'G0VERNMENT': 'GOVERNMENT',
    'GOVERNMFNT': 'GOVERNMENT',
    'SENIOR SCH00L': 'SENIOR SCHOOL',
    'SENI0R SCHOOL': 'SENIOR SCHOOL',
    'UNIQUE IDENT1FICATION': 'UNIQUE IDENTIFICATION',
    'PERMANENT ACCOUNT': 'PERMANENT ACCOUNT',
    'PERMAMENT ACCOUNT': 'PERMANENT ACCOUNT',
    'INCOME TAX': 'INCOME TAX',
    '1NCOME TAX': 'INCOME TAX',
    'ELIG1BILITY': 'ELIGIBILITY',
    'ELIGIB1LITY': 'ELIGIBILITY',
}

# Document type patterns for broad classification
DOCUMENT_TYPE_PATTERNS = {
    DocumentType.EDUCATIONAL.value: {
        'keywords': [
            'education', 'school', 'college', 'university', 'examination', 'marksheet',
            'certificate', 'diploma', 'degree', 'cbse', 'icse', 'state board',
            'secondary', 'higher secondary', 'graduation', 'post graduation',
            'marks', 'grade', 'result', 'transcript', 'academic'
        ],
        'patterns': [
            r'\b(?:cbse|icse|state\s+board|central\s+board)\b',
            r'\bsecondary\s+school\s+(?:examination|certificate)\b',
            r'\bsenior\s+school\s+certificate\b',
            r'\bmarks?\s*(?:statement|sheet)\b',
            r'\b(?:class|grade)\s*(?:x|10|xii|12)\b',
            r'\b(?:bachelor|master|diploma)\s*(?:of|in)?\b'
        ],
        'weight': 1.0
    },
    DocumentType.ID.value: {
        'keywords': [
            'identification', 'identity', 'aadhaar', 'aadhar', 'pan', 'passport',
            'driving license', 'voter id', 'election', 'authority', 'government',
            'unique identification', 'permanent account', 'income tax', 'uidai'
        ],
        'patterns': [
            r'\b(?:aadhaar|aadhar|uid)\b',
            r'\bunique\s+identification\s+authority\b',
            r'\bpermanent\s+account\s+number\b',
            r'\bincome\s+tax\s+department\b',
            r'\bpassport\s*(?:number|no)?\b',
            r'\bdriving\s*licen[cs]e\b',
            r'\bvoter\s*(?:id|identity)\b',
            r'\belection\s+commission\b',
            r'\bgovernment\s+of\s+india\b'
        ],
        'weight': 1.0
    },
    DocumentType.FINANCIAL.value: {
        'keywords': [
            'bank', 'account', 'statement', 'balance', 'transaction', 'deposit',
            'withdrawal', 'credit', 'debit', 'loan', 'investment', 'insurance',
            'policy', 'premium', 'claim', 'ifsc', 'swift', 'micr', 'cheque'
        ],
        'patterns': [
            r'\bbank\s+(?:statement|account)\b',
            r'\b(?:saving|current)\s+account\b',
            r'\bifsc\s*(?:code|number)?\b',
            r'\bmicr\s*(?:code|number)?\b',
            r'\b(?:loan|credit|debit)\s*(?:card|account)?\b',
            r'\binsurance\s+policy\b',
            r'\btransaction\s+(?:history|statement)\b'
        ],
        'weight': 1.0
    }
}

# Document subtype patterns for specific classification  
DOCUMENT_SUBTYPE_PATTERNS = {
    DocumentSubtype.CBSE_10_MARKSHEET.value: {
        'name': 'CBSE Class 10 Marksheet',
        'parent_type': DocumentType.EDUCATIONAL.value,
        'keywords': ['cbse', 'central board', 'secondary education', 'class x', 'class 10'],
        'patterns': [
            r'\bcentral\s+board\s+of\s+secondary\s+education\b',
            r'\bsecondary\s+school\s+examination\b',
            r'\bclass\s*(?:x|10)\b',
            r'\bmarks?\s*(?:statement|sheet)\s*cum\s*certificate\b'
        ],
        'subject_codes': ['101', '041', '043', '044', '045', '049', '083', '087'],
        'header_keywords': ['secondary school examination', 'marks statement cum certificate'],
        'required_elements': ['central board', 'secondary', 'marks'],
        'confidence': {'high': 0.9, 'medium': 0.75, 'low': 0.6}
    },
    DocumentSubtype.CBSE_12_MARKSHEET.value: {
        'name': 'CBSE Class 12 Marksheet',
        'parent_type': DocumentType.EDUCATIONAL.value,
        'keywords': ['cbse', 'central board', 'senior secondary', 'class xii', 'class 12'],
        'patterns': [
            r'\bcentral\s+board\s+of\s+secondary\s+education\b',
            r'\bsenior\s+(?:secondary\s+)?school\s+certificate\s+examination\b',
            r'\bclass\s*(?:xii|12)\b',
            r'\bhigher\s+secondary\s+(?:certificate|examination)\b'
        ],
        'subject_codes': ['301', '042', '048', '028', '029', '030', '064', '065'],
        'header_keywords': ['senior school certificate examination', 'higher secondary certificate'],
        'required_elements': ['central board', 'senior', 'certificate'],
        'confidence': {'high': 0.9, 'medium': 0.75, 'low': 0.6}
    },
    DocumentSubtype.AADHAAR_CARD.value: {
        'name': 'Aadhaar Card',
        'parent_type': DocumentType.ID.value,
        'keywords': ['aadhaar', 'aadhar', 'uid', 'unique identification authority'],
        'patterns': [
            r'\bunique\s+identification\s+authority\s+of\s+india\b',
            r'\baadhaar\b',
            r'\buid\s*(?:ai)?\b',
            r'\b\d{4}\s+\d{4}\s+\d{4}\b'
        ],
        'header_keywords': ['unique identification authority of india', 'government of india'],
        'required_elements': ['aadhaar', 'unique identification'],
        'confidence': {'high': 0.95, 'medium': 0.8, 'low': 0.65}
    },
    DocumentSubtype.PAN_CARD.value: {
        'name': 'PAN Card',
        'parent_type': DocumentType.ID.value,
        'keywords': ['pan', 'permanent account number', 'income tax department'],
        'patterns': [
            r'\bpermanent\s+account\s+number\b',
            r'\bincome\s+tax\s+department\b',
            r'\bgovernment\s+of\s+india\b',
            r'\b[A-Z]{5}\d{4}[A-Z]\b'
        ],
        'header_keywords': ['permanent account number', 'income tax department'],
        'required_elements': ['permanent account', 'income tax'],
        'confidence': {'high': 0.95, 'medium': 0.8, 'low': 0.65}
    }
}


def clean_ocr_text(raw_text: str) -> str:
    """
    Normalize OCR text: lowercase, strip special chars, fix common OCR mistakes.
    
    Args:
        raw_text: Raw OCR text extracted from document
        
    Returns:
        Cleaned and normalized text string
    """
    if not raw_text or not isinstance(raw_text, str):
        return ""
    
    # Normalize whitespace and remove excessive spaces
    cleaned = re.sub(r'\s+', ' ', raw_text).strip()
    
    # Remove common OCR artifacts
    cleaned = re.sub(r'[|\\\/\[\]{}()]+', ' ', cleaned)
    cleaned = re.sub(r'[^\w\s\-.:,]', ' ', cleaned)
    
    # Fix common OCR mistakes
    for wrong, correct in OCR_CORRECTIONS.items():
        wrong_pattern = r'\b' + re.escape(wrong) + r'\b'
        cleaned = re.sub(wrong_pattern, correct, cleaned, flags=re.IGNORECASE)
    
    # Additional fuzzy matching for key terms
    fuzzy_corrections = [
        (r'certificat[es]?', 'CERTIFICATE'),
        (r'marksheet?', 'MARKSHEET'),
        (r'examinatio[ns]?', 'EXAMINATION'),
        (r'secondar[yi]?', 'SECONDARY'),
        (r'authorit[yi]?', 'AUTHORITY')
    ]
    
    for pattern, correction in fuzzy_corrections:
        cleaned = re.sub(pattern, correction, cleaned, flags=re.IGNORECASE)
    
    # Final cleanup
    cleaned = re.sub(r'\s+', ' ', cleaned).strip().upper()
    
    return cleaned


def detect_document_type(ocr_text: str) -> Tuple[str, float]:
    """
    Detects broad document type (EDUCATIONAL, ID, FINANCIAL, etc.)
    
    Args:
        ocr_text: OCR text from document
        
    Returns:
        Tuple of (document_type, confidence_score)
    """
    cleaned = clean_ocr_text(ocr_text)
    scores = {}
    
    # Initialize scores for all types
    for doc_type in DOCUMENT_TYPE_PATTERNS:
        scores[doc_type] = {'score': 0, 'matches': []}
    
    # Calculate scores for each document type
    for doc_type, pattern_data in DOCUMENT_TYPE_PATTERNS.items():
        type_score = scores[doc_type]
        
        # Check keywords
        for keyword in pattern_data['keywords']:
            keyword_pattern = r'\b' + re.escape(keyword.replace(' ', r'\s+')) + r'\b'
            if re.search(keyword_pattern, cleaned, re.IGNORECASE):
                type_score['score'] += pattern_data['weight'] * 0.3
                type_score['matches'].append(f"keyword: {keyword}")
        
        # Check patterns
        for pattern in pattern_data['patterns']:
            if re.search(pattern, cleaned, re.IGNORECASE):
                type_score['score'] += pattern_data['weight'] * 0.7
                type_score['matches'].append(f"pattern: {pattern}")
    
    # Find the best match
    best_type = DocumentType.UNKNOWN.value
    best_score = 0
    
    for doc_type, score_data in scores.items():
        if score_data['score'] > best_score:
            best_score = score_data['score']
            best_type = doc_type
    
    # Normalize confidence score
    confidence = min(best_score / 2.0, 1.0)  # Max possible score is ~2.0
    
    return best_type, confidence


def detect_document_subtype(ocr_text: str, doc_type: str) -> Tuple[str, float]:
    """
    Detects specific document subtype within a type.
    
    Rules:
    - EDUCATIONAL: use exam board keywords + subject codes
    - ID: use issuing authority names (UIDAI, PAN, Election Commission, etc.)
    - FINANCIAL: look for terms like BANK, ACCOUNT, IFSC, INCOME TAX, etc.
    
    Args:
        ocr_text: OCR text from document
        doc_type: Broad document type (from detect_document_type)
        
    Returns:
        Tuple of (document_subtype, confidence_score)
    """
    cleaned = clean_ocr_text(ocr_text)
    applicable_subtypes = {
        subtype: data for subtype, data in DOCUMENT_SUBTYPE_PATTERNS.items() 
        if data['parent_type'] == doc_type
    }
    
    if not applicable_subtypes:
        return DocumentSubtype.UNKNOWN.value, 0.0
    
    scores = {}
    
    # Calculate scores for each subtype
    for subtype, pattern_data in applicable_subtypes.items():
        subtype_score = {'score': 0, 'matches': []}
        
        # Check keywords
        for keyword in pattern_data['keywords']:
            keyword_pattern = r'\b' + re.escape(keyword.replace(' ', r'\s+')) + r'\b'
            if re.search(keyword_pattern, cleaned, re.IGNORECASE):
                subtype_score['score'] += 0.2
                subtype_score['matches'].append(f"keyword: {keyword}")
        
        # Check patterns (higher weight)
        for pattern in pattern_data['patterns']:
            if re.search(pattern, cleaned, re.IGNORECASE):
                subtype_score['score'] += 0.4
                subtype_score['matches'].append(f"pattern: {pattern}")
        
        # Check header keywords (high importance)
        if 'header_keywords' in pattern_data:
            for header_keyword in pattern_data['header_keywords']:
                header_pattern = r'\b' + re.escape(header_keyword.replace(' ', r'\s+')) + r'\b'
                if re.search(header_pattern, cleaned, re.IGNORECASE):
                    subtype_score['score'] += 0.5
                    subtype_score['matches'].append(f"header: {header_keyword}")
        
        # Check subject codes (for educational documents)
        if 'subject_codes' in pattern_data:
            for code in pattern_data['subject_codes']:
                code_pattern = r'\b' + re.escape(code) + r'\b'
                if re.search(code_pattern, cleaned):
                    subtype_score['score'] += 0.3
                    subtype_score['matches'].append(f"subject_code: {code}")
        
        # Check required elements
        if 'required_elements' in pattern_data:
            required_found = 0
            for element in pattern_data['required_elements']:
                element_pattern = r'\b' + re.escape(element.replace(' ', r'\s+')) + r'\b'
                if re.search(element_pattern, cleaned, re.IGNORECASE):
                    required_found += 1
            
            required_ratio = required_found / len(pattern_data['required_elements'])
            subtype_score['score'] += 0.4 * required_ratio
            subtype_score['matches'].append(f"required_elements: {required_found}/{len(pattern_data['required_elements'])}")
        
        scores[subtype] = subtype_score
    
    # Find the best match
    best_subtype = DocumentSubtype.UNKNOWN.value
    best_score = 0
    
    for subtype, score_data in scores.items():
        if score_data['score'] > best_score:
            best_score = score_data['score']
            best_subtype = subtype
    
    # Normalize confidence score based on pattern confidence thresholds
    pattern_data = applicable_subtypes.get(best_subtype)
    confidence = 0
    
    if pattern_data and best_score > 0:
        # Map score to confidence based on pattern thresholds
        max_possible_score = 1.8  # Theoretical max
        normalized_score = best_score / max_possible_score
        
        confidence_thresholds = pattern_data['confidence']
        if normalized_score >= confidence_thresholds['high'] / confidence_thresholds['high']:
            confidence = min(normalized_score, 1.0)
        elif normalized_score >= confidence_thresholds['medium'] / confidence_thresholds['high']:
            confidence = normalized_score * 0.8
        elif normalized_score >= confidence_thresholds['low'] / confidence_thresholds['high']:
            confidence = normalized_score * 0.6
        else:
            confidence = normalized_score * 0.4
    
    return best_subtype, min(confidence, 1.0)


def _ml_fallback_classifier(ocr_text: str) -> Tuple[str, str, float]:
    """
    ML Fallback classifier using simplified TF-IDF + Logistic Regression simulation.
    This is a simplified simulation - in production, you'd use actual ML models.
    
    Args:
        ocr_text: Cleaned OCR text
        
    Returns:
        Tuple of (document_type, document_subtype, confidence)
    """
    cleaned = clean_ocr_text(ocr_text)
    words = cleaned.split()
    word_count = len(words)
    
    # Feature extraction (simplified)
    features = {
        'has_education_terms': bool(re.search(r'\b(education|school|examination|marks|certificate|class|cbse|icse)\b', cleaned, re.IGNORECASE)),
        'has_id_terms': bool(re.search(r'\b(aadhaar|pan|passport|license|voter|identification|authority)\b', cleaned, re.IGNORECASE)),
        'has_financial_terms': bool(re.search(r'\b(bank|account|statement|transaction|income|tax)\b', cleaned, re.IGNORECASE)),
        'has_numbers': bool(re.search(r'\d+', cleaned)),
        'has_codes': bool(re.search(r'\b\d{3,4}\b', cleaned)),
        'word_count': word_count,
        'avg_word_length': sum(len(word) for word in words) / max(len(words), 1)
    }
    
    # Simplified decision tree logic
    if features['has_education_terms'] and features['has_codes']:
        if re.search(r'\bclass\s*(?:x|10)\b', cleaned, re.IGNORECASE):
            return DocumentType.EDUCATIONAL.value, DocumentSubtype.CBSE_10_MARKSHEET.value, 0.75
        elif re.search(r'\bclass\s*(?:xii|12)\b', cleaned, re.IGNORECASE):
            return DocumentType.EDUCATIONAL.value, DocumentSubtype.CBSE_12_MARKSHEET.value, 0.75
        return DocumentType.EDUCATIONAL.value, DocumentSubtype.UNIVERSITY_DEGREE.value, 0.7
    
    if features['has_id_terms']:
        if re.search(r'aadhaar', cleaned, re.IGNORECASE):
            return DocumentType.ID.value, DocumentSubtype.AADHAAR_CARD.value, 0.75
        elif re.search(r'pan', cleaned, re.IGNORECASE):
            return DocumentType.ID.value, DocumentSubtype.PAN_CARD.value, 0.75
        return DocumentType.ID.value, DocumentSubtype.UNKNOWN.value, 0.65
    
    if features['has_financial_terms']:
        return DocumentType.FINANCIAL.value, DocumentSubtype.BANK_STATEMENT.value, 0.7
    
    return DocumentType.UNKNOWN.value, DocumentSubtype.UNKNOWN.value, 0.3


def classify_document(ocr_text: str) -> Dict[str, Any]:
    """
    Full pipeline:
    1. Clean OCR text
    2. Detect type
    3. Detect subtype
    4. If confidence < 0.7, fallback to ML model
    
    Args:
        ocr_text: Raw OCR text from document
        
    Returns:
        Dictionary with classification results: {"type": ..., "subtype": ..., "confidence": ...}
    """
    CONFIDENCE_THRESHOLD = 0.7
    
    if not ocr_text or not isinstance(ocr_text, str) or not ocr_text.strip():
        return {
            "type": DocumentType.UNKNOWN.value,
            "subtype": DocumentSubtype.UNKNOWN.value,
            "confidence": 0.0,
            "method": "rule-based",
            "reasons": ["Empty or invalid OCR text"],
            "raw_text": ocr_text,
            "cleaned_text": ""
        }
    
    # Step 1: Clean OCR text
    cleaned_text = clean_ocr_text(ocr_text)
    
    # Step 2: Detect broad document type
    doc_type, type_confidence = detect_document_type(cleaned_text)
    
    # Step 3: Detect specific subtype
    doc_subtype, subtype_confidence = detect_document_subtype(cleaned_text, doc_type)
    
    # Step 4: Determine if confidence is sufficient
    combined_confidence = (type_confidence + subtype_confidence) / 2
    
    if combined_confidence >= CONFIDENCE_THRESHOLD:
        # Rule-based classification succeeded
        return {
            "type": doc_type,
            "subtype": doc_subtype,
            "confidence": combined_confidence,
            "method": "rule-based",
            "reasons": [f"Type confidence: {type_confidence:.2f}", f"Subtype confidence: {subtype_confidence:.2f}"],
            "raw_text": ocr_text,
            "cleaned_text": cleaned_text,
            "detected_patterns": [f"type: {doc_type}", f"subtype: {doc_subtype}"]
        }
    else:
        # Step 5: Fallback to ML classifier
        ml_type, ml_subtype, ml_confidence = _ml_fallback_classifier(cleaned_text)
        return {
            "type": ml_type,
            "subtype": ml_subtype,
            "confidence": ml_confidence,
            "method": "ml-fallback",
            "reasons": [f"Rule-based confidence too low ({combined_confidence:.2f}), using ML fallback"],
            "raw_text": ocr_text,
            "cleaned_text": cleaned_text,
            "detected_patterns": [f"ml_type: {ml_type}", f"ml_subtype: {ml_subtype}"]
        }


# Example usage and testing
if __name__ == "__main__":
    # Test examples from the requirements
    test_cases = [
        {
            "name": "CBSE 10th Marksheet",
            "text": "CENTRAL BOARD OF SECONDARY EDUCATION MARKS STATEMENT CUM CERTIFICATE SECONDARY SCHOOL EXAMINATION",
            "expected_type": "EDUCATIONAL",
            "expected_subtype": "CBSE_10_MARKSHEET"
        },
        {
            "name": "CBSE 12th Certificate", 
            "text": "CENTRAL BOARD OF SECONDARY EDUCATION SENIOR SCHOOL CERTIFICATE EXAMINATION",
            "expected_type": "EDUCATIONAL",
            "expected_subtype": "CBSE_12_MARKSHEET"
        },
        {
            "name": "Aadhaar Card",
            "text": "UNIQUE IDENTIFICATION AUTHORITY OF INDIA",
            "expected_type": "ID", 
            "expected_subtype": "AADHAAR_CARD"
        }
    ]
    
    print("🔍 AI Document Verification Pipeline - Python Implementation Test\n")
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"Test {i}: {test_case['name']}")
        print(f"Input: {test_case['text']}")
        
        result = classify_document(test_case['text'])
        
        print(f"Output: type='{result['type']}', subtype='{result['subtype']}', confidence={result['confidence']:.2f}")
        print(f"Method: {result['method']}")
        
        type_match = result['type'] == test_case['expected_type']
        subtype_match = result['subtype'] == test_case['expected_subtype']
        status = "✅ PASS" if type_match and subtype_match else "❌ FAIL"
        
        print(f"Expected: type='{test_case['expected_type']}', subtype='{test_case['expected_subtype']}'")
        print(f"Status: {status}\n")
    
    print("🎉 Python implementation testing complete!")