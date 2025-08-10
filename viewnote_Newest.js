const noteList = document.getElementById("noteList");
const searchInput = document.getElementById("searchInput");
const toggleModeBtn = document.getElementById("toggleModeBtn");

// Hàm load toàn bộ note từ localStorage
function getNotesFromLocalStorage() {
  return JSON.parse(localStorage.getItem("notes")) || [];
}

// Hàm lưu toàn bộ note vào localStorage
function saveNotesToLocalStorage(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Hàm render ghi chú (dùng chung cho load & tìm kiếm)
function renderNotes(notes) {
  noteList.innerHTML = ""; // Xoá cũ trước khi render mới

  notes.forEach((note, index) => {
    const card = document.createElement("div");
    card.className = "note-item";

    // Kiểm tra deadline
    let deadlineText = "Không có deadline";
    let isOverdue = false;

    if (note.deadline) {
      deadlineText = note.deadline;

      const now = new Date();
      const deadlineDate = new Date(note.deadline);
      if (now >= deadlineDate) {
        isOverdue = true;
        card.style.border = "2px solid red"; // viền đỏ khi quá hạn
      }
    }

    card.innerHTML = `
      <h5 contenteditable="true" class="note-title">${note.title}</h5>
      <p><small class="text-muted">Tạo lúc: ${note.createdAt}</small></p>
      <p><small class="text-muted">Deadline: ${deadlineText}</small></p>
      <div class="form-check mb-2">
        <input type="checkbox" class="form-check-input note-completed" ${note.isCompleted ? "checked" : ""}>
        <label class="form-check-label">Đã hoàn thành</label>
      </div>
      <div class="note-contents">
        ${note.content.map((item) => `
          <div class="note-content-item mb-1">
            <input type="checkbox" ${item.checked ? "checked" : ""}>
            <input type="text" value="${item.text}">
          </div>
        `).join("")}
      </div>
    `;

    // Sự kiện lưu khi người dùng chỉnh sửa
    card.addEventListener("input", () => saveChanges(index, card));
    card.querySelectorAll("input[type='checkbox']").forEach(input =>
      input.addEventListener("change", () => saveChanges(index, card))
    );

    noteList.appendChild(card);
  });
}

// Hàm lưu thay đổi 1 ghi chú cụ thể
function saveChanges(index, card) {
  const notes = getNotesFromLocalStorage();
  const updatedNote = notes[index];

  updatedNote.title = card.querySelector(".note-title").textContent.trim();
  updatedNote.isCompleted = card.querySelector(".note-completed").checked;

  const contentElements = card.querySelectorAll(".note-content-item");
  updatedNote.content = Array.from(contentElements).map(item => {
    return {
      checked: item.querySelector("input[type='checkbox']").checked,
      text: item.querySelector("input[type='text']").value.trim()
    };
  });

  notes[index] = updatedNote;
  saveNotesToLocalStorage(notes);
}

// Hàm khởi chạy ban đầu
function init() {
  const notes = getNotesFromLocalStorage();
  renderNotes(notes);
}

// Dark mode: bật/tắt & lưu trạng thái
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  toggleModeBtn.textContent = "☀️ Light Mode";
}

toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  toggleModeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("darkMode", isDark);
});

// Tìm kiếm ghi chú
searchInput.addEventListener("input", function (e) {
  const keyword = e.target.value.toLowerCase();
  const notes = getNotesFromLocalStorage();

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(keyword) ||
    note.content.some(item => item.text.toLowerCase().includes(keyword))
  );

  renderNotes(filteredNotes);
});

// Gọi init khi load trang
init();
