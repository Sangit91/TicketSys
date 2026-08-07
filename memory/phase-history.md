# Phase History — TicketSys

> Append-only log. Số phase mới: lấy max + 1 (xem agents/08-memory-management.md).

## PHASE 4 — Backend build (NestJS + Prisma) ([2026-08-07])

### Scaffold + DB docker + migration
- Docker infra `server/docker-compose.yml`: **Postgres host 9432→5432** (tránh local 5432), **MinIO 9100/9101** (tránh vite 9000), API tương lai **9001→3001**. DB/MinIO healthy.
- `server/prisma/schema.prisma` (15 bảng, enum ASCII, valid) + migration `init` đã tạo bảng trong DB docker.
- NestJS skeleton: PrismaModule/Service + `/api/health` → `{status:ok, db:up}`.

### Module Auth (JWT + argon2 + RBAC)
- Cài `@nestjs/jwt`, `argon2`, `cookie-parser`.
- `AuthService`: `login` (argon2 verify) · `refresh` (rotate, lưu hash refresh) · `logout` (revoke) · `me` · `switch` (chỉ ADMIN).
- Guards: `JwtAuthGuard` (Bearer) + `RolesGuard` (`@Roles`); decorator `CurrentUser`, `Roles`.
- refresh token lưu httpOnly cookie `/api/auth`.
- **Seed**: 5 user (admin/123,...) + 6 khoa + gán khoa (khớp frontend mock).
- **Verify**: POST `/api/auth/login` (201) + GET `/api/auth/me` (Bearer) OK — nối DB docker.

### Build config
- `tsconfig.build.json` (exclude prisma) → `node dist/main.js`; `prisma:seed` = `ts-node prisma/seed.ts`.

### Module Users & Departments (CRUD + gán khoa + soft delete)
- `UsersModule`: list (filter role/shift/q) · create (argon2 hash) · update · `assignDepartments` (user_departments) · `departments(id)` · softDelete.
- `DepartmentsModule`: list · detail (+ summary tính động: assetCount, activeTickets) · create (chống trùng code) · update · softDelete.
- Guard mọi endpoint JWT + RBAC (`@Roles('ADMIN')` cho ghi/xoá).
- **Verify**: GET /api/departments, /api/users, /api/users/:id/departments OK.
- Fix: `JwtGlobalModule` (Global) — JwtService sẵn cho mọi guard/module.

### Module Tickets (CRUD + workflow + ký ảnh chữ ký)
- `TicketsModule`: list (filter + phân trang + scope KTV theo khoa) · detail (kèm logs/comments/e2e) · create · `changeStatus` (workflow backend-check) · assign · comment · sign.
- **Ký nội bộ = ẢNH CHỮ KÝ** (theo yêu cầu, không token crypto): `User.signatureImageUrl` map sẵn; `POST /api/tickets/:id/sign` tự gắn ảnh chữ ký của người ký + `TicketE2E`(method `SIGNATURE_IMAGE`, signedBy, verifiedAt) + audit. Token crypto để sau.
- Schema: thêm `User.signatureImageUrl`, `TicketE2E.signedById/signatureImageUrl`, enum `SIGNATURE_IMAGE`; sửa enum `Priority` `P1_KHAP`→`P1_KHAN_CAP` (db push — migrate dev không interactive).
- **Verify**: create→assign→WORKING→DONE; `CLOSED trước ký` → 400 (workflow); `SIGN` → e2eVerified=true, method=SIGNATURE_IMAGE; `CLOSED sau ký` → OK.

## PHASE 3 — Production hardening (tải nhanh + chống lỗi + type chặt) ([2026-08-06])

### Code-split views + ErrorBoundary + Skeleton
- Thêm `@types/react@^19` + `@types/react-dom@^19` (trước đó react hoàn toàn KHÔNG có type declaration) → đây là bước "lộ" ~22 lỗi typing thật bị ẩn, đã fix.
- Lazy-load 7 view theo tab (`React.lazy` + Suspense): DashboardView, TicketsView, InventoryView, AssetFlowMap, DepartmentsView, AdminRoleView, AuditLogsView → build tách chunk riêng (InventoryView 58kB, AssetFlowMap 39kB, còn lại 12-19kB).
- Tạo `ErrorBoundary` (class component, fallback UI + nút Tải lại): bọc cấp cao nhất (main.tsx) + quanh vùng tab.
- Tạo `LoadingSkeleton` (cards + table shimmer, dark/light).
- Fix 22 lỗi typing bị lộ: mockData `: SystemAuditLog[]`; bỏ so sánh status/health bằng literal Anh chết (RESOLVED/CLOSED/IN_PROGRESS/CRITICAL/DEGRADED); cast `node.data` qua `unknown`; bỏ prop `opacity` không tồn tại trên `<Background>` (2 file); thêm `'SECURITY'` vào `AuditLogCategory`; type `Variants` cho TypewriterText; cast `priority`; cloneElement ReactElement.
- Backup trước: commit git.

### Thu gọn hero + bỏ ParticleBackground ở tab dữ liệu
- Hero (headline + Scramble/Typewriter) chỉ render ở tab `TỔNG QUAN`; các tab dữ liệu dùng thanh tiêu đề gọn (`VIEW_META` map, 1 dòng title + sub).
- `ParticleBackground` + `HeroGraphic` chuyển `React.lazy` (bọc `Suspense fallback={null}`), chỉ mount ở login + tab TỔNG QUAN → tab dữ liệu không fetch chunk three.js.
- Kết quả build: bundle chính 1.001MB → 479kB (gzip 143kB); `ParticleBackground` (three.js) tách chunk 515kB chỉ tải khi cần.

### Phân trang bảng (chuẩn bị dữ liệu lớn ~1000 users)
- Tạo `src/hooks/usePagedRows.ts` (phân trang + auto reset trang 1 khi filter đổi) + `src/components/Pagination.tsx` (prev/next, window page, summary "X–Y / tổng").
- Áp vào Tickets (8/trang), Inventory (9), AuditLogs (10). Thay `.map()` toàn bộ bằng slice theo trang.

### Data-access layer
- Tạo `src/data/useDataStore.ts`: gom toàn bộ state (tickets, inventory, departments, staffList, auditLogs, currentUser) + CRUD (`addTicket`, `applyTicketStatus`, `verifyE2E`, `add/update department/inventory/staff`) + `addAuditLog`.
- App.tsx mỏng lại: chỉ giữ auth session (login/switch user, RBAC tab), selectedTicket derive từ store (bỏ snapshot stale), notification/toast. Các view nhận state qua props từ store.
- Khi nối backend: chỉ sửa bên trong `useDataStore` (fetch API), API trả về giữ nguyên — App & views không đổi.

### Reduced-motion + responsive
- `src/hooks/usePrefersReducedMotion.ts`; tôn trọng hệ thống: bỏ ParticleBackground, freeze ScrambleText/TypewriterText.
- CSS `@media (prefers-reduced-motion: reduce)` vô hiệu animation/transition toàn cục.
- Responsive: bảng Tickets cuộn ngang (`overflow-x-auto` + `min-w-[720px]`); Header có sẵn desktop `hidden xl:flex` + sub-nav mobile `xl:hidden overflow-x-auto`.

### Fix bug: deprecation THREE.Clock + mất session khi login
- Thay `THREE.Clock` → `THREE.Timer` trong `ParticleBackground.tsx` (hết cảnh báo deprecation).
- **Persist session login**: `isLoggedIn` + `currentUser` lưu `localStorage` (`app-logged-in`, `app-user`) — khôi phục khi App remount/reload → hết tình trạng "đăng nhập 1 lúc lại log out".

### Quản lý state — Phase A (SessionStore Zustand)
- Cài `zustand`. Tạo `src/state/sessionStore.ts`: `currentUser`, `isLoggedIn`, `login/logout/switchUser`, `updateAssignedDepartments` (persist `ticketsys-session`).
- `useDataStore` bỏ `currentUser`/`setCurrentUser` → đọc actor từ `useSessionStore.getState()`. App dùng `useSessionStore` (bỏ manual `isLoggedIn`/`setCurrentUser`).
- `useDataStore` = **adapter data duy nhất**, giữ để nối backend (Phase B/C: TanStack Query, mooted khi có server).

### Nền tab (bản lề): StaticBackdrop cho tab dữ liệu
- Particle chỉ ở login + TỔNG QUAN; tab dữ liệu (Tickets/Inventory/Audit...) dùng `StaticBackdrop` — nền tĩnh nhẹ (lưới chấm CSS + 2 glow mềm, không animation, tôn trọng reduced-motion).

### Thiết kế backend/DB + hấp thu Checklist improvement
- Phân tích `docs/TicketSys_Architecture_Improvement_Checklist.md` → hoàn toàn khớp kiến trúc đề xuất (Modular Monolith, React+Zustand+Query+useDataStore, NestJS+Prisma+Postgres+MinIO, Docker+WAL). Không dùng Microservice/Kafka/K8s...
- Cập nhật `docs/architecture-backend-db.md`: thêm `sla_policies`, `ticket_attachments`, `ticket_comments`, `notifications`, `consumables`; asset metadata (manufacturer/model/cpuModel/ramGb/diskGb/os); workflow chuẩn hoá (EN enum ↔ VN label, backend-controlled); dept summary tính SQL; soft delete; QR runtime.
- Tạo `docs/api-plan.md`: REST endpoints (Auth/Users/Dept/Tickets/E2E/Assets/Consumables/Audit/Notification/Dashboard) + RBAC + pagination + upload MinIO + lộ trình 6 bước.
- `AGENTS.md` + `memory.md` cập nhật pointer + pending (Prisma schema, khâu chờ chốt stack/deploy).

## PHASE 2 — Hoàn thiện UI nền tảng ([2026-08-06])

### Sửa bug + type-safety (6 bug P0)
- Sửa `criticalCount` đếm sai (`App.tsx`) — dùng `priority === 'P1-KHẨN CẤP'` + status đúng.
- Sửa type `Priority` bị lọt mã màu `'P3-[#CCFF00] TRUNG BÌNH'` (`types.ts`); gõ `Ticket.priority` thành `Priority`.
- Inventory "CHỈ XEM KHOA PHỤ TRÁCH" giờ lọc thực tế (`InventoryView.tsx`).
- TicketDetailModal stale state fix bằng `key={ticket.id}` + bỏ engineer "ma" mặc định.
- AdminRoleView: guard `isAdmin` cho thêm KTV / thêm khoa.
- Xóa `any` toàn bộ (App handlers, InventoryView, AdminRoleView, AssetFlowMap).

### Sinh ID unique + cleanup timer + xóa deps chết
- Tạo `src/utils.ts` (`generateId` crypto.randomUUID, `randomHex`, `fakeSha256`); refactor ID các file.
- Fix timer leak `showNotification` (App) + LoginPage.
- Xóa `express`, `dotenv`, `@types/express` khỏi package.json (trái "không backend").

### Accessibility (a11y)
- Tạo `src/hooks/useTrapFocus.ts` (focus trap + Escape-close), áp dụng **mọi modal**: TicketDetailModal, AssetRelocationModal, DepartmentsView, AdminRoleView (2), InventoryView (3), AssetFlowMap (3).
- Thêm `role="dialog"`/`aria-modal`/aria-label, `aria-current` tab active, `aria-live` NotificationBanner, tabIndex+Enter/Space cho hàng `<tr>` TicketsView.

### Dashboard Command Center
- Thêm tab `'TỔNG QUAN'` vào `TabType` + `ROLE_PERMISSIONS` (mọi role), nav Header.
- Tạo `src/components/DashboardView.tsx`: KPI (P1 mở, thiết bị NGUY CẤP, đang xử lý, chờ ký), ca trực, sức khỏe khoa phòng, telemetry/SLA, ticket gần đây, audit mới.
- Mặc định `activeTab` = 'TỔNG QUAN'.

### Design tokens (@theme) — chuẩn hóa brand colors
- Mở rộng `@theme` trong `index.css`: 13 token — acid-lime(+dim), neon-red, line-energy, neon-cyan, alert-amber, space-bg, card-bg, surface, panel, panel-deep, terracotta, canvas-light.
- Bulk replace `[#HEX]` → token name đồng nhất ở **toàn bộ** `.tsx`/`.ts`/`index.css` (giữ nguyên suffix opacity `/10 /20...`).
- Light theme: các selector `[class*="text-[#CCFF00]"]`... tự chuyển sang `[class*="text-acid-lime"]`...; thêm block override token-surface (bg-surface/panel/space-bg/card-bg → trắng) cho light.
- Kết quả build: sinh đủ `.text-acid-lime`, `.bg-surface`, `.text-neon-cyan`,...; còn 4 selector generic `[class*="bg-[#0-3"]` cover ~153 hex phụ (panel thứ cấp) chưa token hóa.
- Backup trước khi đổi: `Temp\opencode\ticketsys-backup-before-tokens`.

## PHASE 1 — Khởi tạo chuẩn AI Agents Ready ([2026-08-06])

### Thiết lập bộ khung AI Agents (AGENTS.md + agents/ + memory/) ([2026-08-06])
- Mô tả: Áp dụng template-du-an-web-moi.md vào dự án hiện tại.
  - Tạo `AGENTS.md` (index ~3KB, bảng mục lục 01-09, quick start).
  - Tạo `agents/01-getting-started.md` → `agents/09-ops.md` (9 module quy tắc).
  - Tạo `memory.md` + `memory/phase-history.md` + `memory/bugs-fixed.md`.
  - Dự kiến tiếp theo: kết nối OpenBrain plugin (xem agent/09).
- Files affected: AGENTS.md, agents/*.md, memory.md, memory/phase-history.md, memory/bugs-fixed.md
- Commands: (tạo file trực tiếp, không command chạy code)
