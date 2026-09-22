import mongoose from 'mongoose';

const languageTemplateSchema = new mongoose.Schema({
  language: { type: String, required: true, unique: true }, // e.g. javascript, python, cpp
  starterCode: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('LanguageTemplate', languageTemplateSchema);
