import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import eventsRouter from "./events";
import guestsRouter from "./guests";
import tablesRouter from "./tables";
import seatsRouter from "./seats";
import hallRouter from "./hall";
import invitationsRouter from "./invitations";
import checkinRouter from "./checkin";
import subscriptionRouter from "./subscription";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(eventsRouter);
router.use(guestsRouter);
router.use(tablesRouter);
router.use(seatsRouter);
router.use(hallRouter);
router.use(invitationsRouter);
router.use(checkinRouter);
router.use(subscriptionRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
