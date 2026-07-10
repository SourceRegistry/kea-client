import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { KeaClient } from "./client.js";
import { KeaApiError, KeaTransportError } from "./error.js";

describe("KeaClient", () => {
  let server: http.Server;
  let client: KeaClient;
  let lastRequest: { body?: any; headers?: http.IncomingHttpHeaders } | undefined;
  let nextResponse: unknown[];

  beforeEach(async () => {
    nextResponse = [{ result: 0 }];
    lastRequest = undefined;

    server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        lastRequest = { body: raw ? JSON.parse(raw) : undefined, headers: req.headers };
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(nextResponse));
      });
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    client = new KeaClient({ baseUrl: `http://127.0.0.1:${port}`, username: "admin", password: "secret" });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  /** Runs `call`, then asserts the exact JSON body posted to the Control Agent. */
  async function expectRequest(call: () => Promise<unknown>, body: Record<string, unknown>) {
    await call();
    expect(lastRequest?.body).toEqual(body);
  }

  describe("transport", () => {
    it("posts {command, arguments} and unwraps a single response entry", async () => {
      nextResponse = [{ result: 0, arguments: { extended: "Kea 2.6.0" } }];

      const version = await client.control.getVersion();

      expect(lastRequest?.body).toEqual({ command: "version-get" });
      expect(version).toEqual({ extended: "Kea 2.6.0" });
    });

    it("includes the service array when targeting a daemon", () =>
      expectRequest(() => client.lease.getAllLeases4(undefined, ["dhcp4"]), {
        command: "lease4-get-all",
        service: ["dhcp4"],
      }));

    it("sends basic auth headers", async () => {
      await client.control.getStatus();

      const expected = `Basic ${Buffer.from("admin:secret").toString("base64")}`;
      expect(lastRequest?.headers?.authorization).toBe(expected);
    });

    it("throws KeaApiError when result is non-zero", async () => {
      nextResponse = [{ result: 3, text: "Lease not found." }];

      await expect(client.lease.getLease4({ "ip-address": "192.0.2.1" })).rejects.toMatchObject({
        name: "KeaApiError",
        result: 3,
        command: "lease4-get",
        message: "Lease not found.",
      });
    });

    it("rejects with KeaApiError instance", async () => {
      nextResponse = [{ result: 1, text: "unsupported command" }];

      await expect(client.control.shutdown()).rejects.toBeInstanceOf(KeaApiError);
    });

    it("exposes sendRaw for multi-service fan-out without throwing on partial failure", async () => {
      nextResponse = [
        { result: 0, arguments: { extended: "dhcp4 1.0" } },
        { result: 1, text: "dhcp6 not running" },
      ];

      const results = await client.sendRaw("version-get", undefined, ["dhcp4", "dhcp6"]);

      expect(results).toEqual(nextResponse);
      expect(lastRequest?.body).toEqual({ command: "version-get", service: ["dhcp4", "dhcp6"] });
    });

    it("throws KeaTransportError on non-2xx HTTP status", async () => {
      server.close();
      server = http.createServer((_req, res) => {
        res.statusCode = 500;
        res.end("internal error");
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address() as AddressInfo;
      client = new KeaClient({ baseUrl: `http://127.0.0.1:${port}` });

      await expect(client.control.getVersion()).rejects.toBeInstanceOf(KeaTransportError);
    });

    it("throws KeaTransportError on non-JSON response body", async () => {
      server.close();
      server = http.createServer((_req, res) => {
        res.statusCode = 200;
        res.end("not json");
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address() as AddressInfo;
      client = new KeaClient({ baseUrl: `http://127.0.0.1:${port}` });

      await expect(client.control.getVersion()).rejects.toBeInstanceOf(KeaTransportError);
    });

    it("throws KeaTransportError on empty response array", async () => {
      nextResponse = [];

      await expect(client.control.getVersion()).rejects.toBeInstanceOf(KeaTransportError);
    });

    it("resolves void for commands with no response arguments", async () => {
      nextResponse = [{ result: 0 }];

      await expect(client.control.reloadConfig()).resolves.toBeUndefined();
    });
  });

  describe("control", () => {
    it("getConfig", () => expectRequest(() => client.control.getConfig(["dhcp4"]), { command: "config-get", service: ["dhcp4"] }));
    it("getConfigHash", () => expectRequest(() => client.control.getConfigHash(), { command: "config-hash-get" }));
    it("setConfig", () =>
      expectRequest(() => client.control.setConfig({ Dhcp4: { "valid-lifetime": 3600 } }), {
        command: "config-set",
        arguments: { Dhcp4: { "valid-lifetime": 3600 } },
      }));
    it("testConfig", () =>
      expectRequest(() => client.control.testConfig({ Dhcp4: {} }), {
        command: "config-test",
        arguments: { Dhcp4: {} },
      }));
    it("writeConfig", () =>
      expectRequest(() => client.control.writeConfig({ filename: "kea.conf" }), {
        command: "config-write",
        arguments: { filename: "kea.conf" },
      }));
    it("listCommands", () => expectRequest(() => client.control.listCommands(), { command: "list-commands" }));
    it("getBuildReport", () => expectRequest(() => client.control.getBuildReport(), { command: "build-report" }));
    it("getServerTag", () => expectRequest(() => client.control.getServerTag(), { command: "server-tag-get" }));
    it("startLfc", () => expectRequest(() => client.control.startLfc(), { command: "kea-lfc-start" }));
    it("pullConfigBackend", () =>
      expectRequest(() => client.control.pullConfigBackend(), { command: "config-backend-pull" }));
    it("listInterfaces", () => expectRequest(() => client.control.listInterfaces(), { command: "interface-list" }));
    it("addInterface", () =>
      expectRequest(() => client.control.addInterface({ interfaces: ["eth0"] }), {
        command: "interface-add",
        arguments: { interfaces: ["eth0"] },
      }));
    it("redetectInterfaces", () =>
      expectRequest(() => client.control.redetectInterfaces(), { command: "interface-redetect" }));
    it("enableDhcp / disableDhcp", async () => {
      await expectRequest(() => client.control.disableDhcp({ "max-period": 60 }), {
        command: "dhcp-disable",
        arguments: { "max-period": 60 },
      });
      await expectRequest(() => client.control.enableDhcp(), { command: "dhcp-enable" });
    });
    it("reclaimLeases", () =>
      expectRequest(() => client.control.reclaimLeases({ remove: true }), {
        command: "leases-reclaim",
        arguments: { remove: true },
      }));
    it("testSubnet4Select", () =>
      expectRequest(() => client.control.testSubnet4Select({ subnet: "192.0.2.0/24" }), {
        command: "subnet4-select-test",
        arguments: { subnet: "192.0.2.0/24" },
      }));
    it("testSubnet6Select", () =>
      expectRequest(() => client.control.testSubnet6Select({ link: "2001:db8::1" }), {
        command: "subnet6-select-test",
        arguments: { link: "2001:db8::1" },
      }));
    it("shutdown", () =>
      expectRequest(() => client.control.shutdown({ "exit-value": 0 }), {
        command: "shutdown",
        arguments: { "exit-value": 0 },
      }));
  });

  describe("lease", () => {
    it("setLease4", () =>
      expectRequest(() => client.lease.setLease4({ "ip-address": "192.0.2.1", "hw-address": "1a:1b:1c:1d:1e:1f" }), {
        command: "lease4-add",
        arguments: { "ip-address": "192.0.2.1", "hw-address": "1a:1b:1c:1d:1e:1f" },
      }));
    it("getLease4ByHwAddress", () =>
      expectRequest(() => client.lease.getLease4ByHwAddress({ "hw-address": "1a:1b:1c:1d:1e:1f" }), {
        command: "lease4-get-by-hw-address",
        arguments: { "hw-address": "1a:1b:1c:1d:1e:1f" },
      }));
    it("getLease4ByClientId", () =>
      expectRequest(() => client.lease.getLease4ByClientId({ "client-id": "aa:bb" }), {
        command: "lease4-get-by-client-id",
        arguments: { "client-id": "aa:bb" },
      }));
    it("delLease4", () =>
      expectRequest(() => client.lease.delLease4({ "ip-address": "192.0.2.1" }), {
        command: "lease4-del",
        arguments: { "ip-address": "192.0.2.1" },
      }));
    it("updateLease4", () =>
      expectRequest(() => client.lease.updateLease4({ "ip-address": "192.0.2.1", hostname: "host" }), {
        command: "lease4-update",
        arguments: { "ip-address": "192.0.2.1", hostname: "host" },
      }));
    it("wipeLease4", () =>
      expectRequest(() => client.lease.wipeLease4({ "subnet-id": 1 }), {
        command: "lease4-wipe",
        arguments: { "subnet-id": 1 },
      }));
    it("getLease4Page", () =>
      expectRequest(() => client.lease.getLease4Page({ from: "start", limit: 10 }), {
        command: "lease4-get-page",
        arguments: { from: "start", limit: 10 },
      }));
    it("resendLease4Ddns", () =>
      expectRequest(() => client.lease.resendLease4Ddns({ "ip-address": "192.0.2.1" }), {
        command: "lease4-resend-ddns",
        arguments: { "ip-address": "192.0.2.1" },
      }));
    it("setLease6", () =>
      expectRequest(() => client.lease.setLease6({ "ip-address": "2001:db8::1" }), {
        command: "lease6-add",
        arguments: { "ip-address": "2001:db8::1" },
      }));
    it("getLease6ByDuid", () =>
      expectRequest(() => client.lease.getLease6ByDuid({ duid: "00:01" }), {
        command: "lease6-get-by-duid",
        arguments: { duid: "00:01" },
      }));
    it("delLease6", () =>
      expectRequest(() => client.lease.delLease6({ "ip-address": "2001:db8::1" }), {
        command: "lease6-del",
        arguments: { "ip-address": "2001:db8::1" },
      }));
    it("wipeLease6", () =>
      expectRequest(() => client.lease.wipeLease6(), { command: "lease6-wipe" }));
    it("bulkApplyLease6", () =>
      expectRequest(() => client.lease.bulkApplyLease6({ leases: [{ "ip-address": "2001:db8::1" }] }), {
        command: "lease6-bulk-apply",
        arguments: { leases: [{ "ip-address": "2001:db8::1" }] },
      }));
  });

  describe("host", () => {
    it("setReservation", () =>
      expectRequest(
        () => client.host.setReservation({ reservation: { "subnet-id": 1, "hw-address": "aa:bb", "ip-address": "192.0.2.5" } }),
        {
          command: "reservation-add",
          arguments: { reservation: { "subnet-id": 1, "hw-address": "aa:bb", "ip-address": "192.0.2.5" } },
        },
      ));
    it("getReservation", () =>
      expectRequest(() => client.host.getReservation({ "subnet-id": 1, "ip-address": "192.0.2.5" }), {
        command: "reservation-get",
        arguments: { "subnet-id": 1, "ip-address": "192.0.2.5" },
      }));
    it("getAllReservations", () =>
      expectRequest(() => client.host.getAllReservations({ "subnet-id": 1 }), {
        command: "reservation-get-all",
        arguments: { "subnet-id": 1 },
      }));
    it("getReservationPage", () =>
      expectRequest(() => client.host.getReservationPage({ "source-index": 0, limit: 10 }), {
        command: "reservation-get-page",
        arguments: { "source-index": 0, limit: 10 },
      }));
    it("getReservationByHostname", () =>
      expectRequest(() => client.host.getReservationByHostname({ hostname: "host1" }), {
        command: "reservation-get-by-hostname",
        arguments: { hostname: "host1" },
      }));
    it("getReservationById", () =>
      expectRequest(
        () => client.host.getReservationById({ "identifier-type": "hw-address", identifier: "aa:bb" }),
        {
          command: "reservation-get-by-id",
          arguments: { "identifier-type": "hw-address", identifier: "aa:bb" },
        },
      ));
    it("updateReservation", () =>
      expectRequest(
        () => client.host.updateReservation({ reservation: { "subnet-id": 1, hostname: "renamed" } }),
        {
          command: "reservation-update",
          arguments: { reservation: { "subnet-id": 1, hostname: "renamed" } },
        },
      ));
    it("delReservation", () =>
      expectRequest(() => client.host.delReservation({ "subnet-id": 1, "ip-address": "192.0.2.5" }), {
        command: "reservation-del",
        arguments: { "subnet-id": 1, "ip-address": "192.0.2.5" },
      }));
  });

  describe("subnet", () => {
    it("setSubnet4", () =>
      expectRequest(() => client.subnet.setSubnet4({ subnet4: [{ subnet: "192.0.2.0/24" }] }), {
        command: "subnet4-add",
        arguments: { subnet4: [{ subnet: "192.0.2.0/24" }] },
      }));
    it("delSubnet4", () =>
      expectRequest(() => client.subnet.delSubnet4({ id: 1 }), { command: "subnet4-del", arguments: { id: 1 } }));
    it("updateSubnet4", () =>
      expectRequest(() => client.subnet.updateSubnet4({ subnet4: [{ id: 1, subnet: "192.0.2.0/24" }] }), {
        command: "subnet4-update",
        arguments: { subnet4: [{ id: 1, subnet: "192.0.2.0/24" }] },
      }));
    it("listSubnets4", () => expectRequest(() => client.subnet.listSubnets4(), { command: "subnet4-list" }));
    it("getSubnet4", () =>
      expectRequest(() => client.subnet.getSubnet4({ id: 1 }), { command: "subnet4-get", arguments: { id: 1 } }));
    it("setSubnet6", () =>
      expectRequest(() => client.subnet.setSubnet6({ subnet6: [{ subnet: "2001:db8::/64" }] }), {
        command: "subnet6-add",
        arguments: { subnet6: [{ subnet: "2001:db8::/64" }] },
      }));
    it("setNetwork4", () =>
      expectRequest(() => client.subnet.setNetwork4({ "shared-networks": [{ name: "net1" }] }), {
        command: "network4-add",
        arguments: { "shared-networks": [{ name: "net1" }] },
      }));
    it("delNetwork4", () =>
      expectRequest(() => client.subnet.delNetwork4({ name: "net1" }), {
        command: "network4-del",
        arguments: { name: "net1" },
      }));
    it("addNetworkSubnet4", () =>
      expectRequest(() => client.subnet.addNetworkSubnet4({ name: "net1", id: 1 }), {
        command: "network4-subnet-add",
        arguments: { name: "net1", id: 1 },
      }));
    it("delNetworkSubnet4", () =>
      expectRequest(() => client.subnet.delNetworkSubnet4({ name: "net1", id: 1 }), {
        command: "network4-subnet-del",
        arguments: { name: "net1", id: 1 },
      }));
    it("listNetworks4", () => expectRequest(() => client.subnet.listNetworks4(), { command: "network4-list" }));
    it("getNetwork4", () =>
      expectRequest(() => client.subnet.getNetwork4({ name: "net1" }), {
        command: "network4-get",
        arguments: { name: "net1" },
      }));
    it("setNetwork6", () =>
      expectRequest(() => client.subnet.setNetwork6({ "shared-networks": [{ name: "net6" }] }), {
        command: "network6-add",
        arguments: { "shared-networks": [{ name: "net6" }] },
      }));
  });

  describe("class", () => {
    it("setClass", () =>
      expectRequest(() => client.class.setClass({ "client-classes": [{ name: "voip" }] }), {
        command: "class-add",
        arguments: { "client-classes": [{ name: "voip" }] },
      }));
    it("updateClass", () =>
      expectRequest(() => client.class.updateClass({ "client-classes": [{ name: "voip" }] }), {
        command: "class-update",
        arguments: { "client-classes": [{ name: "voip" }] },
      }));
    it("getClass", () =>
      expectRequest(() => client.class.getClass({ name: "voip" }), {
        command: "class-get",
        arguments: { name: "voip" },
      }));
    it("listClasses", () => expectRequest(() => client.class.listClasses(), { command: "class-list" }));
    it("delClass", () =>
      expectRequest(() => client.class.delClass({ name: "voip" }), {
        command: "class-del",
        arguments: { name: "voip" },
      }));
  });

  describe("stat", () => {
    it("getStatistic", () =>
      expectRequest(() => client.stat.getStatistic({ name: "pkt4-received" }), {
        command: "statistic-get",
        arguments: { name: "pkt4-received" },
      }));
    it("getAllStatistics", () =>
      expectRequest(() => client.stat.getAllStatistics(), { command: "statistic-get-all" }));
    it("resetStatistic", () =>
      expectRequest(() => client.stat.resetStatistic({ name: "pkt4-received" }), {
        command: "statistic-reset",
        arguments: { name: "pkt4-received" },
      }));
    it("resetAllStatistics", () =>
      expectRequest(() => client.stat.resetAllStatistics(), { command: "statistic-reset-all" }));
    it("removeStatistic", () =>
      expectRequest(() => client.stat.removeStatistic({ name: "pkt4-received" }), {
        command: "statistic-remove",
        arguments: { name: "pkt4-received" },
      }));
    it("removeAllStatistics", () =>
      expectRequest(() => client.stat.removeAllStatistics(), { command: "statistic-remove-all" }));
    it("setStatisticSampleAge", () =>
      expectRequest(() => client.stat.setStatisticSampleAge({ name: "pkt4-received", duration: 60 }), {
        command: "statistic-sample-age-set",
        arguments: { name: "pkt4-received", duration: 60 },
      }));
    it("setAllStatisticsSampleAge", () =>
      expectRequest(() => client.stat.setAllStatisticsSampleAge({ duration: 60 }), {
        command: "statistic-sample-age-set-all",
        arguments: { duration: 60 },
      }));
    it("setStatisticSampleCount", () =>
      expectRequest(() => client.stat.setStatisticSampleCount({ name: "pkt4-received", "max-samples": 20 }), {
        command: "statistic-sample-count-set",
        arguments: { name: "pkt4-received", "max-samples": 20 },
      }));
    it("setAllStatisticsSampleCount", () =>
      expectRequest(() => client.stat.setAllStatisticsSampleCount({ "max-samples": 20 }), {
        command: "statistic-sample-count-set-all",
        arguments: { "max-samples": 20 },
      }));
  });

  describe("configBackend", () => {
    it("setGlobalParameter4", () =>
      expectRequest(() => client.configBackend.setGlobalParameter4({ parameters: { "valid-lifetime": 3600 } }), {
        command: "remote-global-parameter4-set",
        arguments: { parameters: { "valid-lifetime": 3600 } },
      }));
    it("getGlobalParameter4", () =>
      expectRequest(() => client.configBackend.getGlobalParameter4({ parameters: ["valid-lifetime"] }), {
        command: "remote-global-parameter4-get",
        arguments: { parameters: ["valid-lifetime"] },
      }));
    it("getAllGlobalParameters4", () =>
      expectRequest(() => client.configBackend.getAllGlobalParameters4(), {
        command: "remote-global-parameter4-get-all",
      }));
    it("delGlobalParameter4", () =>
      expectRequest(() => client.configBackend.delGlobalParameter4({ parameters: ["valid-lifetime"] }), {
        command: "remote-global-parameter4-del",
        arguments: { parameters: ["valid-lifetime"] },
      }));
    it("setGlobalParameter6", () =>
      expectRequest(() => client.configBackend.setGlobalParameter6({ parameters: { "preferred-lifetime": 1800 } }), {
        command: "remote-global-parameter6-set",
        arguments: { parameters: { "preferred-lifetime": 1800 } },
      }));
    it("setServer4 / getAllServers4", async () => {
      await expectRequest(() => client.configBackend.setServer4({ servers: [{ "server-tag": "server1" }] }), {
        command: "remote-server4-set",
        arguments: { servers: [{ "server-tag": "server1" }] },
      });
      await expectRequest(() => client.configBackend.getAllServers4(), { command: "remote-server4-get-all" });
    });
    it("setRemoteNetwork4 / listRemoteNetworks4", async () => {
      await expectRequest(() => client.configBackend.setRemoteNetwork4({ "shared-networks": [{ name: "net1" }] }), {
        command: "remote-network4-set",
        arguments: { "shared-networks": [{ name: "net1" }] },
      });
      await expectRequest(() => client.configBackend.listRemoteNetworks4(), { command: "remote-network4-list" });
    });
    it("setRemoteSubnet4 / delRemoteSubnet4ById", async () => {
      await expectRequest(() => client.configBackend.setRemoteSubnet4({ subnets: [{ id: 1, subnet: "192.0.2.0/24" }] }), {
        command: "remote-subnet4-set",
        arguments: { subnets: [{ id: 1, subnet: "192.0.2.0/24" }] },
      });
      await expectRequest(() => client.configBackend.delRemoteSubnet4ById({ subnets: [{ id: 1 }] }), {
        command: "remote-subnet4-del-by-id",
        arguments: { subnets: [{ id: 1 }] },
      });
    });
    it("setOptionGlobal4 / delOptionGlobal4", async () => {
      await expectRequest(
        () => client.configBackend.setOptionGlobal4({ options: [{ code: 6, data: "8.8.8.8" }] }),
        { command: "remote-option4-global-set", arguments: { options: [{ code: 6, data: "8.8.8.8" }] } },
      );
      await expectRequest(() => client.configBackend.delOptionGlobal4({ options: [{ code: 6 }] }), {
        command: "remote-option4-global-del",
        arguments: { options: [{ code: 6 }] },
      });
    });
    it("setOptionDef4 / getAllOptionDefs4", async () => {
      await expectRequest(
        () => client.configBackend.setOptionDef4({ "option-defs": [{ code: 224, name: "custom" }] }),
        { command: "remote-option-def4-set", arguments: { "option-defs": [{ code: 224, name: "custom" }] } },
      );
      await expectRequest(() => client.configBackend.getAllOptionDefs4(), {
        command: "remote-option-def4-get-all",
      });
    });
  });

  describe("ha", () => {
    it("getHeartbeat", () => expectRequest(() => client.ha.getHeartbeat(), { command: "ha-heartbeat" }));
    it("setScopes", () =>
      expectRequest(() => client.ha.setScopes({ scopes: ["server1"] }), {
        command: "ha-scopes",
        arguments: { scopes: ["server1"] },
      }));
    it("continueSync", () => expectRequest(() => client.ha.continueSync(), { command: "ha-continue" }));
    it("startMaintenance", () =>
      expectRequest(() => client.ha.startMaintenance({ force: true }), {
        command: "ha-maintenance-start",
        arguments: { force: true },
      }));
    it("cancelMaintenance", () =>
      expectRequest(() => client.ha.cancelMaintenance(), { command: "ha-maintenance-cancel" }));
    it("sync", () =>
      expectRequest(() => client.ha.sync({ "server-name": "server2" }), {
        command: "ha-sync",
        arguments: { "server-name": "server2" },
      }));
    it("notifySyncComplete", () =>
      expectRequest(() => client.ha.notifySyncComplete(), { command: "ha-sync-complete-notify" }));
  });
});
