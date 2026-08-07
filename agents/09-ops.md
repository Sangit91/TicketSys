# 09 — Ops (Backup / Git / OpenBrain)

> Đọc khi làm ops: backup, commit, push, xử lý OpenBrain.

## 1. Git

- Remote: `origin` → `https://github.com/Sangit91/TicketSys.git` (branch chính `main`).
- Đã push lần đầu (initial commit) — kiểm tra trạng thái: `git status` / `git log --oneline -5`.
- Quy ước:
  - Commit ngắn gọn, đúng trọng tâm, tiếng Việt hoặc English đều được (đồng nhất theo dự án).
  - **KHÔNG commit**: `openbrain/`, `openbrain/.env`, `.env`, `certs/`, `dist/`, `node_modules/`.
  - Trước commit luôn chạy `npm run lint && npm run build`.
  - Push lên `origin/main`, dùng Git Credential Manager (đã cấu hình) để xử lý auth HTTPS.

## 2. Backup

- Trước khi thay đổi lớn (refactor, migrate data, tách component) → nên sao lưu:
  - Git commit/checkpoint, hoặc
  - Copy file quan trọng sang thư mục temp (`C:\Users\ADMINI~1\AppData\Local\Temp\opencode`).
- Ghi nhận bản backup gần nhất vào `memory.md`.

## 2b. Docker / DB backup (PostgreSQL 16 docker — host 9432)

- **PORT**: PostgreSQL container `ticketsys-db` (host **9432**→5432) · MinIO host **9100/9101** · API tương lai **9001**. KHÔNG đụng local 5432.
- Dump DB (đúng container user/db):
  `docker exec ticketsys-db pg_dump -U ticketsys -d ticketsys -Fc --file=/pgdata/backup-$(date +%F).dump`
- Restore:
  `docker exec -i ticketsys-db pg_restore -U ticketsys -d ticketsys --clean --if-exists < backup.dump`
- Xem thêm kế hoạch backup offsite/WAL trong `docs/architecture-backend-db.md` §5.

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
