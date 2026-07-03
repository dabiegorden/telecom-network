import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    attachment: {
      url: { type: String },
      publicId: { type: String },
      fileName: { type: String },
      mimeType: { type: String },
      fileType: {
        type: String,
        enum: ["image", "document"],
      },
      fileSize: { type: Number },
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
