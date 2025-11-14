import { Router } from "express";
import toDoController from "../Controller/toDoController";

const router: Router = Router();

// Rotas principais
router.get("/tarefas", toDoController.find);
router.post("/tarefas", toDoController.create);
router.put("/tarefas/:id", toDoController.update);
router.delete("/tarefas/:id", toDoController.delete); // Soft delete

// Rotas de status
router.patch("/tarefas/:id/status", toDoController.updateStatus);

// Rotas de estatísticas
router.get("/tarefas/stats", toDoController.getStats);

// Rotas de administração (soft delete)
router.get("/tarefas/deleted", toDoController.findDeleted);
router.patch("/tarefas/:id/restore", toDoController.restore);
router.delete("/tarefas/:id/permanent", toDoController.hardDelete);

export default router;
