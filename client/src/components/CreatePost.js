import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePost({ onCreated }) {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_LEN = 1000;
  const MAX_MB = 10;
  const API_BASE = ""; // leave blank when using CRA proxy; else "http://localhost:5000"
  const token = localStorage.getItem("token"); // <-- required for /api/posts

  const resetForm = () => {
    setText("");
    setFile(null);
    setPreview("");
    setError("");
    setLoading(false);
  };

  const removeImage = () => {
    setFile(null);
    setPreview("");
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(f.type)) {
      setError("Only PNG, JPG, JPEG, WEBP or GIF are allowed.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Image is larger than ${MAX_MB}MB.`);
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const parseErr = async (res, fallback) => {
    try {
      const j = await res.json();
      return j?.message || fallback;
    } catch {
      return fallback;
    }
  };

  const uploadImage = async () => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/api/upload/image`, {
      method: "POST",
      // If your upload route is also protected, send the token; otherwise it’s fine to include:
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd
    });

    if (!res.ok) {
      if (res.status === 413) throw new Error(`Image is larger than ${MAX_MB}MB.`);
      throw new Error(await parseErr(res, "Image upload failed"));
    }
    const data = await res.json();
    return data.url; // { url, public_id }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim() && !file) {
      setError("Post content is required");
      return;
    }

    try {
      setLoading(true);
      const imageUrl = file ? await uploadImage() : null;

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: text.trim(), imageUrl })
      });

      if (!res.ok) {
        const msg = await parseErr(res, "Post failed");
        throw new Error(msg);
      }

      const payload = await res.json();
      const created = payload.post || payload; // handle either shape

      resetForm();
      onCreated && onCreated(created);
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    navigate(-1);
  };

  return (
    <div className="cp-wrap">
      <div className="card cp-card">
        <h3 className="cp-title">Create New Post</h3>
        <hr />
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label">What’s on your mind?</label>
          <textarea
            className="form-control cp-textarea"
            rows={5}
            maxLength={MAX_LEN}
            placeholder="Share your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="cp-counter">{`${text.length}/${MAX_LEN} characters`}</div>

          <div className="cp-file-group">
            <label className="form-label">Add an image (optional)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input type="file" accept="image/*" onChange={handleFile} />
              {file && (
                <>
                  <span className="cp-file-name">{file.name}</span>
                  <button
                    type="button"
                    className="btn"
                    onClick={removeImage}
                    style={{ background: "#ef4444", color: "#fff", padding: "6px 10px" }}
                  >
                    Remove image
                  </button>
                </>
              )}
            </div>
            <div className="cp-help">Allowed: PNG, JPG, JPEG, GIF, WEBP. Max {MAX_MB}MB.</div>
          </div>

          {preview && (
            <div className="cp-preview">
              <img src={preview} alt="preview" />
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary cp-submit" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleCancel}
              style={{ background: "#e5e7eb", color: "#111827", padding: "10px 20px", borderRadius: 10 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
