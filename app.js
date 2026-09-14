// اتصال قاعدة بيانات Supabase (مفتاح anon عام محمي بسياسات RLS على الخادم)
const SUPABASE_URL = "https://peqwvdyxtuhigoxdxmah.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcXd2ZHl4dHVoaWdveGR4bWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDk1MTksImV4cCI6MjEwNDk4NTUxOX0.zgCUMoy8stsxdI5q8rTsEqBfCQeDxNcOER5kwyOgemM";

// ===== التبديل بين واجهة الأطباء وواجهة الصيدليات =====
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".panel").forEach((panel) => {
      const show = panel.id === "panel-" + tab.dataset.panel;
      panel.classList.toggle("active", show);
      panel.hidden = !show;
    });
  });
});

// ===== إرسال البيانات إلى Supabase REST API =====
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
      /* تجاهل */
    }
    throw new Error(message);
  }
}

function formToObject(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = value.trim();
  });
  return data;
}

// ===== ربط كل نموذج بزر الإرسال =====
function wireForm(formId, table, statusId) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "status";
    status.textContent = "⏳ جاري إرسال البيانات...";
    button.disabled = true;

    try {
      await sendToSupabase(table, formToObject(form));
      status.className = "status success";
      status.textContent = "✅ تم إرسال البيانات بنجاح، شكراً لك!";
      form.reset();
    } catch (error) {
      status.className = "status error";
      status.textContent = "❌ تعذر إرسال البيانات: " + error.message;
    } finally {
      button.disabled = false;
    }
  });
}

wireForm("doctors-form", "doctors", "doctors-status");
wireForm("pharmacies-form", "pharmacies", "pharmacies-status");
