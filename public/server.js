const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple in-memory config to choose which page is shown at "/"
// "main" -> main chat page, "update" -> update page
let homePage = "main";

// Serve static assets directly from / (no /static prefix in URLs)
app.use(express.static(path.join(__dirname, "public")));

// Route for main chat page
app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route for update page
app.get("/update", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "update.html"));
});

// Home route respects admin-selected page
app.get("/", (req, res) => {
  const target = homePage === "update" ? "update.html" : "index.html";
  res.sendFile(path.join(__dirname, "public", target));
});

// Simple API to get current home page (used by frontend if needed)
app.get("/api/home-page", (req, res) => {
  res.json({ homePage });
});

// Admin login and toggle logic is handled on frontend;
// this endpoint just allows changing the home page from admin panel.
app.post("/api/admin/home-page", (req, res) => {
  const { page } = req.body || {};
  if (page !== "main" && page !== "update") {
    return res.status(400).json({ error: "Invalid page option" });
  }
  homePage = page;
  res.json({ success: true, homePage });
});

// Chat endpoint: local model (e.g. Ollama with Gemma3-1b)
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // نام مدل طبق فایل Model.Gemma3-1b (برای Ollama می‌تواند gemma3:1b باشد)
        model: "gemma3:1b",
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: "Model error", details: text });
    }

    const data = await response.json();
    const reply =
      data.message?.content ||
      data.choices?.[0]?.message?.content ||
      "پاسخی از مدل دریافت نشد.";

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Server error while contacting local model" });
  }
});

app.listen(PORT, () => {
  console.log(`iraigpt.ir server running on http://localhost:${PORT}`);
});

