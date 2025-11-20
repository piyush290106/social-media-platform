import React, { useMemo, useState } from "react";

export default function PostCard({ post = {} }) {
  const [imgOk, setImgOk] = useState(true);

  const authorLabel = useMemo(() => {
    const fn = post?.author?.firstName || "";
    const ln = post?.author?.lastName || "";
    const full = `${fn} ${ln}`.trim();
    return full || post?.author?.username || "Unknown user";
  }, [post]);

  const createdAt = useMemo(() => {
    try {
      return new Date(post?.createdAt || Date.now()).toLocaleString();
    } catch {
      return "";
    }
  }, [post?.createdAt]);

  const likeCount = post?.likes?.length || 0;
  const commentCount = post?.comments?.length || 0;

  return (
    <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{authorLabel}</div>
          <div style={{ color: "#666", fontSize: "0.9rem" }}>{createdAt}</div>
        </div>
      </div>

      {/* Text content (optional) */}
      {post?.content?.trim?.() && (
        <p
          style={{
            marginTop: 8,
            marginBottom: 8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {post.content}
        </p>
      )}

      {/* Image content (optional) */}
      {post?.imageUrl && imgOk && (
        <div
          style={{
            marginTop: 8,
            borderRadius: 8,
            overflow: "hidden",
            background: "#f5f5f5",
          }}
        >
          <img
            src={post.imageUrl}
            alt="Post"
            loading="lazy"
            onError={() => setImgOk(false)}
            style={{
              display: "block",
              width: "100%",
              maxHeight: 480,
              objectFit: "contain",
              background: "#fff",
            }}
          />
        </div>
      )}

      {/* If image failed to load, show a small hint instead of breaking layout */}
      {post?.imageUrl && !imgOk && (
        <div
          style={{
            marginTop: 8,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fff3cd",
            color: "#664d03",
            fontSize: 14,
          }}
        >
          Couldn’t load image.
        </div>
      )}

      {/* Footer (likes/comments) */}
      <div
        style={{
          color: "#888",
          fontSize: "0.9rem",
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span>❤️ {likeCount}</span>
        <span>·</span>
        <span>💬 {commentCount}</span>
      </div>
    </div>
  );
}
