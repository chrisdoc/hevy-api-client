#!/usr/bin/env node

/**
 * Script to extract the OpenAPI specification from Hevy's Swagger UI
 * and save it as a JSON file for reference and tooling.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetch and extract the OpenAPI spec from Hevy's Swagger UI
 */
async function extractHevyOpenApiSpec() {
  console.log('🔍 Fetching OpenAPI spec from Hevy Swagger UI...');
  
  try {
    // Fetch the swagger-ui-init.js file which contains the spec
    const response = await fetch('https://api.hevyapp.com/docs/swagger-ui-init.js', {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Swagger UI init script: ${response.status} ${response.statusText}`);
    }
    
    const scriptContent = await response.text();
    
    if (!scriptContent || scriptContent.trim().length === 0) {
      throw new Error('Received empty response from Swagger UI endpoint');
    }
    
    // Extract the spec from the SwaggerUIBundle configuration
    // Look for the pattern: "swaggerDoc": { ... }
    const specMatch = scriptContent.match(/"swaggerDoc":\s*(\{[\s\S]*?)\s*,\s*"customOptions":/);
    
    if (!specMatch) {
      console.log('Failed to find "swaggerDoc" pattern. Available patterns:');
      const patterns = [
        /"spec":\s*(\{[\s\S]*?\})/,
        /"swagger":\s*(\{[\s\S]*?\})/,
        /"openapi":\s*(\{[\s\S]*?\})/,
        /spec:\s*(\{[\s\S]*?\})/
      ];
      
      for (const pattern of patterns) {
        if (scriptContent.match(pattern)) {
          console.log(`Found alternative pattern: ${pattern.source}`);
        }
      }
      
      throw new Error('Could not find OpenAPI spec in Swagger UI init script. The format may have changed.');
    }
    
    // Parse the extracted spec
    let specString = specMatch[1];
    
    // Handle any JavaScript-specific syntax that might cause JSON parsing issues
    // Replace undefined with null
    specString = specString.replace(/:\s*undefined/g, ': null');
    
    let spec;
    try {
      // Try to evaluate as JavaScript to get the actual object
      // This is safe since we're extracting from a trusted source
      spec = eval(`(${specString})`);
    } catch (evalError) {
      console.error('Failed to evaluate extracted JavaScript object:', evalError.message);
      console.log('First 500 characters of extracted string:', specString.substring(0, 500));
      throw new Error(`Invalid JavaScript object in OpenAPI spec: ${evalError.message}`);
    }
    
    // Validate the spec structure
    if (!spec || typeof spec !== 'object') {
      throw new Error('Extracted spec is not a valid object');
    }
    
    if (!spec.openapi && !spec.swagger) {
      throw new Error('Extracted object is not a valid OpenAPI/Swagger specification');
    }
    
    if (!spec.info) {
      throw new Error('OpenAPI spec missing required "info" section');
    }
    
    if (!spec.paths) {
      console.warn('⚠️  OpenAPI spec missing "paths" section - no API endpoints found');
    }
    
    console.log('✅ Successfully extracted OpenAPI specification from live API');
    console.log(`📊 Found ${Object.keys(spec.paths || {}).length} API endpoints`);
    console.log(`🔧 Found ${Object.keys(spec.components?.schemas || {}).length} schema definitions`);
    console.log(`📝 API version: ${spec.info?.version || 'unknown'}`);
    console.log(`🏷️  API title: ${spec.info?.title || 'unknown'}`);
    
    return spec;
    
  } catch (error) {
    console.error('❌ Error extracting OpenAPI spec:', error.message);
    
    // Provide helpful debugging information
    if (error.message.includes('fetch') || error.message.includes('timeout')) {
      console.error('   💡 This might be a network connectivity issue or the endpoint is down.');
      console.error('   💡 Try visiting https://api.hevyapp.com/docs/ in your browser to verify.');
    } else if (error.message.includes('JSON') || error.message.includes('JavaScript')) {
      console.error('   💡 The response format may have changed. Consider updating the extraction logic.');
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Hevy OpenAPI extraction...');
    
    // Extract the OpenAPI spec (live or cached)
    const spec = await extractHevyOpenApiSpec();
    
    // Set up output paths
    const outputPath = path.join(__dirname, '..', 'docs', 'hevy-openapi-spec.json');
    const docsDir = path.dirname(outputPath);
    
    // Ensure docs directory exists
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Write the spec to file
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
    
    console.log(`✅ Hevy OpenAPI specification saved to: ${outputPath}`);
    console.log(`📊 Spec contains ${Object.keys(spec.paths || {}).length} API endpoints`);
    console.log(`🔧 Schema definitions: ${Object.keys(spec.components?.schemas || {}).length}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
