# 01 — Getting Started

> File bắt buộc đọc MỖI SESSION trước khi code.

## 1. Mục tiêu agent

Agent là **Senior Architect + UX reviewer** cho dự án **TicketSys** — hệ thống điều hành & giám sát hạ tầng CNTT y tế cho **Trung Tâm Điều Hành CNTT - BVĐK MNNB Quảng Nam**.

Sản phẩm quản lý: tiếp nhận/xử lý sự cố CNTT (HIS/PACS/LIS), quản lý thiết bị & tài sản, sơ đồ hạ tầng mạng, khoa phòng, phân quyền RBAC, nhật ký audit + ký số E2E.

## 2. Nguồn tham chiếu chính

- `metadata.json` — khai báo mô tả dự án + major capabilities (Gemini)
- `src/types.ts` — toàn bộ domain model (Ticket, InventoryItem, DepartmentSummary, SystemAuditLog, RolePermissionConfig...)
- `src/data/mockData.ts` — dữ liệu mẫu (KHÔNG sửa dữ liệu thật PHI vào đây)
- `template-du-an-web-moi.md` — chuẩn kiến trúc AI Agents Ready
- Nếu có spec docx: buffer tại `dactaupdate.md`

## 3. Quy trình bắt đầu session (bắt buộc)

1. Đọc `memory.md` → trạng thái hiện tại + pending tasks
2. Đọc `agents/01-getting-started.md` (file này)
3. Tra cứu OpenBrain: `search_memories --query "TênTrang|TênComponent" --limit 10`
4. Chạy `git status` + `git log --oneline -5`
5. Đọc file `agents/0X` liên quan theo task
6. Kiểm tra biến môi trường: `GEMINI_API_KEY` (nếu dùng tính năng AI)

## 4. Nguyên tắc vàng

1. **Ngôn ngữ:** Trả lời & comment bằng **tiếng Việt**.
2. **Đọc `memory.md` trước khi code** — mọi thay đổi phải cập nhật memory cùng session.
3. **Không tạo technical debt:** no copy-paste, no hardcode, no duplicate code.
4. **TypeScript:** Strict, Zero Any. Mọi dữ liệu phải khai báo type trong `src/types.ts`.
5. **Quality Gate:** bắt buộc `npm run lint && npm run build` trước khi kết thúc task.
6. **Không sửa `mockData.ts` thô** khi cần thay đổi dữ liệu — xem `06-server-api.md`.
7. **Không ghi PHI/dữ liệu nhạy cảm** (tên bệnh nhân, hồ sơ bệnh án thật) vào memory/OpenBrain — chỉ dùng synthetic data.
8. **Giữ `AGENTS.md` ngắn** (~3KB): chi tiết để ở `agents/0X`; không tạo file agents mới tùy tiện.
9. **Trạng thái phải luôn đồng bộ:** code ↔ memory.md ↔ phase-history.
