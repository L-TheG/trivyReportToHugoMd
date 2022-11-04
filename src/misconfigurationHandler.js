import fs from "fs";
import { mergeChildrenWithParentObjs, sanitiseStringForMarkdown, reformatString } from "./utils.js";
import { misconfTemplate, outDir } from "./consts.js";

export function extractMisconfigurations(trivyJsonReport) {
  const reportEntries = trivyJsonReport.Misconfigurations;

  // remove all entries that have no results
  let targetableComponents = reportEntries.filter((entry) => entry.hasOwnProperty("Results"));

  // Split every result into its own object
  // merge that with parent object
  let flattenedTargets = mergeChildrenWithParentObjs(targetableComponents, "Results");

  // remove all targets without vulnerabilities
  let misconfiguredComponents = flattenedTargets.filter((target) => target.hasOwnProperty("Misconfigurations"));

  // Split every vulnerability into its own object
  // merge that with parent object
  let misconfigurations = mergeChildrenWithParentObjs(misconfiguredComponents, "Misconfigurations");
  let filteredMisconfigurations = misconfigurations.filter((misconf) => misconf.Severity === "HIGH" || misconf.Severity === "CRITICAL");

  return filteredMisconfigurations;
}

export async function createMisconfigurationFiles(misconfigurations) {
  const misconfigurationMarkdownTemplate = (await fs.promises.readFile(misconfTemplate)).toString();

  misconfigurations.forEach((misconf, index) => {
    let markdown = buildMisconfMarkdown(misconfigurationMarkdownTemplate, misconf);

    let dir = outDir + "/" + "Misconfigurations" + "/" + misconf.Severity + "/" + misconf.Namespace;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dir + "/" + misconf.AVDID + "-" + index + ".md", markdown);
  });
}

function buildMisconfMarkdown(template, misconf) {
  for (const [key, value] of Object.entries(misconf)) {
    const replaceString = reformatString(key);
    const regexp = new RegExp(`${replaceString}`, "gi");

    // convert part that points to specific code, to markdown code block
    if (key === "CauseMetadata") {
      const codeData = buildMisconfCodeBlock(value);
      template = template.replace("_codeBlock", codeData.code);
      template = template.replace("_firstLineNumber", codeData.startLine);
      const highlightLineString = codeData.linesToHighlight.toString().replace(new RegExp(",", "gi"), " ");
      template = template.replace("_linesToHighlight", highlightLineString);
    }

    // create expandable markdown list element
    if (Array.isArray(value)) {
      let arrayString = '{{%expand "' + key + '" %}}\n\n';
      value.forEach((element) => {
        arrayString = arrayString + "- " + element + "\n";
      });
      arrayString = arrayString + "{{% /expand%}}\n";
      template = template.replace(regexp, arrayString);

      // simply exchange template with object value
    } else {
      let stringToReplace = sanitiseStringForMarkdown(value);
      template = template.replace(regexp, stringToReplace);
    }
  }
  return template;
}

function buildMisconfCodeBlock(misconfData) {
  const startLine = misconfData.StartLine;
  const linesToHighlight = [];
  let code = "";
  misconfData.Code.Lines.forEach((line, index) => {
    code = code + line.Content + "\n";
    if (line.IsCause) linesToHighlight.push(index);
  });

  return {
    code: code,
    linesToHighlight: linesToHighlight,
    startLine: startLine,
  };
}
