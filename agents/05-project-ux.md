# 05 — Project UX (Hospital CNTT)

> Đọc khi thay đổi flow người dùng / nội dung tiếng Việt. Domain: quản trị vận hành CNTT bệnh viện.

## 1. Người dùng chính

| Role (`roleType`) | Mô tả | Tab được phép |
|-------------------|-------|---------------|
| `ADMIN` | Quản trị hệ thống | Tất cả |
| `DOCTOR` | Bác sĩ lâm sàng | YÊU CẦU XỬ LÝ, SƠ ĐỒ HẠ TẦNG, KHOA PHÒNG |
| `NURSE` | Điều dưỡng / y sĩ | YÊU CẦU XỬ LÝ, KHOA PHÒNG |
| `HARDWARE_TECH` | KTV phần cứng | YÊU CẦU XỬ LÝ, THIẾT BỊ & TÀI SẢN, SƠ ĐỒ HẠ TẦNG |
| `SOFTWARE_TECH` | KTV phần mềm & CSDL | YÊU CẦU XỬ LÝ, THIẾT BỊ & TÀI SẢN, NHẬT KÝ AUDIT |
| `TECHNICIAN` | KTV CNTT | YÊU CẦU XỬ LÝ, THIẾT BỊ & TÀI SẢN, SƠ ĐỒ HẠ TẦNG |

Quyền được định nghĩa tập trung trong `ROLE_PERMISSIONS` (`src/types.ts`).

## 2. Nguyên tắc UX ngành y tế (hospital-ux)

1. **Ưu tiên khẩn cấp (Critical First):** ticket P1-KHẨN CẤP phải hiển thị nổi bật (badge đỏ `#FF3366`); `criticalCount` tính bằng bộ lọc P1 + chưa đóng.
2. **Trạng thái rõ ràng:** mọi mutation phải có phản hồi ngay — dùng `NotificationBanner` (`showNotification`) + audit log.
3. **Ngôn ngữ chuẩn bệnh viện:** ticket `category` ∈ {Phần Cứng/Y Tế, Phần Mềm HIS/PACS/LIS, Mạng & Hạ Tầng, Tài Khoản & Chữ Ký Số, An Ninh Mạng & Dữ Liệu}. Không dùng thuật ngữ IT rối mắt ngoài màn hình chính.
4. **Ký số E2E (SmartCA/PKI):** flow ký xác nhận 2 chiều (CNTT + Bác sĩ) hoặc upload file ký số — giữ đúng 2 method `DIGITAL_CODE` / `FILE_UPLOAD`.
5. **Mọi thay đổi dữ liệu = sự kiện audit:** không thao tác im lặng; actor (tên + role) luôn được ghi lại.
6. **Shift status:** staff có trạng thái `ĐANG TRỰC / SẴN SÀNG / NGOÀI GIỜ` — hiển thị để phân công trực.
7. **Số liệu sống động:** dùng `SystemMetric` (latency, packet loss, threats, SLA) cho cảm giác "real-time điều hành".

## 3. Quy tắc viết nội dung tiếng Việt

- Không dấu phụ bỏ thiếu; giữ phong cách "command center": chữ in hoa cho headline/button quan trọng (`font-black uppercase tracking-widest`).
- Toast message phải mô tả hành động + kết quả (VD: `ĐÃ THÊM THIẾT BỊ MỚI: <name>`).
- Audit log `details` phải đủ ngữ cảnh: đối tượng, hành động, giá trị thay đổi.
