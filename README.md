# DSpace dARK ID Importer by LA Referencia

Application for importing a CSV file and appending metadata to existing DSpace Items through the DSpace REST API. The initial workflow imports dARK IDs by searching for each generated Handle URI and appending a configurable metadata field.

The DSpace dARK ID Importer works only with DSpace 7 and newer REST APIs.

Source code: [LA-Referencia-Lyrasis-Project/dspace-darkid-importer](https://github.com/LA-Referencia-Lyrasis-Project/dspace-darkid-importer)

Contact, feedback, and bug reports: [GitHub Issues](https://github.com/LA-Referencia-Lyrasis-Project/dspace-darkid-importer/issues)

## Features

- Four-step workflow: Configuration, CSV Validation, Processing, Results
- Built-in How It Works and Privacy Policy pages
- OAI identifier to Handle URI conversion using a configured Handle base URL
- DSpace REST authentication with a Bearer token
- Per-row exact phrase Discovery search and JSON Patch metadata updates
- Automatic metadata field creation when the configured update field is missing
- Idempotent updates: rows are skipped when the item already has the same metadata value
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

## Authentication

The app supports Bearer token authentication. Every DSpace request includes:

```http
Authorization: Bearer <token>
```

Use a token for a DSpace user with permission to edit matched items. If the configured metadata field does not exist yet, the token must also belong to an administrator because creating metadata registry fields requires admin permissions.

For modifying requests, DSpace requires JSON Patch and CSRF protection for `PATCH`, `POST`, `PUT`, and `DELETE`. The app obtains `DSPACE-XSRF-TOKEN`, sends it as `X-XSRF-TOKEN`, and the Next.js proxy keeps DSpace's CSRF cookie.

## Configuration

- DSpace REST API URL: the base server URL, for example `https://repository.org/server`.
- Repository Handle Base URL: the URL used to construct `dc.identifier.uri`, for example `https://deposita.ibict.br/handle/`.
- Metadata Field to Update: defaults to `dc.identifier.darkid`.

If the update field does not exist, the app creates it using `POST /api/core/metadatafields?schemaId=<schemaId>`. This requires an administrator token because DSpace only allows admins to modify the metadata registry. The schema prefix, such as `dc` in `dc.identifier.darkid`, must already exist.

Item lookup uses the DSpace Discovery search endpoint with the generated Handle URI as an exact phrase query, for example:

```text
/api/discover/search/objects?query=%22https%3A%2F%2Fdeposita.ibict.br%2Fhandle%2Fdeposita%2F635%22&dsoType=item&size=2
```

Handle base URLs are normalized to remove duplicate slashes in the path and ensure exactly one trailing slash.

## Expected CSV Format

The CSV must contain headers:

```csv
oai_identifier,dark_id
oai:deposita.ibict.br:deposita/635,dark:abcd123
oai:repositorio.bc.ufg.br:tede/10757,dark:efgh456
```

Blank lines are ignored. Validation blocks processing when required columns are missing, values are empty, OAI identifiers are malformed, or OAI identifiers are duplicated. Duplicate dARK IDs are displayed as warnings.

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

## Duplicate Handling

Before patching an item, the app checks the configured update field on the matched item. If the same value already exists, the row is recorded as `SKIPPED` and no PATCH request is sent.

## How It Works

The UI includes a `/how-it-works` page that explains the import flow:

1. Configure the DSpace REST API URL, repository Handle base URL, Bearer token, and dARK ID metadata field.
2. Upload a CSV file formatted with `oai_identifier,dark_id`.
3. Validate the CSV before any DSpace item is changed.
4. Process rows:
   - 4.1 Verify whether the configured metadata field exists in DSpace and create it when missing.
   - 4.2 For each row, build the Handle URI from the OAI identifier and search the item by that URI.
   - 4.3 Append the metadata only when needed, skipping the row when the item already has the same dARK ID.
5. Review the Results screen and download `report.csv`.

## Privacy

The UI includes a `/privacy-policy` page. The server only forwards requests to the DSpace API URL submitted in the UI and does not store CSV contents, Bearer tokens, DSpace API responses, or import reports. Browser Local Storage may keep configuration values, recent URLs, theme, and language preference.

## DSpace Versions

The app works only with DSpace 7 and newer REST APIs. It uses:

- `GET /api/discover/search/objects?query="<generated-uri>"` for Discovery search
- `GET /api/core/metadatafields` and `GET /api/core/metadataschemas` to verify the metadata registry
- `POST /api/core/metadatafields?schemaId=<schemaId>` to create a missing update field
- `PATCH /api/core/items/{uuid}` with JSON Patch metadata updates

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

- `401 Unauthorized`: token is missing, expired, or credentials are invalid.
- `403 Forbidden`: the authenticated user cannot edit the matching item.
- `422 Unprocessable Entity`: the update metadata field may not exist in the DSpace metadata registry.
- CORS errors: make sure the app is using the built-in `/api/dspace/proxy` route and that DSpace is reachable from the Next.js server.
- No item found: confirm that the configured Handle base URL matches the URI stored in item metadata and indexed by Discovery.
- Multiple matches: more than one item matched the generated URI in Discovery; inspect the repository metadata before rerunning.
