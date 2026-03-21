// Patch: suppress Vite's os.networkInterfaces() call on Windows
// which can cause "spawn UNKNOWN" / ENOBUFS errors in some Node + Windows combos.
const os = require('os');

const original = os.networkInterfaces;
os.networkInterfaces = function patchedNetworkInterfaces() {
  try {
    return original.call(this) || {};
  } catch {
    return {};
  }
};
