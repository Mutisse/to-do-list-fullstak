"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const toDoController_1 = __importDefault(require("../Controller/toDoController"));
const router = (0, express_1.Router)();
router.get("/tarefas", toDoController_1.default.find);
router.post("/tarefas", toDoController_1.default.create);
router.put("/tarefas/:id", toDoController_1.default.update);
router.delete("/tarefas/:id", toDoController_1.default.delete);
exports.default = router;
