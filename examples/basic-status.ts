import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";

const client = new KeaClient({ baseUrl });

const version = await client.control.getVersion();
console.log("Control Agent version:", version.extended);

const status = await client.control.getStatus();
console.log("Control Agent status:", status);

// Target a specific daemon behind the Control Agent via `service`.
const dhcp4Config = await client.control.getConfig(["dhcp4"]);
console.log("Dhcp4 config hash:", dhcp4Config.hash);

const commands = await client.control.listCommands(["dhcp4"]);
console.log("Supported dhcp4 commands:", commands);
