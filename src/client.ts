import * as http from "node:http";
import * as https from "node:https";
import { KeaApiError, KeaTransportError } from "./error.js";
import type {
  BuildReport,
  ClassAddArgs,
  ClassDelArgs,
  ClassGetArgs,
  ClassGetResult,
  ClassListResult,
  ClassUpdateArgs,
  ConfigGetResult,
  ConfigHashGetResult,
  ConfigSetArgs,
  ConfigTestArgs,
  ConfigWriteArgs,
  ConfigWriteResult,
  DhcpDisableArgs,
  DhcpEnableArgs,
  HaHeartbeatResult,
  HaMaintenanceStartArgs,
  HaScopesArgs,
  HaSyncArgs,
  HaSyncCompleteNotifyArgs,
  InterfaceAddArgs,
  InterfaceListResult,
  JsonObject,
  KeaResponse,
  Lease4,
  Lease4GetArgs,
  Lease4GetByClientIdArgs,
  Lease4GetByHwAddressArgs,
  Lease6,
  Lease6BulkApplyArgs,
  Lease6BulkApplyResult,
  Lease6GetArgs,
  Lease6GetByDuidArgs,
  LeaseDelArgs,
  LeaseGetAllArgs,
  LeaseGetAllResult,
  LeaseGetPageArgs,
  LeaseGetPageResult,
  LeaseResendDdnsArgs,
  LeaseWipeArgs,
  LeaseWipeResult,
  LeasesReclaimArgs,
  ListCommandsResult,
  Network4AddArgs,
  Network4GetResult,
  Network4ListResult,
  Network6AddArgs,
  Network6GetResult,
  Network6ListResult,
  NetworkDelArgs,
  NetworkGetArgs,
  NetworkSubnetAddArgs,
  NetworkSubnetDelArgs,
  RemoteGlobalParameterDelArgs,
  RemoteGlobalParameterGetAllArgs,
  RemoteGlobalParameterGetArgs,
  RemoteGlobalParameterSetArgs,
  RemoteNetworkDelArgs,
  RemoteNetworkGetArgs,
  RemoteNetworkListArgs,
  RemoteNetworkSetArgs,
  RemoteOptionDefDelArgs,
  RemoteOptionDefGetAllArgs,
  RemoteOptionDefGetArgs,
  RemoteOptionDefSetArgs,
  RemoteOptionGlobalDelArgs,
  RemoteOptionGlobalGetArgs,
  RemoteOptionGlobalSetArgs,
  RemoteOptionNetworkDelArgs,
  RemoteOptionNetworkSetArgs,
  RemoteOptionPdPoolDelArgs,
  RemoteOptionPdPoolSetArgs,
  RemoteOptionPoolDelArgs,
  RemoteOptionPoolSetArgs,
  RemoteOptionSubnetDelArgs,
  RemoteOptionSubnetSetArgs,
  RemoteServerDelArgs,
  RemoteServerGetArgs,
  RemoteServerSetArgs,
  RemoteSubnetDelByIdArgs,
  RemoteSubnetDelByPrefixArgs,
  RemoteSubnetGetArgs,
  RemoteSubnetListArgs,
  RemoteSubnetSetArgs,
  ReservationAddArgs,
  ReservationDelArgs,
  ReservationGetArgs,
  ReservationGetAllArgs,
  ReservationGetByHostnameArgs,
  ReservationGetByIdArgs,
  ReservationGetPageArgs,
  ReservationGetResult,
  ReservationUpdateArgs,
  SelectTestResult,
  ServerTagGetResult,
  ShutdownArgs,
  StatisticGetArgs,
  StatisticGetResult,
  StatisticRemoveArgs,
  StatisticResetArgs,
  StatisticSampleAgeSetArgs,
  StatisticSampleCountSetArgs,
  StatusGetResult,
  Subnet4AddArgs,
  Subnet4GetResult,
  Subnet4ListResult,
  Subnet4SelectTestArgs,
  Subnet4UpdateArgs,
  Subnet4o6SelectTestArgs,
  Subnet6AddArgs,
  Subnet6GetResult,
  Subnet6ListResult,
  Subnet6SelectTestArgs,
  Subnet6UpdateArgs,
  SubnetDelArgs,
  SubnetGetArgs,
  VersionGetResult,
} from "./types.js";

export interface KeaClientOptions {
  /** Base URL of the Kea Control Agent, e.g. `http://127.0.0.1:8000`. */
  baseUrl: string;
  /** HTTP Basic Auth username, if the Control Agent has `authentication` configured. */
  username?: string;
  /** HTTP Basic Auth password. */
  password?: string;
  /** Extra headers sent with every request. */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds. Defaults to 10000. */
  timeoutMs?: number;
}

/**
 * Low-level command sender: posts `{command, service, arguments}` to the Control
 * Agent and returns the unwrapped `arguments` of the first response entry,
 * throwing {@link KeaApiError} if its `result` code is non-zero.
 */
export type Requester = <TResult, TArgs = unknown>(
  command: string,
  args?: TArgs,
  service?: string[],
) => Promise<TResult>;

/** General control commands, supported by every Kea daemon (dhcp4, dhcp6, d2, ca). */
export class ControlResource {
  constructor(private readonly request: Requester) {}

  getBuildReport(service?: string[]) {
    return this.request<BuildReport>("build-report", undefined, service);
  }

  getConfig(service?: string[]) {
    return this.request<ConfigGetResult>("config-get", undefined, service);
  }

  getConfigHash(service?: string[]) {
    return this.request<ConfigHashGetResult>("config-hash-get", undefined, service);
  }

  reloadConfig(service?: string[]) {
    return this.request<void>("config-reload", undefined, service);
  }

  setConfig(args: ConfigSetArgs, service?: string[]) {
    return this.request<void, ConfigSetArgs>("config-set", args, service);
  }

  testConfig(args: ConfigTestArgs, service?: string[]) {
    return this.request<void, ConfigTestArgs>("config-test", args, service);
  }

  writeConfig(args?: ConfigWriteArgs, service?: string[]) {
    return this.request<ConfigWriteResult, ConfigWriteArgs>("config-write", args, service);
  }

  listCommands(service?: string[]) {
    return this.request<ListCommandsResult>("list-commands", undefined, service);
  }

  shutdown(args?: ShutdownArgs, service?: string[]) {
    return this.request<void, ShutdownArgs>("shutdown", args, service);
  }

  getStatus(service?: string[]) {
    return this.request<StatusGetResult>("status-get", undefined, service);
  }

  getVersion(service?: string[]) {
    return this.request<VersionGetResult>("version-get", undefined, service);
  }

  pullConfigBackend(service?: string[]) {
    return this.request<void>("config-backend-pull", undefined, service);
  }

  getServerTag(service?: string[]) {
    return this.request<ServerTagGetResult>("server-tag-get", undefined, service);
  }

  startLfc(service?: string[]) {
    return this.request<void>("kea-lfc-start", undefined, service);
  }

  addInterface(args: InterfaceAddArgs, service?: string[]) {
    return this.request<void, InterfaceAddArgs>("interface-add", args, service);
  }

  listInterfaces(service?: string[]) {
    return this.request<InterfaceListResult>("interface-list", undefined, service);
  }

  redetectInterfaces(service?: string[]) {
    return this.request<void>("interface-redetect", undefined, service);
  }

  disableDhcp(args?: DhcpDisableArgs, service?: string[]) {
    return this.request<void, DhcpDisableArgs>("dhcp-disable", args, service);
  }

  enableDhcp(args?: DhcpEnableArgs, service?: string[]) {
    return this.request<void, DhcpEnableArgs>("dhcp-enable", args, service);
  }

  reclaimLeases(args: LeasesReclaimArgs, service?: string[]) {
    return this.request<void, LeasesReclaimArgs>("leases-reclaim", args, service);
  }

  testSubnet4Select(args: Subnet4SelectTestArgs, service?: string[]) {
    return this.request<SelectTestResult, Subnet4SelectTestArgs>("subnet4-select-test", args, service);
  }

  testSubnet4o6Select(args: Subnet4o6SelectTestArgs, service?: string[]) {
    return this.request<SelectTestResult, Subnet4o6SelectTestArgs>("subnet4o6-select-test", args, service);
  }

  testSubnet6Select(args: Subnet6SelectTestArgs, service?: string[]) {
    return this.request<SelectTestResult, Subnet6SelectTestArgs>("subnet6-select-test", args, service);
  }
}

/** `lease_cmds` hook: unified lease manipulation across memfile/MySQL/PostgreSQL backends. */
export class LeaseResource {
  constructor(private readonly request: Requester) {}

  setLease4(args: Lease4, service?: string[]) {
    return this.request<void, Lease4>("lease4-add", args, service);
  }

  getLease4(args: Lease4GetArgs, service?: string[]) {
    return this.request<Lease4, Lease4GetArgs>("lease4-get", args, service);
  }

  getLease4ByHwAddress(args: Lease4GetByHwAddressArgs, service?: string[]) {
    return this.request<LeaseGetAllResult<Lease4>, Lease4GetByHwAddressArgs>(
      "lease4-get-by-hw-address",
      args,
      service,
    );
  }

  getLease4ByClientId(args: Lease4GetByClientIdArgs, service?: string[]) {
    return this.request<LeaseGetAllResult<Lease4>, Lease4GetByClientIdArgs>(
      "lease4-get-by-client-id",
      args,
      service,
    );
  }

  delLease4(args: LeaseDelArgs, service?: string[]) {
    return this.request<void, LeaseDelArgs>("lease4-del", args, service);
  }

  updateLease4(args: Lease4, service?: string[]) {
    return this.request<void, Lease4>("lease4-update", args, service);
  }

  wipeLease4(args?: LeaseWipeArgs, service?: string[]) {
    return this.request<LeaseWipeResult, LeaseWipeArgs>("lease4-wipe", args, service);
  }

  getAllLeases4(args?: LeaseGetAllArgs, service?: string[]) {
    return this.request<LeaseGetAllResult<Lease4>, LeaseGetAllArgs>("lease4-get-all", args, service);
  }

  getLease4Page(args: LeaseGetPageArgs, service?: string[]) {
    return this.request<LeaseGetPageResult<Lease4>, LeaseGetPageArgs>("lease4-get-page", args, service);
  }

  resendLease4Ddns(args: LeaseResendDdnsArgs, service?: string[]) {
    return this.request<void, LeaseResendDdnsArgs>("lease4-resend-ddns", args, service);
  }

  setLease6(args: Lease6, service?: string[]) {
    return this.request<void, Lease6>("lease6-add", args, service);
  }

  getLease6(args: Lease6GetArgs, service?: string[]) {
    return this.request<Lease6, Lease6GetArgs>("lease6-get", args, service);
  }

  getLease6ByDuid(args: Lease6GetByDuidArgs, service?: string[]) {
    return this.request<LeaseGetAllResult<Lease6>, Lease6GetByDuidArgs>("lease6-get-by-duid", args, service);
  }

  delLease6(args: LeaseDelArgs, service?: string[]) {
    return this.request<void, LeaseDelArgs>("lease6-del", args, service);
  }

  updateLease6(args: Lease6, service?: string[]) {
    return this.request<void, Lease6>("lease6-update", args, service);
  }

  wipeLease6(args?: LeaseWipeArgs, service?: string[]) {
    return this.request<LeaseWipeResult, LeaseWipeArgs>("lease6-wipe", args, service);
  }

  getAllLeases6(args?: LeaseGetAllArgs, service?: string[]) {
    return this.request<LeaseGetAllResult<Lease6>, LeaseGetAllArgs>("lease6-get-all", args, service);
  }

  getLease6Page(args: LeaseGetPageArgs, service?: string[]) {
    return this.request<LeaseGetPageResult<Lease6>, LeaseGetPageArgs>("lease6-get-page", args, service);
  }

  resendLease6Ddns(args: LeaseResendDdnsArgs, service?: string[]) {
    return this.request<void, LeaseResendDdnsArgs>("lease6-resend-ddns", args, service);
  }

  bulkApplyLease6(args: Lease6BulkApplyArgs, service?: string[]) {
    return this.request<Lease6BulkApplyResult, Lease6BulkApplyArgs>("lease6-bulk-apply", args, service);
  }
}

/** `host_cmds` hook: host reservation management. */
export class HostResource {
  constructor(private readonly request: Requester) {}

  setReservation(args: ReservationAddArgs, service?: string[]) {
    return this.request<void, ReservationAddArgs>("reservation-add", args, service);
  }

  getReservation(args: ReservationGetArgs, service?: string[]) {
    return this.request<ReservationGetResult, ReservationGetArgs>("reservation-get", args, service);
  }

  getAllReservations(args?: ReservationGetAllArgs, service?: string[]) {
    return this.request<ReservationGetResult, ReservationGetAllArgs>("reservation-get-all", args, service);
  }

  getReservationPage(args: ReservationGetPageArgs, service?: string[]) {
    return this.request<ReservationGetResult, ReservationGetPageArgs>("reservation-get-page", args, service);
  }

  getReservationByHostname(args: ReservationGetByHostnameArgs, service?: string[]) {
    return this.request<ReservationGetResult, ReservationGetByHostnameArgs>(
      "reservation-get-by-hostname",
      args,
      service,
    );
  }

  getReservationById(args: ReservationGetByIdArgs, service?: string[]) {
    return this.request<ReservationGetResult, ReservationGetByIdArgs>("reservation-get-by-id", args, service);
  }

  delReservation(args: ReservationDelArgs, service?: string[]) {
    return this.request<void, ReservationDelArgs>("reservation-del", args, service);
  }

  updateReservation(args: ReservationUpdateArgs, service?: string[]) {
    return this.request<void, ReservationUpdateArgs>("reservation-update", args, service);
  }
}

/** `subnet_cmds` hook: incremental subnet and shared-network configuration changes. */
export class SubnetResource {
  constructor(private readonly request: Requester) {}

  setSubnet4(args: Subnet4AddArgs, service?: string[]) {
    return this.request<void, Subnet4AddArgs>("subnet4-add", args, service);
  }

  delSubnet4(args: SubnetDelArgs, service?: string[]) {
    return this.request<void, SubnetDelArgs>("subnet4-del", args, service);
  }

  updateSubnet4(args: Subnet4UpdateArgs, service?: string[]) {
    return this.request<void, Subnet4UpdateArgs>("subnet4-update", args, service);
  }

  listSubnets4(service?: string[]) {
    return this.request<Subnet4ListResult>("subnet4-list", undefined, service);
  }

  getSubnet4(args: SubnetGetArgs, service?: string[]) {
    return this.request<Subnet4GetResult, SubnetGetArgs>("subnet4-get", args, service);
  }

  setSubnet6(args: Subnet6AddArgs, service?: string[]) {
    return this.request<void, Subnet6AddArgs>("subnet6-add", args, service);
  }

  delSubnet6(args: SubnetDelArgs, service?: string[]) {
    return this.request<void, SubnetDelArgs>("subnet6-del", args, service);
  }

  updateSubnet6(args: Subnet6UpdateArgs, service?: string[]) {
    return this.request<void, Subnet6UpdateArgs>("subnet6-update", args, service);
  }

  listSubnets6(service?: string[]) {
    return this.request<Subnet6ListResult>("subnet6-list", undefined, service);
  }

  getSubnet6(args: SubnetGetArgs, service?: string[]) {
    return this.request<Subnet6GetResult, SubnetGetArgs>("subnet6-get", args, service);
  }

  setNetwork4(args: Network4AddArgs, service?: string[]) {
    return this.request<void, Network4AddArgs>("network4-add", args, service);
  }

  delNetwork4(args: NetworkDelArgs, service?: string[]) {
    return this.request<void, NetworkDelArgs>("network4-del", args, service);
  }

  addNetworkSubnet4(args: NetworkSubnetAddArgs, service?: string[]) {
    return this.request<void, NetworkSubnetAddArgs>("network4-subnet-add", args, service);
  }

  delNetworkSubnet4(args: NetworkSubnetDelArgs, service?: string[]) {
    return this.request<void, NetworkSubnetDelArgs>("network4-subnet-del", args, service);
  }

  listNetworks4(service?: string[]) {
    return this.request<Network4ListResult>("network4-list", undefined, service);
  }

  getNetwork4(args: NetworkGetArgs, service?: string[]) {
    return this.request<Network4GetResult, NetworkGetArgs>("network4-get", args, service);
  }

  setNetwork6(args: Network6AddArgs, service?: string[]) {
    return this.request<void, Network6AddArgs>("network6-add", args, service);
  }

  delNetwork6(args: NetworkDelArgs, service?: string[]) {
    return this.request<void, NetworkDelArgs>("network6-del", args, service);
  }

  addNetworkSubnet6(args: NetworkSubnetAddArgs, service?: string[]) {
    return this.request<void, NetworkSubnetAddArgs>("network6-subnet-add", args, service);
  }

  delNetworkSubnet6(args: NetworkSubnetDelArgs, service?: string[]) {
    return this.request<void, NetworkSubnetDelArgs>("network6-subnet-del", args, service);
  }

  listNetworks6(service?: string[]) {
    return this.request<Network6ListResult>("network6-list", undefined, service);
  }

  getNetwork6(args: NetworkGetArgs, service?: string[]) {
    return this.request<Network6GetResult, NetworkGetArgs>("network6-get", args, service);
  }
}

/** `class_cmds` hook: client class management without a server restart. */
export class ClassResource {
  constructor(private readonly request: Requester) {}

  setClass(args: ClassAddArgs, service?: string[]) {
    return this.request<void, ClassAddArgs>("class-add", args, service);
  }

  updateClass(args: ClassUpdateArgs, service?: string[]) {
    return this.request<void, ClassUpdateArgs>("class-update", args, service);
  }

  delClass(args: ClassDelArgs, service?: string[]) {
    return this.request<void, ClassDelArgs>("class-del", args, service);
  }

  getClass(args: ClassGetArgs, service?: string[]) {
    return this.request<ClassGetResult, ClassGetArgs>("class-get", args, service);
  }

  listClasses(service?: string[]) {
    return this.request<ClassListResult>("class-list", undefined, service);
  }
}

/** `stat_cmds` hook: lease/packet statistic inspection and management. */
export class StatResource {
  constructor(private readonly request: Requester) {}

  getStatistic(args: StatisticGetArgs, service?: string[]) {
    return this.request<StatisticGetResult, StatisticGetArgs>("statistic-get", args, service);
  }

  getAllStatistics(service?: string[]) {
    return this.request<StatisticGetResult>("statistic-get-all", undefined, service);
  }

  resetStatistic(args: StatisticResetArgs, service?: string[]) {
    return this.request<void, StatisticResetArgs>("statistic-reset", args, service);
  }

  resetAllStatistics(service?: string[]) {
    return this.request<void>("statistic-reset-all", undefined, service);
  }

  removeStatistic(args: StatisticRemoveArgs, service?: string[]) {
    return this.request<void, StatisticRemoveArgs>("statistic-remove", args, service);
  }

  removeAllStatistics(service?: string[]) {
    return this.request<void>("statistic-remove-all", undefined, service);
  }

  setStatisticSampleAge(args: StatisticSampleAgeSetArgs, service?: string[]) {
    return this.request<void, StatisticSampleAgeSetArgs>("statistic-sample-age-set", args, service);
  }

  setAllStatisticsSampleAge(args: { duration: number }, service?: string[]) {
    return this.request<void, { duration: number }>("statistic-sample-age-set-all", args, service);
  }

  setStatisticSampleCount(args: StatisticSampleCountSetArgs, service?: string[]) {
    return this.request<void, StatisticSampleCountSetArgs>("statistic-sample-count-set", args, service);
  }

  setAllStatisticsSampleCount(args: { "max-samples": number }, service?: string[]) {
    return this.request<void, { "max-samples": number }>("statistic-sample-count-set-all", args, service);
  }
}

/** Configuration Backend commands (`libdhcp_cb_cmds.so`), operating on a database-backed config. */
export class ConfigBackendResource {
  constructor(private readonly request: Requester) {}

  setGlobalParameter4(args: RemoteGlobalParameterSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterSetArgs>("remote-global-parameter4-set", args, service);
  }
  getGlobalParameter4(args: RemoteGlobalParameterGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterGetArgs>("remote-global-parameter4-get", args, service);
  }
  getAllGlobalParameters4(args?: RemoteGlobalParameterGetAllArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterGetAllArgs>(
      "remote-global-parameter4-get-all",
      args,
      service,
    );
  }
  delGlobalParameter4(args: RemoteGlobalParameterDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterDelArgs>("remote-global-parameter4-del", args, service);
  }

  setGlobalParameter6(args: RemoteGlobalParameterSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterSetArgs>("remote-global-parameter6-set", args, service);
  }
  getGlobalParameter6(args: RemoteGlobalParameterGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterGetArgs>("remote-global-parameter6-get", args, service);
  }
  getAllGlobalParameters6(args?: RemoteGlobalParameterGetAllArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterGetAllArgs>(
      "remote-global-parameter6-get-all",
      args,
      service,
    );
  }
  delGlobalParameter6(args: RemoteGlobalParameterDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteGlobalParameterDelArgs>("remote-global-parameter6-del", args, service);
  }

  setServer4(args: RemoteServerSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteServerSetArgs>("remote-server4-set", args, service);
  }
  getServer4(args: RemoteServerGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteServerGetArgs>("remote-server4-get", args, service);
  }
  getAllServers4(service?: string[]) {
    return this.request<JsonObject>("remote-server4-get-all", undefined, service);
  }
  delServer4(args: RemoteServerDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteServerDelArgs>("remote-server4-del", args, service);
  }

  setServer6(args: RemoteServerSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteServerSetArgs>("remote-server6-set", args, service);
  }
  getServer6(args: RemoteServerGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteServerGetArgs>("remote-server6-get", args, service);
  }
  getAllServers6(service?: string[]) {
    return this.request<JsonObject>("remote-server6-get-all", undefined, service);
  }
  delServer6(args: RemoteServerDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteServerDelArgs>("remote-server6-del", args, service);
  }

  setRemoteNetwork4(args: RemoteNetworkSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkSetArgs>("remote-network4-set", args, service);
  }
  getRemoteNetwork4(args: RemoteNetworkGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkGetArgs>("remote-network4-get", args, service);
  }
  listRemoteNetworks4(args?: RemoteNetworkListArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkListArgs>("remote-network4-list", args, service);
  }
  delRemoteNetwork4(args: RemoteNetworkDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkDelArgs>("remote-network4-del", args, service);
  }

  setRemoteNetwork6(args: RemoteNetworkSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkSetArgs>("remote-network6-set", args, service);
  }
  getRemoteNetwork6(args: RemoteNetworkGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkGetArgs>("remote-network6-get", args, service);
  }
  listRemoteNetworks6(args?: RemoteNetworkListArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkListArgs>("remote-network6-list", args, service);
  }
  delRemoteNetwork6(args: RemoteNetworkDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteNetworkDelArgs>("remote-network6-del", args, service);
  }

  setRemoteSubnet4(args: RemoteSubnetSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetSetArgs>("remote-subnet4-set", args, service);
  }
  getRemoteSubnet4(args: RemoteSubnetGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetGetArgs>("remote-subnet4-get", args, service);
  }
  delRemoteSubnet4ById(args: RemoteSubnetDelByIdArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetDelByIdArgs>("remote-subnet4-del-by-id", args, service);
  }
  delRemoteSubnet4ByPrefix(args: RemoteSubnetDelByPrefixArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetDelByPrefixArgs>("remote-subnet4-del-by-prefix", args, service);
  }
  listRemoteSubnets4(args?: RemoteSubnetListArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetListArgs>("remote-subnet4-list", args, service);
  }

  setRemoteSubnet6(args: RemoteSubnetSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetSetArgs>("remote-subnet6-set", args, service);
  }
  getRemoteSubnet6(args: RemoteSubnetGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetGetArgs>("remote-subnet6-get", args, service);
  }
  delRemoteSubnet6ById(args: RemoteSubnetDelByIdArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetDelByIdArgs>("remote-subnet6-del-by-id", args, service);
  }
  delRemoteSubnet6ByPrefix(args: RemoteSubnetDelByPrefixArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetDelByPrefixArgs>("remote-subnet6-del-by-prefix", args, service);
  }
  listRemoteSubnets6(args?: RemoteSubnetListArgs, service?: string[]) {
    return this.request<JsonObject, RemoteSubnetListArgs>("remote-subnet6-list", args, service);
  }

  setOptionGlobal4(args: RemoteOptionGlobalSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionGlobalSetArgs>("remote-option4-global-set", args, service);
  }
  getOptionGlobal4(args: RemoteOptionGlobalGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionGlobalGetArgs>("remote-option4-global-get", args, service);
  }
  getAllOptionsGlobal4(service?: string[]) {
    return this.request<JsonObject>("remote-option4-global-get-all", undefined, service);
  }
  delOptionGlobal4(args: RemoteOptionGlobalDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionGlobalDelArgs>("remote-option4-global-del", args, service);
  }

  setOptionGlobal6(args: RemoteOptionGlobalSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionGlobalSetArgs>("remote-option6-global-set", args, service);
  }
  getOptionGlobal6(args: RemoteOptionGlobalGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionGlobalGetArgs>("remote-option6-global-get", args, service);
  }
  getAllOptionsGlobal6(service?: string[]) {
    return this.request<JsonObject>("remote-option6-global-get-all", undefined, service);
  }
  delOptionGlobal6(args: RemoteOptionGlobalDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionGlobalDelArgs>("remote-option6-global-del", args, service);
  }

  setOptionNetwork4(args: RemoteOptionNetworkSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionNetworkSetArgs>("remote-option4-network-set", args, service);
  }
  delOptionNetwork4(args: RemoteOptionNetworkDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionNetworkDelArgs>("remote-option4-network-del", args, service);
  }
  setOptionNetwork6(args: RemoteOptionNetworkSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionNetworkSetArgs>("remote-option6-network-set", args, service);
  }
  delOptionNetwork6(args: RemoteOptionNetworkDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionNetworkDelArgs>("remote-option6-network-del", args, service);
  }

  setOptionSubnet4(args: RemoteOptionSubnetSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionSubnetSetArgs>("remote-option4-subnet-set", args, service);
  }
  delOptionSubnet4(args: RemoteOptionSubnetDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionSubnetDelArgs>("remote-option4-subnet-del", args, service);
  }
  setOptionSubnet6(args: RemoteOptionSubnetSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionSubnetSetArgs>("remote-option6-subnet-set", args, service);
  }
  delOptionSubnet6(args: RemoteOptionSubnetDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionSubnetDelArgs>("remote-option6-subnet-del", args, service);
  }

  setOptionPool4(args: RemoteOptionPoolSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionPoolSetArgs>("remote-option4-pool-set", args, service);
  }
  delOptionPool4(args: RemoteOptionPoolDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionPoolDelArgs>("remote-option4-pool-del", args, service);
  }
  setOptionPool6(args: RemoteOptionPoolSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionPoolSetArgs>("remote-option6-pool-set", args, service);
  }
  delOptionPool6(args: RemoteOptionPoolDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionPoolDelArgs>("remote-option6-pool-del", args, service);
  }
  setOptionPdPool6(args: RemoteOptionPdPoolSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionPdPoolSetArgs>("remote-option6-pd-pool-set", args, service);
  }
  delOptionPdPool6(args: RemoteOptionPdPoolDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionPdPoolDelArgs>("remote-option6-pd-pool-del", args, service);
  }

  setOptionDef4(args: RemoteOptionDefSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefSetArgs>("remote-option-def4-set", args, service);
  }
  getOptionDef4(args: RemoteOptionDefGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefGetArgs>("remote-option-def4-get", args, service);
  }
  getAllOptionDefs4(args?: RemoteOptionDefGetAllArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefGetAllArgs>("remote-option-def4-get-all", args, service);
  }
  delOptionDef4(args: RemoteOptionDefDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefDelArgs>("remote-option-def4-del", args, service);
  }

  setOptionDef6(args: RemoteOptionDefSetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefSetArgs>("remote-option-def6-set", args, service);
  }
  getOptionDef6(args: RemoteOptionDefGetArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefGetArgs>("remote-option-def6-get", args, service);
  }
  getAllOptionDefs6(args?: RemoteOptionDefGetAllArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefGetAllArgs>("remote-option-def6-get-all", args, service);
  }
  delOptionDef6(args: RemoteOptionDefDelArgs, service?: string[]) {
    return this.request<JsonObject, RemoteOptionDefDelArgs>("remote-option-def6-del", args, service);
  }
}

/** High Availability hook commands (`libdhcp_ha.so`). */
export class HaResource {
  constructor(private readonly request: Requester) {}

  getHeartbeat(service?: string[]) {
    return this.request<HaHeartbeatResult>("ha-heartbeat", undefined, service);
  }

  setScopes(args: HaScopesArgs, service?: string[]) {
    return this.request<void, HaScopesArgs>("ha-scopes", args, service);
  }

  continueSync(service?: string[]) {
    return this.request<void>("ha-continue", undefined, service);
  }

  startMaintenance(args?: HaMaintenanceStartArgs, service?: string[]) {
    return this.request<void, HaMaintenanceStartArgs>("ha-maintenance-start", args, service);
  }

  cancelMaintenance(service?: string[]) {
    return this.request<void>("ha-maintenance-cancel", undefined, service);
  }

  sync(args: HaSyncArgs, service?: string[]) {
    return this.request<void, HaSyncArgs>("ha-sync", args, service);
  }

  notifySyncComplete(args?: HaSyncCompleteNotifyArgs, service?: string[]) {
    return this.request<void, HaSyncCompleteNotifyArgs>("ha-sync-complete-notify", args, service);
  }
}

/**
 * Thin typed client for the Kea Control Agent HTTP command API.
 * See https://kea.readthedocs.io/en/latest/arm/ctrl-channel.html
 */
export class KeaClient {
  private readonly baseUrl: URL;
  private readonly timeoutMs: number;
  private readonly headers: Record<string, string>;

  readonly control: ControlResource;
  readonly lease: LeaseResource;
  readonly host: HostResource;
  readonly subnet: SubnetResource;
  readonly class: ClassResource;
  readonly stat: StatResource;
  readonly configBackend: ConfigBackendResource;
  readonly ha: HaResource;

  constructor(options: KeaClientOptions) {
    this.baseUrl = new URL(options.baseUrl);
    this.timeoutMs = options.timeoutMs ?? 10000;
    this.headers = { ...options.headers };
    if (options.username !== undefined) {
      const token = Buffer.from(`${options.username}:${options.password ?? ""}`).toString("base64");
      this.headers.authorization = `Basic ${token}`;
    }

    const request = this.request.bind(this);
    this.control = new ControlResource(request);
    this.lease = new LeaseResource(request);
    this.host = new HostResource(request);
    this.subnet = new SubnetResource(request);
    this.class = new ClassResource(request);
    this.stat = new StatResource(request);
    this.configBackend = new ConfigBackendResource(request);
    this.ha = new HaResource(request);
  }

  /**
   * Sends a raw command and returns every response entry unwrapped, one per
   * targeted service, without throwing on individual failures. Use this for
   * commands issued against multiple `service` targets at once; prefer the
   * typed resource methods (`client.lease`, `client.subnet`, ...) otherwise.
   */
  sendRaw<TResult = unknown, TArgs = unknown>(
    command: string,
    args?: TArgs,
    service?: string[],
  ): Promise<KeaResponse<TResult>[]> {
    return this.post(command, args, service);
  }

  private async request<TResult, TArgs = unknown>(
    command: string,
    args?: TArgs,
    service?: string[],
  ): Promise<TResult> {
    const responses = await this.post<TResult, TArgs>(command, args, service);
    const [first] = responses;
    if (!first) {
      throw new KeaTransportError(`Kea command "${command}" returned an empty response`);
    }
    if (first.result !== 0) {
      throw new KeaApiError(command, first.result, first.text, service?.[0]);
    }
    return first.arguments as TResult;
  }

  private post<TResult, TArgs>(
    command: string,
    args: TArgs | undefined,
    service: string[] | undefined,
  ): Promise<KeaResponse<TResult>[]> {
    const payload = JSON.stringify({
      command,
      ...(service ? { service } : {}),
      ...(args !== undefined ? { arguments: args } : {}),
    });

    const transport = this.baseUrl.protocol === "https:" ? https : http;

    return new Promise((resolve, reject) => {
      const req = transport.request(
        {
          protocol: this.baseUrl.protocol,
          hostname: this.baseUrl.hostname,
          port: this.baseUrl.port,
          path: this.baseUrl.pathname === "/" ? "/" : this.baseUrl.pathname,
          method: "POST",
          timeout: this.timeoutMs,
          headers: {
            ...this.headers,
            "content-type": "application/json",
            "content-length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            const raw = Buffer.concat(chunks).toString("utf8");
            const status = res.statusCode ?? 0;

            if (status < 200 || status >= 300) {
              reject(new KeaTransportError(raw || `Kea Control Agent request failed with status ${status}`, status));
              return;
            }

            try {
              const parsed = raw ? JSON.parse(raw) : [];
              resolve(Array.isArray(parsed) ? parsed : [parsed]);
            } catch (err) {
              reject(new KeaTransportError(`Failed to parse Kea Control Agent response: ${(err as Error).message}`));
            }
          });
        },
      );

      req.on("error", reject);
      req.on("timeout", () => req.destroy(new Error(`Kea Control Agent request timed out after ${this.timeoutMs}ms`)));

      req.write(payload);
      req.end();
    });
  }
}
