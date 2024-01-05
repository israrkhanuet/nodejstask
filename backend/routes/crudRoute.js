import express from "express";
import Employe from "../models/employeModel.js";

const crudRouter = express.Router();

// Create
crudRouter.post("/create", async (req, res) => {
  try {
    const newItem = new Employe({
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      post: req.body.post,
      department: req.body.department,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read
crudRouter.get("/read", async (req, res) => {
  try {
    const items = await Employe.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
crudRouter.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedItem = await Employe.findOneAndUpdate({ id: id }, req.body, {
      new: true,
    });
    res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
crudRouter.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Employe.findOneAndDelete({ id: id });
    if (result) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default crudRouter;
