import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create backup timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupName = `ai-knowledge-hub-backup-${timestamp}`;

console.log('🔵 Creating backup:', backupName);

// Create backup directory
const backupDir = path.join('..', backupName);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Get current git status
try {
  const gitStatus = execSync('git status --porcelain').toString();
  const gitBranch = execSync('git branch --show-current').toString().trim();
  const gitCommit = execSync('git rev-parse HEAD').toString().trim();
  
  // Create backup info file
  const backupInfo = {
    timestamp: new Date().toISOString(),
    branch: gitBranch,
    commit: gitCommit,
    uncommittedChanges: gitStatus.split('\n').filter(line => line.trim()),
    nodeVersion: process.version,
    platform: process.platform
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );
  
  console.log('📋 Backup info saved');
} catch (error) {
  console.error('⚠️ Git info error:', error.message);
}

// List of directories and files to backup
const itemsToBackup = [
  'src',
  'public',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  '.env.example',
  '.gitignore',
  'README.md',
  'CLAUDE.md',
  'supabase',
  '*.sql',
  '*.md',
  '*.js',
  '*.html'
];

// Copy files and directories
itemsToBackup.forEach(item => {
  const sourcePath = path.join('.', item);
  
  // Handle wildcards
  if (item.includes('*')) {
    const files = fs.readdirSync('.').filter(file => {
      if (item.startsWith('*')) {
        return file.endsWith(item.slice(1));
      }
      return false;
    });
    
    files.forEach(file => {
      try {
        const destPath = path.join(backupDir, file);
        fs.copyFileSync(file, destPath);
        console.log('✅ Backed up:', file);
      } catch (error) {
        console.error('❌ Error backing up', file, ':', error.message);
      }
    });
  } else {
    try {
      const destPath = path.join(backupDir, item);
      
      if (fs.existsSync(sourcePath)) {
        const stats = fs.statSync(sourcePath);
        
        if (stats.isDirectory()) {
          // Copy directory recursively
          copyDirectory(sourcePath, destPath);
          console.log('✅ Backed up directory:', item);
        } else {
          // Copy file
          fs.copyFileSync(sourcePath, destPath);
          console.log('✅ Backed up file:', item);
        }
      }
    } catch (error) {
      console.error('❌ Error backing up', item, ':', error.message);
    }
  }
});

// Helper function to copy directory recursively
function copyDirectory(source, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(dest, file);
    
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

console.log('\n✅ Backup completed successfully!');
console.log('📁 Backup location:', path.resolve(backupDir));
console.log('\n💡 To restore from this backup:');
console.log('1. Copy the backup folder to desired location');
console.log('2. Run: npm install');
console.log('3. Copy .env.local from your current setup');
console.log('4. Run: npm run dev');