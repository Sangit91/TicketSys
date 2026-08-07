# 🏥 Kiến trúc TicketSys — Frontend hiện tại · Backend · Database & Mối quan hệ

> Trung Tâm Điều Hành CNTT — BVĐK Khu Vực Miền Núi Phía Bắc Quảng Nam
> Phiên bản: PHASE 3 (2026-08) · Frontend đã chuẩn bị cho backend; phần Backend/DB là **thiết kế đề xuất**.

---

## Phần 1 — Cấu trúc dự án Frontend hiện tại (đã chạy)

### 1.1 Cây thư mục `src/`

```text
src/
├── main.tsx                  # Entry: StrictMode + ErrorBoundary
├── App.tsx                   # Shell: activeTab, drawer, theme, notification; đọc data từ store
├── index.css                 # Tailwind v4 @theme (design tokens) + theme-light + prefers-reduced-motion
├── types.ts                  # TOÀN BỘ domain types (nguồn sự thật) + ROLE_PERMISSIONS (RBAC 6 roles)
├── utils.ts                  # generateId, randomHex, fakeSha256
├── data/
│   ├── useDataStore.ts       # DATA LAYER: state + CRUD + audit (adapter duy nhất để nối backend)
│   └── mockData.ts           # Data mẫu synthetic (KHÔNG PHI thật)
├── state/
│   └── sessionStore.ts       # Zustand + persist: currentUser, isLoggedIn, login/logout/switch
├── hooks/
│   ├── usePagedRows.ts       # Phân trang bảng
│   ├── useTrapFocus.ts       # A11y focus trap modal
│   └── usePrefersReducedMotion.ts
└── components/               # 20+ components
    ├── DashboardView, TicketsView, InventoryView, AssetFlowMap,
    ├── DepartmentsView, AdminRoleView, AuditLogsView, LoginPage,
    ├── Header, FooterMarquee, NotificationBanner, ActionDrawer, TicketDetailModal,
    ├── ErrorBoundary, LoadingSkeleton, Pagination, ParticleBackground, HeroGraphic,
    └── ScrambleText, TypewriterText, AssetRelocation*…
```

### 1.2 Nguyên tắc kiến trúc frontend

- **3 lớp state tách rõ:**
  1. `Session & Permission` → `src/state/sessionStore.ts` (**Zustand + persist**) — `currentUser`, `isLoggedIn`.
  2. `Server data` → `src/data/useDataStore.ts` (**adapter duy nhất**) — read/write tập trung, **audit log mọi mutation**.
  3. `UI ephemeral` → `useState` local (tab, drawer, filter, trang, `selectedTicketId` derive từ store).
- **Code-split**: mỗi tab một `React.lazy` chunk; `ErrorBoundary` + `LoadingSkeleton`; bảng dùng `usePagedRows`.
- **Seam cho backend**: `useDataStore` là nơi DUY NHẤT cần sửa để đổi từ mock sang API; App & views không đổi.

### 1.3 Entity hiện có trong `types.ts`
`UserRole` (6 roles) · `TabType` · `ROLE_PERMISSIONS` · `TechnicalStaffProfile` · `Priority` · `TicketStatus` · `IssueCategory` · `Ticket` (+ `TicketLog`, E2E fields) · `SystemAuditLog` · `InventoryItem` (+`AssetHistoryEvent`, ink fields) · `DepartmentSummary` · `SystemMetric`.

---

## Phần 2 — Thiết kế Backend (đề xuất)

| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Database | **PostgreSQL 16** | quan hệ + JSONB + WAL/PITR backup |
| ORM/DB access | **Prisma** | migration + type sinh; ngăn SQLi; schema khớp `types.ts` |
| Framework API | **NestJS** (Fastify) | DI, Guard RBAC, ValidationPipe, OpenAPI |
| Auth | JWT access (ngắn) + refresh httpOnly cookie + **argon2** | logout/refresh chắc |
| File | **MinIO** (S3) | file ký số, biên bản, giấy đề nghị |
| Deploy | **Docker Compose** | postgres + api + app/nginx proxy |

### Kiến trúc runtime
```
Browser ──HTTPS──> Caddy/Nginx (TLS + static SPA )
                        │
                        ├─ /api/* ──> NestJS (Guards, Rate-limit, Audit)
                        │               ├─ Prisma ──> PostgreSQL (volume + backups)
                        │               ├─ MinIO (S3) ◄── file ký số
                        │               └─ Auth: argon2 + JWT + refresh rotation
                        └─ / ──> static build (Vite SPA)
```

---

## Phần 3 — Thiết kế Database & mối quan hệ (ERD)

### 3.1 Sơ đồ mối quan hệ giữa các bảng

```
users 1───∞ refresh_tokens          (1 user : nhiều phiên refresh)
users 1───∞ user_departments ∞───1 departments   (N:M — KTV phụ trách nhiều khoa)
users 1───∞ tickets (as assignedEngineerId / createdById)
users 1───∞ ticket_logs (actorId)
users 1───∞ audit_logs (actorId)

departments 1───∞ tickets (departmentId)
departments 1───∞ assets (departmentId)
departments 1───∞ asset_history (from/to)

tickets 1───∞ ticket_logs        (nhật ký xử lý từng sự cố)
tickets 1───0..1 ticket_e2e      (1-1: ký số xác nhận 2 chiều)
tickets 1───∞ ticket_attachments (0..N: ảnh/video/pdf/log đính kèm)
tickets 1───∞ ticket_comments    (0..N: trao đổi giữa người dùng — tách khỏi audit log)
tickets ∞───0..1 sla_policies    (SLA theo mức ưu tiên — đổi không cần sửa code)
tickets ∞───0..1 assets (assetId) (1 sự cố tham chiếu 0..1 thiết bị)

assets 1───∞ asset_history        (lịch sử đời thiết bị)
users 1───∞ notifications         (thông báo cá nhân: isRead)
consumables ──0..1 assets?        (vật tư tiêu hao — tách khỏi Asset, tuỳ nhu cầu liên kết)
```

### 3.2 Bảng & cột — định lại `types.ts` sang schema

**users** — `username UNIQUE`, `password_hash`, `roleType enum(6)`, `name`, `phone`, `email`, `specialty`, `shiftStatus`, `avatar`, `status(active/banned)`, `lastLoginAt`

**refresh_tokens** — `id`, `userId→users`, `tokenHash UNIQUE`, `expiresAt`, `revokedAt`, `ip`, `userAgent`

**departments** — `id`, `name`, `code UNIQUE`, `lead`, `headcount`, `allocatedBudget`, `networkBandwidthGbps`, `healthIndex`

**user_departments** — `userId→users`, `departmentId→departments` (PK kép) — là quan hệ N:N để gán khoa phụ trách cho KTV.

**tickets** — `id`, `title`, `description`, `category`, `priority`, `status`, `type(INCIDENT/SERVICE_REQUEST/CHANGE)`, `requestorName/Role/Phone`, `departmentId→departments`, `assetId→assets?`, `assignedEngineerId→users?`, `createdById→users`, `createdAt/updatedAt`, `dueAt`(SLA), `firstResponseAt`, `resolvedAt`, `closedAt`, `requiresE2E`, `e2eVerified`, `escalationLevel`, `slaPolicyId→sla_policies`, `softDelete: deletedAt/deletedBy?`

**sla_policies** — `id`, `code UNIQUE`, `name`, `priority(enum)`, `responseHours`, `resolutionHours`, `breachNotify` — SLA theo mức ưu tiên, đổi **không sửa code** (ticket chỉ ref `slaPolicyId`).

**ticket_logs** — `id`, `ticketId→tickets`, `action`, `note`, `actorId→users`, `createdAt`  (= mảng `logs` trong `Ticket`)

**ticket_e2e** — `ticketId (PK→tickets)`, `verificationMethod`, `userSignature`, `itSignature`, `signedFileName`, `signedFileUrl`, `signedFileType`, `signedFileSize`, `uploadTime`, `sha256Hash`, `verifiedAt`  (= field E2E trong `Ticket`)

**ticket_attachments** — `id`, `ticketId→tickets`, `uploaderId→users`, `category(image/video/pdf/log)`, `fileName`, `fileUrl→storage/`, `mimeType`, `size`, `sha256Hash`, `uploadedAt`  — ảnh/video/log/biên bản đính kèm (đa file).

**ticket_comments** — `id`, `ticketId→tickets`, `authorId→users`, `content`, `createdAt` — **trao đổi giữa người dùng**, tách khỏi audit log.

**notifications** — `id`, `userId→users`, `title`, `content`, `isRead`, `linkTo`, `createdAt` — thông báo cá nhân (gán ticket, đổi trạng thái, SLA sắp trễ, mực cạn...).

**assets** — `id`, `name`, `serialNumber UNIQUE`, `type`, `manufacturer`, `model`, `cpuModel`, `ramGb`, `diskGb`, `os`, `departmentId→departments`, `assignedToId→users?`, `ip/mac/subnet/vlan/gateway`, `health`, `operationalStatus`, `temperature/cpu/mem/uptime` (% usage telemetry), `location`, `assetCode UNIQUE` (≠ QR image; QR sinh runtime), `lastMaintenanceDate`, `supplierName`, `importDate`, `warrantyExpiryDate`, `topologyNodeId`, `softDelete: deletedAt/deletedBy?`

**consumables** — `id`, `name`, `type(ink/ssd/ram/cmos_battery/other)`, `departmentId→departments?`, `productCode`, `stockQuantity`, `reorderLevel`, `supplierName`, `importDate`, `unitPrice`, `linkedAssetId→assets?`, `createdAt` — **vật tư tiêu hao tách khỏi Asset** (mực in, SSD/RAM thay thế, pin CMOS...).

**asset_history** — `id`, `assetId→assets`, `type(NHẬP_XUẤT/DI_DỜI/BẢO_TRÌ/THAY_MỰC/CHUYỂN_TRẠNG)`, `description`, `actorId→users`, `fromDepartmentId`, `toDepartmentId`, `fromLocation`, `toLocation`, `receivedById→users?`, `transferReason`, `decisionNumber` (tương ứng `AssetHistoryEvent`)

**audit_logs** — `id`, `userId→users?`, `level`, `category`, `action`, `details`, `ip`, `targetId`, `payloadDiff JSONB`, `signedFilePreview`, `sha256Hash`, `createdAt`  (append-only; trigger chặn UPDATE/DELETE)

### 3.3 Quy tắc quan hệ (quan trọng để hiểu)

1. **users ↔ departments** là **N:N** qua bảng `user_departments` (FK): 1 KTV phụ trách N khoa · 1 khoa có N KTV. Scope hiển thị "KHOA PHỤ TRÁCH" ở UI dựa trên quan hệ này.
2. **tickets → departments** là **N:1** (bắt buộc): ticket luôn thuộc 1 khoa. **tickets → assets** là **N:0..1** tuỳ chọn: 1 ticket có thể không/tham chiếu 1 thiết bị (qua `assetQrCode`/`assetId`).
3. **tickets `assignedEngineerId`/`createdById` → users**: phân công KTV; người tạo.
4. **ticket → ticket_logs / ticket_e2e**: **1-N** (nhật ký) và **1-1** (bản ký số) — tách E2E khỏi ticket chính giúp nullable gọn & truy vết cụ thể.
5. **assets → asset_history**: **1-N** — lịch sử toàn đời thiết bị (nhập/đi/trang/bảo trì/thay mực/chuyển trạng thái).
6. **users → audit_logs / ticket_logs**: **1-N** qua `actorId` — "mọi thay đổi = 1 vết" bảo chứng ai làm WUT (actor).
7. **refresh_tokens → users**: **N:1** — xoay vòng refresh; logout thu hội.
8. **tickets → sla_policies** **N:1** (tùy chọn, SLA theo ưu tiên) · **tickets → ticket_attachments / ticket_comments** **1-N** (đa file, trao đổi) · **users → notifications** **1-N** (thông báo cá nhân).

> **Nguyên tắc chuẩn hoá:** các trường *hiển thị tên* (`departmentName`, `assignedEngineerRole`...) KHÔNG lưu trùng mà **join FK**. (Khác mockData frontend đang denormalize tạm.)

### 3.4 Index khuyến nghị
- `tickets(status, priority)` · `tickets(departmentId)` · `tickets(assignedEngineerId)`
- `assets(operationalStatus)` · `assets(departmentId)`
- `audit_logs(createdAt, category)` · `audit_logs(userId)`
- `user_departments(userId)` · `ticket_logs(ticketId)`

### 3.5 Workflow trạng thái ticket (chuẩn hóa + backend-controlled)

> Checklist đề xuất chuỗi tiếng Anh; UI hiện dùng tiếng Việt + state E2E. **Backend lưu enum chuẩn, UI map sang nhãn tiếng Việt** (1-1), transition do backend kiểm soát.

| Backend enum (lưu) | Nhãn UI (hiện) | Cho phép (next) |
|---|---|---|
| `OPEN` | MỚI | ASSIGNED → CLOSED (huỷ) |
| `ASSIGNED` | ĐÃ PHÂN CÔNG | WORKING → CLOSED |
| `WORKING` | ĐANG XỬ LÝ | WAIT_USER · DONE · CANCELED |
| `WAIT_USER` | CHỜ KÝ XÁC NHẬN (E2E) | WORKING · DONE |
| `DONE` | ĐÃ HOÀN THÀNH | CLOSED (bắt buộc ký E2E nếu `requiresE2E`) |
| `CLOSED` | ĐÃ ĐÓNG | — (tiêu chí _terminal_) |
| `CANCELED` | ĐÃ HUỶ | — |

### 3.6 Dữ liệu tổng hợp & Soft Delete

- **Department summary/health** → **không lưu bảng tổng hợp**; tính bằng SQL view/API khi đọc (`assetCount`, `activeTicketsCount`, `healthIndex`, `allocatedBudget`). Không hardcode như mockData frontend.
- **Soft delete** trên `users`, `departments`, `assets`: thêm `deletedAt`, `deletedBy` (không xoá cứng; truy vấn mặc định lọc `deletedAt IS NULL`).
- **QR**: chỉ lưu `assetCode` (string), **sinh QR runtime** (thư viện), không lưu ảnh QR.

---

## Phần 4 — Bảo mật

- **Auth:** argon2 hash mật khẩu; JWT access ngắn (~15′) + refresh httpOnly cookie có rotation; logout revoke token.
- **RBAC/Grand:** Guard server per-module (`@Roles(...)`); scope KTV chỉ đọc khoa được gán — **kiểm server-side, không tin client**; rate-limit login.
- **Input/Output:** ValidationPipe (class-validator) + zod; Prisma ngăn SQLi; CORS whitelist; enum bảo mật endpoint.
- **PHI:** không ghi bệnh án/bệnh nhân thật (chỉ synthetic); TLS in route; (tuỳ chọn) mã hóa cột nhạy cảm `pgcrypto`.
- **Điều vận hành:** secrets qua `.env`/Docker secrets; app user trong prod KHÔNG có DDL; **audit_logs** không thể xóa/sửa (trigger).

---

## Phần 5 — Sao lưu & Restore

- **Tự động**
  - Daily `pg_dump -Fc` (14–30 ngày) + **WAL archiving** → PITR tới giây.
  - Nén + mã hóa (gpg) → **offsite** (S3/MinIO) + snapshot máy ảo.
  - MinIO (file upload) có replication; backup audit riêng.
- **Restore (drill định kỳ):**
  1. `docker compose stop api`  2. `pg_restore -Fc --clean --if-exists`  3. `docker compose up -d api` (migrate tự động)  4. kinh nghiệm: verify đếm bảng + healthcheck.

---

## Phần 6 — Deploy nhanh

- 1 lệnh: `docker compose up -d --build`; migration chạy khi start (`prisma migrate deploy`).
- Healthcheck `/api/health` (Kiểm tra DB + MinIO).
- CI/CD (GitHub Actions): build → test → migrate → deploy tới VPS.
- Mở rộng: Caddy/Nginx + replica; sau là k8s/Cloud Run.

---

## Phần 7 — Lộ trình nối từ frontend hiện tại

1. Viết **Prisma schema** (Phần 3.2) + migration.
2. NestJS: module `Users/Auth/Roles/Audit`, Guard RBAC, DTO, openapi.
3. `useDataStore` → gọi REST API (`VITE_API_BASE`); cờ `VITE_USE_MOCK` (dev/seed).
4. TanStack Query + optimistic update (Phase B).
5. Docker compose + backup + CI/CD.
6. **Khâu chờ:** chốt PostgreSQL?, NestJS?, đích deploy (VPS vs cloud)?, file upload (MinIO vs DB BLOB).