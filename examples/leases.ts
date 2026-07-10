import { KeaApiError } from "../src/index.js";
import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";
const service = ["dhcp4"];

const client = new KeaClient({ baseUrl });

// Requires the `lease_cmds` hook library loaded by the dhcp4 daemon.
await client.lease.setLease4(
  {
    "ip-address": "192.0.2.100",
    "hw-address": "1a:1b:1c:1d:1e:1f",
    "subnet-id": 1,
    "valid-lft": 3600,
  },
  service,
);
console.log("Lease added.");

const lease = await client.lease.getLease4({ "ip-address": "192.0.2.100" }, service);
console.log("Fetched lease:", lease);

await client.lease.updateLease4({ ...lease, hostname: "example-host" }, service);
console.log("Lease updated with hostname.");

const page = await client.lease.getLease4Page({ from: "start", limit: 50 }, service);
console.log(`Fetched ${page.leases.length} leases (page).`);

try {
  await client.lease.getLease4({ "ip-address": "192.0.2.250" }, service);
} catch (err) {
  if (err instanceof KeaApiError && err.result === 3) {
    console.log("No lease exists for 192.0.2.250 (result=3, not found).");
  } else {
    throw err;
  }
}

await client.lease.delLease4({ "ip-address": "192.0.2.100" }, service);
console.log("Lease deleted.");
