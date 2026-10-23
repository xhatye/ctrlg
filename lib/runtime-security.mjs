// Minimum security releases for the Node.js advisory published 2026-10-21.
// https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
const minimumByMajor = {22:[23,4],24:[22,1],26:[12,1]};

export function nodeRuntimePatched(version) {
  const match = typeof version === 'string' && /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return false;
  const [,major,minor,patch] = match.map(Number);
  const minimum = minimumByMajor[major];
  return Boolean(minimum && (minor > minimum[0] || minor === minimum[0] && patch >= minimum[1]));
}

export function assertPatchedNode(version = process.versions.node) {
  if (!nodeRuntimePatched(version)) {
    throw new Error('Node.js security update required: use patched Node.js 22.23.4, 24.22.1, 26.12.1 or a later update in these release lines.');
  }
}
