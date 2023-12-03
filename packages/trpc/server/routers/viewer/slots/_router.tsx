import { EventEmitter } from "events";
import type { NextApiRequest, NextApiResponse } from "next";

import publicProcedure from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { ZGetScheduleInputSchema } from "./getSchedule.schema";
import { ZRemoveSelectedSlotInputSchema } from "./removeSelectedSlot.schema";
import { ZReserveSlotInputSchema } from "./reserveSlot.schema";

type SlotsRouterHandlerCache = {
  getSchedule?: typeof import("./getSchedule.handler").getScheduleHandler;
  reserveSlot?: typeof import("./reserveSlot.handler").reserveSlotHandler;
};

const UNSTABLE_HANDLER_CACHE: SlotsRouterHandlerCache = {};

const ee = new EventEmitter();

/** This should be called getAvailableSlots */
export const slotsRouter = router({
  onReserve: publicProcedure.subscription(() => {
    // return an `observable` with a callback which is triggered immediately
    return observable<string>((emit) => {
      const onReserve = (data: string) => {
        // emit data to client
        emit.next(data);
      };
      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on("reserveSlot", onReserve);
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("reserveSlot", onReserve);
      };
    });
  }),
  onRemoveSlot: publicProcedure.subscription(() => {
    // return an `observable` with a callback which should be triggered immediately
    return observable<Post>((emit) => {
      const onRe = (data: Post) => {
        // emit data to client
        emit.next(data);
      };
      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on("removeSelectedSlotMark", onRe);
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("removeSelectedSlotMark", onRe);
      };
    });
  }),

  getSchedule: publicProcedure.input(ZGetScheduleInputSchema).query(async ({ input, ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.getSchedule) {
      UNSTABLE_HANDLER_CACHE.getSchedule = await import("./getSchedule.handler").then(
        (mod) => mod.getScheduleHandler
      );
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.getSchedule) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.getSchedule({
      ctx,
      input,
    });
  }),
  reserveSlot: publicProcedure.input(ZReserveSlotInputSchema).mutation(async ({ input, ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.reserveSlot) {
      UNSTABLE_HANDLER_CACHE.reserveSlot = await import("./reserveSlot.handler").then(
        (mod) => mod.reserveSlotHandler
      );
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.reserveSlot) {
      throw new Error("Failed to load handler");
    }

    const unstableHandleCache = UNSTABLE_HANDLER_CACHE.reserveSlot({
      ctx: { ...ctx, req: ctx.req as NextApiRequest, res: ctx.res as NextApiResponse },
      input,
    });
    ee.emit("reserveSlot", "Fuck You");
    return unstableHandleCache;
  }),
  // This endpoint has no dependencies, it doesn't need its own file
  removeSelectedSlotMark: publicProcedure
    .input(ZRemoveSelectedSlotInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { req, prisma } = ctx;
      const uid = req?.cookies?.uid || input.uid;
      if (uid) {
        await prisma.selectedSlots.deleteMany({ where: { uid: { equals: uid } } });
      }
      return;
    }),
});
