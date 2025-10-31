#!/bin/bash

# Script to download ONNX models for schema inference
# Run this script to download LayoutLMv3 and DistilBERT models

set -e

MODELS_DIR="public/models"
mkdir -p "$MODELS_DIR"

echo "Downloading ONNX models for schema inference..."

# Note: Direct ONNX models from HuggingFace may require Git LFS or special handling
# For production, consider these alternatives:
# 1. Export models yourself using transformers
# 2. Host models on your own CDN
# 3. Use Hugging Face Inference API instead

echo "⚠️  Manual download required for ONNX models:"
echo ""
echo "1. LayoutLMv3 (~133MB quantized):"
echo "   Visit: https://huggingface.co/microsoft/layoutlmv3-base"
echo "   Download the ONNX model files and place in: $MODELS_DIR/layoutlm.onnx"
echo ""
echo "2. DistilBERT (~66MB):"
echo "   You can export using Python:"
echo "   pip install optimum[exporters]"
echo "   optimum-cli export onnx --model distilbert-base-uncased $MODELS_DIR/distilbert/"
echo ""
echo "Alternatively, for development, creating placeholder files..."

# Create placeholder files for development
echo "Creating placeholder ONNX model files (for development only)..."
touch "$MODELS_DIR/layoutlm.onnx"
touch "$MODELS_DIR/distilbert.onnx"

echo "✅ Placeholder files created. Replace with actual models for production use."
echo ""
echo "For actual model download, use one of these methods:"
echo "1. git lfs install && git clone https://huggingface.co/microsoft/layoutlmv3-base"
echo "2. Use transformers library to export: python scripts/export-onnx.py"
