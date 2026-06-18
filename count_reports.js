const fs = require('fs');
const reports = JSON.parse(fs.readFileSync('damage-report/reports.json', 'utf8'));
console.log(reports.length);