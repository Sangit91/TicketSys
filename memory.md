# Memory — TicketSys (Trung Tâm Điều Hành CNTT - BVĐK MNNB Quảng Nam)

> Lịch sử chi tiết: memory/phase-history.md · Bug đã sửa: memory/bugs-fixed.md

## 📌 Thông tin dự án

- **Tên:** Trung Tâm Điều Hành CNTT — BVĐK MNNB Quảng Nam
- **Loại:** Web app quản lý vận hành CNTT y tế (SPA frontend)
- **Module:** Yêu cầu xử lý (tickets) · Thiết bị & Tài sản · Sơ đồ hạ tầng · Khoa phòng · Quản trị roles · Audit logs + ký số E2E
- **Repo:** `TicketSys-main` (local D:\Coding\TicketSys-main) — chưa có remote

## 🎯 Tầm nhìn kiến trúc

- **Nguyên tắc:** Reusable First · Mobile First · Accessibility First · Hospital UX (critical first).
- **Technical:** TypeScript Strict · Zero Any · Feature Based (1 view = 1 component) · Không backend (mock data).
- **State:** React `useState` tập trung tại `App.tsx` — không Redux/Zustand.

## 🏗️ Cấu trúc dự án hiện tại

```text
src/
├── App.tsx            ← Root + state chính + render theo activeTab
├── main.tsx / index.css
├── types.ts            # Domain types (nguồn sự thật)
├── data/mockData.ts    # Data mẫu
└── components/         # 18 views/components (Header, TicketsView, InventoryView, AssetFlowMap...)
```

## 🚧 Backup gần nhất

- Chưa có backup chính thức (đang khởi tạo dự án chuẩn agent).
- Khuyến nghị: trước khi thay đổi lớn, làm git checkpoint.

## ⚠️ Quy tắc môi trường BẮT BUỘC NHỚ

- Port dev: **9000** (`npm run dev`, host 0.0.0.0, HMR).
- `@google/genai` đã khai báo nhưng **CHƯA dùng** trong src (dự trù Gemini server-side).
- Mọi thao tác ghi data phải qua handler App.tsx + `addAuditLog`.
- Cả 2 theme (dark/light) luôn phải render đúng.

## 🔍 Quality Gate

- `npm run lint` (tsc --noEmit) + `npm run build` — bắt buộc PASS trước khi xong task.

## 📊 Trạng thái hiện tại

| Module | Status |
|--------|--------|
| Dashboard / Tổng quan | ✅ PHASE 2 (KPI, ca trực, SLA, sức khỏe khoa phòng) |
| Tickets / Yêu cầu xử lý | ✅ Hoàn chỉnh (list, tạo, update status, ký số E2E) |
| Inventory / Thiết bị | ✅ Hoàn chỉnh (add/update, di dời, scope filter đã fix) |
| AssetFlow / Sơ đồ hạ tầng | ✅ ReactFlow map |
| Departments | ✅ Add/update |
| Admin Role / RBAC | ✅ ROLE_PERMISSIONS 6 roles (guard isAdmin) |
| AuditLogs | ✅ Ghi + view |
| Theme dark/light | ✅ |
| Ký số E2E (DIGITAL_CODE / FILE_UPLOAD) | ✅ |
| A11y (focus trap / aria) | ✅ Mọi modal + aria-label |
| Design tokens (@theme) | ✅ Token hóa brand colors (acid-lime, line-energy, neon-red, neon-cyan, alert-amber, surfaces) |
| Backend / gemini AI | ⏳ Chưa (không backend; gemini chưa dùng) |
| Tests / Docker | ⏳ Chưa có |

## 🔎 Audit / Pending Tasks

- [ ] Dashboard: SLA metrics còn hardcode (1.8ms, 99.98%...) — nối với `SystemMetric`/mock khi có dữ liệu động.
- [ ] Design tokens: còn ~153 hex `[#...]` phụ (panel #1A1A1A, #12131F, #1A1D2E...) chưa token hóa — được generic light selector cover, token hóa tiếp nếu cần.
- [ ] Quyết định dùng thực tế `@google/genai` (Gemini) khi có yêu cầu AI.
- [ ] (Tùy chọn) Thêm tests / Docker khi mở rộng.
- Phase hiện tại: **PHASE 2 — Hoàn thiện UI nền tảng** (xem memory/phase-history.md).

## 📌 Ghi chú quan trọng

1. `template-du-an-web-moi.md` là chuẩn kiến trúc AI Agents Ready — đã áp dụng khi tạo AGENTS.md + agents/ + memory/.
2. Dữ liệu trong mockData **chỉ dùng synthetic** — cấm PHI thật.
3. Đã xóa toàn bộ `any` (PHASE 2); `src/utils.ts` là nơi tập trung helper ID/hash.