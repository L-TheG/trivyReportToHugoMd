import { existsSync, mkdirSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { misconfTemplate, outDir } from "../consts.js";
import { Misconfiguration } from "../types/misconfigurationTypes.js";
import { reformatString, sanitiseStringForMarkdown } from "../utils.js";

export async function createMisconfigurationFiles(misconfigurations: Misconfiguration[]) {
  const misconfigurationMarkdownTemplate = (await readFile(misconfTemplate)).toString();

  misconfigurations.forEach((misconf, index) => {
    let markdown = buildMisconfMarkdown(misconfigurationMarkdownTemplate, misconf);

    let dir = outDir + "/" + "Misconfigurations" + "/" + misconf.Severity + "/" + misconf.Namespace;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(dir + "/" + misconf.AVDID + "-" + index + ".md", markdown);
  });
}

function buildMisconfMarkdown(template: string, misconfiguration: Misconfiguration) {
  for (const [key, value] of Object.entries(misconfiguration)) {
    const replaceString = reformatString(key);
    const regexp = new RegExp(`${replaceString}`, "gi");

    // convert part that points to specific code, to markdown code block
    if (key === "CauseMetadata") {
      const backupTemplate = template;
      try {
        const codeData = buildMisconfCodeBlock(misconfiguration["CauseMetadata"]);
        template = template.replace("_codeBlock", codeData.code);
        template = template.replace("_firstLineNumber", codeData.startLine.toString());
        const highlightLineString = codeData.linesToHighlight.toString().replace(new RegExp(",", "gi"), " ");
        template = template.replace("_linesToHighlight", highlightLineString);
      } catch (e) {
        template = backupTemplate;
      }
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

function buildMisconfCodeBlock(misconfData: Misconfiguration["CauseMetadata"]) {
  const startLine = misconfData.StartLine;
  const linesToHighlight: number[] = [];
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
