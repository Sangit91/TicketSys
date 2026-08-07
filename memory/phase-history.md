# Phase History — TicketSys

> Append-only log. Số phase mới: lấy max + 1 (xem agents/08-memory-management.md).

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
