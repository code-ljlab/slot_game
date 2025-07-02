# WordPress埋め込みガイド

## 方法1: iframeで埋め込む（推奨）

### 1. ファイルをサーバーにアップロード
- `index.html`
- `styles.css`
- `script.js`

これらのファイルを同じディレクトリにアップロードしてください。

### 2. WordPressの投稿/ページに埋め込み
以下のコードを投稿やページのHTMLエディタに貼り付けます：

```html
<iframe 
  src="https://あなたのドメイン/path/to/index.html" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="max-width: 600px; margin: 0 auto; display: block;">
</iframe>
```

## 方法2: 直接HTMLを埋め込む

### 1. カスタムHTMLブロックを使用
WordPressのブロックエディタで「カスタムHTML」ブロックを追加し、以下を貼り付けます：

```html
<div id="lucky-number-game">
    <style>
        /* styles.cssの内容をここに貼り付け */
    </style>
    
    <div class="game-container">
        <h1>ラッキーナンバー</h1>
        
        <div id="game-container" class="game-content">
            <div class="license-plate">
                <div class="plate-top">
                    <span class="region" id="region">品川</span>
                    <span class="classification" id="classification">500</span>
                </div>
                <div class="plate-bottom">
                    <span class="hiragana" id="hiragana">あ</span>
                    <span class="number-group">
                        <span class="number-digit" id="digit1">1</span>
                        <span class="number-digit" id="digit2">2</span>
                        <span class="number-separator">-</span>
                        <span class="number-digit" id="digit3">3</span>
                        <span class="number-digit" id="digit4">4</span>
                    </span>
                </div>
            </div>

            <div class="controls">
                <button id="spin-btn" class="spin-button">回す</button>
            </div>

            <div id="result-message" class="result-message"></div>
        </div>
    </div>
    
    <script>
        /* script.jsの内容をここに貼り付け */
    </script>
</div>
```

## 方法3: プラグインを使用

### Code Snippetsプラグインを使用
1. 「Code Snippets」プラグインをインストール
2. 新しいスニペットを作成
3. ショートコードとして登録

```php
add_shortcode('lucky_number_game', function() {
    ob_start();
    ?>
    <!-- ゲームのHTMLコード -->
    <?php
    return ob_get_clean();
});
```

4. 投稿内で `[lucky_number_game]` と入力

## 注意事項

- **レスポンシブ対応**: すでにモバイル対応済みです
- **jQuery競合**: 純粋なJavaScriptで作られているため、jQueryとの競合はありません
- **SSL対応**: httpsサイトに埋め込む場合は、iframeのsrcもhttpsにしてください
- **高さ調整**: iframeの場合、height="600"の値を調整してください

## トラブルシューティング

### フォントが表示されない場合
Google Fontsの読み込みを確認：
```html
<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;900&display=swap" rel="stylesheet">
```

### スタイルが崩れる場合
親要素のCSSが影響している可能性があります。以下を追加してください：
```css
#lucky-number-game * {
    box-sizing: border-box;
}
```