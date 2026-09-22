import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  hidden: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('TestCase', testCaseSchema);
