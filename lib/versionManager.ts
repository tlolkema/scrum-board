import { kv } from "@vercel/kv";

const VERSION_KEY = "scrum-board-version";

export class VersionManager {
  private static instance: VersionManager;

  private constructor() {}

  public static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  /**
   * Get the current version number from KV
   * Returns 1 if KV is not configured or version doesn't exist
   */
  async getVersion(): Promise<number> {
    try {
      // Check if KV is configured
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.log("Vercel KV not configured, using default version 1");
        return 1;
      }

      const version = await kv.get<number>(VERSION_KEY);
      return version ?? 1;
    } catch (error) {
      console.error("Error getting version from KV:", error);
      return 1;
    }
  }

  /**
   * Increment the version number in KV
   * Returns the new version number
   */
  async incrementVersion(): Promise<number> {
    try {
      // Check if KV is configured
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.log("Vercel KV not configured, version tracking disabled");
        return 1;
      }

      const currentVersion = await this.getVersion();
      const newVersion = currentVersion + 1;
      await kv.set(VERSION_KEY, newVersion);
      return newVersion;
    } catch (error) {
      console.error("Error incrementing version in KV:", error);
      return 1;
    }
  }

  /**
   * Compare client version with server version
   * Returns true if versions match (no update needed)
   */
  async compareVersion(clientVersion: number | null | undefined): Promise<boolean> {
    if (clientVersion === null || clientVersion === undefined) {
      return false; // Client doesn't have a version, needs update
    }

    const serverVersion = await this.getVersion();
    return clientVersion === serverVersion;
  }
}

export const versionManager = VersionManager.getInstance();

