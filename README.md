# ユーザー管理システム

Spring Boot バックエンドと Angular フロントエンドを使用したユーザー管理システムです。

## 概要

このシステムは、ユーザーの情報（姓名、メールアドレス、JSONデータ）を管理するためのWebアプリケーションです。バックエンドはSpring Bootで構築され、フロントエンドはAngularで構築されています。データはJSONファイルベースのデータベースで管理されます。

## システム構成

### バックエンド (Spring Boot)

- **フレームワーク**: Spring Boot 3.x
- **データベース**: ファイルベースJSONDB (H2から移行)
- **ビルドツール**: Gradle
- **Java バージョン**: 17+

#### 主要コンポーネント

- **User Entity**: ユーザー情報を表現するエンティティクラス
- **JsonDbService**: JSONファイルベースのデータベース操作を担当
- **UserService**: ビジネスロジックを担当
- **UserController**: REST APIエンドポイントを提供
- **IndexController**: Webページとステータス情報を提供

#### データ構造

```json
{
  "id": "1",
  "firstName": "太郎",
  "lastName": "田中",
  "email": "tanaka@example.com",
  "jsonData": {
    "age": 30,
    "city": "東京",
    "hobbies": ["読書", "旅行"],
    "profile": {
      "bio": "エンジニアとして働いています",
      "experience": 5
    }
  }
}
```

### フロントエンド (Angular)

- **フレームワーク**: Angular 17+
- **UIライブラリ**: Bootstrap 5
- **HTTP通信**: Angular HttpClient
- **スタイル**: SCSS（Sass）による高度なスタイリング

#### 主要コンポーネント

- **UserManagementComponent**: ユーザー管理のメイン画面
- **UserService**: バックエンドAPIとの通信を担当
- **User Model**: フロントエンドでのユーザーデータ構造

#### SCSSの利点

- **変数**: カラー、サイズ、アニメーション時間などの再利用可能な値
- **ミックスイン**: 共通のスタイルパターンを関数化
- **ネスト**: セレクタの階層構造を視覚的に表現
- **演算**: 数値計算による動的なスタイル生成
- **関数**: 条件分岐やループによる高度なスタイル制御

## セットアップと実行

### 前提条件

- Java 17以上
- Node.js 18以上
- npm または yarn

### バックエンドの起動

```bash
# プロジェクトルートディレクトリで
./gradlew bootRun
```

バックエンドは `http://localhost:8080` で起動します。

### フロントエンドの起動

```bash
# clientディレクトリで
cd client
npm install
npm start
```

フロントエンドは `http://localhost:4200` で起動します。

## API仕様

### ベースURL
```
http://localhost:8080/api/users
```

### エンドポイント

#### 1. ユーザー一覧取得
```
GET /api/users
```

**レスポンス例:**
```json
[
  {
    "id": "1",
    "firstName": "太郎",
    "lastName": "田中",
    "email": "tanaka@example.com",
    "jsonData": {...}
  }
]
```

#### 2. ユーザー作成
```
POST /api/users
```

**リクエストボディ:**
```json
{
  "firstName": "花子",
  "lastName": "佐藤",
  "email": "sato@example.com",
  "jsonData": {
    "age": 25,
    "city": "大阪"
  }
}
```

#### 3. ユーザー更新
```
PUT /api/users/{id}
```

**リクエストボディ:** 作成時と同様

#### 4. ユーザー削除
```
DELETE /api/users/{id}
```

#### 5. ユーザー取得（ID指定）
```
GET /api/users/{id}
```

#### 6. ステータス確認
```
GET /api/status
```

## データベース

### JSONDBファイル

- **メインデータファイル**: `data/users.json`
- **サンプルデータ**: `src/main/resources/sample-users.json`
- **自動保存**: 設定可能（`jsondb.auto.save=true`）

### データの永続化

- アプリケーション起動時に `data/users.json` からデータを読み込み
- ファイルが存在しない場合は `sample-users.json` からサンプルデータを読み込み
- データの変更時は自動的に `data/users.json` に保存

## 設定

### アプリケーション設定 (`application.properties`)

```properties
# JSONDB設定
jsondb.file.path=./data/users.json
jsondb.auto.save=true

# 文字エンコーディング
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.force=true
server.servlet.encoding.enabled=true

# サーバーポート
server.port=8080
```

## 機能

### ユーザー管理

- ✅ ユーザー一覧表示
- ✅ ユーザー追加
- ✅ ユーザー編集
- ✅ ユーザー削除
- ✅ JSONデータの柔軟な管理

### データ検証

- メールアドレスの重複チェック
- 必須フィールドのバリデーション
- JSONデータの形式チェック

### 国際化対応

- 日本語文字の完全サポート
- UTF-8エンコーディング
- **Google Noto Sans JPフォント**による美しい日本語表示
- 日本語テキストの最適化（行間、文字間隔の調整）

### UI/UX改善

- **フォント**: Google Noto Sans JP（日本語最適化）
- **デザイン**: モダンなグラデーションとシャドウ効果
- **レスポンシブ**: モバイル・タブレット対応
- **アニメーション**: スムーズなホバー効果とトランジション
- **カラーパレット**: 統一感のある配色設計

## 開発者向け情報

### プロジェクト構造

```
myapp/
├── src/main/java/com/example/myapp/
│   ├── config/          # 設定クラス
│   ├── controller/      # REST APIコントローラー
│   ├── entity/          # エンティティクラス
│   ├── service/         # ビジネスロジック
│   └── MyappApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── sample-users.json
├── client/              # Angularフロントエンド
│   ├── src/app/
│   │   ├── components/
│   │   ├── models/
│   │   └── services/
│   └── package.json
├── data/                # JSONDBデータファイル
├── build.gradle         # Gradle設定
└── README.md
```

### ログ出力

アプリケーションは詳細なログを出力し、以下の情報を提供します：

- ファイル読み込み/保存の状況
- データベース操作の詳細
- エラーの詳細情報
- パフォーマンス情報

### トラブルシューティング

#### よくある問題

1. **ポート8080が使用中**
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

2. **データファイルが読み込まれない**
   - `data/users.json` の存在確認
   - ファイルの権限確認
   - JSON形式の構文チェック

3. **日本語文字の文字化け**
   - エディタの文字エンコーディング設定
   - アプリケーションのUTF-8設定確認

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

バグレポートや機能リクエストは、GitHubのIssueでお知らせください。

## 更新履歴

- v1.0.0: 初期リリース
- v1.1.0: H2からJSONDBへの移行
- v1.2.0: 日本語サポートの改善
- v1.3.0: エラーハンドリングの強化
