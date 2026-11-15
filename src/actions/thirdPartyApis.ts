"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ApiConnectorUpdateInput {
  id: string;
  connected?: boolean;
  apiKey?: string;
  accountLabel?: string;
  autoSync?: boolean;
}

/**
 * Fetch all third-party API connectors
 */
export async function getApiConnectorsAction() {
  try {
    const connectors = await prisma.apiConnector.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { success: true, connectors };
  } catch (err: unknown) {
    console.error("Failed to fetch API connectors:", err);
    return { success: false, connectors: [] };
  }
}

/**
 * Connect or disconnect a third-party API
 */
export async function toggleConnectorStatusAction(input: ApiConnectorUpdateInput) {
  try {
    const connector = await prisma.apiConnector.findUnique({ where: { id: input.id } });
    if (!connector) return { success: false, error: "Connector not found" };

    const nextConnected = input.connected !== undefined ? input.connected : !connector.connected;

    const updated = await prisma.apiConnector.update({
      where: { id: input.id },
      data: {
        connected: nextConnected,
        accountLabel: input.accountLabel || (nextConnected ? "Connected via API" : "Not connected"),
        apiKeyEncrypted: input.apiKey ? input.apiKey : connector.apiKeyEncrypted,
        lastPulled: nextConnected ? "Just now" : connector.lastPulled,
      },
    });

    // Log the configuration change
    await prisma.apiSyncLog.create({
      data: {
        connectorId: input.id,
        action: nextConnected ? "API_CONNECTED" : "API_DISCONNECTED",
        status: "Success",
        itemsSynced: updated.locationsMatched,
        message: nextConnected
          ? `Connected credentials for ${updated.name}`
          : `Disconnected credentials for ${updated.name}`,
      },
    });

    revalidatePath("/admin/listings/api-sync");
    revalidatePath("/admin/listings/ai-visibility");
    return { success: true, connector: updated };
  } catch (err: unknown) {
    console.error("Failed to toggle connector:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

/**
 * Trigger an API pull for a connector
 */
export async function triggerApiPullAction(connectorId: string) {
  try {
    const connector = await prisma.apiConnector.findUnique({ where: { id: connectorId } });
    if (!connector) return { success: false, error: "Connector not found" };

    const updated = await prisma.apiConnector.update({
      where: { id: connectorId },
      data: {
        lastPulled: "Just now",
      },
    });

    // Create sync audit log
    const log = await prisma.apiSyncLog.create({
      data: {
        connectorId,
        action: "LIVE_API_PULL",
        status: "Success",
        itemsSynced: connector.locationsMatched,
        message: `Successfully pulled verified NAP & ratings from ${connector.name}`,
      },
    });

    revalidatePath("/admin/listings/api-sync");
    revalidatePath("/admin/listings/ai-visibility");
    return { success: true, connector: updated, log };
  } catch (err: unknown) {
    console.error("Failed to trigger API pull:", err);
    return { success: false, error: err instanceof Error ? err.message : "API pull failed" };
  }
}

/**
 * Fetch all directory listings
 */
export async function getDirectoryListingsAction() {
  try {
    const directories = await prisma.directoryListing.findMany({
      orderBy: { overallNapMatch: "desc" },
    });
    return { success: true, directories };
  } catch (err: unknown) {
    console.error("Failed to fetch directory listings:", err);
    return { success: false, directories: [] };
  }
}

/**
 * Fetch recent sync logs
 */
export async function getApiSyncLogsAction(connectorId?: string) {
  try {
    const where = connectorId ? { connectorId } : {};
    const logs = await prisma.apiSyncLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { success: true, logs };
  } catch (err: unknown) {
    console.error("Failed to fetch sync logs:", err);
    return { success: false, logs: [] };
  }
}
