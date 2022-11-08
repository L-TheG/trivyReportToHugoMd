# Trivy Kubernetes Report Converter

This Nodejs application converts a [Trivy](https://aquasecurity.github.io/trivy/v0.34/docs/) Kubernetes report into multiple markdown files, which can be used by [Hugo](https://gohugo.io/) to create a documentation-like website that makes the report more discoverable and more easily usable.
More specifically, the markdown output expects to be served, using the [dockdock](https://github.com/vjeantet/hugo-theme-docdock) theme. Other themes might not work so easily, as the generated markdown uses some theme-specific keywords.

To specify where the markdown files should be saved to, run the application with the ```outDir=</path/to/dir``` option. If this option is not provided, the files will be output to ```/src/data/out```.

You can use https://github.com/L-TheG/trivySecurityDocs.git to try out the generated markdown files.

The report that is to be converted has to be in .json format and should be named report.json. The file has to be located at ```/src/data```.
An example command to generate such a file would be ```trivy k8s --kubeconfig <path/to/kubeconfig> --format json -o report.json cluster --timeout 90m0s```.
