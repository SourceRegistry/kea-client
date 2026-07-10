import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";
const service = ["dhcp4"];

// Requires the `libdhcp_ha.so` hook library loaded and an HA peer configured.
const client = new KeaClient({ baseUrl });

const heartbeat = await client.ha.getHeartbeat(service);
console.log("HA heartbeat:", heartbeat);

await client.ha.startMaintenance({ force: false }, service);
console.log("HA maintenance mode requested.");

await client.ha.cancelMaintenance(service);
console.log("HA maintenance mode cancelled.");
