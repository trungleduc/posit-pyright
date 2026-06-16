#!/usr/bin/env node
// Generates typeshed.json from the typeshed-fallback/stdlib directory.
// Output: dist/typeshed.json
// Format: { "/typeshed/stdlib/<path>": "<file contents>", ... }

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const typeshedDir = path.resolve(__dirname, "../pyright-internal/typeshed-fallback/stdlib");
const outFile = path.resolve(__dirname, "dist/typeshed.json");

function walkDir(dir, prefix, result = {}) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const fullPath = path.join(dir, entry.name);
        const relPath = prefix + entry.name;
        if (entry.isDirectory()) {
            walkDir(fullPath, relPath + "/", result);
        } else if (!entry.name.startsWith(".")) {
            result["/typeshed/stdlib/" + relPath] = fs.readFileSync(fullPath, "utf8");
        }
    }
    return result;
}

const contents = walkDir(typeshedDir, "");

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(contents));

console.log(`Wrote ${Object.keys(contents).length} files to ${outFile}`);
