<p align="center">
  <img src="./assets/kea-logo.png" alt="Kea logo" width="96">
</p>

<p align="center">
  <b>kea-client</b><br/>
  Typed Node.js client for the <a href="https://gitlab.isc.org/isc-projects/kea">Kea DHCP</a> Control Agent HTTP API
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@sourceregistry/kea-client"><img alt="npm" src="https://img.shields.io/npm/v/@sourceregistry/kea-client"></a>
  <a href="https://www.npmjs.com/package/@sourceregistry/kea-client"><img alt="downloads" src="https://img.shields.io/npm/dm/@sourceregistry/kea-client"></a>
  <img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue">
  <img alt="node" src="https://img.shields.io/node/v/@sourceregistry/kea-client">
  <a href="https://github.com/SourceRegistry/kea-client/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/SourceRegistry/kea-client/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/SourceRegistry/kea-client/issues"><img alt="issues" src="https://img.shields.io/github/issues/SourceRegistry/kea-client"></a>
</p>

## What this is

A thin, zero-dependency client for [Kea DHCP](https://gitlab.isc.org/isc-projects/kea)'s Control Agent HTTP command channel. Kea's API is a single-endpoint JSON command protocol (`POST /` with `{command, service, arguments}`), not a path-based REST API — this client wraps that protocol in typed, resource-grouped methods covering the general control commands and every command hook library ships (`lease_cmds`, `host_cmds`, `subnet_cmds`, `class_cmds`, `stat_cmds`, `cb_cmds`, `ha`). It does not manage the Kea process itself, nor the Control Agent's own configuration.

## Installation

```sh
npm install @sourceregistry/kea-client
```

Also published unscoped as [`kea-client`](https://www.npmjs.com/package/kea-client). Requires Node.js >= 18.

## Quick Start

```ts
import { KeaClient } from "@sourceregistry/kea-client";

const client = new KeaClient({ baseUrl: "http://127.0.0.1:8000" });

const version = await client.control.getVersion();
console.log(version.extended);

// Target a specific daemon behind the Control Agent with a trailing `service` array.
const status = await client.control.getStatus(["dhcp4"]);
console.log(status);

await client.lease.setLease4(
  { "ip-address": "192.0.2.100", "hw-address": "1a:1b:1c:1d:1e:1f", "subnet-id": 1 },
  ["dhcp4"],
);
```

See [`/examples`](./examples) for full walkthroughs of every command group.

## API

Every `KeaClient` method sends one Kea command and unwraps the first response entry, throwing `KeaApiError` if its `result` code is non-zero. The optional trailing `service?: string[]` argument on every method selects which daemon(s) the Control Agent forwards the command to (e.g. `["dhcp4"]`, `["dhcp6"]`, `["d2"]`); omit it to let the Control Agent handle the command itself.

| Resource | Hook / source | Example methods |
|---|---|---|
| `client.control` | general commands (built into every daemon) | `getVersion`, `getStatus`, `getConfig`, `setConfig`, `testConfig`, `reloadConfig`, `writeConfig`, `listCommands`, `shutdown`, `getBuildReport`, `enableDhcp`/`disableDhcp`, `reclaimLeases`, `listInterfaces`/`addInterface`/`redetectInterfaces`, `testSubnet4Select`/`testSubnet6Select` |
| `client.lease` | `lease_cmds` | `setLease4`/`setLease6`, `getLease4`/`getLease6`, `getLease4ByHwAddress`, `getLease6ByDuid`, `updateLease4`/`updateLease6`, `delLease4`/`delLease6`, `wipeLease4`/`wipeLease6`, `getAllLeases4`/`getAllLeases6`, `getLease4Page`/`getLease6Page`, `bulkApplyLease6`, `resendLease4Ddns`/`resendLease6Ddns` |
| `client.host` | `host_cmds` | `setReservation`, `getReservation`, `getAllReservations`, `getReservationPage`, `getReservationByHostname`, `getReservationById`, `updateReservation`, `delReservation` |
| `client.subnet` | `subnet_cmds` | `setSubnet4`/`setSubnet6`, `getSubnet4`/`getSubnet6`, `updateSubnet4`/`updateSubnet6`, `listSubnets4`/`listSubnets6`, `delSubnet4`/`delSubnet6`, `setNetwork4`/`setNetwork6`, `getNetwork4`/`getNetwork6`, `listNetworks4`/`listNetworks6`, `addNetworkSubnet4`/`addNetworkSubnet6`, `delNetworkSubnet4`/`delNetworkSubnet6`, `delNetwork4`/`delNetwork6` |
| `client.class` | `class_cmds` | `setClass`, `updateClass`, `getClass`, `listClasses`, `delClass` |
| `client.stat` | `stat_cmds` | `getStatistic`, `getAllStatistics`, `resetStatistic`/`resetAllStatistics`, `removeStatistic`/`removeAllStatistics`, `setStatisticSampleAge`/`setAllStatisticsSampleAge`, `setStatisticSampleCount`/`setAllStatisticsSampleCount` |
| `client.configBackend` | `cb_cmds` (`remote-*`) | `setGlobalParameter4`/`get`/`getAll`/`del` (+ `6`), `setServer4`/`get`/`getAll`/`del` (+`6`), `setRemoteNetwork4`/`get`/`list`/`del` (+`6`), `setRemoteSubnet4`/`get`/`list`/`delById`/`delByPrefix` (+`6`), `setOptionGlobal4`/`get`/`getAll`/`del`, `setOptionNetwork4`/`del`, `setOptionSubnet4`/`del`, `setOptionPool4`/`del`, `setOptionPdPool6`/`del`, `setOptionDef4`/`get`/`getAll`/`del` (+`6` for all option/def commands) |
| `client.ha` | `ha` (High Availability) | `getHeartbeat`, `setScopes`, `continueSync`, `startMaintenance`/`cancelMaintenance`, `sync`, `notifySyncComplete` |

For commands issued against multiple `service` targets at once (e.g. `["dhcp4", "dhcp6"]`), use `client.sendRaw(command, args, service)` — it returns every response entry without throwing on individual failures, since one target may succeed while another fails (Kea's partial-failure `result: 5`).

### Error handling

```ts
import { KeaApiError, KeaTransportError } from "@sourceregistry/kea-client";

try {
  await client.lease.getLease4({ "ip-address": "192.0.2.100" }, ["dhcp4"]);
} catch (err) {
  if (err instanceof KeaApiError) {
    // err.result: 1 error, 2 unsupported, 3 not found, 4 conflict, 5 partial failure
    console.error(err.command, err.result, err.message);
  } else if (err instanceof KeaTransportError) {
    // non-2xx HTTP status or malformed response from the Control Agent itself
    console.error(err.statusCode, err.message);
  }
}
```

### Options

```ts
new KeaClient({
  baseUrl: "http://127.0.0.1:8000", // required
  username: "admin",                 // optional, HTTP Basic Auth
  password: "secret",
  headers: { "x-request-id": "..." }, // optional, merged into every request
  timeoutMs: 10000,                    // optional, defaults to 10000
});
```

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch/PR process, commit message conventions, and a checklist for adding new commands.

```sh
npm test              # vitest run
npm run test:ui        # vitest --ui
npm run test:coverage  # vitest run --coverage
npm run build           # tsc + vite build (+ JSR package assembly)
npm run docs:build      # typedoc -> generated/docs
```

Each file in `/examples` is runnable directly against a real Control Agent:

```sh
npm run examples/basic-status -- http://127.0.0.1:8000
# or: KEA_CA_URL=http://127.0.0.1:8000 npm run examples/leases
```

## License

Apache-2.0. See [LICENSE](./LICENSE).
