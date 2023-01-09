import { MergedMisconfigurationComponentResult, Misconfiguration, MisconfigurationScannedComponent } from "../types/misconfigurationTypes.js";

export function getMisconfiguredComponents(scannedComponents: MisconfigurationScannedComponent[]) {
  // remove all entries that have no results
  let targetableComponents = scannedComponents.filter((component) => component.hasOwnProperty("Results"));

  // Merge the scanned Components (parent) with its results (child)
  let scanResults: MergedMisconfigurationComponentResult[] = [];
  targetableComponents.forEach((component) => (scanResults = scanResults.concat(mergeResultWithEntry(component))));

  // remove all non misconfigured results
  let misconfiguredResults = scanResults.filter((result) => result.Misconfigurations != undefined);

  // Merge the targetable Components (parent) with its vulnerabilies (child)
  let misconfigurations: Misconfiguration[] = [];
  misconfiguredResults.forEach((result) => (misconfigurations = misconfigurations.concat(mergeMisconfigurationWithResult(result))));

  return misconfigurations;
}

// remove nesting
function mergeResultWithEntry(scannedComponent: MisconfigurationScannedComponent): MergedMisconfigurationComponentResult[] {
  const merged: MergedMisconfigurationComponentResult[] = [];
  scannedComponent.Results!.forEach((result) => {
    merged.push({
      Kind: scannedComponent.Kind,
      Name: scannedComponent.Name,
      Namespace: scannedComponent.Namespace,
      Class: result.Class,
      Type: result.Type,
      Target: result.Target,
      MisconfSummary: result.MisconfSummary,
      Misconfigurations: result.Misconfigurations,
    });
  });
  return merged;
}

// Remove nesting
function mergeMisconfigurationWithResult(result: MergedMisconfigurationComponentResult) {
  const merged: Misconfiguration[] = [];

  result.Misconfigurations!.forEach((misconfiguration) => {
    merged.push({
      Kind: result.Kind,
      Name: result.Name,
      Namespace: result.Namespace,
      Class: result.Class,
      Type: result.Type,
      Target: result.Target,
      MisconfSummary: result.MisconfSummary,
      AVDID: misconfiguration.AVDID,
      CauseMetadata: misconfiguration.CauseMetadata,
      Description: misconfiguration.Description,
      ID: misconfiguration.ID,
      Layer: misconfiguration.Layer,
      Message: misconfiguration.Message,
      Misconfiguration_Namespace: misconfiguration.Namespace,
      PrimaryURL: misconfiguration.PrimaryURL,
      Query: misconfiguration.Query,
      References: misconfiguration.References,
      Resolution: misconfiguration.Resolution,
      Severity: misconfiguration.Severity,
      Status: misconfiguration.Status,
      Title: misconfiguration.Title,
      Misconfiguration_Type: misconfiguration.Type,
    });
  });
  return merged;
}
