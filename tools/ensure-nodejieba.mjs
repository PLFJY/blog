import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nodeMajor = Number(process.versions.node.split('.')[0]);

if (nodeMajor !== 22) {
  console.error(
    `This project uses nodejieba native bindings for Hexo recommendations. Use Node 22 first; current Node is ${process.version}.`,
  );
  console.error('Run `nvm use` in this repository, then retry.');
  process.exit(1);
}

function nodejiebaWorks() {
  try {
    const entry = require.resolve('nodejieba');
    delete require.cache[entry];

    const nodejieba = require('nodejieba');
    nodejieba.cut('本地构建测试');
    return true;
  } catch (_) {
    return false;
  }
}

if (nodejiebaWorks()) {
  process.exit(0);
}

const packageJsonPath = require.resolve('nodejieba/package.json');
const packageDir = dirname(packageJsonPath);
const binName = process.platform === 'win32' ? 'node-pre-gyp.cmd' : 'node-pre-gyp';
const nodePreGypBin = join(packageDir, 'node_modules', '.bin', binName);

execFileSync(nodePreGypBin, ['install', '--fallback-to-build'], {
  cwd: packageDir,
  stdio: 'inherit',
});

if (!nodejiebaWorks()) {
  console.error('nodejieba binding installation finished, but the binding still cannot be loaded.');
  process.exit(1);
}
