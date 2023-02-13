import { MisconfigurationScannedComponent } from "./misconfigurationTypes";
import { VulnerabilityScannedComponent } from "./vulnerabilityTypes";

export type TrivyReport = {
  ClusterName: string;
  Misconfigurations: MisconfigurationScannedComponent[];
  Vulnerabilities: VulnerabilityScannedComponent[];
};

export type Filterable = {
  Namespace: string;
};
