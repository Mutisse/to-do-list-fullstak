import { Router } from "express";
import toDoController from "../Controller/toDoController";

const router: Router = Router();

router.get("/tarefas",toDoController.find);
router.post("/tarefas", toDoController.create);
router.put("/tarefas/:id", toDoController.update);
router.delete("/tarefas/:id", toDoController.delete);

export default router;
