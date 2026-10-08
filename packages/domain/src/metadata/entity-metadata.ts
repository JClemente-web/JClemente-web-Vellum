import type { UserId } from "../ids/user-id.js";

export type EntityMetadata = {
  createdAt: string;
  updatedAt: string;
  createdBy: UserId;
};
