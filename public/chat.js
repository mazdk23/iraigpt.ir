const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

function appendMessage(role, text) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

let history = [];
let sending = false;

chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!userInput || !userInput.value.trim() || sending) return;
  const content = userInput.value.trim();
  userInput.value = "";

  appendMessage("user", content);
  history.push({ role: "user", content });

  sending = true;

  const thinkingRow = document.createElement("div");
  thinkingRow.className = "message-row ai typing";
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML =
    '<span class="typing-dots"><span></span><span></span><span></span></span>';
  thinkingRow.appendChild(bubble);
  chatMessages.appendChild(thinkingRow);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    if (!res.ok) {
      throw new Error("خطا در ارتباط با سرور");
    }
    const data = await res.json();
    const reply = data.reply || "پاسخی از مدل دریافت نشد.";

    thinkingRow.remove();
    appendMessage("ai", reply);
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    thinkingRow.remove();
    appendMessage(
      "ai",
      "در حال حاضر ارتباط با مدل روی سرور برقرار نشد. لطفاً کمی بعد دوباره تلاش کن یا تنظیمات سرور را بررسی کن."
    );
    console.error(err);
  } finally {
    sending = false;
  }
});

