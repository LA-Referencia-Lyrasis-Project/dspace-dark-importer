# DSpace dARK Importer by LA Referencia

Application for mapping dARKs to DSpace objects through the DSpace REST API. It resolves the Handle extracted from each OAI identifier and generates a CSV with the matched object UUID and dARK; it never modifies DSpace.

The DSpace dARK Importer works only with DSpace 7 and newer REST APIs.

Source code: [LA-Referencia-Lyrasis-Project/dspace-dark-importer](https://github.com/LA-Referencia-Lyrasis-Project/dspace-dark-importer)

Contact, feedback, and bug reports: [GitHub Issues](https://github.com/LA-Referencia-Lyrasis-Project/dspace-dark-importer/issues)

## Features

- Four-step workflow: Configuration, CSV Validation, Processing, Results
- Built-in How It Works and Privacy Policy pages
- OAI identifier to Handle extraction
- Per-row Handle resolution through the read-only PID endpoint, with Discovery fallback
- Downloadable `items-darks.csv` containing `id,dc.identifier.dark` for uniquely matched items
- Retry with exponential backoff for transient network and HTTP failures
- Detailed live log and downloadable `report.csv`
- Local Storage persistence for configuration and recently used URLs
- Light and dark themes
- Strict TypeScript, modular services, and unit tests
- Same-port backend proxy for DSpace API calls

## Project Setup

```bash
npm install
npm run dev
```

Open the URL printed by Next.js.

## Backend Proxy

All DSpace API calls go through the Next.js API route at `/api/dspace/proxy` or `<basePath>/api/dspace/proxy` when a base path is configured. The browser calls the app on one origin, and the server calls DSpace from Node.js, so DSpace CORS configuration is not required for the import UI.

Use `npm run dev` for local development and `npm run start:prod` for production.

## Build

```bash
npm run build
```

The production build is generated in `.next/` and is served with `npm start`.

Because the app uses Next.js standalone output, run `npm run build` before `npm start`. The build script also copies `.next/static` and `public/` into `.next/standalone/` so the production server can serve JavaScript, CSS, icons, and other static assets.

`npm start`, `npm run start:prod`, and the PM2 scripts load `.env` at runtime before starting the standalone server. Environment variables already exported in the shell or supplied by PM2 take priority over `.env`.

## Tests

```bash
npm test
```

The current test suite covers the reusable OAI-to-Handle conversion utility.

## Configuration

- DSpace REST API URL: the base server URL, for example `https://repository.org/server`.
- Repository Handle Base URL: the URL used to construct `dc.identifier.uri`, for example `https://deposita.ibict.br/handle/`.
Item lookup first extracts the Handle from the OAI identifier and resolves it through the DSpace PID endpoint, for example:

```text
/api/pid/find?id=hdl%3Adeposita%2F635
```

The PID endpoint redirects to the matching DSpace object; the app follows that response and stores its UUID. It does not restrict results to items, so other DSpace object types can also be exported. If the repository cannot resolve the PID, the app falls back to an exact Discovery search using the generated Handle URI.

## Prerequisite: register the dARK metadata field

Before importing `items-darks.csv` into DSpace, an administrator must add `dc.identifier.dark` to the repository's DC metadata registry. In the DSpace administrative interface, open **Registries → Metadata → DC** and create the field.

## Expected CSV Format

The CSV must contain headers:

```csv
oai_identifier,dark
oai:deposita.ibict.br:deposita/635,dark:abcd123
oai:repositorio.bc.ufg.br:tede/10757,dark:efgh456
```

Blank lines are ignored. Validation blocks processing when required columns are missing, values are empty, OAI identifiers are malformed, or OAI identifiers are duplicated. Duplicate dARKs are displayed as warnings.

## OAI Conversion

The app never infers protocol or handle prefix from the OAI identifier. It extracts the handle suffix after the repository identifier and appends it to the configured Handle base URL. Local development identifiers with ports, such as `oai:localhost:4000:123456789/268`, are supported.

Example:

```text
oai:deposita.ibict.br:deposita/635
https://deposita.ibict.br/handle/
```

becomes:

```text
https://deposita.ibict.br/handle/deposita/635
```

Local example:

```text
oai:localhost:4000:123456789/268
http://localhost:4000/handle/
```

becomes:

```text
http://localhost:4000/handle/123456789/268
```

## Output files

`items-darks.csv` has the columns `id,dc.identifier.dark` and includes only rows with exactly one matching DSpace item. Use it in the administrator's chosen DSpace metadata-import process. `report.csv` remains available for auditing all rows.

## How It Works

The UI includes a `/how-it-works` page that explains the import flow:

1. An administrator registers `dc.identifier.dark` in the DC metadata registry before the generated file is imported.
2. Configure the DSpace REST API URL and repository Handle base URL.
3. Upload a CSV file formatted with `oai_identifier,dark`.
4. Validate the CSV before querying DSpace.
5. Process rows:
   - 4.1 For each row, extract the Handle from the OAI identifier and resolve it through the PID endpoint.
   - 4.2 Export each unique match as `id,dc.identifier.dark`; DSpace is not changed.
6. Review the Results screen and download `items-darks.csv` and `report.csv`.

## Privacy

The UI includes a `/privacy-policy` page. The server only forwards read-only requests to the DSpace API URL submitted in the UI and does not store CSV contents, DSpace API responses, or import reports. Browser Local Storage may keep configuration values, recent URLs, theme, and language preference.

## DSpace Versions

The app works only with DSpace 7 and newer REST APIs. It uses:

- `GET /api/pid/find?id=hdl:<handle>` to resolve the Handle to a DSpace object
- `GET /api/discover/search/objects?query="<generated-uri>"` as a fallback when PID resolution is unavailable

The DSpace REST API must be reachable from the Next.js server.

## License

This project is licensed under the GNU Affero General Public License v3.0 only. See [LICENSE.txt](LICENSE.txt).

## Deployment

The deployment is one Next.js Node process serving both the UI and the DSpace proxy.

```bash
cp .env.example .env
npm run start:prod
```

Then open:

```text
http://your-server:8787/
```

Enter the DSpace REST API URL on the Configuration screen. The server uses the URL submitted by the UI.

### Environment Variables

Server runtime:

- `NODE_ENV`: use `production` for deployments.
- `PORT`: HTTP port. Default: `8787`.
- `HOSTNAME`: bind host used by the Next.js standalone server. Use `0.0.0.0` when exposing the app outside localhost.
- `NEXT_PUBLIC_BASE_PATH`: optional deployment subpath, for example `/dark-importer`. This value is used for Next.js `basePath` and `assetPrefix`, so set it before running `npm run build`.
- `REQUEST_BODY_LIMIT_BYTES`: max JSON body accepted by the proxy. Default: `1048576`.
- `PROXY_RESPONSE_LIMIT_BYTES`: max DSpace response body accepted by the proxy. Default: `26214400`.
- `PROXY_TIMEOUT_MS`: DSpace request timeout. Default: `30000`.

See [.env.example](.env.example) for a complete example.

### PM2

Install PM2 on the server if it is not already available:

```bash
npm install -g pm2
```

Build and start the production server with PM2:

```bash
npm run pm2:prod
```

Reload after deploying changes:

```bash
npm run pm2:reload
```

Stop the process:

```bash
npm run pm2:stop
```

## Troubleshooting

- `401 Unauthorized` or `403 Forbidden`: the repository does not allow anonymous PID or Discovery searches.
- CORS errors: make sure the app is using the built-in `/api/dspace/proxy` route and that DSpace is reachable from the Next.js server.
- No item found: confirm that the configured Handle base URL matches the URI stored in item metadata and indexed by Discovery.
- Multiple matches: more than one item matched the generated URI in Discovery; inspect the repository metadata before rerunning.
