# 02 — Architecture

> Đọc khi sửa cấu trúc src/, state management, data flow.

## 1. Tổng quan

- **Frontend SPA thuần** — React 19 + TypeScript + Vite 6. **KHÔNG có backend** (no server/), chưa có Docker, chưa có tests.
- Toàn bộ data nằm trong `src/data/mockData.ts`, chạy hoàn toàn trên browser (localStorage cho theme).
- `@google/genai` đã khai báo trong `package.json` nhưng **chưa được sử dụng** trong `src/` — đây là capability dự trù (metadata.json khai báo `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`).

## 2. Cấu trúc src/

```text
src/
├── App.tsx                    ← Root component: state chính + routing bằng tab
├── main.tsx                   ← Entry point
├── index.css                  ← Tailwind v4 + @theme tokens + theme-light overrides
├── types.ts                   ← TOÀN BỘ domain types (nguồn sự thật)
├── data/
│   └── mockData.ts            ← Data mẫu (users, tickets, inventory, departments, audit logs)
└── components/                ← 18 view/components (mỗi view 1 file)
```

## 3. State management

- **Không dùng Redux/Zustand** — state được quản lý bằng React `useState` tập trung tại `App.tsx`:
  - `tickets`, `inventory`, `departments`, `auditLogs` — data chính
  - `currentUser`, `staffList` — RBAC
  - `activeTab` — điều hướng
  - `theme` (`'dark' | 'light'`) — persist `localStorage.getItem('app-theme')`
- Các handler thống nhất: `handleCreateTicket`, `handleUpdateTicketStatus`, `handleVerifyE2E`, `handleAddInventoryItem`, `handleUpdateInventoryItem`, `handleAddDepartment`, `handleUpdateDepartment`, `handleLoginSuccess`, `handleSwitchUser`, `handleAddStaffProfile`, `handleUpdateStaffDepartments`.
- **Mọi thao tác ghi đều phải ghi audit log** qua `addAuditLog()` (hàm trung tâm).

## 4. Quy tắc khi sửa cấu trúc

1. Thêm view mới → tạo component trong `src/components/`, đăng ký `TabType` trong `types.ts`, render trong `App.tsx` theo `activeTab`.
2. Thêm type mới → khai báo trong `src/types.ts` (Zero Any).
3. KHÔNG tạo backend/file server mới nếu chưa được yêu cầu.
4. Data mới dạng thô → thêm vào `src/data/mockData.ts` theo đúng type.
5. Router: hiện tại dùng `activeTab` state — không thêm react-router nếu chưa cần.

## 5. Commands

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Dev server — port **9000**, host 0.0.0.0 |
| `npm run build` | Build production |
| `npm run lint` | Type check `tsc --noEmit` (Quality Gate) |
| `npm run preview` | Preview build |
