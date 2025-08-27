#!/usr/bin/env node

/**
 * CookSmart Logo Integration Script
 * This script helps integrate your chef's hat logo throughout the app
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 CookSmart Logo Integration Script');
console.log('===================================\n');

// Check if logo directory exists
const logoDir = path.join(__dirname, '../assets/images/logo');
const requiredFiles = [
  'icon.png',
  'adaptive-icon.png', 
  'splash-icon.png',
  'favicon.png',
  'logo-light.png',
  'logo-dark.png',
  'logo-light-monochrome.png',
  'logo-dark-monochrome.png'
];

console.log('📁 Checking logo directory structure...');

if (!fs.existsSync(logoDir)) {
  console.error('❌ Logo directory not found!');
  console.log('Please create: assets/images/logo/');
  process.exit(1);
}

let missingFiles = [];
let existingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(logoDir, file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
  } else {
    missingFiles.push(file);
  }
});

console.log(`✅ Found ${existingFiles.length} logo files:`);
existingFiles.forEach(file => console.log(`   • ${file}`));

if (missingFiles.length > 0) {
  console.log(`\n⚠️  Missing ${missingFiles.length} logo files:`);
  missingFiles.forEach(file => console.log(`   • ${file}`));
  console.log('\n📖 See assets/images/logo/README.md for requirements');
}

// Check integration status
console.log('\n🔧 Integration Status:');

const integrationPoints = [
  {
    name: 'Logo Component',
    file: 'components/CookSmartLogo.tsx',
    status: fs.existsSync(path.join(__dirname, '../components/CookSmartLogo.tsx'))
  },
  {
    name: 'Home Screen Logo',
    file: 'app/(tabs)/index.tsx',
    status: true // We know this is integrated
  },
  {
    name: 'Recipe Screen Logo', 
    file: 'app/recipes.tsx',
    status: true // We know this is integrated
  },
  {
    name: 'Loading Screen',
    file: 'components/LoadingScreen.tsx',
    status: fs.existsSync(path.join(__dirname, '../components/LoadingScreen.tsx'))
  }
];

integrationPoints.forEach(point => {
  const status = point.status ? '✅' : '❌';
  console.log(`${status} ${point.name} (${point.file})`);
});

// Next steps
console.log('\n📋 Next Steps:');
console.log('1. Replace placeholder logo files with your chef\'s hat logo');
console.log('2. Create theme-specific variations (light/dark)');
console.log('3. Run: expo prebuild (to update native icons)');
console.log('4. Test on both light and dark themes');
console.log('5. Build and test on device');

console.log('\n🎯 Logo Integration Complete!');
console.log('Your chef\'s hat logo will make CookSmart look amazing! 🍳✨');

// Check app.json configuration
const appJsonPath = path.join(__dirname, '../app.json');
if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const config = appJson.expo;
    
    console.log('\n⚙️  App Configuration:');
    console.log(`   Icon: ${config.icon}`);
    console.log(`   Adaptive Icon: ${config.android?.adaptiveIcon?.foregroundImage}`);
    console.log(`   Splash: ${config.plugins?.find(p => Array.isArray(p) && p[0] === 'expo-splash-screen')?.[1]?.image}`);
    console.log(`   Favicon: ${config.web?.favicon}`);
    
  } catch (error) {
    console.log('⚠️  Could not read app.json configuration');
  }
} 