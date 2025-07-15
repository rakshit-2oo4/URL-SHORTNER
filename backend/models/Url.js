import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  clickHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String
  }]
});
const Url = mongoose.model('Url', urlSchema);
export default Url;