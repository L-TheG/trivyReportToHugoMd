import fs from "fs";
import path from "path";

export function countSeverityKinds(resultsArray) {
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

// Removes or escapes parts of strings that break mardown files
export function sanitiseStringForMarkdown(value) {
  let result = value.toString().replace(new RegExp(/\\/g), "\\\\");
  result = result.replace(/"/g, '\\"');
  result = result.replace(/\n/g, "");
  return result;
}

// Split every _childObj_ into its own component
// add all its parents properties to it
export function mergeChildrenWithParentObjs(listOfObjects, childObjName) {
  let returnObject = [];
  listOfObjects.forEach((currentObj) => {
    currentObj[childObjName].forEach((element) => {
      let finalEntry = Object.assign({}, element, currentObj);
      delete finalEntry[childObjName];
      returnObject.push(finalEntry);
    });
  });
  return returnObject;
}

// makes first chat lowercase and prefixes _ to the string
export function reformatString(value) {
  return "_" + value.slice(0, 1).toLocaleLowerCase() + value.slice(1);
}

export function getDirectoriesRecursive(srcpath) {
  return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}

function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b), []);
}

function getDirectories(srcpath) {
  return fs
    .readdirSync(srcpath)
    .map((file) => path.join(srcpath, file))
    .filter((path) => fs.statSync(path).isDirectory());
}
