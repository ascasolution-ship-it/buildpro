const fs = require('fs');
const lines = fs.readFileSync('C:/Users/tycol/.gemini/antigravity/brain/64c508a1-5a97-47d8-accc-eb05ca529c07/.system_generated/logs/transcript.jsonl', 'utf8').trim().split('\n');
console.log('Total lines:', lines.length);
lines.forEach((line, idx) => {
  try {
    const p = JSON.parse(line);
    if (line.includes('pg') || line.includes('Client') || line.includes('pooler')) {
      console.log(`[Line ${idx} - Step ${p.step_index}] Source: ${p.source}`);
      if (p.content) console.log('  Content:', p.content.substring(0, 300).replace(/\n/g, ' '));
      if (p.tool_calls) console.log('  Tool Calls:', JSON.stringify(p.tool_calls).substring(0, 300));
    }
  } catch (e) {
    // ignore
  }
});
