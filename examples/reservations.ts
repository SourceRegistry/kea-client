import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";
const service = ["dhcp4"];

const client = new KeaClient({ baseUrl });

// Requires the `host_cmds` hook library.
await client.host.setReservation(
  {
    reservation: {
      "subnet-id": 1,
      "hw-address": "aa:bb:cc:dd:ee:ff",
      "ip-address": "192.0.2.200",
      hostname: "reserved-host",
    },
  },
  service,
);
console.log("Reservation added.");

const byId = await client.host.getReservationById(
  { "identifier-type": "hw-address", identifier: "aa:bb:cc:dd:ee:ff" },
  service,
);
console.log("Reservation by hw-address:", byId.hosts);

const all = await client.host.getAllReservations({ "subnet-id": 1 }, service);
console.log(`Subnet 1 has ${all.hosts?.length ?? 0} reservation(s).`);

await client.host.delReservation({ "subnet-id": 1, "ip-address": "192.0.2.200" }, service);
console.log("Reservation deleted.");
