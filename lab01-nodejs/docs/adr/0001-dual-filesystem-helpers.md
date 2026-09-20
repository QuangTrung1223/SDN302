# Dual-style File System Helpers (Callback and Promises)

For Requirement 4 of Lab 02, we implement both callback-based (`fs.readFile`/`fs.writeFile`) and promise-based (`fs.promises` / async/await) helpers within `fileHelpers.js`.

The server route handlers use the promise-based helpers for clean, readable, non-blocking asynchronous control flow, while the callback helpers are exposed and verified via automated demo/test scripts to satisfy academic grading requirements.
