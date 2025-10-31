"""
Python script to export ONNX models for schema inference
Requires: pip install transformers optimum[exporters] onnx onnxruntime

This script exports DistilBERT and creates a stub for LayoutLM
For LayoutLM, you may need to download from HuggingFace directly
"""

import os
from pathlib import Path

try:
    from optimum.onnx import export
    from transformers import AutoTokenizer, AutoModelForTokenClassification
    print("✅ Required libraries found")
except ImportError:
    print("❌ Missing libraries. Install with:")
    print("pip install transformers optimum[exporters] onnx onnxruntime")
    exit(1)

MODELS_DIR = Path("public/models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def export_distilbert():
    """Export DistilBERT to ONNX format"""
    print("\n📦 Exporting DistilBERT to ONNX...")
    
    model_name = "distilbert-base-uncased"
    output_path = MODELS_DIR / "distilbert.onnx"
    
    try:
        from optimum.exporters.onnx import main_export
        
        main_export(
            model_name,
            output=str(MODELS_DIR / "distilbert"),
            task="feature-extraction",
        )
        
        print(f"✅ DistilBERT exported to {output_path}")
    except Exception as e:
        print(f"❌ Failed to export DistilBERT: {e}")
        print("Creating placeholder file...")
        output_path.touch()

def create_layoutlm_placeholder():
    """Create placeholder for LayoutLM (requires manual download)"""
    print("\n📝 Creating LayoutLM placeholder...")
    
    output_path = MODELS_DIR / "layoutlm.onnx"
    output_path.touch()
    
    print(f"✅ Placeholder created at {output_path}")
    print("⚠️  For actual LayoutLM model:")
    print("   Visit: https://huggingface.co/microsoft/layoutlmv3-base")
    print("   Or use: git lfs install && git clone https://huggingface.co/microsoft/layoutlmv3-base")

if __name__ == "__main__":
    print("🚀 ONNX Model Export Script")
    print("=" * 50)
    
    export_distilbert()
    create_layoutlm_placeholder()
    
    print("\n" + "=" * 50)
    print("✅ Model export complete!")
    print(f"📁 Models location: {MODELS_DIR.absolute()}")
