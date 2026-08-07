# 🌐 TicketSys — Plan REST API (NestJS + Prisma)

> Bản thiết kế API phục vụ frontend hiện tại. Backend: **NestJS (Modular Monolith)** + Prisma + PostgreSQL + MinIO.
> Frontend nối qua adapter `useDataStore` (+ TanStack Query Phase B) — API trả về giữ nguyên domain shape của `types.ts`.

---

## 1. Nguyên tắc chung

- **Base:** `/api` · Auth: JWT Bearer (access). Refresh qua httpOnly cookie (`/api/auth/refresh`).
- **Response chuẩn:**
  ```json
  { "data": { ... } }                     // 200 OK
  { "error": { "code": "TICKET_NOT_FOUND", "message": "...", "details": {} } }  // 4xx/5xx
  ```
- **RBAC:** guard server-side theo `roleType` (ADMIN / DOCTOR / NURSE / HARDWARE_TECH / SOFTWARE_TECH / TECHNICIAN); scope KTV = dept được gán (`user_departments`), **không tin client**.
- **Pagination** (danh sách): `GET ?page=1&pageSize=10&sort=-createdAt&q=` → trả `{ items, page, pageSize, total, totalPages }` — khớp `usePagedRows`.
- **Mọi ghi đều ghi audit** (`audit_logs`) + actor + ip (middleware).

---

## 2. Nhóm tài nguyên

### Auth
| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/auth/login` | public | `{ username, password }` → `{ accessToken, user }` + set refresh cookie |
| POST | `/api/auth/refresh` | cookie | xoay refresh token |
| POST | `/api/auth/logout` | auth | revoke refresh |
| POST | `/api/auth/switch` | auth | `{ userId }` chuyển phiên (RBAC demo) |
| POST | `/api/auth/rate-limit-status` | public | (log) |

### Users & Khoa
| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/users` | ADMIN | danh sách staff (+ filter `roleType`, `shiftStatus`) |
| POST | `/api/users` | ADMIN | tạo staff |
| PATCH | `/api/users/:id` | ADMIN/self | cập nhật profile |
| PATCH | `/api/users/:id/departments` | ADMIN | gán khoa phụ trách (`user_departments`) |
| DELETE | `/api/users/:id` | ADMIN | soft delete |
| GET | `/api/departments` | auth | danh sách khoa (scope theo role) |
| GET | `/api/departments/:id` | auth | chi tiết + summary đã tính |
| POST | `/api/departments` | ADMIN | thêm khoa |
| PATCH | `/api/departments/:id` | ADMIN | sửa khoa |
| DELETE | `/api/departments/:id` | ADMIN | soft delete |

### Tickets (lõi)
| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/tickets` | auth (scope dept) | list + filter `status/priority/category/departmentId/assignedEngineerId` + search + pagination |
| GET | `/api/tickets/:id` | auth | chi tiết (kèm `logs`, `comments`, `attachments`, `e2e`) |
| POST | `/api/tickets` | auth | tạo ticket (ref `departmentId`, `assetId?`, `slaPolicyId`) |
| PATCH | `/api/tickets/:id/status` | auth | đổi trạng thái (backend-check workflow) |
| PATCH | `/api/tickets/:id/assign` | auth | phân công `assignedEngineerId` |
| PATCH | `/api/tickets/:id/details` | auth | sửa metadata |
| GET | `/api/tickets/:id/logs` | auth | danh sách nhật ký |
| GET | `/api/tickets/:id/comments` | auth | danh sách comment |
| POST | `/api/tickets/:id/comments` | auth | thêm comment |
| GET | `/api/tickets/:id/attachments` | auth | danh sách file đính kèm |
| POST | `/api/tickets/:id/attachments` | auth | upload (MinIO) |

### Ký số E2E
| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/tickets/:id/e2e/verify-code` | CNTT + Khoa | ký 2 chiều `{ itSignature, userSignature }` |
| POST | `/api/tickets/:id/e2e/verify-file` | CNTT + Khoa | upload biên bản ký (SHA-256, TSA) |
| GET | `/api/tickets/:id/e2e` | auth | thông tin bản ký số |

### Assets, Consumables
| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/assets` | auth (scope) | danh sách thiết bị (+ filter type/status/health/department + pagination) |
| GET | `/api/assets/:id` | auth | chi tiết + history |
| POST | `/api/assets` | ADMIN/KTV | thêm thiết bị |
| PATCH | `/api/assets/:id` | ADMIN/KTV | sửa |
| POST | `/api/assets/:id/history` | auth | ghi nhật ký di dời/bảo trì/thay mực |
| DELETE | `/api/assets/:id` | ADMIN | soft delete |
| GET | `/api/consumables` | auth | vật tư tiêu hao (mực/SSD/RAM...) |
| POST | `/api/consumables` | ADMIN | nhập kho |
| POST | `/api/consumables/:id/consume` | auth | xuất/tiêu hao (cập nhật `stockQuantity`) |

### Audit & Notifications (& Dashboard)
| Method | Path | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/audit-logs` | ADMIN/KTV-PM | + filter level/category/search + pagination |
| GET | `/api/notifications` | auth (own) | thông báo cá nhân |
| PATCH | `/api/notifications/:id/read` | auth | đánh dấu đã đọc |
| GET | `/api/dashboard/summary` | auth | P1 mở, NGUY CẤP, đang xử lý, chờ ký, ca trực, health |
| GET | `/api/dashboard/telemetry` | auth | SLA/latency/metrics |
| GET | `/api/health` | — | healthcheck (DB + MinIO) |

---

## 3. Ví dụ request/response

**Tạo ticket**
```
POST /api/tickets
Authorization: Bearer <accessToken>
{ "title":"Máy in hết mực", "category":"Phần Cứng / Y Tế", "priority":"P2-CAO",
  "departmentId":"dep-1", "assetId":"ast-2", "requestorName":"BS. Nam",
  "requiresE2E": true }
→ 201 { "data": { "id":"INC-2026-XXXX", "status":"OPEN", ... } }
```

**Đổi trạng thái (workflow checked)**
```
PATCH /api/tickets/:id/status   Body: { "status":"WORKING", "note":"đang xử lý" }
→ 400 nếu transition không hợp lệ (VD OPEN → DONE) — backend-control.
```

**Danh sách pages**
```
GET /api/tickets?page=2&pageSize=8&priority=P1-KHẨN CẤP&status=OPEN
→ { "items":[ ... ], "page":2, "pageSize":8, "total":120, "pageCount":15 }
```

---

## 4. Xác thực workflow ở backend

- Mỗi transition do **service Ticket** kiểm tra bảng `workflow` cho phép; invalid → 422.
- `requiresE2E` → chặn `DONE→CLOSED` nếu chưa `e2eVerified`.
- Mọi đổi status sinh `ticket_logs` + audit.

---

## 5. Upload file (MinIO)

- Upload `multipart/form-data`; file → MinIO bucket (`ticket-attachments`, `ticket-e2e`, `ticket-proposal`); lưu `sha256` (hash client trước khi upload).
- Download qua URL ký tạm (presigned) hoặc proxy `/api/files/:id`.

---

## 6. Lộ trình triển khai (khớp Phase B/C)

| Bước | Việc |
|---|---|
| 1 | `GET/POST/PATCH/DELETE` core: Auth, Users, Departments |
| 2 | Tickets + status workflow + logs/comments |
| 3 | Assets + history + consumables |
| 4 | Ký số E2E + file upload MinIO |
| 5 | Audit + Notification + Dashboard summary |
| 6 | `useDataStore` → `useApi` (cờ `VITE_USE_MOCK`), TanStack Query |

---

*Tham chiếu: `docs/architecture-backend-db.md` (schema + quan hệ) · `src/types.ts` (domain shape)*