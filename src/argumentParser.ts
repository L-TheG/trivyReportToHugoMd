import { setOutDir } from "./consts.js";

export function getArguments() {
  const args = process.argv.slice(2);
  args.forEach((argument) => {
    if (argument.includes("--severity")) {
      severities = argument.split("=")[1].split(",");
    }
    if (argument.includes("--include")) {
      includedNamespaces = argument.split("=")[1].split(",");
    }
    if (argument.includes("--exclude")) {
      excludedNamespaces = argument.split("=")[1].split(",");
    }
    if (argument.includes("--outDir")) {
      setOutDir(argument.split("=")[1]);
    }
  });
  if (includedNamespaces.length > 0 && excludedNamespaces.length > 0) {
    console.log("Including and excluding namespaces at the same time does not work");
    process.exit(1);
  }
}

export let includedNamespaces: string[] = [];
export let excludedNamespaces: string[] = [];
export let severities: string[] = [];
