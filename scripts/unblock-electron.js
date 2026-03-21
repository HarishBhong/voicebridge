const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

if (process.platform !== 'win32') {
  process.exit(0);
}

const electronDist = path.join(__dirname, '..', 'node_modules', 'electron', 'dist');
const electronExe = path.join(electronDist, 'electron.exe');

if (!existsSync(electronExe)) {
  console.log('[unblock-electron] electron.exe not found. Skipping.');
  process.exit(0);
}

const psScript = [
  "$ErrorActionPreference='SilentlyContinue'",
  `$paths = @('${electronDist.replace(/'/g, "''")}')`,
  "foreach ($p in $paths) {",
  "  if (Test-Path $p) {",
  "    Get-ChildItem -Path $p -Recurse -File | Unblock-File",
  "  }",
  "}",
].join('; ');

const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
  stdio: 'inherit',
  windowsHide: true,
});

if (result.error) {
  console.log('[unblock-electron] Unable to run PowerShell unblock step.');
  process.exit(0);
}

console.log('[unblock-electron] Completed.');
