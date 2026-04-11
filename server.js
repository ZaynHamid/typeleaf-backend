import express from "express";
import { Login, Signup } from "./helpers/users.js"
import { createComment, createPost, deletePost, findPosts, getComments, getPostLikes, savePost, toggleLike, updatePost, deleteSavedPost, getSavedPosts } from "./helpers/post.js";
import { authMiddleware } from "./helpers/authMiddleware.js";
import cors from "cors"
import errorHandler from "./helpers/errorMiddleware.js";
import AppError from "./helpers/error.js";
import asyncHandler from "./helpers/asyncHandler.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { logger } from "./helpers/logger.js";

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(limiter);
app.use((req, res, next) => {
    logger.info(`${req.method} - ${req.url}`);
    next()
})

app.post("/signup", asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new AppError("All fields are required", 400);
    }

    const user = await Signup(username, email, password);

    return res.status(201).json({
        success:true,
        user
    });

}));

app.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new AppError("All fields are required", 400);

    const user = await Login(email, password);

    res.status(200).json(user);
}));

app.get("/me", authMiddleware, (req, res) => {
    const user = req.user;
    return res.status(200).json({ user });
});

app.post("/create-post", authMiddleware, asyncHandler(async (req, res) => {
    const { title, body, tags } = req.body;
    
    if (!title?.trim() || !body?.trim() || !Array.isArray(tags)) {
        throw new AppError("Invalid input: Title, body, and tags are required", 400);
    }

    const author = req.user.id; 

    const post = await createPost(title, body, author, tags);

    return res.status(201).json({ 
        success: true,
        post 
    });
}));

app.get("/post", asyncHandler(async (req, res) => { 
    const { id, author, title } = req.query;
    let filter = {};

    if (id) filter._id = id;
    if (author) filter.author = author;
    if (title) filter.title = { $regex: title, $options: "i" };

    const posts = await findPosts(filter);
    return res.status(200).json(posts);
}));

app.put("/post", authMiddleware, asyncHandler(async (req, res) => {
    const { postId, updates } = req.body;
    const postAuthor = req.user.id;
    if (updates.author) throw new AppError("Can't update the author", 400)

    if (
        (updates.title !== undefined && !updates.title.trim()) ||
        (updates.body !== undefined && !updates.body.trim())
    ) throw new AppError("Title or body is invalid", 400);

    const post = await updatePost(postId, updates, postAuthor);
    return res.status(200).json({ message: "Updated", post });
}));

app.delete("/post/:id", authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const author = req.user.id;

    await deletePost(id, author);

    return res.sendStatus(204);
}))

app.post("/comment", authMiddleware, asyncHandler(async (req, res) => {
    const { postId, comment, parentId } = req.body;
    const { id } = req.user;

    if (!postId || !comment) throw new AppError("Missing postId or comment", 400);


    const comm = await createComment(postId, id, comment, parentId)

    return res.status(201).json({
        message: "Comment created",
        comm
    });

}));

app.get("/comment/:id", asyncHandler(async (req, res) => {
    const { id: postId } = req.params;

    const comments = await getComments(postId);

    return res.status(200).json({
        comments
    });
}));

app.post("/like", authMiddleware, asyncHandler(async (req, res) => {
    const { postId } = req.body;
    const userId = req.user.id;

    if(!postId) throw new AppError("postId is required", 400);

    const re = await toggleLike(postId, userId);

    return res.status(200).json(re);
}));

app.get("/likes/:postId", asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const likes = await getPostLikes(postId);
    return res.status(200).json({ likes })

}))

app.post("/save", authMiddleware, asyncHandler(async (req, res) => {
    const { postId } = req.body;
    const userId = req.user.id;

    if (!postId) throw new AppError("postId is required", 400);

    const result = await savePost(postId, userId);

    return res.status(200).json(result);
}));

app.get("/save", authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const posts = await getSavedPosts(userId);
    
    return res.status(200).json({
        success: true,
        saved: posts
    });

}));

app.delete("/unsave/:postId", authMiddleware, asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId) throw new AppError("postId is required", 400);
    
    const result = await deleteSavedPost(postId, userId);

    return res.status(200).json(result);
}));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Listening on Port ${PORT}`);
});
