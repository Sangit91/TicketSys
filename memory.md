# Memory — TicketSys (Trung Tâm Điều Hành CNTT - BVĐK MNNB Quảng Nam)

> Lịch sử chi tiết: memory/phase-history.md · Bug đã sửa: memory/bugs-fixed.md

## 📌 Thông tin dự án

- **Tên:** Trung Tâm Điều Hành CNTT — BVĐK MNNB Quảng Nam
- **Loại:** Web app quản lý vận hành CNTT y tế (SPA frontend)
- **Module:** Yêu cầu xử lý (tickets) · Thiết bị & Tài sản · Sơ đồ hạ tầng · Khoa phòng · Quản trị roles · Audit logs + ký số E2E
- **Repo:** `TicketSys-main` (local D:\Coding\TicketSys-main) — remote `origin` = https://github.com/Sangit91/TicketSys.git (branch `main`)

## 🎯 Tầm nhìn kiến trúc

- **Nguyên tắc:** Reusable First · Mobile First · Accessibility First · Hospital UX (critical first).
- **Technical:** TypeScript Strict · Zero Any · Feature Based (1 view = 1 component) · Không backend (mock data).
- **State/Data:** tập trung tại `src/data/useDataStore.ts` (React `useState`, không Redux/Zustand) — App shell chỉ giữ auth/session + UI state.

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

- **Git checkpoint:** initial commit `6af2125` đã push `origin/main` (2026-08-06).
- Backup token ruổi: `Temp\opencode\ticketsys-backup-before-tokens`.

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
| Data-access layer PHASE 3 | ✅ Tách sang `src/data/useDataStore.ts` (state + CRUD + audit); App mỏng — khi nối backend chỉ sửa hook này |
| Reduced-motion + responsive PHASE 3 | ✅ `usePrefersReducedMotion` (tắt ParticleBackground/Scramble/Typewriter); CSS `@media reduce`; bảng Tickets cuộn ngang mobile (Header đã có sub-nav xl:hidden) |
| Performance PHASE 3 | ✅ Code-split 7 view + Lazy + Suspense + ErrorBoundary + LoadingSkeleton; `@types/react` đã cài |
| Thu gọn UI PHASE 3 | ✅ Hero chỉ ở TỔNG QUAN; ParticleBackground/HeroGraphic lazy + render ở login & TỔNG QUAN (cắt bundle chính 1MB→479kB) |
| Phân trang bảng PHASE 3 | ✅ `usePagedRows` + `Pagination` cho Tickets (8/trang), Inventory (9), AuditLogs (10); auto reset về trang 1 khi lọc |
| Backend / DB | 📐 **Đã có thiết kế chốt** — `docs/architecture-backend-db.md` (schema + quan hệ + bảo mật + backup) + `docs/api-plan.md` (REST); đã hấp thu `TicketSys_Architecture_Improvement_Checklist`. Chưa code. |
| Gemini AI | ⏳ Chưa (chưa dùng `@google/genai`) |
| Tests / Docker | ⏳ Chưa có (kế hoạch trong docs) |

## 🔎 Audit / Pending Tasks

- [ ] **Backend build (kế tiếp):** Prisma schema (theo docs 3.2 + workflow 3.5) → NestJS modules (Auth/Users/Dept/Tickets/Assets/Audit) → seed/migration → MinIO → logging.
- [ ] **Khâu chờ backend:** chốt PostgreSQL?/NestJS?/đích deploy (VPS vs cloud)?/file MinIO vs DB BLOB (đã ghi trong `docs/architecture-backend-db.md` Phần 7).
- [ ] Dashboard: SLA metrics còn hardcode (1.8ms, 99.98%...) — nối `SystemMetric`/API khi backend.
- [ ] Design tokens: còn ~153 hex `[#...]` phụ (panel #1A1A1A, #12131F, #1A1D2E...) chưa token hóa — được generic light selector cover.
- [ ] Quyết định dùng thực tế `@google/genai` (Gemini) khi có yêu cầu AI.
- [ ] (Tùy chọn) Thêm tests / Docker khi mở rộng.
- Phase hiện tại: **PHASE 3 — Production hardening** (xem memory/phase-history.md).

## 🧠 Quản lý state — Kiến trúc + plan (PHASE A triển khai, Phase B/C chờ backend)

### Mô hình 3 lớp
1. **Session & Permission** → `src/state/sessionStore.ts` (**Zustand + persist**) — `currentUser`, `isLoggedIn`, `login/logout/switchUser`, `updateAssignedDepartments`. Không nhân bản session trong data layer.
2. **Server data** → `src/data/useDataStore.ts` (**adapter duy nhất**) — tickets/inventory/departments/staffList/auditLogs + CRUD + audit. Đọc actor từ sessionStore (`useSessionStore.getState()`).
3. **UI ephemeral** → `useState` local trong App/component — `activeTab`, drawer, `selectedTicketId` (derive từ store), filter, trang.

### Quyết định đã chốt
- Không dùng Redux. Chọn **Zustand (session/UI) + TanStack Query (server data, khi có backend)**.
- `useDataStore` giữ vai trò **seam 1-chỗ**: nối backend chỉ sửa trong file này (hoặc đổi sang adapter Query) — App & views không đổi.

### Phase còn lại (khi có backend)
- **B1** TanStack QueryProvider + query tickets/inventory/departments/audit.
- **B2** `useDataStore` → adapter: mock (dev) / Query (prod) qua cờ `VITE_USE_MOCK`.
- **B3:** mutation **optimistic update** + `invalidateQueries(['tickets'])`.
- **C1:** cache off (IndexedDB) optional; **C3:** staleTime/selector tối ưu re-render.

## 📌 Ghi chú quan trọng

1. `template-du-an-web-moi.md` là chuẩn kiến trúc AI Agents Ready — đã áp dụng khi tạo AGENTS.md + agents/ + memory/.
2. Dữ liệu trong mockData **chỉ dùng synthetic** — cấm PHI thật.
3. Đã xóa toàn bộ `any` (PHASE 2); `src/utils.ts` là nơi tập trung helper ID/hash.
4. Tài liệu kiến trúc backend/DB & mối quan hệ: `docs/architecture-backend-db.md` + `docs/api-plan.md` (đã hấp thu checklist improvement).