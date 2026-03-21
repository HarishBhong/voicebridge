const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const appArg = args.length > 0 ? args : ['.'];
const electronBinary = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'electron.exe');

const runWithNodeSpawn = () =>
  new Promise((resolve, reject) => {
    const child = spawn(electronBinary, appArg, {
      stdio: 'inherit',
      windowsHide: false,
    });

    child.once('error', (error) => reject(error));
    child.once('exit', (code) => resolve(typeof code === 'number' ? code : 0));
  });

const runWithPowerShellFallback = () =>
  new Promise((resolve, reject) => {
    const escapedPath = electronBinary.replace(/'/g, "''");
    const escapedArgs = appArg.map((value) => `'${String(value).replace(/'/g, "''")}'`).join(', ');

    const command =
      "$ErrorActionPreference='Stop'; " +
      `$p = Start-Process -FilePath '${escapedPath}' -ArgumentList @(${escapedArgs}) -PassThru -Wait; ` +
      'exit $p.ExitCode';

    const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command], {
      stdio: 'inherit',
      windowsHide: false,
    });

    child.once('error', (error) => reject(error));
    child.once('exit', (code) => resolve(typeof code === 'number' ? code : 0));
  });

(async () => {
  try {
    const exitCode = await runWithNodeSpawn();
    process.exit(exitCode);
  } catch (error) {
    if (process.platform !== 'win32') {
      console.error(error?.message || String(error));
      process.exit(1);
    }

    try {
      const exitCode = await runWithPowerShellFallback();
      process.exit(exitCode);
    } catch (fallbackError) {
      console.error('Electron launch failed.');
      console.error(fallbackError?.message || String(fallbackError));
      process.exit(1);
    }
  }
})();
