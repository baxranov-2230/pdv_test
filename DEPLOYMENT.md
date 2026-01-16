# Loyihani Serverga Joylash (Deploy) Qo'llanmasi

PDV Test loyihasini Linux serveriga joylash uchun quyidagi qadamlarni bajaring.

## 1. Talablar (Serverda)

Serveringizda (VPS/Dedicated) **Docker** va **Docker Compose** o'rnatilganligiga ishonch hosil qiling.

```bash
# Tizimni yangilash
sudo apt update
sudo apt upgrade -y

# Dockerni o'rnatish
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# O'rnatilganligini tekshirish
docker compose version
```

## 2. Fayllarni Serverga O'tkazish

Loyiha fayllarini `git` (tavsiya etiladi) yoki `scp` orqali serverga o'tkazishingiz mumkin.

### A varianti: Git orqali (Tavsiya etiladi)
1. Kodingizni GitHub yoki GitLab repozitoriysiga yuklang (push).
2. Serverga kiring va loyihani klon qiling:
   ```bash
   git clone <sizning-repo-urlingiz> pdv_project
   cd pdv_project
   ```

### B varianti: SCP orqali (To'g'ridan-to'g'ri nusxalash)
Bu buyruqni **o'z kompyuteringizdan** (serverdan emas) yuriting:
```bash
# user@server-ip ni o'zingizning server ma'lumotlaringizga o'zgartiring
scp -r ./pdv_test user@sizning-server-ip:~/pdv_project
```

## 3. Sozlash (Konfiguratsiya)

1. **Loyiha papkasiga kiring** (serverda):
   ```bash
   cd ~/pdv_project
   ```

2. **.env fayllarni sozlang**:
   Loyihada `.env` fayllari mavjudligini tekshiring.
   - `backend/.env` (Ma'lumotlar bazasi, Secret key)
   - `frontend/.env` (API URL - bu avtomatik `VITE_API_URL=/api` bo'lishi kerak)

   `backend/.env` namunasi:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/pdv_test
   SECRET_KEY=sizning_maxfiy_kalitingiz
   ```

## 4. Ishga tushirish (Deploy)

Tayyorlangan `deploy.sh` skriptini ishga tushiring:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 5. Tekshirish

Brauzerni ochib serveringiz IP manzili yoki domeniga kiring:
- **Sayt (Frontend)**: `http://sizning-server-ip`
- **API Hujjatlari**: `http://sizning-server-ip/docs`

## Muammolarni bartaraf etish (Troubleshooting)

- **502 Bad Gateway**: Backend endi ishga tushayotgan bo'lishi mumkin. 10-15 soniya kutib, sahifani yangilang (refresh).
- **Permission Denied**: Agar `docker` buyruqlarida ruxsat yo'q desa, oldiga `sudo` qo'shib ishlating yoki foydalanuvchini docker guruhiga qo'shing.
