import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { sep } from "path";
import { excludedNamespaces, getArguments, includedNamespaces, severities } from "./argumentParser.js";
import { indexFileTemplate, mainIndexFileTemplate, outDir } from "./consts.js";
import { createMisconfigurationFiles } from "./markdownCreation/misconfigurationMarkdownCreator.js";
import { createVulnerabilityFiles } from "./markdownCreation/vulnerabilityMarkdownCreator.js";
import { getMisconfiguredComponents } from "./reportDataTransformation/misconfigurationDataTransformer.js";
import { getVulnerableComponents } from "./reportDataTransformation/vulnerabilityDataTransformer.js";
import { Filterable, TrivyReport } from "./types/generalTypes.js";
import { Misconfiguration } from "./types/misconfigurationTypes.js";
import { Vulnerability } from "./types/vulnerabilityTypes.js";
import { getDirectoriesRecursive } from "./utils.js";

await main();

async function main() {
  getArguments();
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const trivyJsonReport: TrivyReport = JSON.parse(readFileSync("./report.json", "utf-8"));

  let vulnerabilities: Vulnerability[] = getVulnerableComponents(trivyJsonReport.Vulnerabilities);
  let misconfigurations: Misconfiguration[] = getMisconfiguredComponents(trivyJsonReport.Misconfigurations);

  // Filtering
  if (severities.length > 0) {
    vulnerabilities = vulnerabilities.filter((vulnerability) => severities.includes(vulnerability.Severity));
    misconfigurations = misconfigurations.filter((misconfiguration) => severities.includes(misconfiguration.Severity));
  }
  if (includedNamespaces.length > 0) {
    vulnerabilities = filterListsPartial(vulnerabilities, includedNamespaces, true) as Vulnerability[];
    misconfigurations = filterListsPartial(misconfigurations, includedNamespaces, true) as Misconfiguration[];
  }
  if (excludedNamespaces.length > 0) {
    vulnerabilities = filterListsPartial(vulnerabilities, excludedNamespaces, false) as Vulnerability[];
    misconfigurations = filterListsPartial(misconfigurations, excludedNamespaces, false) as Misconfiguration[];
  }

  console.log(vulnerabilities.length, " Vulnerabilities with severity: ", severities, " found.");
  console.log(misconfigurations.length, " Misconfigurations with severity: ", severities, " found.");

  await createVulnerabilityFiles(vulnerabilities);
  await createMisconfigurationFiles(misconfigurations);

  await createIndexFiles(trivyJsonReport.ClusterName);
}

// filters the vulnerabilities list, based on wether it contains any string from the filterList
// if includes === true, keep only the only the vulnerabilities containing any string from filter list
// if includes === false, remove any vulnerability NOT containing any string from filter list
function filterListsPartial<T extends Filterable>(vulnerabilities: T[], filterList: string[], include: boolean): T[] {
  let result: T[] = [];
  for (let vulnerability of vulnerabilities) {
    let match = false;
    for (let element2 of filterList) {
      if (vulnerability.Namespace !== undefined && vulnerability.Namespace.includes(element2) === include) {
        match = true;
        break;
      }
    }
    if (match) {
      result.push(vulnerability);
    }
  }
  return result;
}

// Each directory needs its own index file
async function createIndexFiles(cluserName: string) {
  const dirs = getDirectoriesRecursive(outDir);
  const indexTemplate = (await readFile(indexFileTemplate)).toString();
  const mainIndexTemplate = (await readFile(mainIndexFileTemplate)).toString();

  dirs.forEach((dir, index) => {
    const pathElements = dir.split(sep);
    const title = pathElements[pathElements.length - 1];
    // Top level index file has special title

    // the top level index file should contain some extra information
    if (index == 0) {
      let indexText = mainIndexTemplate.replace("_title", "Vulnerability Scan of Kubernetes cluster");
      indexText = indexText.replace("_clusterName", cluserName);
      writeFileSync(dir + "/" + "_index.md", indexText);
    } else {
      writeFileSync(dir + "/" + "_index.md", indexTemplate.replace("_title", title));
    }
  });
}
