export const NETWORK_PROTOCOL_VERSION = 1;
export const DEFAULT_MULTIPLAYER_PORT = 3001;
export const SNAPSHOT_SEND_INTERVAL_MS = 50;

export interface NetworkPlayerSnapshot {
  id: string;
  position: [number, number, number];
  forward: [number, number, number];
  right: [number, number, number];
  up: [number, number, number];
  speed: number;
  smoothedPitch: number;
  smoothedRoll: number;
  smoothedYaw: number;
  updatedAt: number;
}

export type ClientToServerMessage =
  | {
      type: "hello";
      version: number;
    }
  | {
      type: "state";
      player: NetworkPlayerSnapshot;
    };

export type ServerToClientMessage =
  | {
      type: "welcome";
      id: string;
      tickRate: number;
      serverTime: number;
    }
  | {
      type: "snapshot";
      players: NetworkPlayerSnapshot[];
      serverTime: number;
    }
  | {
      type: "player_left";
      id: string;
    };
