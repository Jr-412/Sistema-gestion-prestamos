import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import loansRouter from "./loans.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(loansRouter);

export default router;
