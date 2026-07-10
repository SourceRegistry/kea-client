/** Name of a Kea daemon that can be targeted via the `service` field of a command. */
export type KeaService = "dhcp4" | "dhcp6" | "d2" | "ca";

/** A single entry of a Kea Control Agent response array. */
export interface KeaResponse<T = unknown> {
  result: number;
  text?: string;
  arguments?: T;
}

/** Loosely-typed JSON object, used for Kea config fragments whose full schema
 * is defined by the Kea JSON config grammar rather than this client. */
export type JsonObject = Record<string, unknown>;

// ---------------------------------------------------------------------------
// General / control commands
// ---------------------------------------------------------------------------

export interface BuildReport {
  text: string;
}

export interface ConfigGetResult {
  Dhcp4?: JsonObject;
  Dhcp6?: JsonObject;
  D2?: JsonObject;
  Control?: JsonObject;
  hash?: string;
  [key: string]: unknown;
}

export interface ConfigHashGetResult {
  hash: string;
}

export interface ConfigSetArgs {
  [daemon: string]: JsonObject | undefined;
}

export interface ConfigTestArgs {
  [daemon: string]: JsonObject | undefined;
}

export interface ConfigWriteArgs {
  filename?: string;
}

export interface ConfigWriteResult {
  filename: string;
  size: number;
}

export interface ListCommandsResult extends Array<string> {}

export interface ShutdownArgs {
  "exit-value"?: number;
  type?: "now" | "engine-init" | "engine-restart";
}

export interface StatusGetResult {
  pid: number;
  uptime: number;
  reload: number;
  "multi-threading-enabled"?: boolean;
  "thread-pool-size"?: number;
  "packet-queue-size"?: number;
  "high-availability"?: JsonObject[];
  [key: string]: unknown;
}

export interface VersionGetResult {
  extended: string;
}

export interface ServerTagGetResult {
  "server-tag": string;
}

export interface InterfaceAddArgs {
  interfaces: string[];
}

export interface InterfaceListResult {
  interfaces: string[];
}

export interface DhcpDisableArgs {
  "max-period"?: number;
  origin?: string;
  "origin-id"?: number;
}

export interface DhcpEnableArgs {
  origin?: string;
  "origin-id"?: number;
}

export interface LeasesReclaimArgs {
  remove: boolean;
}

export interface Subnet4SelectTestArgs {
  interface?: string;
  address?: string;
  relay?: string;
  local?: string;
  remote?: string;
  link?: string;
  subnet?: string;
  classes?: string[];
}

export interface Subnet4o6SelectTestArgs extends Subnet4SelectTestArgs {
  "interface-id"?: string;
}

export interface Subnet6SelectTestArgs {
  interface?: string;
  "interface-id"?: string;
  remote?: string;
  link?: string;
  classes?: string[];
}

export interface SelectTestResult {
  subnet4?: JsonObject;
  subnet6?: JsonObject;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// lease_cmds
// ---------------------------------------------------------------------------

export interface Lease4 {
  "ip-address": string;
  "hw-address"?: string;
  "client-id"?: string;
  valid_lft?: number;
  "valid-lft"?: number;
  expire?: number;
  subnet_id?: number;
  "subnet-id"?: number;
  "fqdn-fwd"?: boolean;
  "fqdn-rev"?: boolean;
  hostname?: string;
  state?: number;
  "user-context"?: JsonObject;
  [key: string]: unknown;
}

export interface Lease6 {
  "ip-address": string;
  duid?: string;
  "iaid"?: number;
  "valid-lft"?: number;
  "preferred-lft"?: number;
  expire?: number;
  "subnet-id"?: number;
  "fqdn-fwd"?: boolean;
  "fqdn-rev"?: boolean;
  hostname?: string;
  state?: number;
  type?: "IA_NA" | "IA_PD" | "IA_TA";
  "prefix-len"?: number;
  "user-context"?: JsonObject;
  [key: string]: unknown;
}

export interface Lease4GetArgs {
  "ip-address"?: string;
  "subnet-id"?: number;
  identifier?: string;
  "identifier-type"?: "hw-address" | "client-id";
}

export interface Lease4GetByHwAddressArgs {
  "hw-address": string;
}

export interface Lease4GetByClientIdArgs {
  "client-id": string;
}

export interface Lease6GetArgs {
  "ip-address"?: string;
  "subnet-id"?: number;
  "type"?: "IA_NA" | "IA_PD" | "IA_TA";
  duid?: string;
  iaid?: number;
}

export interface Lease6GetByDuidArgs {
  duid: string;
}

export interface LeaseDelArgs {
  "ip-address"?: string;
  "subnet-id"?: number;
  identifier?: string;
  "identifier-type"?: string;
  type?: "IA_NA" | "IA_PD" | "IA_TA";
}

export interface LeaseWipeArgs {
  "subnet-id"?: number | number[];
}

export interface LeaseWipeResult {
  leases: number;
}

export interface LeaseGetAllArgs {
  subnets?: number[];
}

export interface LeaseGetAllResult<T> {
  leases: T[];
  count?: number;
}

export interface LeaseGetPageArgs {
  "from"?: string | "start";
  limit: number;
  "subnet-id"?: number;
}

export interface LeaseGetPageResult<T> {
  leases: T[];
  count: number;
}

export interface LeaseResendDdnsArgs {
  "ip-address": string;
}

export interface Lease6BulkApplyArgs {
  "deleted-leases"?: Lease6[];
  leases?: Lease6[];
}

export interface Lease6BulkApplyResult {
  "failed-deleted-leases"?: JsonObject[];
  "failed-leases"?: JsonObject[];
}

// ---------------------------------------------------------------------------
// host_cmds (reservations)
// ---------------------------------------------------------------------------

export interface HostReservation {
  "subnet-id"?: number;
  "subnet-id4"?: number;
  "subnet-id6"?: number;
  "ip-address"?: string;
  "ip-addresses"?: string[];
  prefixes?: string[];
  duid?: string;
  "hw-address"?: string;
  "circuit-id"?: string;
  "client-id"?: string;
  "flex-id"?: string;
  hostname?: string;
  "option-data"?: JsonObject[];
  "client-classes"?: string[];
  "user-context"?: JsonObject;
  [key: string]: unknown;
}

export interface ReservationAddArgs {
  reservation: HostReservation;
}

export interface ReservationGetArgs {
  "subnet-id": number;
  "ip-address"?: string;
  identifier?: string;
  "identifier-type"?: "hw-address" | "duid" | "circuit-id" | "client-id" | "flex-id";
}

export interface ReservationGetResult {
  hosts?: HostReservation[];
}

export interface ReservationGetAllArgs {
  "subnet-id"?: number;
}

export interface ReservationGetPageArgs {
  "subnet-id"?: number;
  "source-index": number;
  from?: string;
  limit: number;
}

export interface ReservationGetByHostnameArgs {
  hostname: string;
  "subnet-id"?: number;
}

export interface ReservationGetByIdArgs {
  "identifier-type": "hw-address" | "duid" | "circuit-id" | "client-id" | "flex-id";
  identifier: string;
}

export interface ReservationDelArgs {
  "subnet-id": number;
  "ip-address"?: string;
  identifier?: string;
  "identifier-type"?: string;
}

export interface ReservationUpdateArgs {
  reservation: HostReservation;
}

// ---------------------------------------------------------------------------
// subnet_cmds
// ---------------------------------------------------------------------------

export interface Subnet4Config extends JsonObject {
  id?: number;
  subnet: string;
  pools?: JsonObject[];
}

export interface Subnet6Config extends JsonObject {
  id?: number;
  subnet: string;
  pools?: JsonObject[];
  "pd-pools"?: JsonObject[];
}

export interface SharedNetwork4Config extends JsonObject {
  name: string;
  subnet4?: Subnet4Config[];
}

export interface SharedNetwork6Config extends JsonObject {
  name: string;
  subnet6?: Subnet6Config[];
}

export interface Subnet4AddArgs {
  subnet4: Subnet4Config[];
}

export interface Subnet6AddArgs {
  subnet6: Subnet6Config[];
}

export interface SubnetDelArgs {
  id: number;
}

export interface Subnet4UpdateArgs {
  subnet4: Subnet4Config[];
}

export interface Subnet6UpdateArgs {
  subnet6: Subnet6Config[];
}

export interface Subnet4ListResult {
  subnets: Array<{ id: number; subnet: string }>;
}

export interface Subnet6ListResult {
  subnets: Array<{ id: number; subnet: string }>;
}

export interface SubnetGetArgs {
  id?: number;
  subnet?: string;
}

export interface Subnet4GetResult {
  subnet4: Subnet4Config[];
}

export interface Subnet6GetResult {
  subnet6: Subnet6Config[];
}

export interface Network4AddArgs {
  "shared-networks": SharedNetwork4Config[];
}

export interface Network6AddArgs {
  "shared-networks": SharedNetwork6Config[];
}

export interface NetworkDelArgs {
  name: string;
  subnets_action?: "keep" | "remove";
  "subnets-action"?: "keep" | "remove";
}

export interface NetworkSubnetAddArgs {
  name: string;
  id: number;
}

export interface NetworkSubnetDelArgs {
  name: string;
  id: number;
}

export interface Network4ListResult {
  "shared-networks": Array<{ name: string }>;
}

export interface Network6ListResult {
  "shared-networks": Array<{ name: string }>;
}

export interface NetworkGetArgs {
  name: string;
}

export interface Network4GetResult {
  "shared-network": SharedNetwork4Config;
}

export interface Network6GetResult {
  "shared-network": SharedNetwork6Config;
}

// ---------------------------------------------------------------------------
// class_cmds
// ---------------------------------------------------------------------------

export interface ClientClassConfig extends JsonObject {
  name: string;
  test?: string;
  "option-data"?: JsonObject[];
  "option-def"?: JsonObject[];
  "next-server"?: string;
  "server-hostname"?: string;
  "boot-file-name"?: string;
  "only-in-additional-list"?: boolean;
  "valid-lifetime"?: number;
}

export interface ClassAddArgs {
  "client-classes": ClientClassConfig[];
}

export interface ClassUpdateArgs {
  "client-classes": ClientClassConfig[];
}

export interface ClassDelArgs {
  name: string;
}

export interface ClassGetArgs {
  name: string;
}

export interface ClassGetResult {
  "client-classes": ClientClassConfig[];
}

export interface ClassListResult {
  "client-classes": Array<{ name: string }>;
}

// ---------------------------------------------------------------------------
// stat_cmds
// ---------------------------------------------------------------------------

export type StatisticSample = [number, string];

export interface StatisticGetArgs {
  name: string;
}

export interface StatisticGetResult {
  [name: string]: StatisticSample[];
}

export interface StatisticResetArgs {
  name: string;
}

export interface StatisticRemoveArgs {
  name: string;
}

export interface StatisticSampleAgeSetArgs {
  name: string;
  duration: number;
}

export interface StatisticSampleCountSetArgs {
  name: string;
  "max-samples": number;
}

// ---------------------------------------------------------------------------
// cb_cmds (Configuration Backend commands, remote-*)
// ---------------------------------------------------------------------------

export interface RemoteServerSelector {
  "server-tags": string[];
}

export interface RemoteMapArgs {
  "remote-map"?: JsonObject;
}

export interface RemoteGlobalParameterSetArgs extends RemoteMapArgs {
  parameters: JsonObject;
}

export interface RemoteGlobalParameterGetArgs extends RemoteMapArgs {
  parameters: string[];
}

export interface RemoteGlobalParameterGetAllArgs extends RemoteMapArgs {}

export interface RemoteGlobalParameterDelArgs extends RemoteMapArgs {
  parameters: string[];
}

export interface RemoteServer {
  "server-tag": string;
  description?: string;
}

export interface RemoteServerSetArgs {
  servers: RemoteServer[];
}

export interface RemoteServerGetArgs {
  servers: Array<{ "server-tag": string }>;
}

export interface RemoteServerDelArgs {
  servers: Array<{ "server-tag": string }>;
}

export interface RemoteNetworkSetArgs extends RemoteMapArgs {
  "shared-networks": JsonObject[];
}

export interface RemoteNetworkGetArgs extends RemoteMapArgs {
  "shared-networks": Array<{ name: string }>;
}

export interface RemoteNetworkDelArgs extends RemoteMapArgs {
  "shared-networks": Array<{ name: string }>;
}

export interface RemoteNetworkListArgs extends RemoteMapArgs {}

export interface RemoteSubnetSetArgs extends RemoteMapArgs {
  subnets: JsonObject[];
}

export interface RemoteSubnetGetArgs extends RemoteMapArgs {
  subnets: Array<{ id: number } | { subnet: string }>;
}

export interface RemoteSubnetDelByIdArgs extends RemoteMapArgs {
  subnets: Array<{ id: number }>;
}

export interface RemoteSubnetDelByPrefixArgs extends RemoteMapArgs {
  subnets: Array<{ subnet: string }>;
}

export interface RemoteSubnetListArgs extends RemoteMapArgs {}

export interface RemoteOptionGlobalSetArgs extends RemoteMapArgs {
  options: JsonObject[];
}

export interface RemoteOptionGlobalGetArgs extends RemoteMapArgs {
  options: Array<{ code: number; space?: string }>;
}

export interface RemoteOptionGlobalDelArgs extends RemoteMapArgs {
  options: Array<{ code: number; space?: string }>;
}

export interface RemoteOptionNetworkSetArgs extends RemoteMapArgs {
  "shared-networks": Array<{ name: string }>;
  options: JsonObject[];
}

export interface RemoteOptionNetworkDelArgs extends RemoteMapArgs {
  "shared-networks": Array<{ name: string }>;
  options: Array<{ code: number; space?: string }>;
}

export interface RemoteOptionSubnetSetArgs extends RemoteMapArgs {
  subnets: Array<{ id: number }>;
  options: JsonObject[];
}

export interface RemoteOptionSubnetDelArgs extends RemoteMapArgs {
  subnets: Array<{ id: number }>;
  options: Array<{ code: number; space?: string }>;
}

export interface RemoteOptionPoolSetArgs extends RemoteMapArgs {
  pools: Array<{ pool: string }>;
  options: JsonObject[];
}

export interface RemoteOptionPoolDelArgs extends RemoteMapArgs {
  pools: Array<{ pool: string }>;
  options: Array<{ code: number; space?: string }>;
}

export interface RemoteOptionPdPoolSetArgs extends RemoteMapArgs {
  "pd-pools": Array<{ prefix: string }>;
  options: JsonObject[];
}

export interface RemoteOptionPdPoolDelArgs extends RemoteMapArgs {
  "pd-pools": Array<{ prefix: string }>;
  options: Array<{ code: number; space?: string }>;
}

export interface RemoteOptionDefSetArgs extends RemoteMapArgs {
  "option-defs": JsonObject[];
}

export interface RemoteOptionDefGetArgs extends RemoteMapArgs {
  "option-defs": Array<{ code: number; space?: string }>;
}

export interface RemoteOptionDefGetAllArgs extends RemoteMapArgs {}

export interface RemoteOptionDefDelArgs extends RemoteMapArgs {
  "option-defs": Array<{ code: number; space?: string }>;
}

// ---------------------------------------------------------------------------
// High Availability (libdhcp_ha.so)
// ---------------------------------------------------------------------------

export interface HaHeartbeatResult {
  state: string;
  date: string;
  "scopes"?: string[];
  [key: string]: unknown;
}

export interface HaScopesArgs {
  scopes: string[];
}

export interface HaMaintenanceStartArgs {
  force?: boolean;
}

export interface HaSyncArgs {
  "server-name": string;
  "max-period"?: number;
}

export interface HaSyncCompleteNotifyArgs {
  origin?: string;
}
