import mongoose from "mongoose";
import { config } from "dotenv";

config();
const uri = process.env.MONGO_URI;

mongoose.connect(uri).then(() => console.log("Connected!")).catch(e => console.log(e))

const userSchema = new mongoose.Schema({
    displayName: { type: String, required: false },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [String]
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true }
}, { timestamps: true });

const likeSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const savedSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});


likeSchema.index({ userId: 1, postId: 1 }, { unique: true });
savedSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Users = mongoose.model("User", userSchema);
const Posts = mongoose.model("Post", postSchema);
const Comments = mongoose.model("Comment", commentSchema);
const Likes = mongoose.model("Like", likeSchema);
const Saved = mongoose.model("Saved", savedSchema);



export { Users, Posts, Comments, Likes, Saved }