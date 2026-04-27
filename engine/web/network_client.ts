import {
  ClientToServerMessage,
  NetworkPlayerSnapshot,
  ServerToClientMessage,
  NETWORK_PROTOCOL_VERSION,
} from "../shared/multiplayer";

export interface NetworkClientOptions {
  url: string;
  onWelcome: (id: string) => void;
  onSnapshot: (players: readonly NetworkPlayerSnapshot[]) => void;
  onPlayerLeft: (id: string) => void;
  onStatusChange?: (status: string) => void;
}

export class NetworkClient {
  private readonly url: string;
  private readonly onWelcome: (id: string) => void;
  private readonly onSnapshot: (players: readonly NetworkPlayerSnapshot[]) => void;
  private readonly onPlayerLeft: (id: string) => void;
  private readonly onStatusChange?: (status: string) => void;
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private localPlayerId: string | null = null;
  private manuallyClosed = false;
  private lastSendTime = 0;

  constructor(options: NetworkClientOptions) {
    this.url = options.url;
    this.onWelcome = options.onWelcome;
    this.onSnapshot = options.onSnapshot;
    this.onPlayerLeft = options.onPlayerLeft;
    this.onStatusChange = options.onStatusChange;
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.manuallyClosed = false;
    this.setStatus(`Conectando ao multiplayer em ${this.url}...`);

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.addEventListener("open", () => {
      this.setStatus("Multiplayer conectado.");
      this.sendRaw({
        type: "hello",
        version: NETWORK_PROTOCOL_VERSION,
      });
    });

    socket.addEventListener("message", (event) => {
      const message = this.parseMessage(event.data);
      if (!message) {
        return;
      }

      switch (message.type) {
        case "welcome":
          this.localPlayerId = message.id;
          this.onWelcome(message.id);
          this.setStatus(`Multiplayer ativo. Seu ID: ${message.id}`);
          break;
        case "snapshot":
          this.onSnapshot(message.players);
          break;
        case "player_left":
          this.onPlayerLeft(message.id);
          break;
      }
    });

    socket.addEventListener("close", () => {
      this.socket = null;
      if (this.manuallyClosed) {
        this.setStatus("Multiplayer desconectado.");
        return;
      }

      this.setStatus("Conexao multiplayer perdida. Tentando reconectar...");
      this.scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      this.setStatus("Erro na conexao multiplayer.");
    });
  }

  disconnect(): void {
    this.manuallyClosed = true;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  getLocalPlayerId(): string | null {
    return this.localPlayerId;
  }

  sendPlayerSnapshot(snapshot: NetworkPlayerSnapshot, timeMs: number): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    if (timeMs - this.lastSendTime < 45) {
      return;
    }

    this.lastSendTime = timeMs;
    this.sendRaw({
      type: "state",
      player: snapshot,
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) {
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2500);
  }

  private sendRaw(message: ClientToServerMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    this.socket.send(JSON.stringify(message));
  }

  private parseMessage(raw: string | ArrayBuffer | Blob): ServerToClientMessage | null {
    if (typeof raw !== "string") {
      return null;
    }

    try {
      return JSON.parse(raw) as ServerToClientMessage;
    } catch (error) {
      console.warn("Mensagem multiplayer invalida.", error);
      return null;
    }
  }

  private setStatus(status: string): void {
    this.onStatusChange?.(status);
  }
}
