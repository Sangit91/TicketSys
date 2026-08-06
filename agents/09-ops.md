# 09 — Ops (Backup / Git / OpenBrain)

> Đọc khi làm ops: backup, commit, push, xử lý OpenBrain.

## 1. Git

- Hiện tại repo chưa có lịch sử commit đáng kể (đang khởi tạo). Quy ước:
  - Commit ngắn gọn, đúng trọng tâm, tiếng Việt hoặc English đều được (đồng nhất theo dự án).
  - **KHÔNG commit**: `openbrain/`, `openbrain/.env`, `.env`, `certs/`, `dist/`, `node_modules/`.
  - Trước commit luôn chạy `npm run lint && npm run build`.

## 2. Backup

- Trước khi thay đổi lớn (refactor, migrate data, tách component) → nên sao lưu:
  - Git commit/checkpoint, hoặc
  - Copy file quan trọng sang thư mục temp (`C:\Users\ADMINI~1\AppData\Local\Temp\opencode`).
- Ghi nhận bản backup gần nhất vào `memory.md`.

## 3. OpenBrain (plugin memory)

- Plugin: `./openbrain` (clone từ `https://github.com/CodebyKDvn/openbrain.git`). **KHÔNG commit folder này**.
- Config: khai báo `"plugin": ["./openbrain"]` trong `opencode.json`.
- Env: `openbrain/.env` chứa `GEMINI_API_KEY` — đã gitignore.
- Verify hoạt động: `search_memories --query "test" --limit 5` và `list_skills` phải trả kết quả.
- DB dùng chung: `~/.opencode/openbrain/openbrain.db` — có cột `project` để tách memory theo dự án (từ v2.0.0).
- Dùng khi: tra cứu bug/pattern đã gặp (`search_memories`), tạo skill workflow lặp ≥3 lần (`create_skill`).

## 4. Quy tắc dùng memory.md vs OpenBrain

| Tình huống | Dùng |
|-----------|------|
| Trạng thái kiến trúc / pending | `memory.md` |
| Backup / phase history | `memory/` |
| Bug đã fix / decision / pattern | OpenBrain `search_memories` |
| Workflow lặp ≥3 lần | OpenBrain `create_skill` |
| Đọc mỗi session (bắt buộc) | `memory.md` + `agents/01` |
