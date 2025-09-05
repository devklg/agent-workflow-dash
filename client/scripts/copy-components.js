#!/usr/bin/env node

/**
 * Script to copy Claude Dashboard components to Agent Dashboard
 * Run this AFTER running frontend_setup.js in claude-dashboard
 */

const fs = require('fs');
const path = require('path');

const sourcePath = 'D:\\claude-dashboard\\client\\src\\components';
const targetPath = path.join(__dirname, '..', 'src', 'components');

console.log('🚀 Copying Claude Dashboard components to Agent Dashboard...\n');
console.log('Source:', sourcePath);
console.log('Target:', targetPath);
console.log('');

// Check if source exists
if (!fs.existsSync(sourcePath)) {
  console.error('❌ ERROR: Claude Dashboard components not found!');
  console.error('   Expected location:', sourcePath);
  console.error('');
  console.error('   Please run the following first:');
  console.error('   cd D:\\claude-dashboard\\client');
  console.error('   node frontend_setup.js');
  process.exit(1);
}

// Function to copy directory recursively
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(childItem => {
      copyRecursive(
        path.join(src, childItem),
        path.join(dest, childItem)
      );
    });
  } else {
    // It's a file, copy it
    const content = fs.readFileSync(src, 'utf8');
    
    // Update import paths to use real API instead of mock data
    let updatedContent = content
      .replace(/from '..\/..\/data\/mockAgents'/g, "from '../../services/agentAPI'")
      .replace(/from '..\/..\/data\/mockProjects'/g, "from '../../services/agentAPI'")
      .replace(/from '..\/..\/data\/mockActivities'/g, "from '../../services/agentAPI'")
      .replace(/mockAgents/g, "agents")
      .replace(/mockProjects/g, "projects")
      .replace(/mockActivities/g, "activities");
    
    fs.writeFileSync(dest, updatedContent);
    console.log('✓ Copied:', path.relative(sourcePath, src));
  }
}

// Copy all components
try {
  copyRecursive(sourcePath, targetPath);
  
  console.log('\n✅ Successfully copied all components!');
  console.log('\n📝 Next steps:');
  console.log('   1. cd D:\\seo-learning-platform\\agent-dashboard\\client');
  console.log('   2. npm install');
  console.log('   3. npm start');
  console.log('\n🚀 Dashboard will be available at http://localhost:3000');
  
} catch (error) {
  console.error('❌ Error copying components:', error.message);
  process.exit(1);
}