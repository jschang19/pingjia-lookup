# Dataset Example
你可以使用 `example.sql` 中的指令匯入本專案需要的資料庫 `shop` 和相關的資料表，並且使用其中的店家與範例資料進行測試。

## Schema
以下是重點資料表的結構說明：
### `shop`
| 欄位名稱    | 資料類型       | 允許空值 | 主鍵 | 備註     |
|-------------|-------------|----------|-----|---------|
| ShopID      | varchar(50) | 否       | 是   | 店家編號 |
| ShopName    | varchar(250)| 是       | 否   | 店家名稱 |
| ShopBranch  | varchar(250)| 是       | 否   | 分店名稱 |
| ShopAddress | longtext    | 是       | 否   | 店家地址 |
| ShopUrl     | longtext    | 是       | 否   | 店家網址 |
| UpdateDate  | datetime    | 是       | 否   | 更新日期 |

### `shopcomment`
| 欄位名稱           | 資料類型       | 允許空值 | 主鍵 | 備註                   |
|---------------------|----------------|---------|------|--------------------|
| CommentID           | varchar(50)    | 否      | 是   | 評價資料編號         |
| ShopID              | varchar(50)    | 否      |      | 被評價店家編號       |
| Author              | varchar(250)   | 否      |      | 評論者名稱          |
| CommentMagnitude    | varchar(50)    | 是      |      | 評論權重            |
| CommentTaste        | double         | 是      |      | 口味評分，0 ~ 5     |
| CommentEnvironment  | double         | 是      |      | 環境評分，0 ~ 5     |
| CommentService      | double         | 是      |      | 服務評分，0 ~ 5     |
| Review              | longtext       | 否      |      | 評論留言內容         |
| AvgPrice            | varchar(255)   | 是      |      | 平均消費價格         |
| CommentDate         | datetime       | 是      |      | 留言日期            |
| UpdateDate          | datetime       | 是      |      | 更新日期            |

## Reminder
- 你可以自行修改資料表的欄位名稱與型別，請記得同時修改 `server/utils/mysql` 相關的 SQL query 欄位名稱
- 範例資料為簡體中文，預設會在後端查詢關鍵字時轉換為繁體中文
- 本範例資料僅供測試使用，請勿用於商業用途

## Reference
本資料集來自於台灣大學楊立偉教授

