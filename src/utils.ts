import { readdirSync, statSync } from "fs";
import path from "path";

export function countSeverityKinds(resultsArray: { Severity: string }[]) {
  let severites = {
    criticalSeverity: 0,
    highSeverity: 0,
    overallCount: resultsArray.length,
  };

  resultsArray.forEach((result) => {
    switch (result.Severity) {
      case "CRITICAL":
        severites.criticalSeverity = severites.criticalSeverity + 1;
        break;
      case "HIGH":
        severites.highSeverity = severites.highSeverity + 1;
        break;
      default:
        break;
    }
  });
  return severites;
}

// makes first chat lowercase and prefixes _ to the string
export function reformatString(value: string) {
  return "_" + value.slice(0, 1).toLocaleLowerCase() + value.slice(1);
}

// Removes or escapes parts of strings that break mardown files
export function sanitiseStringForMarkdown(value: any) {
  if (value === undefined) return;

  let result = value.toString().replace(new RegExp(/\\/g), "\\\\");
  result = result.replace(/"/g, '\\"');
  result = result.replace(/\n/g, "");
  return result;
}

export function getDirectoriesRecursive(srcpath: string): string[] {
  return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}

function flatten(lists: any) {
  return lists.reduce((a: any, b: any) => a.concat(b), []);
}
function getDirectories(srcpath: string) {
  return readdirSync(srcpath)
    .map((file) => path.join(srcpath, file))
    .filter((path) => statSync(path).isDirectory());
}
