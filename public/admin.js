const loginForm = document.getElementById("loginForm");
const adminPanel = document.getElementById("adminPanel");
const homePageForm = document.getElementById("homePageForm");
const homePageSelect = document.getElementById("homePageSelect");
const adminStatus = document.getElementById("adminStatus");

const USERS = [
  { username: "mazdak", password: "13891389mn" },
  { username: "mahyar", password: "mahyer" }
];

function setStatus(message, isError = false) {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  adminStatus.classList.toggle("error", !!isError);
}

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const ok = USERS.some(
    (u) => u.username === username && u.password === password
  );
  if (!ok) {
    alert("نام کاربری یا رمز عبور اشتباه است.");
    return;
  }

  loginForm.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  setStatus("ورود موفق. اکنون می‌توانید صفحه اصلی را تنظیم کنید.");
});

homePageForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const page = homePageSelect.value;
  try {
    const res = await fetch("/api/admin/home-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page })
    });
    if (!res.ok) {
      throw new Error();
    }
    const data = await res.json();
    setStatus(
      data.homePage === "update"
        ? "صفحه آپدیت به عنوان صفحه اصلی تنظیم شد."
        : "صفحه چت به عنوان صفحه اصلی تنظیم شد."
    );
  } catch {
    setStatus("ذخیره تغییرات با خطا مواجه شد.", true);
  }
});

