export type Misconfiguration = {
  Kind: string;
  Name: string;
  Namespace: string;
  Class: string;
  Type: string;
  Target: string;
  MisconfSummary: { Successes: number; Failures: number; Exceptions: number };
  AVDID: string;
  CauseMetadata: {
    Code: {
      Lines: {
        Annotation: string;
        Content: string;
        FirstCause: boolean;
        IsCause: boolean;
        LastCause: boolean;
        Number: number;
        Truncated: boolean;
      }[];
    };
    EndLine: number;
    Provider: string;
    Service: string;
    StartLine: number;
  };
  Description: string;
  ID: string;
  Layer: {};
  Message: string;
  Misconfiguration_Namespace: string;
  PrimaryURL: string;
  Query: string;
  References: string[];
  Resolution: string;
  Severity: string;
  Status: string;
  Title: string;
  Misconfiguration_Type: string;
};

export type MisconfigurationScannedComponent = {
  Kind: string;
  Name: string;
  Namespace: string;
  Results?: {
    Class: string;
    Type: string;
    Target: string;
    MisconfSummary: { Successes: number; Failures: number; Exceptions: number };
    Misconfigurations: {
      AVDID: string;
      CauseMetadata: {
        Code: {
          Lines: {
            Annotation: string;
            Content: string;
            FirstCause: boolean;
            IsCause: boolean;
            LastCause: boolean;
            Number: number;
            Truncated: boolean;
          }[];
        };
        EndLine: number;
        Provider: string;
        Service: string;
        StartLine: number;
      };
      Description: string;
      ID: string;
      Layer: {};
      Message: string;
      Namespace: string;
      PrimaryURL: string;
      Query: string;
      References: string[];
      Resolution: string;
      Severity: string;
      Status: string;
      Title: string;
      Type: string;
    }[];
  }[];
};

// Temporary type, used during data transformation
// Hoisting the results fields into the top most level
// removing one layer of nesting
export type MergedMisconfigurationComponentResult = {
  Kind: string;
  Name: string;
  Namespace: string;
  Class: string;
  Type: string;
  Target: string;
  MisconfSummary: { Successes: number; Failures: number; Exceptions: number };
  Misconfigurations: {
    AVDID: string;
    CauseMetadata: {
      Code: {
        Lines: {
          Annotation: string;
          Content: string;
          FirstCause: boolean;
          IsCause: boolean;
          LastCause: boolean;
          Number: number;
          Truncated: boolean;
        }[];
      };
      EndLine: number;
      Provider: string;
      Service: string;
      StartLine: number;
    };
    Description: string;
    ID: string;
    Layer: {};
    Message: string;
    Namespace: string;
    PrimaryURL: string;
    Query: string;
    References: string[];
    Resolution: string;
    Severity: string;
    Status: string;
    Title: string;
    Type: string;
  }[];
};
