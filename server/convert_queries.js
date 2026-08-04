const fs = require('fs');
const path = require('path');

const routeFiles = [
  'routes/quiz.js',
  'routes/auth.js', 
  'routes/admin.js',
  'routes/leaderboard.js'
];

function convertSQLQueryFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Ensure require is correct
  content = content.replace(/require\('\.\.\/db'\)/, "require('../db-postgresql')");
  
  // Fix datetime('now')
  content = content.replace(/datetime\('now'\)/g, 'CURRENT_TIMESTAMP');
  content = content.replace(/datetime\(\\'now\\'\)/g, 'CURRENT_TIMESTAMP');
  
  // Fix JULIANDAY calculations - these must be converted properly
  content = content.replace(
    /CAST\(ROUND\(\(JULIANDAY\(CURRENT_TIMESTAMP\) - JULIANDAY\(started_at\)\) \* 86400\) AS INTEGER\)/g,
    "CAST(ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)))::INTEGER)"
  );
  
  // Split by lines and process each line to track parameter placeholders
  let lines = content.split('\n');
  let inString = false;
  let stringChar = null;
  let paramCounter = 0;
  let output = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if line contains a db query
    if (line.match(/db\.(getOne|getAll|insert|update|query)\s*\(/)) {
      // Find all ? in quoted strings in this line and following lines until )
      let fullQuery = '';
      let j = i;
      let foundEnd = false;
      let quoteCount = 0;
      
      // Collect full query
      while (j < lines.length && !foundEnd) {
        fullQuery += lines[j] + '\n';
        
        // Count opening and closing parens/quotes
        if (lines[j].includes(');')) {
          foundEnd = true;
        }
        j++;
      }
      
      // Now convert placeholders in fullQuery
      // Find the SQL string part (between quotes)
      const sqlMatch = fullQuery.match(/(['"`])(.*?)\1/s);
      if (sqlMatch) {
        const sqlString = sqlMatch[0];
        const sqlContent = sqlMatch[2];
        
        // Count and replace ? with $1, $2, etc
        let paramNum = 1;
        let newSqlContent = sqlContent.replace(/\?/g, () => `$${paramNum++}`);
        let newSqlString = sqlString.charAt(0) + newSqlContent + sqlString.charAt(0);
        
        // Replace in fullQuery
        fullQuery = fullQuery.replace(sqlString, newSqlString);
      }
      
      // Split back into lines and add
      const newLines = fullQuery.split('\n');
      for (let nl of newLines) {
        if (nl.trim()) {
          output.push(nl);
        }
      }
      i = j - 1;
    } else {
      output.push(line);
    }
  }
  
  fs.writeFileSync(filePath, output.join('\n'));
}

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  console.log(`Converting: ${file}`);
  convertSQLQueryFile(filePath);
  console.log(`  ✅ Done`);
});

console.log('\n✅ All files converted!');
