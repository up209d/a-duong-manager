We gonna build a react app (make sure we can convert to native by react-native). Our target is on web first, react native later.

For backend, let's do node js backend with sqlite db first, we can convert to other type db later

All the app screenshot you can process inside app-screenshot folder

Main language for this app is in Vietnamese, and secondary language will be in English

Requirement will be in Vietnamese, you might need to understand it in english, but remember, this app is for vietnamese users

READ the raw-req.html for requirement

TÀI LIỆU THIẾT KẾ & DANH MỤC CHỨC NĂNG
======================================

Ứng dụng Quản lý Tồn kho, Công nợ và Báo cáo Lãi lỗ Tối giản cho Cửa hàng Nhỏ
-----------------------------------------------------------------------------

1\. Tổng quan Dự án (Project Overview)
--------------------------------------

### 1.1. Mục tiêu

Xây dựng ứng dụng quản lý bán hàng và kho vận tinh gọn, lược bỏ các quy trình phê duyệt hoặc quản lý đa kho phức tạp. Ứng dụng tập trung giải quyết 4 nhu cầu cốt lõi của chủ cửa hàng nhỏ:

1.  Quản lý danh mục sản phẩm & biến động tồn kho.
2.  Ghi nhận Xuất kho (Bán hàng) & Công nợ Khách hàng.
3.  Ghi nhận Nhập kho (Mua hàng) & Công nợ Nhà cung cấp.
4.  Báo cáo Lợi nhuận (Lãi / Lỗ) trực quan và nhanh chóng.

### 1.2. Nguyên tắc Thiết kế UI/UX

*   Tối giản thao tác: Đơn bán hàng và nhập hàng hoàn tất trong 1 màn hình duy nhất (không qua bước duyệt/chờ nhận).
*   Trực quan: Hiển thị chỉ số tài chính quan trọng ngay tại Trang chủ.
*   Tối ưu di động: Nút bấm to, hỗ trợ quét mã vạch (Barcode/QR) bằng camera thoại.

2\. Kiến trúc Hệ thống & Luồng Dữ liệu (System Workflow)
--------------------------------------------------------

\[Nhập kho\] ──(+)─> \[Tồn kho Sản phẩm\] ──(-)─> \[Xuất kho / Bán hàng\]  
   │                                              │  
   ├── (Nợ NCC) ──> \[Nhà Cung Cấp\]                 ├── (Nợ Khách) ──> \[Khách Hàng\]  
   │                                              │  
   └── (Chi phí nhập) ──┐                    ┌───┴── (Doanh thu)  
                        ▼                    ▼  
                  \[Báo cáo Lãi Lỗ (Dashboard)\]  

3\. Danh mục Chức năng Chi tiết (Functional Requirements)
---------------------------------------------------------

### Module 1: Quản lý Sản phẩm & Tồn kho

STT

Chức năng

Mô tả chi tiết

Trường dữ liệu / Thao tác

1.1

Danh sách Sản phẩm

Hiển thị tất cả mặt hàng kèm số lượng tồn và giá bán.

Tìm kiếm theo Tên/SKU, Bộ lọc theo Danh mục.

1.2

Thêm/Sửa Sản phẩm

Tạo mới hoặc cập nhật thông tin mặt hàng.

\- Mã SKU (Tự sinh hoặc quét Barcode)

\- Tên sản phẩm (Bắt buộc)

\- Danh mục

\- Đơn vị tính (Cái, Kg, Hộp...)

\- Giá vốn (Giá nhập mặc định)

\- Giá bán cơ bản

1.3

Cảnh báo tồn kho

Cảnh báo khi mặt hàng chạm ngưỡng tồn tối thiểu.

Cài đặt Ngưỡng tồn tối thiểu cho từng SP.

### Module 2: Quản lý Xuất kho (Bán hàng) & Khách hàng

STT

Chức năng

Mô tả chi tiết

Trường dữ liệu / Thao tác

2.1

Danh sách Khách hàng

Quản lý thông tin liên hệ và công nợ của khách.

Tên, Số điện thoại, Địa chỉ, Tổng công nợ hiện tại.

2.2

Thêm Khách hàng

Tạo nhanh hồ sơ khách hàng.

Cho phép thêm nhanh ngay tại màn hình Tạo đơn bán.

2.3

Tạo Phiếu Xuất kho

Bán hàng và tự động trừ tồn kho.

\- Chọn Khách hàng (Hoặc mặc định: Khách lẻ)

\- Chọn Sản phẩm + Số lượng + Giá bán thực tế

\- Giảm giá (% hoặc số tiền ![](images/image1.png))

\- Phụ phí (Phí ship, đóng gói)

\- Trạng thái thanh toán: Đã trả / Nợ một phần / Mua nợ

\- Ghi chú đơn hàng

2.4

Lịch sử Xuất kho

Xem danh sách phiếu bán hàng đã phát sinh.

Lọc theo thời gian, trạng thái thanh toán.

### Module 3: Quản lý Nhập kho & Nhà cung cấp

STT

Chức năng

Mô tả chi tiết

Trường dữ liệu / Thao tác

3.1

Danh sách Nhà cung cấp

Quản lý thông tin đối tác cung ứng và nợ cần trả.

Tên NCC, Số điện thoại, Địa chỉ, Tổng nợ NCC.

3.2

Tạo Phiếu Nhập kho

Nhập hàng về kho và tự động cộng tồn kho.

\- Chọn Nhà cung cấp

\- Chọn Sản phẩm + Số lượng + Giá nhập thực tế

\- Giảm giá từ NCC

\- Chi phí vận chuyển/nhập hàng

\- Trạng thái thanh toán: Đã trả / Nợ một phần / Nợ toàn bộ

\- Ghi chú

3.3

Lịch sử Nhập kho

Xem chi tiết các đợt nhập hàng đã thực hiện.

Lọc theo NCC, thời gian.

### Module 4: Báo cáo Tài chính & Lãi Lỗ (Dashboard)

STT

Chức năng

Mô tả chi tiết

Trường dữ liệu / Thao tác

4.1

Tổng kết Hôm nay

Thống kê nhanh chỉ số trong ngày tại màn hình chính.

Doanh thu, Giá vốn, Lợi nhuận gộp trong ngày.

4.2

Báo cáo Lãi/Lỗ

Báo cáo chi tiết theo khoảng thời gian tùy chọn.

\- Tổng Doanh thu

\- Tổng Giá vốn hàng bán

\- Tổng Giảm giá & Phụ phí

\- Lợi nhuận ròng

4.3

Quản lý Công nợ

Báo cáo tổng hợp nợ phải thu và nợ phải trả.

\- Tổng tiền khách hàng nợ cửa hàng

\- Tổng tiền cửa hàng nợ Nhà cung cấp

4\. Công thức Tính toán (Business Logic & Formulas)
---------------------------------------------------

1.  Giá trị Đơn Xuất kho (Doanh thu đơn hàng):  
    ![](images/image3.png)
2.  Giá vốn Đơn Xuất kho (Cost of Goods Sold - COGS):  
    ![](images/image2.png)
3.  Lợi nhuận Gộp từng đơn:  
    ![](images/image5.png)
4.  Lợi nhuận Ròng Khoảng thời gian:  
    ![](images/image4.png)
5.  Tính Công nợ:

*   Khách nợ mới: ![](images/image7.png)
*   Nợ Nhà cung cấp mới: ![](images/image6.png)

5\. Mô hình Dữ liệu Tối giản (Database Schema Design)
-----------------------------------------------------

### 5.1. Bảng products (Sản phẩm)

*   id (PK, Integer/UUID)
*   sku (String, Unique) - Mã vạch / Mã SP
*   name (String) - Tên sản phẩm
*   category (String) - Danh mục
*   unit (String) - Đơn vị tính
*   cost\_price (Decimal) - Giá vốn mặc định
*   selling\_price (Decimal) - Giá bán cơ bản
*   stock\_quantity (Integer) - Số lượng tồn hiện tại
*   min\_stock\_alert (Integer) - Ngưỡng cảnh báo hết hàng

### 5.2. Bảng customers (Khách hàng)

*   id (PK)
*   name (String)
*   phone (String)
*   address (Text)
*   current\_debt (Decimal) - Công nợ hiện tại

### 5.3. Bảng suppliers (Nhà cung cấp)

*   id (PK)
*   name (String)
*   phone (String)
*   address (Text)
*   current\_debt (Decimal) - Nợ NCC hiện tại

### 5.4. Bảng transactions (Phiếu Xuất / Nhập Kho)

*   id (PK)
*   code (String) - Mã phiếu (VD: XK001, NK001)
*   type (Enum: EXPORT, IMPORT) - Loại giao dịch
*   entity\_id (FK) - ID Khách hàng hoặc ID Nhà cung cấp
*   subtotal (Decimal) - Tiền hàng
*   discount (Decimal) - Giảm giá
*   extra\_fee (Decimal) - Phụ phí / Phí vận chuyển
*   total\_amount (Decimal) - Tổng tiền cuối cùng
*   paid\_amount (Decimal) - Số tiền đã thanh toán
*   note (Text) - Ghi chú
*   created\_at (Timestamp) - Ngày tạo phiếu

### 5.5. Bảng transaction\_items (Chi tiết Phiếu)

*   id (PK)
*   transaction\_id (FK)
*   product\_id (FK)
*   quantity (Integer) - Số lượng
*   unit\_price (Decimal) - Giá bán hoặc giá nhập tại thời điểm tạo phiếu
*   cost\_price (Decimal) - Giá vốn tại thời điểm tạo phiếu (dùng để tính lãi lỗ chính xác)

6\. Lộ trình Phát triển Gợi ý (Development Roadmap)
---------------------------------------------------

*   Giai đoạn 1 (MVP - 2 tuần): Xây dựng CSDL, Module Quản lý Sản phẩm & Tạo Đơn Xuất/Nhập đơn giản.
*   Giai đoạn 2 (1 tuần): Tích hợp Quản lý Khách hàng, Nhà cung cấp & Tính năng Ghi nhận Công nợ.
*   Giai đoạn 3 (1 tuần): Xây dựng Màn hình Báo cáo Dashboard (Doanh thu, Giá vốn, Lợi nhuận) & Bộ quét Mã vạch bằng Camera.
*   Giai đoạn 4 (1 tuần): Kiểm thử, tối ưu UI/UX cho di động và bàn giao.