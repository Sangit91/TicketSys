# 02 — Architecture

> Đọc khi sửa cấu trúc src/, state management, data flow.

## 1. Tổng quan

- **Frontend SPA thuần** — React 19 + TypeScript + Vite 6. **KHÔNG có backend** (no server/), chưa có Docker, chưa có tests.
- Toàn bộ data nằm trong `src/data/mockData.ts`, chạy hoàn toàn trên browser (localStorage cho theme).
- `@google/genai` đã khai báo trong `package.json` nhưng **chưa được sử dụng** trong `src/` — đây là capability dự trù (metadata.json khai báo `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`).

## 2. Cấu trúc src/

```text
src/
├── App.tsx                    ← Shell: auth/session + UI state; views nhận data từ data layer
├── main.tsx                   ← Entry point (StrictMode + ErrorBoundary)
├── index.css                  ← Tailwind v4 + @theme tokens + theme-light overrides
├── types.ts                   ← TOÀN BỘ domain types (nguồn sự thật)
├── data/
│   ├── useDataStore.ts        ← DATA LAYER: state + CRUD + audit (nối backend chỉ sửa đây)
│   └── mockData.ts            ← Data mẫu (users, tickets, inventory, departments, audit logs)
├── hooks/                     ← useDataStore*, usePagedRows, useTrapFocus, usePrefersReducedMotion
└── components/                ← Views code-split (React.lazy) + ErrorBoundary + Pagination…
```

## 3. State management — 3 lớp tách rõ

1. **Session & Permission** → `src/state/sessionStore.ts` (**Zustand + persist** `ticketsys-session`): `currentUser`, `isLoggedIn`, `login/logout/switchUser`, `updateAssignedDepartments`. App dùng `useSessionStore`, không nhân bản session.
2. **Server data** → `src/data/useDataStore.ts` (**adapter duy nhất**, React `useState`): `tickets`, `inventory`, `departments`, `staffList`, `auditLogs` + CRUD (`addTicket`, `applyTicketStatus`, `verifyE2E`, `add/update department/inventory/staff`) + `addAuditLog`. Actor đọc từ `useSessionStore.getState()`.
3. **UI ephemeral** → `useState` local trong App/component: `activeTab`, drawer, `selectedTicketId` (modal **derive** từ store — hết stale state), filter, trang, form.

- `App.tsx` **mỏng**: theme (persist `app-theme`), `activeTab`, routing, notification/toast.
- **Khi nối backend**: chỉ sửa bên trong `useDataStore` (hoặc đổi sang adapter TanStack Query), App & views không đổi.
- Mọi thao tác ghi đều có audit log (qua `addAuditLog` của store).
- Plan mở rộng (PHASE B/C): TanStack Query cho server data, optimistic update, cờ `VITE_USE_MOCK`.

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
