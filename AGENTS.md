# AGENTS.md - TicketSys (Trung Tâm Điều Hành CNTT - BVĐK MNNB Quảng Nam)

> Đã tách module (2026-08-06). Nội dung chi tiết trong agents/01-09*.md.
> Bắt buộc mỗi session: đọc `agents/01-getting-started.md` + `memory.md` trước khi code.

## 📚 Mục lục quick-ref

| # | File | Nhóm quy tắc | Khi nào đọc |
|---|------|---------------|-------------|
| 01 | agents/01-getting-started.md | Mục tiêu + bắt đầu session + nguyên tắc vàng | Mỗi session bắt buộc |
| 02 | agents/02-architecture.md | Cấu trúc src/, data layer (useDataStore), không backend | Sửa cấu trúc / state / data flow |
| 03 | agents/03-ui-design-system.md | Design tokens + theme dark/light | Sửa UI / thêm component visual |
| 04 | agents/04-components.md | Pattern component + reusable + a11y | Thêm/sửa component |
| 05 | agents/05-project-ux.md | UX ngành CNTT y tế (hospital-ux) | Thay đổi flow / nội dung tiếng Việt |
| 06 | agents/06-server-api.md | API/DB governance (mock data) | Thêm/đổi dữ liệu, types, mockData |
| 07 | agents/07-self-review.md | Review bắt buộc trước khi xong | Kết thúc task |
| 08 | agents/08-memory-management.md | Memory safety + phase numbering | Cập nhật memory |
| 09 | agents/09-ops.md | Backup / Git / OpenBrain | Ops, commit, backup |

## 🚦 Quick Start — Agent mới vào dự án

1. Đọc `memory.md` → trạng thái + pending tasks
2. Đọc `agents/01-getting-started.md` → quy tắc bắt buộc
3. Tra cứu OpenBrain: `search_memories --query "TênTrang|TênComponent" --limit 10`
4. Kiểm tra `git status` + `git log --oneline -5`
5. Tùy task, đọc file `agents/0X` liên quan (lazy loading)

## ⚡ Hiện trạng nhanh (PHASE 3 — cập nhật 2026-08-06)

- **Dev port 9000** (host 0.0.0.0) · GitHub `origin` → https://github.com/Sangit91/TicketSys (branch `main`)
- **State/CRUD tập trung** `src/data/useDataStore.ts` — nối backend chỉ sửa file này, App/views không đổi.
- Bundle **code-split** 7 view (`React.lazy`) + `ErrorBoundary` + `LoadingSkeleton`; bảng **phân trang** (`usePagedRows`); design tokens `@theme`; `prefers-reduced-motion` (a11y).
- Bắt buộc Quality Gate: `npm run lint && npm run build` (xem 07).

## 📌 Ghi chú tách file

- Tách 2026-08-06 để AGENTS.md ngắn (~3KB), tiết kiệm token mỗi session.
- Quy tắc: **KHÔNG tạo file agents mới tùy tiện** — chỉ mở rộng file 0X có sẵn.
- Mọi thay đổi quy tắc phải đồng bộ: sửa file 0X + cập nhật bảng mục lục ở đây + ghi `memory/phase-history.md`.
