// In restricted Windows hosts, Vite's optional `net use` probe can throw synchronously.
// Preserve the normal callback error contract; no required subprocess is emulated.
import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
const original = cp.exec;
cp.exec = function (command, ...args) {
  try {
    return original(command, ...args);
  } catch (error) {
    const cb = args.at(-1);
    if (command === "net use" && typeof cb === "function") {
      queueMicrotask(() => cb(error, "", ""));
      return;
    }
    throw error;
  }
};
syncBuiltinESMExports();
