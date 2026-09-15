// Publish a fresh, allowlisted source snapshot without local Git history or credentials.
// Usage: GH_BIN=/path/to/gh node scripts/publish-github.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executable = process.env.GH_BIN || 'gh';
const repositoryName = 'english-learning-tracker';
const sourceDirectories = ['client', 'server', 'shared', 'public-site', 'scripts', 'docs'];
const sourceFiles = [
  'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.app.json',
  'tsconfig.node.json', 'vite.config.ts', 'vite.public.config.mts',
  'tailwind.config.ts', 'postcss.config.js', 'nest-cli.json', 'components.json',
  'eslint.config.js', '.stylelintrc.js', '.prettierrc', 'PUBLIC-README.md',
];
const allowedExtension = /\.(?:tsx?|mts|mjs|cjs|js|json|css|html|svg|md|sh)$/;
const entries = [];
const decoder = new TextDecoder('utf-8', { fatal: true });
function include(relative) {
  const bytes = fs.readFileSync(path.join(root, relative));
  const content = decoder.decode(bytes);
  const credentialPattern = /(?:postgres(?:ql)?:\/\/|gh[pousr]_[a-zA-Z0-9]{30,}|github_pat_[a-zA-Z0-9_]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
  if (credentialPattern.test(content)) throw new Error(`Credential-like content found in ${relative}; stopped.`);
  entries.push({ path: relative === 'PUBLIC-README.md' ? 'README.md' : relative, mode: relative.endsWith('.sh') ? '100755' : '100644', type: 'blob', content });
}
function walk(relative) {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (entry.isSymbolicLink() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const child = `${relative}/${entry.name}`;
    if (entry.isDirectory()) walk(child);
    else if (allowedExtension.test(child)) include(child);
  }
}
sourceDirectories.forEach(walk);
sourceFiles.forEach(include);
entries.push({ path: '.gitignore', mode: '100644', type: 'blob', content: 'node_modules/\ndist/\n.env\n.env.*\n.spark/\n.spark_project\n.logs/\nlogs/\n.agents/\n.claude/\n.DS_Store\n*.tsbuildinfo\n' });
entries.push({ path: 'docs/.nojekyll', mode: '100644', type: 'blob', content: '' });
console.log(`Prepared ${entries.length} public files; environment files, local history and logs excluded.`);
if (!process.argv.includes('--check')) {
  function api(endpoint, method = 'GET', body) {
    const args = ['api', endpoint, '--method', method];
    if (body) args.push('--input', '-');
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        return JSON.parse(execFileSync(executable, args, {
          input: body ? JSON.stringify(body) : undefined,
          encoding: 'utf8', maxBuffer: 12 * 1024 * 1024,
          stdio: ['pipe', 'pipe', 'pipe'],
        }));
      } catch (error) {
        const message = String(error.stderr || error.message);
        if (attempt === 4 || !/timeout|connection reset|502 Bad Gateway|503 Service Unavailable/i.test(message)) throw error;
        console.log(`GitHub request timed out; retry ${attempt}/3: ${endpoint}`);
      }
    }
  }
  const user = api('user');
  let repository;
  try {
    repository = api(`repos/${user.login}/${repositoryName}`);
    if (repository.private) throw new Error('Existing repository is private; stopped.');
    console.log(`Continuing in repository: ${repository.html_url}`);
  } catch (error) {
    if (!/404 Not Found|Not Found/i.test(String(error.stderr || error.message))) throw error;
    repository = api('user/repos', 'POST', {
      name: repositoryName, private: false, auto_init: true,
      description: 'nan 的英语学习记录 · Friends × English Originals · 荧光青学习热力图',
    });
    console.log(`Created repository: ${repository.html_url}`);
  }
  const repoPath = `repos/${user.login}/${repository.name}`;
  const branch = repository.default_branch;
  const ref = api(`${repoPath}/git/ref/heads/${branch}`);
  const previous = api(`${repoPath}/git/commits/${ref.object.sha}`);
  const tree = api(`${repoPath}/git/trees`, 'POST', { base_tree: previous.tree.sha, tree: entries });
  const commit = api(`${repoPath}/git/commits`, 'POST', {
    message: 'Publish English learning dashboard with neon mint theme',
    tree: tree.sha, parents: [ref.object.sha],
  });
  api(`${repoPath}/git/refs/heads/${branch}`, 'PATCH', { sha: commit.sha, force: false });
  const pages = api(`${repoPath}/pages`, 'POST', { build_type: 'legacy', source: { branch, path: '/docs' } });
  console.log(JSON.stringify({ repository: repository.html_url, page: pages.html_url, commit: commit.sha, status: pages.status }, null, 2));
  console.log('Pages requested. Verify the build status and public URL before claiming it is live.');
}
