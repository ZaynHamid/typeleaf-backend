import { Comments, Likes, Posts, Saved } from "./db.js";
import AppError from "./error.js";

const createPost = async (title, body, author, tags) => {
    const post = await Posts({
        title,
        body,
        author,
        tags
    });
    post.save();

    return post;
}

const findPosts = async (identifier) => {
  return await Posts.find(identifier)
    .populate("author", "username") 
    .select("title body tags author createdAt");
};
const updatePost = async (postId, updates, postAuthor) => {
    const { title, body, tags } = updates;
    const cleanUpdates = { title, body, tags };

    const post = await Posts.findOneAndUpdate(
        { _id: postId, author: postAuthor },
        { $set: cleanUpdates },
        {
            new: true,
            runValidators: true
        }
    );

    if (!post) {
        throw new AppError("Post not found or you are not authorized to edit it", 404);
    }

    return post;
};

const deletePost = async (postId, author) => {
    const post = await Posts.findOneAndDelete({ _id: postId, author });

    if (!post) {
        throw new AppError("Post not found or you are not authorized to delete it", 404);
    }

    await Comments.deleteMany({ post: postId });

    return post;
}

const getPostLikes = async postId => {
    const postExist = await Posts.exists({ _id: postId });
    if (!postExist) throw new AppError("Invalid postId", 404);

    const postLike = await Likes.countDocuments({ postId });
    return postLike;
}

const createComment = async (postId, author, commentValue, parentId) => {
    const postExist = await Posts.exists({ _id: postId });
    if (!postExist) throw new AppError("Invalid postId", 404);

    if (parentId) {
        const parent = await Comments.findById({ _id: parentId });
        if (!parent) throw new AppError("Invalid parentId", 404);
    }

    const post = await Comments.create({
        postId,
        author,
        text: commentValue,
        parentId: parentId || null
    });

    return post;

}

const buildTree = comments => {
    const map = {};
    const roots = [];

    comments.forEach(comment => {
        comment.replies = [];
        map[comment._id.toString()] = comment;
    });

    comments.forEach(comment => {
        if (comment.parentId) {
            const parent = map[comment.parentId.toString()];
            if (parent) parent.replies.push(comment);
        } else {
            roots.push(comment)
        }
    });

    return roots;
}

const getComments = async (postId) => {
    const postExist = await Posts.exists({ _id: postId });
    if (!postExist) throw new AppError("Invalid postId", 404);

    const comments = await Comments.find({ postId }).populate("author", "username").lean();
    const tree = buildTree(comments);

    return tree;
}

const toggleLike = async (postId, userId) => {
    const existing = await Likes.findOne({ postId, userId });

    if (existing) {
        await Likes.deleteOne({ _id: existing._id });

        const count = await Likes.countDocuments({ postId });

        return { liked: false, likesCount: count };
    } else {
        await Likes.create({ postId, userId });

        const count = await Likes.countDocuments({ postId });

        return { liked: true, likesCount: count };
    }
};

const savePost = async (postId, userId) => {
    const postExist = await Posts.exists({ _id: postId });
    if (!postExist) throw new AppError("Invalid postId", 404);

    const existing = await Saved.findOne({ userId, postId });

    if (existing) {
        return { saved: true, message: "Already saved" };
    }

    const savedPost = await Saved.create({ userId, postId });
    if (!savedPost) throw new AppError("Unable to save post", 400);

    return savedPost;
};

const getSavedPosts = async userId => {
    const savedPosts = await Saved.find({ userId });

    return savedPosts;
}

const deleteSavedPost = async (postId, userId) => {
    const postExist = await Posts.exists({ _id: postId });

    if (!postExist) throw new AppError("Invalid postId", 404);

    await Saved.deleteOne({ userId, postId });

    return { saved: false, message: "Post unsaved" };
};

export { createPost, findPosts, updatePost, deletePost, createComment, getComments, getPostLikes, toggleLike, savePost, deleteSavedPost, getSavedPosts }