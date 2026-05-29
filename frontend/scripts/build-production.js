#!/usr/bin/env node

/**
 * Production Build Script
 * 
 * This script performs a comprehensive production build with:
 * - Environment validation
 * - Dependency audit
 * - TypeScript type checking
 * - Production build
 * - Bundle analysis
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, colors.cyan + colors.bright)
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green)
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow)
}

function logError(message) {
  log(`✗ ${message}`, colors.red)
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: 'inherit',
      ...options,
    })
  } catch (error) {
    logError(`Command failed: ${command}`)
    throw error
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} found`)
    return true
  } else {
    logWarning(`${description} not found at ${filePath}`)
    return false
  }
}

async function main() {
  log('\n' + '='.repeat(60), colors.bright)
  log('  Production Build Script', colors.bright + colors.cyan)
  log('  Library Management System - Frontend', colors.bright)
  log('='.repeat(60) + '\n', colors.bright)

  try {
    // Step 1: Environment Validation
    logStep('1/6', 'Validating Environment')
    
    // Check for required files
    checkFile('.env.production', 'Production environment file')
    checkFile('next.config.mjs', 'Next.js configuration')
    checkFile('tsconfig.json', 'TypeScript configuration')
    checkFile('package.json', 'Package configuration')
    
    // Check Node version
    const nodeVersion = process.version
    log(`Node.js version: ${nodeVersion}`)
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    if (majorVersion < 18) {
      logError('Node.js 18 or higher is required')
      process.exit(1)
    }
    logSuccess('Node.js version is compatible')

    // Step 2: Dependency Check
    logStep('2/6', 'Checking Dependencies')
    
    if (!fs.existsSync('node_modules')) {
      log('Installing dependencies...')
      exec('npm ci')
    } else {
      logSuccess('Dependencies already installed')
    }

    // Security audit (non-blocking)
    log('\nRunning security audit...')
    try {
      exec('npm audit --production', { stdio: 'pipe' })
      logSuccess('No security vulnerabilities found')
    } catch (error) {
      logWarning('Security vulnerabilities detected. Run "npm audit" for details.')
    }

    // Step 3: TypeScript Type Checking
    logStep('3/6', 'Type Checking')
    
    try {
      exec('npx tsc --noEmit')
      logSuccess('TypeScript type checking passed')
    } catch (error) {
      logError('TypeScript type checking failed')
      logError('Fix type errors before building for production')
      process.exit(1)
    }

    // Step 4: Linting
    logStep('4/6', 'Linting Code')
    
    try {
      exec('npm run lint')
      logSuccess('Linting passed')
    } catch (error) {
      logWarning('Linting issues detected. Consider fixing before deployment.')
      // Don't exit - linting warnings shouldn't block production build
    }

    // Step 5: Production Build
    logStep('5/6', 'Building for Production')
    
    log('This may take a few minutes...\n')
    exec('npm run build')
    logSuccess('Production build completed')

    // Step 6: Build Analysis
    logStep('6/6', 'Analyzing Build')
    
    // Check build output
    const buildDir = '.next'
    if (fs.existsSync(buildDir)) {
      logSuccess('Build directory created')
      
      // Get build size
      try {
        const { execSync } = require('child_process')
        const sizeOutput = execSync(`du -sh ${buildDir}`, { encoding: 'utf-8' })
        log(`Build size: ${sizeOutput.split('\t')[0]}`)
      } catch (error) {
        // du command might not be available on Windows
        log('Build size: Unable to calculate')
      }
    } else {
      logError('Build directory not found')
      process.exit(1)
    }

    // Success summary
    log('\n' + '='.repeat(60), colors.green + colors.bright)
    log('  ✓ Production Build Successful!', colors.green + colors.bright)
    log('='.repeat(60) + '\n', colors.green + colors.bright)

    log('Next steps:')
    log('  1. Test the production build locally: npm run start')
    log('  2. Review the build output in the .next directory')
    log('  3. Deploy to your production environment')
    log('')

  } catch (error) {
    log('\n' + '='.repeat(60), colors.red + colors.bright)
    log('  ✗ Production Build Failed', colors.red + colors.bright)
    log('='.repeat(60) + '\n', colors.red + colors.bright)
    
    logError('Build process encountered an error')
    logError('Please review the error messages above and try again')
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  logError('Unexpected error occurred')
  console.error(error)
  process.exit(1)
})
