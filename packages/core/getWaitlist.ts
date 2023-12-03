import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";

import { getUserAvailability } from "./getUserAvailability";

async function addToWaitlist(userId: number, eventTypeId: number, preferredTimeSlot: Dayjs) {
  // Add error handling if necessary
  return await prisma.waitlistEntry.create({
    data: {
      userId,
      eventTypeId,
      preferredTimeSlot: preferredTimeSlot.toDate(),
    },
  });
}

async function removeFromWaitlist(waitlistEntryId: number) {
  return await prisma.waitlistEntry.delete({
    where: {
      id: waitlistEntryId,
    },
  });
}

async function getWaitlistForEvent(eventTypeId: number) {
  // Add error handling if necessary
  return await prisma.waitlistEntry.findMany({
    where: {
      eventTypeId,
    },
    orderBy: {
      waitlistTimestamp: "asc",
    },
  });
}

async function processWaitlistEntries(eventTypeId: number) {
  const waitlistEntries = await getWaitlistForEvent(eventTypeId);

  for (const entry of waitlistEntries) {
    try {
      const userAvailability = await getUserAvailability({
        userId: entry.userId,
        dateFrom: dayjs().format(),
        dateTo: entry.preferredTimeSlot.format(),
        eventTypeId: entry.eventTypeId,
      });
    } catch (error) {
      console.error(`Error processing waitlist entry: ${error}`);
      // Optionally handle the error, like re-trying the operation or logging the error
    }
  }
}

async function notifyUser(userId: number, eventTypeId: number, availableTimeRange: Dayjs) {
  try {
    // Implement the actual email sending logic
    // Return true if email sent successfully, false otherwise
    return await sendEmailNotification(userId, eventTypeId, availableTimeRange);
  } catch (error) {
    console.error(`Error sending email notification: ${error}`);
    return false;
  }
}

// Example usage
// addToWaitlist(1, 101, dayjs('2023-01-01T10:00:00Z'));
// processWaitlistEntries(101);
