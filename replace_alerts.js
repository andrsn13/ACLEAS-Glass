const fs = require('fs');

const files = [
  './components/Modules/DailyPipeline.tsx',
  './components/Modules/InputSession.tsx',
  './components/Modules/ConstructionJournal.tsx',
  './components/Modules/AIConversation.tsx',
  './components/Modules/Settings.tsx',
  './components/Modules/OutputTrainer.tsx',
  './components/Modules/Pronunciation.tsx',
  './components/Modules/WeeklyReview.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    // Add import { toast } from '@/lib/toast'; if not exists
    if (!content.includes('import { toast }')) {
      // Find the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + "import { toast } from '@/lib/toast';\n" + content.slice(nextLineIndex + 1);
      } else {
        content = "import { toast } from '@/lib/toast';\n" + content;
      }
    }
    
    // Replace alert( with toast(
    content = content.replace(/alert\(/g, 'toast(');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
