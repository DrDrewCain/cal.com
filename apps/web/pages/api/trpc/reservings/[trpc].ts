import { createNextApiHandler } from "@calcom/trpc/server/createNextApiHandler";
import { reservingRouter } from "@calcom/trpc/server/routers/viewer/reserving/_router";

export default createNextApiHandler(reservingRouter);
