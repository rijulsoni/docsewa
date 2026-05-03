import { db } from "./db";
import { UsageType, SubscriptionStatus } from "@/generated/prisma";

const LIMITS = {
  FREE: {
    [UsageType.CHAT_PDF]: 3,
    [UsageType.DOCUMENT_TRANSLATOR]: 3,
    [UsageType.BATCH_PROCESS]: 1,
    [UsageType.LARGE_FILE]: 10 * 1024 * 1024, // 10MB
  },
  PRO: {
    [UsageType.CHAT_PDF]: Infinity,
    [UsageType.DOCUMENT_TRANSLATOR]: Infinity,
    [UsageType.BATCH_PROCESS]: 20,
    [UsageType.LARGE_FILE]: 50 * 1024 * 1024, // 50MB
  },
  TEAMS: {
    [UsageType.CHAT_PDF]: Infinity,
    [UsageType.DOCUMENT_TRANSLATOR]: Infinity,
    [UsageType.BATCH_PROCESS]: 100,
    [UsageType.LARGE_FILE]: 200 * 1024 * 1024, // 200MB
  },
};

export async function getSubscriptionStatus(clerkId: string): Promise<SubscriptionStatus> {
  const user = await db.user.findUnique({
    where: { clerkId },
    select: { status: true },
  });
  return user?.status || SubscriptionStatus.FREE;
}

export async function checkUsageLimit(clerkId: string, type: UsageType) {
  const status = await getSubscriptionStatus(clerkId);
  const limit = LIMITS[status][type];

  if (limit === Infinity) return { allowed: true, current: 0, limit };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await db.usage.findUnique({
    where: {
      userId_type_date: {
        userId: clerkId,
        type,
        date: today,
      },
    },
  });

  const currentCount = usage?.count || 0;
  return {
    allowed: currentCount < limit,
    current: currentCount,
    limit,
  };
}

export async function incrementUsage(clerkId: string, type: UsageType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await db.usage.upsert({
    where: {
      userId_type_date: {
        userId: clerkId,
        type,
        date: today,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId: clerkId,
      type,
      date: today,
      count: 1,
    },
  });
}
