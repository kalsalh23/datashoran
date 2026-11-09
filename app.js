// إعدادات Supabase
const SUPABASE_URL = "https://peqwvdyxtuhigoxdxmah.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcXd2ZHl4dHVoaWdveGR4bWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDk1MTksImV4cCI6MjEwNDk4NTUxOX0.zgCUMoy8stsxdI5q8rTsEqBfCQeDxNcOER5kwyOgemM";

// ===== شاشة البداية (Splash Screen) =====
const splashScreen = document.getElementById("splash-screen");
const mainContent = document.getElementById("main-content");
const loaderPercent = document.querySelector(".loader-percent");
const loaderProgress = document.querySelector(".loader-progress");

let progress = 0;
const duration = 5000; // 5 ثواني
const interval = 50; // تحديث كل 50 ميلي ثانية
const increment = (100 / duration) * interval;

const progressInterval = setInterval(() => {
  progress += increment;
  if (progress >= 100) {
    progress = 100;
    clearInterval(progressInterval);
    hideSplashScreen();
  }
  loaderPercent.textContent = Math.round(progress) + "%";
}, interval);

function hideSplashScreen() {
  splashScreen.classList.add("hidden");
  setTimeout(() => {
    splashScreen.hidden = true;
    mainContent.hidden = false;
  }, 500);
}

// ===== رفع الملف =====
const fileInput = document.getElementById("family-book-image");
const fileUploadArea = document.getElementById("file-upload-area");
const fileUploadContent = document.getElementById("file-upload-content");
const filePreview = document.getElementById("file-preview");
const previewImg = document.getElementById("preview-img");
const removeFileBtn = document.getElementById("remove-file");

fileUploadArea.addEventListener("click", () => fileInput.click());

fileUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileUploadContent.classList.add("dragover");
});

fileUploadArea.addEventListener("dragleave", () => {
  fileUploadContent.classList.remove("dragover");
});

fileUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  fileUploadContent.classList.remove("dragover");
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) {
    handleFileSelect(e.target.files[0]);
  }
});

function handleFileSelect(file) {
  if (!file.type.startsWith("image/")) {
    showStatus("❌ يرجى اختيار ملف صورة فقط", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showStatus("❌ حجم الملف يجب أن يكون أقل من 5 ميجابايت", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    previewImg.src = event.target.result;
    fileUploadContent.hidden = true;
    filePreview.hidden = false;
  };
  reader.readAsDataURL(file);
}

removeFileBtn.addEventListener("click", () => {
  fileInput.value = "";
  previewImg.src = "";
  filePreview.hidden = true;
  fileUploadContent.hidden = false;
});

// ===== إرسال البيانات إلى Supabase =====
async function sendToSupabase(table, data) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + table, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let message = "خطأ من الخادم (" + res.status + ")";
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch (_) {
      // تجاهل
    }
    throw new Error(message);
  }
}

function formToObject(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (key !== "family_book_image") {
      data[key] = typeof value === "string" ? value.trim() : value;
    }
  });
  return data;
}

// ===== ربط النموذج بزر الإرسال =====
const form = document.getElementById("heating-oil-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

function showStatus(message, type) {
  statusEl.className = "status " + type;
  statusEl.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // التحقق من رفع الصورة
  if (!fileInput.files.length) {
    showStatus("❌ يرجى رفع صورة دفتر العائلة", "error");
    return;
  }

  showStatus("⏳ جاري إرسال الطلب...", "loading");
  submitBtn.disabled = true;

  try {
    const formData = formToObject(form);
    await sendToSupabase("heating_oil_registrations", formData);

    showStatus("✅ تم إرسال الطلب بنجاح، شكراً لك!", "success");
    form.reset();
    filePreview.hidden = true;
    fileUploadContent.hidden = false;
    previewImg.src = "";
  } catch (error) {
    showStatus("❌ تعذر إرسال الطلب: " + error.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});