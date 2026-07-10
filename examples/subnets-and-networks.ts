import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";
const service = ["dhcp4"];

const client = new KeaClient({ baseUrl });

// Requires the `subnet_cmds` hook library.
await client.subnet.setSubnet4(
  {
    subnet4: [{ id: 100, subnet: "192.0.2.0/24", pools: [{ pool: "192.0.2.10 - 192.0.2.200" }] }],
  },
  service,
);
console.log("Subnet4 100 added.");

await client.subnet.setNetwork4({ "shared-networks": [{ name: "office-network" }] }, service);
console.log("Shared network 'office-network' added.");

await client.subnet.addNetworkSubnet4({ name: "office-network", id: 100 }, service);
console.log("Subnet 100 attached to 'office-network'.");

const list = await client.subnet.listSubnets4(service);
console.log("Subnets:", list.subnets);

const networks = await client.subnet.listNetworks4(service);
console.log("Shared networks:", networks["shared-networks"]);

await client.subnet.delNetworkSubnet4({ name: "office-network", id: 100 }, service);
await client.subnet.delNetwork4({ name: "office-network" }, service);
await client.subnet.delSubnet4({ id: 100 }, service);
console.log("Cleaned up subnet and shared network.");
