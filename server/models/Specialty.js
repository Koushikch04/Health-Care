import mongoose from "mongoose";

const Schema = mongoose.Schema;

const specialtySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Specialty = mongoose.model("Specialty", specialtySchema);
export default Specialty;
