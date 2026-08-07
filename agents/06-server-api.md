# 06 — Server / API / Data Governance

> Đọc khi thêm/đổi dữ liệu, types, mockData. Hiện tại dự án **KHÔNG có backend** — dữ liệu mock hoàn toàn.

## 1. Kiến trúc dữ liệu hiện tại

- Nguồn dữ liệu duy nhất: `src/data/mockData.ts` (khởi tạo state trong `src/data/useDataStore.ts`).
- Domain types tập trung tại `src/types.ts`:
  - `Ticket` — sự cố yêu cầu xử lý (có field ký số E2E: `e2eVerified`, `userSignature`, `itSignature`, `verificationMethod`, `signedFile*`)
  - `InventoryItem` + `AssetHistoryEvent` — thiết bị/tài sản + lịch sử vận hành
  - `DepartmentSummary` — khoa phòng
  - `SystemAuditLog` — nhật ký audit (level/category/action/details/actor/sha256Hash)
  - `TechnicalStaffProfile` + `ROLE_PERMISSIONS` — nhân sự & RBAC
  - `SystemMetric` — số liệu vận hành

## 2. Quy tắc thay đổi dữ liệu

1. **Thêm/đổi type:** sửa `src/types.ts` trước, rồi mới sửa `mockData.ts` cho khớp.
2. **Zero Any:** dữ liệu mới phải khớp 100% interface. `any` chỉ chấp nhận tạm ở handler đang migrate (handleAddDepartment etc.) — khi sửa, hãy loại bỏ `any`.
3. **ID chuẩn:** ticket `INC-2026-XXXX`, log `LOG-2026-XXXX`, user `USER-<ROLE>-<NAME>`, department `DEP-<CODE>`, asset QR `QR-<TYPE>-<CODE>`.
4. **Timestamp:** ISO 8601 UTC (`new Date().toISOString()`).
5. **Audit log bắt buộc:** mọi mutation phải đi kèm `addAuditLog` — không thêm dữ liệu thầm lặng.
6. **Synthetic only:** KHÔNG đưa PHI (bệnh nhân thật, hồ sơ thật) vào mockData — chỉ dùng tên/dữ liệu giả.

## 3. Chuẩn bị khi có backend (tương lai)

- Dự trù: `@google/genai` (Gemini) đã có trong dependencies — server-side capability khai báo trong `metadata.json`.
- Nếu thêm API: tạo thư mục `server/`, giữ nguyên contract type từ `src/types.ts` (chia sẻ types nếu cần).
- Mọi API mới phải qua `agents/09-ops.md` (backup trước) và ghi phase-history.

## 4. Env

- `.env.example` hiện có: `GEMINI_API_KEY`, `APP_URL`.
- `.env` thật nằm ở `openbrain/.env` (plugin) — đã gitignore, không commit key.
