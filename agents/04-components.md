# 04 — Components

> Đọc khi thêm/sửa component trong `src/components/`.

## 1. Nguyên tắc

- **1 view = 1 file** trong `src/components/`. Component dùng chung nhỏ (ScrambleText, TypewriterText) cũng 1 file.
- **Reusable First:** component dùng được ≥2 nơi thì tách riêng, không duplicate JSX.
- **Naming:** PascalCase, export named (`export const X: React.FC<Props>` hoặc function component).
- **Props:** khai báo interface riêng trên component, tên `XxxProps`.
- **Default theme:** prop `theme` mặc định `'dark'`, dùng biến `isLight = theme === 'light'` để switch class.

## 2. Danh sách components hiện tại

| Component | Vai trò |
|-----------|---------|
| `Header.tsx` | Thanh điều hướng + tab + user menu + theme toggle |
| `TicketsView.tsx` | Danh sách yêu cầu xử lý (tickets) |
| `TicketDetailModal.tsx` | Chi tiết ticket + cập nhật trạng thái + ký số E2E |
| `ActionDrawer.tsx` | Drawer tạo ticket mới |
| `InventoryView.tsx` | Quản lý thiết bị & tài sản |
| `AssetFlowMap.tsx` | Sơ đồ hạ tầng (ReactFlow, ~1300 dòng) |
| `AssetRelocationFlow.tsx` / `AssetRelocationModal.tsx` | Di dời tài sản |
| `DepartmentsView.tsx` | Quản lý khoa phòng |
| `AdminRoleView.tsx` | Quản trị roles / staff |
| `AuditLogsView.tsx` | Nhật ký audit |
| `LoginPage.tsx` | Đăng nhập + chọn role |
| `ParticleBackground.tsx` | Three.js particle canvas |
| `HeroGraphic.tsx` | SVG server network graphic |
| `NotificationBanner.tsx` | Toast thông báo |
| `FooterMarquee.tsx` | Footer chạy chữ |
| `ScrambleText.tsx` / `TypewriterText.tsx` | Hiệu ứng chữ |

## 3. Pattern bắt buộc

1. **Audit log:** Mọi mutation data phải đi qua data layer `useDataStore` (không ghi thẳng state trong component con).
2. **Light theme:** Mọi component phải hoạt động ở cả 2 theme (dùng prop `theme` + lớp `.theme-light`).
3. **Callback naming:** `onSubmit`, `onClose`, `onSelect`, `onUpdate...` — dữ liệu đẩy lên cha qua callback, không mutate state cha trực tiếp.
4. **Modal/Drawer:** nhận `isOpen` + `onClose`; render có điều kiện hoặc dùng AnimatePresence.
5. **KHÔNG dùng `any`:** type props/data chính xác từ `../types`.

## 4. Accessibility

- Modal/Drawer: có nút đóng rõ ràng, focus quản lý hợp lý.
- Dropdown menu (Header): đóng khi click ngoài (dùng `useRef` + `mousedown` listener).
- Icon: dùng `lucide-react`, kèm text hoặc `aria-label` khi icon-only.
