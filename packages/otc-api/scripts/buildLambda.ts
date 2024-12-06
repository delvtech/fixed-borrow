#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  createWriteStream,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import JSZip from "jszip";
import { compilerOptions } from "../src/tsconfig.json";

const outDir = resolve("src", compilerOptions.outDir);

// compile ts
const buildResult = spawnSync("tsc", ["--project", "src"], {
	stdio: "inherit",
});
if (buildResult.error) {
	console.error(buildResult.error);
	process.exit(1);
}

// install dependencies
const installResult = spawnSync("npm", ["install", "--production"], {
	stdio: "inherit",
	cwd: outDir,
});
if (installResult.error) {
	console.error(installResult.error);
	process.exit(1);
}

// add compiled files and dependencies to a new zip
const zipName = `${outDir}.zip`;
const zip = zipDir(outDir);

// add other files
zip.file("package.json", readFileSync("package.json"));
zip.file("README.md", readFileSync("README.md"));
zip.file(".env.example", readFileSync(".env.example"));

// write zip
zip
	.generateNodeStream({ type: "nodebuffer", streamFiles: true })
	.pipe(createWriteStream(zipName))
	.on("finish", () => {
		console.log(`Zipped lambda at ${zipName}`);
	});

// clean up
process.on("exit", () => {
	rmSync(outDir, { recursive: true, force: true });
});

function zipDir(dirPath: string, zipInstance?: JSZip | null) {
	const zip = zipInstance || new JSZip();
	const items = readdirSync(dirPath);

	for (const item of items) {
		const itemName = basename(item);
		const itemPath = join(dirPath, item);
		const stat = statSync(itemPath);

		if (stat.isFile()) {
			const fileData = readFileSync(itemPath);
			zip.file(itemName, fileData);
		} else if (stat.isDirectory()) {
			zipDir(itemPath, zip.folder(itemName));
		}
	}

	return zip;
}
