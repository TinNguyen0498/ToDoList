let currentZIndex = 1;
const createBtn = document.getElementById("add-note-btn");
const board = document.getElementById("board")
// Dua note len tren cung
function bringNoteToFront(note) {
    currentZIndex++;
    note.style.zIndex = currentZIndex;
}
function placeCareAtEnd(el) {
        const range = document.createRange();
        const sel = window.getSelection();

        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    function placeCaretAtEnd(el) {
  el.focus();
  if (
    typeof window.getSelection != "undefined"
    && typeof document.createRange != "undefined"
  ) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
// Tạo ghi chú mới
function createNoteElement() {
    const note = document.createElement("div");
    note.classList.add("note");

    const checkHoanThanh = document.createElement("input");
    checkHoanThanh.type = "checkbox";
    checkHoanThanh.className = "checkbox-hoanthanh";

    const label = document.createElement("label");
    label.textContent = "Hoàn thành";
    label.setAttribute("for", "checkbox-hoanthanh");

    const ngayTao = document.createElement("p");
    ngayTao.className = "note-date";
    ngayTao.style.display = "none";
    const now = new Date();
    ngayTao.textContent = `Ngày tạo: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

    const ghiChuTitle = document.createElement("p");
    ghiChuTitle.innerHTML = 'Ghi chú: <span contenteditable="True" class="editable-title"></span>';

    const firstLine = document.createElement("p");
    firstLine.setAttribute("contenteditable", "true");
    firstLine.innerHTML = '<input type="checkbox">';

    const titleEditable = ghiChuTitle.querySelector(".editable-title");

    titleEditable.addEventListener("input", function () {
    const maxLength = 24;
    if (this.textContent.length > maxLength) {
    this.textContent = this.textContent.substring(0, maxLength);
    placeCaretAtEnd(this); // Giữ con trỏ cuối dòng
  }
});
    note.addEventListener("mousedown", () => bringNoteToFront(note));

    
    note.appendChild(checkHoanThanh);
    note.appendChild(label);
    note.appendChild(ngayTao);
    note.appendChild(ghiChuTitle);
    note.appendChild(firstLine);

    // Xử lý khi checkbox được nhấn
    checkHoanThanh.addEventListener("change", function () {
    const isChecked = this.checked;

    for (let child of note.children) {
        // Chỉ giữ lại checkbox và ngày tạo khi hoàn thành
        if (child === checkHoanThanh || child === ngayTao) {
            child.style.display = "";
        } else {
            child.style.display = isChecked ? "none" : "";
        }
    }

    // Luôn hiển thị ngày tạo nếu đã check
    ngayTao.style.display = isChecked ? "" : "none";

    // Cần hiện lại label "Hoàn thành" nếu bỏ check
    label.style.display = isChecked ? "none" : "";
    saveNotesToLocalStorage();
});
    return note;
}
let noteCount = 0;
createBtn.addEventListener("click", function(e) {
    const newNote = createNoteElement();
    board.appendChild(newNote);
    newNote.style.position = "absolute";
    newNote.style.top = (200 + noteCount * 30) + "px";
    newNote.style.left = (80 + noteCount * 30) + "px";
    noteCount++;

    // Reset nội dung note
    const inputs = newNote.querySelectorAll("input[type='checkbox']");
    inputs.forEach(input => input.checked = false);

    const editablePs = newNote.querySelectorAll("p[contenteditable='true']");
    
    editablePs.forEach(p => {
    const checkbox = p.querySelector('input[type="checkbox"]');
    p.innerHTML = ""; // Xoá toàn bộ nội dung
    if (checkbox) {
        p.appendChild(checkbox); // Gắn lại checkbox nếu có
    }
});
    // Gắn lại drag & enter event
    enableDragging(newNote);
    enableEnterToAddCheckbox(newNote);
    saveNotesToLocalStorage();
});

// Hàm kéo
function enableDragging(note) {
    let isDragging = false;
    let offsetX, offsetY;
// --- Sự kiện click chuột (PC) ---
    note.addEventListener("mousedown", function(e) {
      bringNoteToFront(note);
        isDragging = true;
        offsetX = e.clientX - note.offsetLeft;
        offsetY = e.clientY - note.offsetTop;
    });

    document.addEventListener("mousemove", function(e) {
        if (isDragging) {
            note.style.left = (e.clientX - offsetX) + "px";
            note.style.top = (e.clientY - offsetY) + "px";
        }
    });

    document.addEventListener("mouseup", function() {
        isDragging = false;
        saveNotesToLocalStorage();
    });
}
// --- Sự kiện cảm ứng (điện thoại) ---
  note.addEventListener("touchstart", function (e) {
    bringNoteToFront(note);
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - note.offsetLeft;
    offsetY = touch.clientY - note.offsetTop;
  });

  document.addEventListener("touchmove", function (e) {
    if (isDragging) {
      const touch = e.touches[0];
      note.style.left = (touch.clientX - offsetX) + "px";
      note.style.top = (touch.clientY - offsetY) + "px";
    }
  });

  document.addEventListener("touchend", function () {
    if (isDragging) {
      isDragging = false;
      saveNotesToLocalStorage();
    }
  });
}
// Hàm Enter để thêm checkbox
function enableEnterToAddCheckbox(noteElement) {
        noteElement.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();

                const currentCheckboxes = noteElement.querySelectorAll('input[type="checkbox"]');
                if (currentCheckboxes.length >= 11) {
                    alert("Note is full (10 max)");
                    return;
                }
                const newLine = document.createElement("div");
                newLine.innerHTML = '<p contenteditable="true"><input type="checkbox"></p>';
                noteElement.appendChild(newLine);
                const editableP = newLine.querySelector('p');
                placeCaretAtEnd(editableP);
            }
        });
    }
    function saveNotesToLocalStorage() {
  const allNotes = document.querySelectorAll(".note");
  const notesData = [];

  allNotes.forEach((note, index) => {
    const id = index;
    const title = note.querySelector(".editable-title").textContent;
    const isCompleted = note.querySelector(".checkbox-hoanthanh").checked;
    const createdAt = note.querySelector(".note-date").textContent;
    const top = note.style.top;
    const left = note.style.left;

    const content = [];
    note.querySelectorAll("p[contenteditable='true']").forEach(p => {
      const checkbox = p.querySelector("input[type='checkbox']");
      content.push({
        checked: checkbox?.checked || false,
        text: p.textContent.trim()
      });
    });

    notesData.push({ id, title, content, isCompleted, createdAt, position: { top, left } });
  });

  localStorage.setItem("notes", JSON.stringify(notesData));
}
window.addEventListener("DOMContentLoaded", function () {
  const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

  savedNotes.forEach(noteData => {
    const note = createNoteElement();
    board.appendChild(note);
    note.style.top = noteData.position.top;
    note.style.left = noteData.position.left;
    note.querySelector(".editable-title").textContent = noteData.title;
    note.querySelector(".checkbox-hoanthanh").checked = noteData.isCompleted;
    note.querySelector(".note-date").textContent = noteData.createdAt;

    const firstLine = note.querySelector("p[contenteditable='true']");
    firstLine.innerHTML = "";
    noteData.content.forEach((line, index) => {
      const p = document.createElement("p");
      p.setAttribute("contenteditable", "true");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = line.checked;

      p.appendChild(checkbox);
      p.append(line.text);

      if (index === 0) {
        firstLine.replaceWith(p);
      } else {
        note.appendChild(p);
      }
    });

    enableDragging(note);
    enableEnterToAddCheckbox(note);
  });
});
    // Ẩn/hiện nội dung note khi hoàn thành
function toggleNoteContent(note, isCompleted) {
    const children = Array.from(note.children);
    children.forEach(child => {
        if (!child.classList.contains("checkbox-hoanthanh") && child.tagName !== "LABEL") {
            child.style.display = isCompleted ? "none" : "";
        }
    });
}
const contextMenu = document.getElementById("contextMenu");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");

let currentNote = null; // lưu note hiện tại được nhấp chuột phải

// Khi chuột phải vào note
board.addEventListener("contextmenu", function (e) {
  e.preventDefault();

  const note = e.target.closest(".note");
  if (!note) return;

  currentNote = note;

  // Hiện context menu tại vị trí chuột
  contextMenu.style.top = `${e.pageY}px`;
  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.style.display = "block";
});

// Nhấn "Xóa note"
deleteNoteBtn.addEventListener("click", function () {
  if (currentNote) {
    currentNote.remove();
    saveNotesToLocalStorage();
    currentNote = null;
  }
  contextMenu.style.display = "none";
});

// Ẩn menu khi click nơi khác
document.addEventListener("click", function (e) {
  if (!contextMenu.contains(e.target)) {
    contextMenu.style.display = "none";
  }
});

//darkmode,lightmode
const toggleModeBtn = document.getElementById("toggleModeBtn");

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
document.getElementById("deleteAllBtn").addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ ghi chú không?")) {
        // Xóa ghi chú trên giao diện
        const board = document.getElementById("board");
        board.innerHTML = "";

        // Xóa dữ liệu lưu trong localStorage
        localStorage.removeItem("notesData");

        // Nếu bạn lưu background ảnh thì cũng reset (nếu muốn)
        // localStorage.removeItem("backgroundImage");

        alert("Đã xoá toàn bộ ghi chú!");
    }

});
