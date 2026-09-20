# BÁO CÁO THỰC HÀNH LAB 02
## MÔN HỌC: SDN302 - SERVER-SIDE DEVELOPMENT WITH NODEJS, EXPRESS AND MONGODB
**Chủ đề: APIs, the HTTP Module and the File System (Hệ thống BookNest Online Bookstore)**

---

### THÔNG TIN SINH VIÊN
- **Họ và tên:** Nguyen Le Quang Trung
- **Mã số sinh viên:** DS190284
- **Lớp / Khóa:** Semester 7 - FPT University
- **Ngày thực hiện:** 14/09/2026
- **Tập tin nén nộp bài:** `DS190284_NguyenLeQuangTrung_Lab02.zip`

---

## PHẦN 1: EXPLORE A PUBLIC REST API WITH POSTMAN (20%)

### 1.1. Bảng tổng hợp 4 yêu cầu HTTP gửi tới JSONPlaceholder (`https://jsonplaceholder.typicode.com/posts`)

| STT | Phương thức (Method) | Endpoint / URL | Request Body | Status Code | Các Response Headers quan trọng nhất |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **1** | `GET` | `https://jsonplaceholder.typicode.com/posts` | *(None)* | `200 OK` | `content-type: application/json; charset=utf-8`<br>`x-powered-by: Express`<br>`cache-control: max-age=43200` |
| **2** | `POST` | `https://jsonplaceholder.typicode.com/posts` | `{"title": "BookNest Architecture", "body": "Node.js Core HTTP", "userId": 1}` | `201 Created` | `content-type: application/json; charset=utf-8`<br>`location: https://jsonplaceholder.typicode.com/posts/101`<br>`x-powered-by: Express` |
| **3** | `PUT` | `https://jsonplaceholder.typicode.com/posts/1` | `{"id": 1, "title": "BookNest Architecture (Updated)", "body": "Advanced Async", "userId": 1}` | `200 OK` | `content-type: application/json; charset=utf-8`<br>`x-powered-by: Express` |
| **4** | `DELETE` | `https://jsonplaceholder.typicode.com/posts/1` | *(None)* | `200 OK` | `content-type: application/json; charset=utf-8`<br>`x-powered-by: Express` |

---

### 1.2. Chuyển đổi dữ liệu mẫu từ JSON sang cấu trúc XML tương đương

#### Dữ liệu gốc dạng JSON:
```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto"
}
```

#### Cấu trúc XML tương đương:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<post>
  <userId>1</userId>
  <id>1</id>
  <title>sunt aut facere repellat provident occaecati excepturi optio reprehenderit</title>
  <body>quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto</body>
</post>
```

---

### 1.3. Hai ưu điểm vượt trội của JSON so với XML

1. **Cú pháp nhẹ gọn (Lightweight) và hiệu năng truyền tải/phân tích cao hơn:**
   - JSON không yêu cầu các thẻ đóng lặp đi lặp lại như XML (`<title>...</title>`), giúp kích thước payload nhỏ hơn đáng kể, tiết kiệm băng thông mạng.
   - Trình duyệt và Node.js có engine V8 tích hợp sẵn hàm native `JSON.parse()` và `JSON.stringify()`, giúp tốc độ parse dữ liệu JSON nhanh hơn nhiều so với việc dựng cây DOM của XML parser.

2. **Ánh xạ trực tiếp với cấu trúc dữ liệu của các ngôn ngữ lập trình hiện đại:**
   - JSON hỗ trợ trực tiếp các kiểu dữ liệu cơ bản: String, Number, Boolean, Array `[]`, và Object `{}`.
   - Trong JavaScript/Node.js, JSON ánh xạ 1:1 thành JavaScript Object mà không cần thông qua lớp chuyển đổi (unmarshalling/schema mapping) phức tạp như XML.

---

### 1.4. Bảng so sánh SOAP và REST

| Tiêu chí | SOAP (Simple Object Access Protocol) | REST (Representational State Transfer) |
| :--- | :--- | :--- |
| **Bản chất** | Là một **Giao thức (Protocol)** chuẩn hóa nghiêm ngặt bởi W3C. | Là một **Kiểu kiến trúc (Architectural Style)** dựa trên chuẩn HTTP. |
| **Giao thức truyền tải (Protocol)** | Hoạt động qua HTTP, HTTPS, SMTP, FTP, TCP,... | Chủ yếu hoạt động trên nền tảng **HTTP / HTTPS**. |
| **Định dạng thông điệp (Message Format)** | Chỉ hỗ trợ duy nhất định dạng **XML** (được bọc trong `SOAP-Envelope`). | Linh hoạt hỗ trợ nhiều định dạng: **JSON** (phổ biến nhất), XML, HTML, Plain Text. |
| **Quản lý trạng thái (State)** | Có thể hỗ trợ cả Stateful hoặc Stateless tùy theo cấu hình WS-*. | Hoàn toàn **Stateless** (mỗi request độc lập, chứa đầy đủ thông tin xác thực/ngữ cảnh). |
| **Tính bảo mật & Chuẩn hóa** | Tích hợp chuẩn bảo mật cấp doanh nghiệp cao cấp (WS-Security, ACID transactions). | Dựa vào bảo mật tầng mạng (HTTPS/TLS) và token chuẩn (JWT, OAuth2). |
| **Trường hợp sử dụng điển hình (Typical Use Case)** | Các hệ thống tài chính ngân hàng, cổng thanh toán, viễn thông, giao dịch B2B yêu cầu bảo mật và tính toàn vẹn dữ liệu cực kỳ khắt khe. | Ứng dụng web, mobile app, microservices, public APIs cần tốc độ nhanh, nhẹ và dễ tích hợp. |

---

## PHẦN 2: BUILD A WEB SERVER WITH THE CORE HTTP MODULE (25%)

### 2.1. Thiết kế và cấu trúc server (`server.js`)
- Server sử dụng thuần túy module core `node:http`, lắng nghe tại cổng `3000`.
- Các route chính được triển khai:
  - `GET /`: Phục vụ trang chủ HTML `public/index.html` (`Content-Type: text/html; charset=utf-8`).
  - `GET /about`: Trả về trang giới thiệu hệ thống BookNest (`Content-Type: text/html; charset=utf-8`).
  - `GET /api/books`: Trả về mảng JSON ít nhất 5 cuốn sách đọc từ `books.json` (`Content-Type: application/json; charset=utf-8`).
  - Route không tồn tại: Trả về trang thông báo lỗi 404 (`Content-Type: text/html; charset=utf-8`, status code `404`).

### 2.2. Minh chứng kết quả (Screenshots)
*(Chụp ảnh màn hình từ trình duyệt hoặc Postman chèn vào vị trí dưới đây)*
- **Ảnh 1: Truy cập `http://localhost:3000/` từ trình duyệt** (Hiển thị trang chủ BookNest kèm banner).
- **Ảnh 2: Truy cập `http://localhost:3000/about`** (Hiển thị thông tin giới thiệu BookNest).
- **Ảnh 3: Gửi GET `http://localhost:3000/api/books` trên Postman** (Status 200 OK, trả về mảng các cuốn sách).
- **Ảnh 4: Gửi request tới route không tồn tại (vd: `/unknown-path`)** (Status 404 Not Found).

---

## PHẦN 3: HANDLE HTTP METHODS, QUERY STRINGS AND REQUEST BODIES (20%)

### 3.1. Cơ chế lọc Query String (`/api/books?category=IT&limit=2`)
- Sử dụng API `new URL(req.url, "http://localhost:3000")` để phân tích `searchParams`.
- Lọc theo trường `category` không phân biệt hoa thường và giới hạn số lượng kết quả theo `limit`.

### 3.2. Nhận và phân tích dữ liệu POST (`POST /api/books`)
- Thu thập body qua các stream event non-blocking: `req.on('data', chunk => ...)` và `req.on('end', () => ...)`.
- Kiểm tra tính hợp lệ của dữ liệu đầu vào, tự động sinh `id` mới.
- Lưu dữ liệu vào `books.json` và trả về status `201 Created` kèm thực thể sách vừa tạo.

### 3.3. Xử lý phương thức không hỗ trợ (HTTP 405 Method Not Allowed)
- Nếu người dùng gửi phương thức không hợp lệ (ví dụ `PUT`, `DELETE` vào `/api/books` hoặc `POST` vào `/about`):
  - Trả về status `405 Method Not Allowed`.
  - Thiết lập header `Allow: GET, POST`.
  - Trả về JSON mô tả chi tiết: `{"error": "Method PUT Not Allowed on /api/books", "allowedMethods": ["GET", "POST"]}`.

### 3.4. Minh chứng kết quả (Screenshots)
- **Ảnh 5: Gửi GET `/api/books?category=IT&limit=2` trên Postman** (Chỉ trả về 2 cuốn sách thuộc danh mục IT).
- **Ảnh 6: Gửi POST `/api/books` với body JSON trên Postman** (Status 201 Created, trả về đối tượng vừa tạo).
- **Ảnh 7: Gửi PUT `/api/books` trên Postman** (Status 405 Method Not Allowed kèm header Allow).

---

## PHẦN 4: WORK WITH THE FILE SYSTEM (25%)

### 4.1. Hiện thực Dual-Style File Helpers (`fileHelpers.js`)
Theo yêu cầu đề bài, hai phong cách làm việc với file system được hiện thực hoàn chỉnh:
1. **Callback Style (`fs.readFile` / `fs.writeFile`):**
   - `readBooksCallback(callback)`
   - `writeBooksCallback(books, callback)`
   - Kiểm chứng độc lập qua script `testCallbacks.js` (`npm run test:callbacks`).
2. **Promise / Async-Await Style (`fs.promises`):**
   - `readBooksAsync()`
   - `writeBooksAsync(books)`
   - Tích hợp trực tiếp vào route POST `/api/books` của `server.js` để đảm bảo dữ liệu luôn được lưu bền vững sau khi khởi động lại server.

### 4.2. Ghi Access Log (`logs/access.log`)
- Tại thời điểm khởi động server, kiểm tra và tạo tự động thư mục `logs/` nếu chưa tồn tại (`initLogsDir()`).
- Mỗi request đến server được ghi nối một dòng với định dạng:
  ```
  [2026-09-14T15:14:07.123Z] GET /api/books?category=IT&limit=2
  [2026-09-14T15:14:07.150Z] POST /api/books
  ```

### 4.3. Minh chứng kết quả
- **Ảnh 8: Kết quả chạy `node testCallbacks.js` thành công**.
- **Ảnh 9: Nội dung file `books.json` sau khi gửi request POST** (cuốn sách mới đã xuất hiện trong file).
- **Ảnh 10: Nội dung file `logs/access.log` ghi nhận đầy đủ các lượt truy cập**.

---

## PHẦN 5: SERVE STATIC FILES (10%)

### 5.1. Phục vụ Static File từ thư mục `public/`
- Thư mục `public/` chứa:
  - `index.html`: Giao diện HTML của BookNest.
  - `style.css`: File CSS định kiểu thẩm mỹ, responsive.
  - `booknest-banner.svg`: Ảnh vector logo/banner của hệ thống BookNest.
- Server tự động xác định MIME type dựa vào đuôi mở rộng của file bằng `path.extname()`:
  - `.html` -> `text/html; charset=utf-8`
  - `.css` -> `text/css; charset=utf-8`
  - `.svg` -> `image/svg+xml`
  - `.txt` -> `text/plain; charset=utf-8`

### 5.2. Route `/download` gửi file đính kèm
- Gửi file danh mục sách `booknest-catalog.txt`.
- Header đính kèm: `Content-Disposition: attachment; filename="booknest-catalog.txt"`.
- Trình duyệt tự động mở hộp thoại tải xuống thay vì hiển thị trực tiếp.

### 5.3. Minh chứng kết quả
- **Ảnh 11: Trang web hiển thị đầy đủ định dạng CSS và ảnh đồ họa `booknest-banner.svg`**.
- **Ảnh 12: Truy cập `http://localhost:3000/download`** (Trình duyệt tải về file `booknest-catalog.txt`).

---

## KẾT LUẬN VÀ TỔNG KẾT
Toàn bộ 5 yêu cầu của bài Lab 02 đã được hiện thực trọn vẹn, chạy đúng đặc tả và không có lỗi:
- Sử dụng chuẩn ES Modules hiện đại.
- Không phụ thuộc vào thư viện ngoài, tối ưu hiệu năng với built-in module của Node.js.
- Đầy đủ file kiểm thử, Postman collection và tài liệu nộp bài.
