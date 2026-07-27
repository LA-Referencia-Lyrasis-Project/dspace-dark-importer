# DSpace Dark ID Import

A browser-only React application for importing a CSV file and appending metadata to existing DSpace Items through the DSpace REST API. The initial workflow imports Dark IDs by searching for each generated Handle URI and appending a configurable metadata field.

## Features

- Four-step workflow: Configuration, CSV Validation, Processing, Results
- OAI identifier to Handle URI conversion using a configured Handle base URL
- DSpace REST authentication with Bearer token or username/password login
- Per-row exact phrase Discovery search and JSON Patch metadata updates
- Automatic metadata field creation when the configured update field is missing
- Idempotent updates: rows are skipped when the item already has the same metadata value
- Retry with exponential backoff for transient network and HTTP failures
- Detailed live log and downloadable `report.csv`
- Local Storage persistence for configuration and recently used URLs
- Light and dark themes
- Strict TypeScript, modular services, and unit tests
- Optional local backend proxy for DSpace instances that reject browser CORS requests

## Project Setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

## Backend Proxy Mode

If DSpace rejects requests from the browser with `Invalid CORS request`, run the local proxy:

```bash
npm run proxy
```

Then enable **Use backend proxy** on the Configuration screen and use:

```text
http://localhost:8787/api/dspace/proxy
```

In this mode the browser calls the local proxy, and the proxy calls DSpace from Node.js. Browser CORS restrictions apply only to browser requests, so this avoids changing the DSpace backend CORS configuration.

The proxy can also serve the production build:

```bash
npm run build
npm run proxy
```

Then open:

```text
http://127.0.0.1:8787/
```

## Build

```bash
npm run build
npm run preview
```

The production build is generated in `dist/` and can be hosted on any static web server.

## Tests

```bash
npm test
```

The current test suite covers the reusable OAI-to-Handle conversion utility.

## Authentication

Two authentication modes are supported:

- Bearer Token: every request includes `Authorization: Bearer <token>`.
- Username and Password: the app posts credentials to `/api/authn/login` and stores the returned Bearer token in memory for the import session.

For modifying requests, DSpace requires JSON Patch. Some DSpace deployments also require CSRF protection for `PATCH`, `POST`, `PUT`, and `DELETE`. This app sends `credentials: "include"` and will forward a readable `DSPACE-XSRF-TOKEN` cookie as `X-XSRF-TOKEN` when present.

## Configuration

- DSpace REST API URL: the base server URL, for example `https://repository.org/server`.
- Repository Handle Base URL: the URL used to construct `dc.identifier.uri`, for example `https://deposita.ibict.br/handle/`.
- Backend Proxy URL: optional; defaults to `http://localhost:8787/api/dspace/proxy`.
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

Blank lines are ignored. Validation blocks processing when required columns are missing, values are empty, OAI identifiers are malformed, or OAI identifiers are duplicated. Duplicate Dark IDs are displayed as warnings.

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

## DSpace Versions

The app targets DSpace 7 and newer REST APIs. It uses:

- `POST /api/authn/login` for login
- `GET /api/discover/search/objects?query="<generated-uri>"` for Discovery search
- `GET /api/core/metadatafields` and `GET /api/core/metadataschemas` to verify the metadata registry
- `POST /api/core/metadatafields?schemaId=<schemaId>` to create a missing update field
- `PATCH /api/core/items/{uuid}` with JSON Patch metadata updates

The REST API must be reachable from the browser and configured with CORS rules that allow the app origin, authorization headers, credentials when needed, and the HTTP methods used above.

## Deployment

Build the app and serve `dist/` from a static web host. Configure the DSpace server CORS settings for the deployed origin. No backend service is required.

## Troubleshooting

- `401 Unauthorized`: token is missing, expired, or credentials are invalid.
- `403 Forbidden`: the authenticated user cannot edit the matching item.
- `422 Unprocessable Entity`: the update metadata field may not exist in the DSpace metadata registry.
- CORS errors: update DSpace CORS settings to allow the deployed origin, `Authorization`, `Content-Type`, and `X-XSRF-TOKEN` headers.
- No item found: confirm that the configured Handle base URL matches the URI stored in item metadata and indexed by Discovery.
- Multiple matches: more than one item matched the generated URI in Discovery; inspect the repository metadata before rerunning.
