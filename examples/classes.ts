import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";
const service = ["dhcp4"];

const client = new KeaClient({ baseUrl });

// Requires the `class_cmds` hook library.
await client.class.setClass(
  {
    "client-classes": [{ name: "voip-phones", test: "substring(option[60].hex,0,4) == 'Grand'" }],
  },
  service,
);
console.log("Client class 'voip-phones' added.");

const list = await client.class.listClasses(service);
console.log("Classes:", list["client-classes"]);

await client.class.updateClass(
  {
    "client-classes": [
      { name: "voip-phones", test: "substring(option[60].hex,0,4) == 'Grand'", "boot-file-name": "voip.bin" },
    ],
  },
  service,
);
console.log("Class updated with boot-file-name.");

const cls = await client.class.getClass({ name: "voip-phones" }, service);
console.log("Class detail:", cls["client-classes"]);

await client.class.delClass({ name: "voip-phones" }, service);
console.log("Class deleted.");
