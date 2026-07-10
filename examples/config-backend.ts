import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";
const service = ["dhcp4"];

// Requires the `cb_cmds` hook library and a configured database config backend
// (`config-control` / MySQL or PostgreSQL config backend) on the dhcp4 daemon.
const client = new KeaClient({ baseUrl });

await client.configBackend.setGlobalParameter4({ parameters: { "valid-lifetime": 7200 } }, service);
console.log("Remote global parameter 'valid-lifetime' set to 7200.");

const params = await client.configBackend.getAllGlobalParameters4(undefined, service);
console.log("All remote global parameters:", params);

await client.configBackend.setRemoteSubnet4({ subnets: [{ id: 200, subnet: "192.0.2.0/24" }] }, service);
console.log("Remote subnet 200 stored in the config backend.");

const subnets = await client.configBackend.listRemoteSubnets4(undefined, service);
console.log("Remote subnets:", subnets);

await client.configBackend.delRemoteSubnet4ById({ subnets: [{ id: 200 }] }, service);
await client.configBackend.delGlobalParameter4({ parameters: ["valid-lifetime"] }, service);
console.log("Cleaned up remote subnet and global parameter.");
