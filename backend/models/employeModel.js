import mongoose from "mongoose";

const employeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    post: { type: String, required: true },
    department: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Employe = mongoose.model("Employe", employeSchema);

export default Employe;
