import { KeaClient } from "../src/index.js";

const baseUrl = process.argv[2] ?? process.env.KEA_CA_URL ?? "http://127.0.0.1:8000";
const service = ["dhcp4"];

const client = new KeaClient({ baseUrl });

const all = await client.stat.getAllStatistics(service);
console.log("All statistics:", all);

const packetsReceived = await client.stat.getStatistic({ name: "pkt4-received" }, service);
console.log("pkt4-received samples:", packetsReceived["pkt4-received"]);

await client.stat.setStatisticSampleCount({ name: "pkt4-received", "max-samples": 20 }, service);
console.log("Sample count for pkt4-received set to 20.");

await client.stat.resetStatistic({ name: "pkt4-received" }, service);
console.log("pkt4-received statistic reset.");
