# Astra for VS Code

DataStax Astra Cassandra-as-a-Service: Open, multi-cloud stack for modern data apps

## Local Development

### How to the run the extension locally

1. Install VS Code.
2. Clone this repo.
3. Install Node Dependencies: `npm i`.
4. Compile the project with Typescript: `tsc` or `tsc --watch`
5. Click the play icon on the left toolbar.
6. Click "Run Extension" on the top toolbar.

### How to publish

1. Run `npm run publish`
2. Paste in a personal access token (you can create a personal access token at dev.azure.com).
3. Use GitHub CLI to tag a release in GitHub (example: `gh release create v0.3.7`)