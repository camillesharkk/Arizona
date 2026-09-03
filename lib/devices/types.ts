export type DeviceSessionRow = {
  id: string;
  userId: string;
  deviceTokenHash: string;
  deviceLabel: string;
  userAgentSummary: string | null;
  createdAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
};

export type DeviceActivationRow = {
  id: string;
  userId: string;
  deviceSessionId: string;
  at: string;
};

export type PublicDevice = {
  id: string;
  deviceLabel: string;
  lastSeenAt: string;
  current: boolean;
};
