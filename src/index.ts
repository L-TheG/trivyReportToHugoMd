import { readFileSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { sep } from "path";
import { getArguments, severities } from "./argumentParser.js";
import { indexFileTemplate, mainIndexFileTemplate, outDir } from "./consts.js";
import { createMisconfigurationFiles } from "./markdownCreation/misconfigurationMarkdownCreator.js";
import { createVulnerabilityFiles } from "./markdownCreation/vulnerabilityMarkdownCreator.js";
import { getMisconfiguredComponents } from "./reportDataTransformation/misconfigurationDataTransformer.js";
import { getVulnerableComponents } from "./reportDataTransformation/vulnerabilityDataTransformer.js";
import { TrivyReport } from "./types/generalTypes.js";
import { Misconfiguration } from "./types/misconfigurationTypes.js";
import { Vulnerability } from "./types/vulnerabilityTypes.js";
import { countSeverityKinds, getDirectoriesRecursive } from "./utils.js";

// TODO: look at rook-ceph vulns. Vulns with no title etc. should not show up as _title.md

await main();

async function main() {
  getArguments();
  const trivyJsonReport: TrivyReport = JSON.parse(readFileSync("./report.json", "utf-8"));

  const vulnerabilities: Vulnerability[] = getVulnerableComponents(trivyJsonReport.Vulnerabilities).filter((vulnerability) => {
    if (severities.length > 0) {
      severities.includes(vulnerability.Severity);
    } else {
      true;
    }
  });

  const misconfigurations: Misconfiguration[] = getMisconfiguredComponents(trivyJsonReport.Misconfigurations).filter((misconfiguration) => {
    if (severities.length > 0) {
      severities.includes(misconfiguration.Severity);
    } else {
      true;
    }
  });

  console.log(vulnerabilities.length, " Vulnerabilities with severity: ", severities, " found.");
  console.log(misconfigurations.length, " Misconfigurations with severity: ", severities, " found.");

  const vulnSeverityCounts = countSeverityKinds(vulnerabilities);
  const misconfSeverityCounts = countSeverityKinds(misconfigurations);

  await createVulnerabilityFiles(vulnerabilities);
  await createMisconfigurationFiles(misconfigurations);
  await createIndexFiles(trivyJsonReport.ClusterName, vulnSeverityCounts, misconfSeverityCounts);
}

// Each directory needs its own index file
async function createIndexFiles(
  cluserName: string,
  vulnSeverityCounts: { criticalSeverity: number; highSeverity: number; overallCount: number },
  misconfSeverityCounts: { criticalSeverity: number; highSeverity: number; overallCount: number }
) {
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

      indexText = indexText.replace("_vulnCount", vulnSeverityCounts.overallCount.toString());
      indexText = indexText.replace("_criticalVuln", vulnSeverityCounts.criticalSeverity.toString());
      indexText = indexText.replace("_highVuln", vulnSeverityCounts.highSeverity.toString());

      indexText = indexText.replace("_misconfCount", misconfSeverityCounts.overallCount.toString());
      indexText = indexText.replace("_criticalMisconf", misconfSeverityCounts.criticalSeverity.toString());
      indexText = indexText.replace("_highMisconf", misconfSeverityCounts.highSeverity.toString());

      // indexText = indexText.replace("_misconfCount", misconfCount);

      writeFileSync(dir + "/" + "_index.md", indexText);
    } else {
      writeFileSync(dir + "/" + "_index.md", indexTemplate.replace("_title", title));
    }
  });
}
