export let outDir = "./src/data/out";
export const indexFileTemplate = "./src/data/templates/indexFileTemplate.txt";
export const mainIndexFileTemplate = "./src/data/templates/mainIndexFileTemplate.txt";
export const vulnTemplate = "./src/data/templates/vulnerabilityReportTemplate.txt";
export const misconfTemplate = "./src/data/templates/misconfigurationReportTemplate.txt";

export function changeOutDir(newOutDir) {
  outDir = newOutDir;
}
