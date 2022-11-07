import path from "path";
import fs from "fs";
import { getDirectoriesRecursive, countSeverityKinds } from "./utils.js";
import { createMisconfigurationFiles, extractMisconfigurations } from "./misconfigurationHandler.js";
import { extractVulnerabilities, createVulnerabilityFiles } from "./vulnerabilityHandler.js";
import { outDir, indexFileTemplate, mainIndexFileTemplate, changeOutDir } from "./consts.js";

/*
The json structure, generated by the trivy report can be found at the bottom of this file:
*/
await main();

async function main() {
  parseArgs();
  const trivyJsonReport = JSON.parse(await fs.promises.readFile("./src/data/report.json"));

  const vulnerabilities = extractVulnerabilities(trivyJsonReport);
  const vulnSeverityCounts = countSeverityKinds(vulnerabilities);

  const misconfigurations = extractMisconfigurations(trivyJsonReport);
  const misconfSeverityCounts = countSeverityKinds(misconfigurations);

  await createVulnerabilityFiles(vulnerabilities);
  await createMisconfigurationFiles(misconfigurations);

  await createIndexFiles(trivyJsonReport.ClusterName, vulnSeverityCounts, misconfSeverityCounts);
}

function parseArgs() {
  process.argv.forEach((element) => {
    if (element.includes("outDir=")) {
      let newOutDir = element.split("=")[1];
      changeOutDir(newOutDir);
    }
  });
}

// Each directory needs its own index file
async function createIndexFiles(cluserName, vulnSeverityCounts, misconfSeverityCounts) {
  const dirs = getDirectoriesRecursive(outDir);
  const indexTemplate = (await fs.promises.readFile(indexFileTemplate)).toString();
  const mainIndexTemplate = (await fs.promises.readFile(mainIndexFileTemplate)).toString();

  dirs.forEach((dir, index) => {
    const pathElements = dir.split(path.sep);
    const title = pathElements[pathElements.length - 1];
    // Top level index file has special title

    // the top level index file should contain some extra information
    if (index == 0) {
      let indexText = mainIndexTemplate.replace("_title", "Vulnerability Scan of Kubernetes cluster");
      indexText = indexText.replace("_clusterName", cluserName);

      indexText = indexText.replace("_vulnCount", vulnSeverityCounts.overallCount);
      indexText = indexText.replace("_criticalVuln", vulnSeverityCounts.criticalSeverity);
      indexText = indexText.replace("_highVuln", vulnSeverityCounts.highSeverity);

      indexText = indexText.replace("_misconfCount", misconfSeverityCounts.overallCount);
      indexText = indexText.replace("_criticalMisconf", misconfSeverityCounts.criticalSeverity);
      indexText = indexText.replace("_highMisconf", misconfSeverityCounts.highSeverity);

      // indexText = indexText.replace("_misconfCount", misconfCount);

      fs.writeFileSync(dir + "/" + "_index.md", indexText);
    } else {
      fs.writeFileSync(dir + "/" + "_index.md", indexTemplate.replace("_title", title));
    }
  });
}

/*
{
  "ClusterName": "string",
  "Misconfigurations": [
    {
      "Kind": "string",
      "Namespace": "string",
      "Name": "string",
      "Results": [
        {
          "Class": "string",
          "Target": "string",
          "Type": "string",
          "MisconfSummary": {
            "Successes": "integer",
            "Failures": "integer",
            "Exceptions": "integer"
          },
          "Misconfigurations": [
            {
              "Type": "string",
              "ID": "string",
              "AVDID": "string",
              "Title": "string",
              "Description": "string",
              "Message": "string",
              "Namespace": "string",
              "Query": "string",
              "Resolution": "string",
              "Severity": "string",
              "PrimaryURL": "string",
              "References": [
                "string"
              ],
              "Status": "string",
              "CauseMetadata": {
                "Provider": "string",
                "Service": "string",
                "StartLine": "integer",
                "EndLine": "integer",
                "Code": {
                  "Lines": [
                    {
                      "Number": "integer",
                      "Content": "string",
                      "IsCause": "boolean",
                      "Annotation": "string",
                      "Truncated": "boolean",
                      "FirstCause": "boolean",
                      "LastCause": "boolean"
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  ],
  "Vulnerabilities": [
    {
      "Kind": "string",
      "Namespace": "string",
      "Name": "string",
      "Results": [
        {
          "Class": "string",
          "Target": "string",
          "Type": "string",
          "Vulnerabilities": [
            {
              "VulnerabilityID": "string",
              "VendorIDs": [
                "string"
              ],
              "PkgName": "string",
              "InstalledVersion": "string",
              "FixedVersion": "string",
              "Layer": {
                "Digest": "string",
                "DiffID": "string"
              },
              "DataSource": {
                "ID": "string",
                "Name": "string",
                "URL": "string"
              },
              "Title": "string",
              "Severity": "string"
            }
          ]
        }
      ]
    }
  ]
}
*/
