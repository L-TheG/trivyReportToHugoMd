export let outDir = "./output";
export const indexFileTemplate = "./hugoTemplates/indexFileTemplate.txt";
export const mainIndexFileTemplate = "./hugoTemplates/mainIndexFileTemplate.txt";
export const vulnTemplate = "./hugoTemplates/vulnerabilityReportTemplate.txt";
export const misconfTemplate = "./hugoTemplates/misconfigurationReportTemplate.txt";

export const setOutDir = (newDir: string) => (outDir = newDir);
