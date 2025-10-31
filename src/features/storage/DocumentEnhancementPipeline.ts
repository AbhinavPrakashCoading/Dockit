import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
// Note: sharp removed for Vercel compatibility
// Enhancement pipeline temporarily disabled for MVP - Canvas API used instead
import { EnhancementStep, EnhancementType, MLToolConfig, DEFAULT_ML_CONFIG } from './types'

/**
 * AI/ML Enhancement Pipeline using Free Tools
 * 
 * Free Tools Integration:
 * 1. ESRGAN - AI Super Resolution (https://github.com/xinntao/ESRGAN)
 * 2. OpenCV - Image Processing (https://opencv.org/)
 * 3. Tesseract - OCR (https://github.com/tesseract-ocr/tesseract)
 * 4. Sharp - High-performance image processing (Node.js)
 * 5. MediaPipe - Face Detection (Google)
 * 6. waifu2x - Anime-style upscaling (Alternative)
 */
export class DocumentEnhancementPipeline {
  private config: MLToolConfig
  private tempDir: string

  constructor(config: Partial<MLToolConfig> = {}, tempDir: string = './temp') {
    this.config = { ...DEFAULT_ML_CONFIG, ...config }
    this.tempDir = tempDir
  }

  /**
   * Main enhancement pipeline coordinator
   */
  async enhance(
    inputBuffer: Buffer,
    enhancementTypes: EnhancementType[],
    mimeType: string
  ): Promise<{ buffer: Buffer; steps: EnhancementStep[] }> {
    const steps: EnhancementStep[] = []
    let currentBuffer = inputBuffer

    console.log(`🚀 Starting enhancement pipeline with: ${enhancementTypes.join(', ')}`)

    for (const type of enhancementTypes) {
      const startTime = Date.now()
      
      try {
        const result = await this.applyEnhancement(currentBuffer, type, mimeType)
        currentBuffer = result.buffer
        
        steps.push({
          type,
          parameters: result.parameters || {},
          toolUsed: result.toolUsed,
          processingTime: Date.now() - startTime,
          qualityImprovement: result.qualityImprovement,
          success: true
        })

        console.log(`✅ ${type} completed in ${Date.now() - startTime}ms`)
      } catch (error) {
        console.error(`❌ ${type} failed:`, error)
        steps.push({
          type,
          parameters: {},
          toolUsed: 'Unknown',
          processingTime: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { buffer: currentBuffer, steps }
  }

  /**
   * Apply individual enhancement
   */
  private async applyEnhancement(
    buffer: Buffer,
    type: EnhancementType,
    mimeType: string
  ): Promise<{ buffer: Buffer; toolUsed: string; parameters?: any; qualityImprovement?: number }> {
    
    switch (type) {
      case 'upscale':
        return await this.upscaleImage(buffer)
      
      case 'denoise':
        return await this.denoiseImage(buffer)
      
      case 'contrast':
        return await this.adjustContrast(buffer)
      
      case 'sharpen':
        return await this.sharpenImage(buffer)
      
      case 'color_correct':
        return await this.correctColors(buffer)
      
      case 'ocr':
        return await this.extractText(buffer)
      
      case 'face_detection':
        return await this.detectFaces(buffer)
      
      case 'document_analysis':
        return await this.analyzeDocument(buffer, mimeType)
      
      default:
        throw new Error(`Unknown enhancement type: ${type}`)
    }
  }

  /**
   * 1. UPSCALING - Passthrough mode for MVP (sharp removed for Vercel)
   */
  private async upscaleImage(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    // MVP: Enhancement disabled - returns original buffer
    // TODO: Implement with Canvas API or WASM-based solution
    console.warn('⚠️  Image upscaling disabled for MVP (sharp removed for Vercel compatibility)')
    
    return {
      buffer,
      toolUsed: 'Passthrough-MVP',
      parameters: { note: 'Enhancement disabled for Vercel deployment' }
    }
  }

  private async esrganUpscale(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    const inputPath = path.join(this.tempDir, `input_${Date.now()}.jpg`)
    const outputPath = path.join(this.tempDir, `output_${Date.now()}.jpg`)

    await fs.writeFile(inputPath, buffer)

    return new Promise((resolve, reject) => {
      // Assuming ESRGAN is installed and accessible
      const esrgan = spawn('python', [
        'esrgan/inference_esrgan.py',
        '--input', inputPath,
        '--output', outputPath,
        '--model_path', 'models/RRDB_ESRGAN_x4.pth'
      ])

      esrgan.on('close', async (code) => {
        try {
          if (code === 0) {
            const enhanced = await fs.readFile(outputPath)
            await fs.unlink(inputPath)
            await fs.unlink(outputPath)
            
            resolve({
              buffer: enhanced,
              toolUsed: 'ESRGAN-x4',
              parameters: { model: 'RRDB_ESRGAN_x4', factor: 4 }
            })
          } else {
            reject(new Error(`ESRGAN process exited with code ${code}`))
          }
        } catch (error) {
          reject(error)
        }
      })

      esrgan.on('error', reject)
    })
  }

  /**
   * 2. DENOISING - Passthrough mode for MVP
   */
  private async denoiseImage(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    console.warn('⚠️  Image denoising disabled for MVP')
    return { buffer, toolUsed: 'Passthrough-MVP', parameters: {} }
  }

  /**
   * 3. CONTRAST ENHANCEMENT - Passthrough mode for MVP
   */
  private async adjustContrast(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    console.warn('⚠️  Contrast adjustment disabled for MVP')
    return { buffer, toolUsed: 'Passthrough-MVP', parameters: {} }
  }

  /**
   * 4. SHARPENING - Passthrough mode for MVP
   */
  private async sharpenImage(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    console.warn('⚠️  Image sharpening disabled for MVP')
    return { buffer, toolUsed: 'Passthrough-MVP', parameters: {} }
  }

  /**
   * 5. COLOR CORRECTION - Passthrough mode for MVP
   */
  private async correctColors(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    console.warn('⚠️  Color correction disabled for MVP')
    return { buffer, toolUsed: 'Passthrough-MVP', parameters: {} }
  }

  /**
   * 6. OCR using Tesseract
   */
  private async extractText(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    if (!this.config.tesseractEnabled) {
      return { buffer, toolUsed: 'OCR-Disabled', parameters: {} }
    }

    const inputPath = path.join(this.tempDir, `ocr_input_${Date.now()}.jpg`)
    await fs.writeFile(inputPath, buffer)

    return new Promise((resolve, reject) => {
      const tesseract = spawn('tesseract', [
        inputPath,
        'stdout',
        '-l', this.config.tesseractLanguages.join('+'),
        '--psm', '6' // Assume uniform block of text
      ])

      let text = ''
      let error = ''

      tesseract.stdout.on('data', (data) => {
        text += data.toString()
      })

      tesseract.stderr.on('data', (data) => {
        error += data.toString()
      })

      tesseract.on('close', async (code) => {
        try {
          await fs.unlink(inputPath)
          
          if (code === 0) {
            resolve({
              buffer, // Return original buffer, text is stored separately
              toolUsed: 'Tesseract-5.0',
              parameters: { 
                languages: this.config.tesseractLanguages,
                extractedText: text.trim(),
                confidence: Math.random() * 30 + 70 // Placeholder confidence
              }
            })
          } else {
            reject(new Error(`Tesseract failed: ${error}`))
          }
        } catch (err) {
          reject(err)
        }
      })

      tesseract.on('error', reject)
    })
  }

  /**
   * 7. FACE DETECTION - Passthrough mode for MVP
   */
  private async detectFaces(buffer: Buffer): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    console.warn('⚠️  Face detection disabled for MVP')
    return {
      buffer,
      toolUsed: 'Passthrough-MVP',
      parameters: {
        facesDetected: 0,
        confidence: 0,
        boundingBoxes: []
      }
    }
  }

  /**
   * 8. DOCUMENT ANALYSIS - Basic passthrough for MVP
   */
  private async analyzeDocument(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; toolUsed: string; parameters: any }> {
    console.warn('⚠️  Document analysis simplified for MVP')
    
    // Basic metadata without image processing
    const metadata = {
      width: 0,
      height: 0,
      channels: 0,
      hasAlpha: false,
      density: 72,
      format: mimeType.split('/')[1] || 'jpeg',
    }
    
    const analysis = {
      dimensions: { width: 0, height: 0 },
      channels: 0,
      hasAlpha: false,
      density: 72,
      format: metadata.format,
      size: buffer.length,
      documentType: 'document',
      quality: 0.5,
      estimatedTextDensity: 0.5,
      backgroundType: 'uniform',
      recommendedEnhancements: []
    }

    return {
      buffer,
      toolUsed: 'DocumentAnalyzer-MVP-Passthrough',
      parameters: analysis
    }
  }

  private guessDocumentType(metadata: any, fileSize: number): string {
    const { width = 0, height = 0 } = metadata
    const aspectRatio = width / height

    if (aspectRatio > 0.6 && aspectRatio < 1.4) return 'photo'
    if (aspectRatio > 1.3) return 'certificate'
    if (fileSize < 50000) return 'signature'
    return 'document'
  }

  private assessImageQuality(metadata: any): number {
    const { width = 0, height = 0, density = 72 } = metadata
    const pixels = width * height
    
    // Basic quality scoring
    let score = 0.5
    if (pixels > 1000000) score += 0.2 // High resolution
    if (density > 150) score += 0.1 // Good DPI
    if (width > 800 && height > 600) score += 0.1 // Adequate size
    
    return Math.min(score, 1.0)
  }

  private recommendEnhancements(metadata: any): string[] {
    const recommendations: string[] = []
    const { width = 0, height = 0, density = 72 } = metadata

    if (width < 800 || height < 600) recommendations.push('upscale')
    if (density < 150) recommendations.push('sharpen')
    recommendations.push('contrast')
    
    return recommendations
  }

  /**
   * Batch processing capabilities
   */
  async enhanceBatch(
    files: { buffer: Buffer; filename: string; mimeType: string }[],
    enhancementTypes: EnhancementType[]
  ): Promise<{ filename: string; result: { buffer: Buffer; steps: EnhancementStep[] } | Error }[]> {
    const results = []

    for (const file of files) {
      try {
        const result = await this.enhance(file.buffer, enhancementTypes, file.mimeType)
        results.push({ filename: file.filename, result })
      } catch (error) {
        results.push({ filename: file.filename, result: error as Error })
      }
    }

    return results
  }
}

/**
 * FREE AI/ML TOOLS INSTALLATION GUIDE
 * 
 * 1. ESRGAN (AI Super Resolution):
 *    ```bash
 *    git clone https://github.com/xinntao/ESRGAN.git
 *    cd ESRGAN
 *    pip install torch torchvision torchaudio
 *    wget https://github.com/xinntao/ESRGAN/releases/download/v0.0.1/RRDB_ESRGAN_x4.pth
 *    ```
 * 
 * 2. Tesseract OCR:
 *    ```bash
 *    # Ubuntu/Debian
 *    sudo apt-get install tesseract-ocr tesseract-ocr-hin
 *    
 *    # macOS
 *    brew install tesseract tesseract-lang
 *    
 *    # Windows
 *    # Download from: https://github.com/UB-Mannheim/tesseract/wiki
 *    ```
 * 
 * 3. OpenCV (for advanced processing):
 *    ```bash
 *    pip install opencv-python opencv-contrib-python
 *    ```
 * 
 * 4. Sharp (Node.js, already included):
 *    ```bash
 *    npm install sharp
 *    ```
 * 
 * 5. MediaPipe (Google's ML framework):
 *    ```bash
 *    pip install mediapipe
 *    ```
 * 
 * 6. Alternative: waifu2x (Anime-style upscaling):
 *    ```bash
 *    git clone https://github.com/nagadomi/waifu2x.git
 *    ```
 * 
 * CLOUD FREE TIERS:
 * - Google Cloud Vision API: 1000 requests/month free
 * - Azure Cognitive Services: 5000 transactions/month free  
 * - AWS Rekognition: 5000 images/month free for first year
 */

export const enhancementPipeline = new DocumentEnhancementPipeline()