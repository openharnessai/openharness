// 合成 dist/harnesses.json：从 data/harnesses/<id>.json 收集并按 id 排序输出。
// 源（可 review 的单文件）在 data/harnesses/，发布/分发的合并文件由这里生成，不手改。
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'data', 'harnesses');
const OUT = path.join(__dirname, '..', 'dist');

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.json'));
const list = files.map((f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')));
list.sort((a, b) => String(a.id).localeCompare(String(b.id)));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'harnesses.json'), JSON.stringify(list, null, 2) + '\n');
console.log('built dist/harnesses.json with ' + list.length + ' harnesses');
