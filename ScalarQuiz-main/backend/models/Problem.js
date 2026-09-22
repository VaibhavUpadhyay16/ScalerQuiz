import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  description: { type: String, required: true },
  constraints: { type: [String], default: [] },
  examples: { type: [exampleSchema], default: [] },
  tags: { type: [String], default: [] },
  starterCode: { type: Map, of: String, default: {} },
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
