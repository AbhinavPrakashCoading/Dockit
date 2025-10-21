#!/usr/bin/env tsx
/**
 * TypeScript Schema Extraction Server
 * Provides HTTP API for the schema extraction engine
 */

import express from 'express';
import cors from 'cors';
import { SchemaExtractionEngine } from './src/engines/schema-extraction/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize the schema extraction engine
const engine = new SchemaExtractionEngine({
    maxSearchResults: 15,
    timeout: 45000,
    includeOfficialOnly: true,
    preferPdfs: true
});

// Serve the main UI
app.get('/', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'typescript-schema-tool.html'));
});

// Health check
app.get('/health', (req: any, res: any) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'TypeScript Schema Extraction Server is running',
        engine: 'Full TypeScript Engine with Web Scraping'
    });
});

// Main schema extraction endpoint
app.post('/api/extract-schema', async (req: any, res: any) => {
    try {
        const { examName } = req.body;
        
        if (!examName || typeof examName !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'examName is required and must be a string'
            });
        }
        
        console.log(`🔍 Extracting schema for: ${examName}`);
        
        const startTime = Date.now();
        const schema = await engine.generateExamSchema(examName);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Schema extracted in ${duration}ms`);
        
        res.json({
            success: true,
            schema,
            meta: {
                processingTime: duration,
                timestamp: new Date().toISOString(),
                engine: 'TypeScript with Real Web Scraping'
            }
        });
        
    } catch (error) {
        console.error('❌ Schema extraction error:', error);
        
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            meta: {
                timestamp: new Date().toISOString(),
                engine: 'TypeScript Engine'
            }
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 TypeScript Schema Extraction Server');
    console.log('━'.repeat(50));
    console.log(`   Server:     http://localhost:${PORT}`);
    console.log(`   API:        http://localhost:${PORT}/api/extract-schema`);
    console.log(`   Health:     http://localhost:${PORT}/health`);
    console.log(`   Engine:     Full TypeScript with Web Scraping`);
    console.log('━'.repeat(50));
    console.log('💡 Features:');
    console.log('   ✅ Real web scraping and PDF extraction');
    console.log('   ✅ Intelligent fallback system');
    console.log('   ✅ Multi-source content aggregation');
    console.log('   ✅ Advanced schema inference');
    console.log('\n🌐 Open http://localhost:3002 in your browser!');
});