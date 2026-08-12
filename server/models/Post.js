const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Post content is required"],
      minlength: [1, "Post cannot be empty"],
      maxlength: [500, "Post cannot exceed 500 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tags: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "A post cannot have more than 5 tags",
      },
      default: [],
    },
  },
  { timestamps: true },
);

// Useful indexes for feed/explore queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
