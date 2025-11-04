import React from "react";

export default function PostCard({ post }) {
  const author =
    post?.author?.firstName || post?.author?.lastName
      ? `${post?.author?.firstName || ""} ${post?.author?.lastName || ""}`.trim()
      : (post?.author?.username || "Unknown");

  return (
    <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
      <div style={{ fontWeight: 600 }}>{author}</div>
      <div style={{ color: "#666", fontSize: "0.9rem" }}>
        {new Date(post?.createdAt || Date.now()).toLocaleString()}
      </div>

      {post?.content && <p style={{ marginTop: 8 }}>{post.content}</p>}

      {post?.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          style={{ width: "100%", borderRadius: 8, marginTop: 8, maxHeight: 420, objectFit: "contain" }}
        />
      )}

      <div style={{ color: "#888", fontSize: "0.9rem", marginTop: 8 }}>
        ❤️ {post?.likes?.length || 0} · 💬 {post?.comments?.length || 0}
      </div>
    </div>
  );
}
