#!/usr/bin/env python3
"""
Simple Flask server for Schema Extraction Engine
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

def generate_fallback_schema(exam_name):
    """Generate a realistic fallback schema based on exam type"""
    
    # Normalize exam name
    normalized_name = ' '.join(word.capitalize() for word in exam_name.replace('-', ' ').replace('_', ' ').split())
    
    lower_name = exam_name.lower()
    
    # Banking exams (IBPS, SBI, etc.)
    if any(keyword in lower_name for keyword in ['ibps', 'bank', 'sbi', 'rbi']):
        requirements = [
            {
                "type": "photograph",
                "requirements": {
                    "format": ["JPG", "JPEG"],
                    "size_kb": {"min": 20, "max": 50},
                    "dimensions": "200x230 pixels",
                    "color": "color",
                    "background": "light",
                    "notes": ["Recent colored photograph", "Passport size", "Clear face visibility"]
                }
            },
            {
                "type": "signature",
                "requirements": {
                    "format": ["JPG", "JPEG"],
                    "size_kb": {"min": 10, "max": 20},
                    "dimensions": "140x60 pixels",
                    "background": "white",
                    "notes": ["Clear signature in black ink", "Sign on white paper"]
                }
            },
            {
                "type": "thumb_impression",
                "requirements": {
                    "format": ["JPG", "JPEG"],
                    "size_kb": {"min": 10, "max": 20},
                    "dimensions": "240x240 pixels",
                    "background": "white",
                    "notes": ["Left thumb impression", "Clear impression on white paper"]
                }
            }
        ]
    
    # SSC exams
    elif 'ssc' in lower_name:
        requirements = [
            {
                "type": "photograph",
                "requirements": {
                    "format": ["JPEG"],
                    "size_kb": {"min": 4, "max": 40},
                    "dimensions": "3.5x4.5 cm",
                    "color": "color",
                    "background": "light",
                    "notes": ["Recent colored photograph", "Passport size"]
                }
            },
            {
                "type": "signature",
                "requirements": {
                    "format": ["JPEG"],
                    "size_kb": {"min": 1, "max": 12},
                    "dimensions": "4x2 cm",
                    "background": "white",
                    "notes": ["Clear signature in black ink"]
                }
            }
        ]
    
    # Medical/Engineering exams
    elif any(keyword in lower_name for keyword in ['neet', 'jee', 'gate']):
        requirements = [
            {
                "type": "photograph",
                "requirements": {
                    "format": ["JPG", "JPEG"],
                    "size_kb": {"min": 10, "max": 200},
                    "dimensions": "Passport size",
                    "color": "color",
                    "background": "white",
                    "notes": ["Recent photograph", "Face should be clearly visible", "No sunglasses or hat"]
                }
            },
            {
                "type": "signature",
                "requirements": {
                    "format": ["JPG", "JPEG"],
                    "size_kb": {"min": 4, "max": 30},
                    "background": "white",
                    "notes": ["Clear signature in blue or black ink"]
                }
            }
        ]
    
    # UPSC/Civil Services
    elif any(keyword in lower_name for keyword in ['upsc', 'civil', 'ias', 'ips']):
        requirements = [
            {
                "type": "photograph",
                "requirements": {
                    "format": ["JPG", "JPEG"],
                    "size_kb": {"min": 3, "max": 50},
                    "dimensions": "5x7 cm",
                    "color": "color",
                    "background": "white",
                    "notes": ["Recent photograph", "Professional attire preferred", "Clear face visibility"]
                }
            },
            {
                "type": "signature",
                "requirements": {
                    "format": ["JPG", "JPEG"],
                    "size_kb": {"min": 1, "max": 10},
                    "dimensions": "4x2 cm",
                    "background": "white",
                    "notes": ["Signature in black ink", "Sign on white paper"]
                }
            }
        ]
    
    # Generic requirements
    else:
        requirements = [
            {
                "type": "photograph",
                "requirements": {
                    "format": ["JPG", "JPEG", "PNG"],
                    "size_kb": {"min": 10, "max": 100},
                    "dimensions": "Passport size",
                    "color": "color",
                    "notes": ["Recent photograph", "Clear face visibility"]
                }
            },
            {
                "type": "signature",
                "requirements": {
                    "format": ["JPG", "JPEG", "PNG"],
                    "size_kb": {"min": 5, "max": 50},
                    "background": "white",
                    "notes": ["Clear signature"]
                }
            }
        ]
    
    return {
        "exam": normalized_name,
        "documents": requirements,
        "extractedFrom": "Intelligent Fallback System",
        "extractedAt": datetime.now().isoformat()
    }

@app.route('/')
def serve_ui():
    """Serve the HTML dev tool"""
    return send_from_directory('.', 'schema-extraction-dev-tool.html')

@app.route('/api/generate-schema', methods=['POST'])
def generate_schema():
    """Generate exam schema endpoint"""
    try:
        data = request.get_json()
        exam_name = data.get('examName', '').strip()
        
        if not exam_name:
            return jsonify({
                'success': False,
                'error': 'Exam name is required'
            }), 400
        
        print(f"Generating schema for: {exam_name}")
        
        # Generate intelligent fallback schema
        schema = generate_fallback_schema(exam_name)
        
        print(f"Generated schema for {schema['exam']}")
        
        return jsonify({
            'success': True,
            'schema': schema,
            'message': f"Generated schema for {schema['exam']}",
            'note': 'Using intelligent pattern matching - real web extraction available via Node.js version'
        })
        
    except Exception as e:
        print(f"Error generating schema: {e}")
        
        # Return basic fallback even on error
        fallback = {
            "exam": data.get('examName', 'Unknown Exam'),
            "documents": [
                {
                    "type": "photograph",
                    "requirements": {
                        "format": ["JPG", "JPEG"],
                        "size_kb": {"min": 10, "max": 100},
                        "dimensions": "Passport size",
                        "color": "color",
                        "notes": ["Recent photograph"]
                    }
                }
            ],
            "extractedFrom": "Basic Fallback",
            "extractedAt": datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'schema': fallback,
            'message': 'Generated basic fallback schema',
            'warning': 'Error occurred during generation'
        })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'message': 'Schema Extraction Server is running'
    })

if __name__ == '__main__':
    print("🚀 Schema Extraction Server starting...")
    print("   Local:    http://localhost:3001")
    print("   API:      http://localhost:3001/api/generate-schema")
    print("   Health:   http://localhost:3001/health")
    print("\n💡 Open http://localhost:3001 in your browser to use the dev tool!")
    
    app.run(host='0.0.0.0', port=3001, debug=True)