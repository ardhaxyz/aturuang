# Frontend Testing Guide

## 🎯 Cara Testing Frontend di Local

### 1. Start Backend

```bash
cd /home/sutopo/aturuang/backend
node src/index.js
```

Backend akan berjalan di: `http://localhost:3001`

### 2. Start Frontend

```bash
cd /home/sutopo/aturuang/frontend
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

### 3. Buka Browser

Buka browser dan akses: `http://localhost:3000`

---

## 📋 Checklist Testing

### A. Landing Page
- [ ] Halaman utama load dengan benar
- [ ] Layout terlihat jelas
- [ ] Navigasi berfungsi

### B. Login
- [ ] Form login muncul
- [ ] Login dengan admin/admin123 berhasil
- [ ] Redirect ke dashboard setelah login

### C. Dashboard
- [ ] Dashboard muncul setelah login
- [ ] Stats cards terlihat
- [ ] Quick actions berfungsi

### D. Calendar View
- [ ] Calendar load dengan benar
- [ ] Bookings muncul di calendar
- [ ] Click booking untuk melihat detail

### E. Room Management
- [ ] List rooms muncul
- [ ] Bisa filter rooms
- [ ] Bisa tambah room (jika admin)

### F. Booking
- [ ] Bisa buat booking baru
- [ ] Booking masuk ke calendar
- [ ] Status booking terlihat (pending/approved/rejected)

### G. User Management
- [ ] List users muncul
- [ ] Bisa tambah user (jika admin)
- [ ] Bisa assign role

---

## 🔧 Troubleshooting

### Error: "Failed to fetch"

**Solusi:**
1. Pastikan backend running di http://localhost:3001
2. Cek environment variables di frontend/.env:
   ```
   VITE_API_URL=http://localhost:3001
   ```

### Error: "CORS Error"

**Solusi:**
1. Pastikan backend CORS sudah di-set:
   ```javascript
   cors({
     origin: ['http://localhost:3000'],
     credentials: true
   })
   ```

### Error: "Cannot login"

**Solusi:**
1. Pastikan backend sudah setup:
   ```bash
   curl -X POST http://localhost:3001/api/setup \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```
2. Cek setup status:
   ```bash
   curl http://localhost:3001/api/setup/status
   ```

---

## 🧪 Manual API Testing

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Get Rooms
```bash
TOKEN="your-jwt-token"
curl http://localhost:3001/api/rooms \
  -H "Authorization: Bearer $TOKEN"
```

### Test Get Bookings
```bash
TOKEN="your-jwt-token"
curl http://localhost:3001/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Expected Behavior

### After Login
- Redirect ke dashboard
- Token tersimpan di localStorage
- User info muncul di header

### Dashboard
- Stats cards: Total Rooms, Total Bookings, Today's Bookings
- Quick Actions: Book a Room
- Recent Activity: List booking terbaru

### Calendar
- FullCalendar loaded
- Bookings visible
- Click booking untuk melihat detail
- Drag booking untuk edit (jika admin)

---

## 🎯 Next Steps

1. Test semua fitur di checklist
2. Dokumentasikan bug jika ada
3. Deploy ke Render untuk production

---

**Created:** 2026-02-15
**Status:** Ready for Testing
