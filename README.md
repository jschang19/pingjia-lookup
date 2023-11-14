# Restaurant Comments Lookup (Nuxt3)

這是個人的 Nuxt3 的練習專案，建立一個餐廳評價查詢全端網站。

![banner](https://jcshawn.com/wp-content/uploads/2023/11/restshawn-banner.jpg)

## Features
- 根據地區、餐廳名稱查詢餐廳資料與評價
- 顯示餐廳基本資訊與評價
- 根據評價、消費價格排序餐廳
- 依照評價高低、日期排序評價
- 推薦同地區的類似餐廳

![demo](https://jcshawn.com/wp-content/uploads/2023/11/restshawn_example.png)

## Tech Stack
- Nuxt3
- Tailwind CSS
- MySQL

## Setup
1. 複製專案:

```bash
git clone https://github.com/jschang19/restaurant-comment-lookup.git

cd restaurant-comment-lookup
```

2. 安裝套件:

```bash
# yarn
yarn install
```

3. 先建立資料庫 `shop`，再匯入測試資料:

```bash
mysql -u {user} -p -e "CREATE DATABASE shop"
mysql -u {user} -p shop < ./sql/example.sql
```
如果你還沒有建立 MySQL，可以參考下方的 [Database Setup](#database_setup) 來建立資料庫與資料表。
## Development Server

啟動測試伺服器，並且在瀏覽器中開啟 `http://localhost:3000`:

```bash
# yarn
yarn dev
```

### Database Setup
如果你的開發環境沒有，可以依照以下步驟安裝 MySQL 資料庫。

先到官網安裝 Docker:
https://docs.docker.com/get-docker/

複製以下程式碼，並在專案資料夾裡建立 `docker-compose.yml` 檔案，你可修改 `MYSQL_ROOT_PASSWORD` 與 `MYSQL_DATABASE` 等環境變數:

```yml
version: '3.1'  # 使用 docker-compose 檔案版本 3.1

services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example  
      MYSQL_DATABASE: shop # 創建一個資料庫
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - my-db:/var/lib/mysql
  volumes:
    my-db:
```

3. 執行以下指令啟動 container:

```bash
docker-compose up -d
```

現在 MySQL 會在 Port 3306 執行，並且可以使用你設定的帳號密碼連接到資料庫。
```bash
mysql -u {user} -p
# 接著輸入你設定的密碼，你應該看不到密碼輸入的字元
# 這是正常的，只要正常輸入並按下 Enter 即可
```

如果你想要停止 container，可以執行以下指令:

```bash
docker-compose down
```

如果你要刪除資料庫的資料，可以執行以下指令移除 volume:

```bash
docker volume rm my-db
```

## Production

建立 production build:

```bash
# npm
yarn build
```

在本機端預覽 production build:

```bash
yarn preview
```

## Deployment
你可以將 Nuxt 專案部署於 [Vercel](https://vercel.com) 或 [Zeabur](https://zeabur.com) 等平台，而 MySQL 資料庫可以使用 [RemoteMysql](https://remotemysql.com/index.html) 等免費的 MySQL 服務架設。

然而若你想要透過 Docker 部署，可以在專案資料夾裡建立 `Dockerfile` 檔案並貼上以下程式碼:

```Dockerfile
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install && yarn cache clean

COPY . .

RUN yarn build

EXPOSE 3000
CMD ["sh","-c","node .output/server/index.mjs"]
```

你可以使用以下指令建立 image:

```bash
docker build -t {image_name} .
```

接著你可以使用以下指令啟動 container:

```bash
docker run -d --name {container_name} -p 3000:3000 --env-file ./env {image_name}
```

p.s. 上方 Dockerfile 參考自[將 Nuxt3 發布至 docker 中，Dockerfile 看這裡就對了](https://www.ruyut.com/2023/04/deploy-nuxt3-to-docker-with-dockerfile.html)

## Environment Variables

建立 `.env` 檔案，並且設定以下環境變數:

```env
DB_HOST= # 你的資料庫主機位置
DB_PORT= # 你的資料庫連接埠
DB_USER= # 你的資料庫使用者名稱
DB_PASSWD= # 你的資料庫使用者密碼
DB_NAME= # 你的資料庫名稱
```
## Note
以下是本專案的一些注意事項:
- 為了練習前端，此專案是採在「 前端的後端 」( a.k.a Nuxt 3 自帶的 Nitro ) 與資料庫互動，並沒有另建 backend server 用來處理資料庫的 CRUD，實務上建議另建後端來跟資料庫互動。
- 由於開發專案時是使用學校課程老師提供的唯獨資料庫，因此個人沒有針對資料表結構去做優化，實務上你可以另建欄位來儲存原先我在 SQL query 計算的資料，以減少資料庫的負擔。

## License
[MIT](https://choosealicense.com/licenses/mit/)
