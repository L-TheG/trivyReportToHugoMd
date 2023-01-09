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
  });
  if (includedNamespaces !== undefined && excludedNamespaces !== undefined) {
    console.log("Including and excluding namespaces at the same time does not work");
    process.exit(1);
  }
}

export let includedNamespaces: string[];
export let excludedNamespaces: string[];
export let severities: string[];
