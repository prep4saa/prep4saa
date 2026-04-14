type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const SEC_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "新人開発者のオンボーディング",
    scenario: "スタートアップのAWS管理者であるあなたのチームに、バックエンド開発者のキムが入社しました。S3とEC2には読み取り専用でのみアクセスでき、変更や削除はできてはいけません。",
    steps: [
      { title: "IAMユーザーを作成", desc: "kim-dev のIAMユーザーを作成してください。" },
      { title: "S3 ReadOnlyポリシーを付与", desc: "AmazonS3ReadOnlyAccess を kim-dev に付与してください。" },
      { title: "AccessDeniedを確認", desc: "バケット削除コマンドを実行して権限制限を確認してください。" },
    ],
    explanation: "IAMユーザーにマネージドポリシーを直接付与するのは基本パターンです。ReadOnlyポリシーは List、Get、Describe のみ許可するため、削除や変更コマンドは AccessDenied になります。",
  },
  2: {
    title: "チーム別の権限分離",
    scenario: "会社の規模が拡大し、開発チーム5人と運用チーム3人になりました。開発チームはEC2のみ、運用チームはRDSのみを管理します。個別ユーザーごとのポリシー管理は面倒なので、グループベースに切り替えます。",
    steps: [
      { title: "dev-teamグループを作成", desc: "開発チーム用のIAMグループを作成してください。" },
      { title: "EC2ポリシーを付与", desc: "dev-team に AmazonEC2FullAccess を付与してください。" },
      { title: "ユーザーをグループへ追加", desc: "kim-dev を dev-team グループに追加してください。" },
    ],
    explanation: "IAMグループを使うと、ユーザーの追加と削除だけで権限を付与・回収できます。個別ポリシー管理より運用ミスを大きく減らせます。",
  },
  3: {
    title: "EC2がS3へアクセスする必要がある場合",
    scenario: "稼働中のEC2サーバーは、毎晩ログファイルをS3へ自動アップロードしなければなりません。開発者が「アクセスキーをEC2へハードコードしてもいいですか」と聞いてきました。安全な方法で設定してください。",
    steps: [
      { title: "IAM Roleを作成", desc: "EC2用のIAM Roleを作成してください。" },
      { title: "S3権限を付与", desc: "Roleに AmazonS3FullAccess を付与してください。" },
      { title: "EC2へRoleを関連付け", desc: "EC2インスタンスにIAM Roleを関連付けてください。" },
    ],
    explanation: "EC2がIAM Roleを使うと、インスタンスメタデータサービスが一時クレデンシャルを自動発行します。アクセスキーのハードコードは漏えいリスクが高いため、Roleの利用が推奨です。",
  },
  4: {
    title: "顧客データバケットの保護",
    scenario: "S3には顧客注文データが保存されています。セキュリティ監査で、バケットが公開される可能性があると指摘されました。特定のLambda関数だけがアクセスできるようにロックしてください。",
    steps: [
      { title: "パブリックアクセスを全面遮断", desc: "orders-data-bucket の公開アクセスをすべて遮断してください。" },
      { title: "バケットポリシーを適用", desc: "特定のLambda ARNだけを許可するバケットポリシーを適用してください。" },
      { title: "設定を確認", desc: "パブリックアクセス遮断が正しく設定されているか確認してください。" },
    ],
    explanation: "S3保護には2つの層があります。Block Public Access はアカウントやバケット全体を守る安全網で、バケットポリシーは Lambda ARN など特定のPrincipalだけを許可する細かな制御です。",
  },
  5: {
    title: "コンプライアンス向けデータ暗号化",
    scenario: "フィンテックのスタートアップが金融データをS3に保存しています。規制当局から、顧客データは顧客企業が管理するキーで暗号化しなければならないという要件が出ました。",
    steps: [
      { title: "KMS CMKを作成", desc: "金融データ暗号化用のCMKを作成してください。" },
      { title: "KMS Aliasを作成", desc: "キーIDの代わりに使う alias を作成してください。" },
      { title: "S3 SSE-KMSを設定", desc: "fintech-data-bucket の既定暗号化を SSE-KMS にしてください。" },
    ],
    explanation: "SSE-KMS では S3 が KMS API を呼び出して暗号化と復号を行います。顧客管理キーを使うと、キー ポリシーでアクセスを細かく制御し、CloudTrail で利用履歴を監査できます。",
  },
  6: {
    title: "ウェブサーバーの最小権限ネットワーク設定",
    scenario: "EC2 ウェブサーバーがハッキング攻撃を受けています。セキュリティグループが 0.0.0.0/0 で全開放されています。ウェブトラフィックのみを許可し、SSH は事務所 IP からのみアクセス可能にしてください。",
    steps: [
      { title: "現在のセキュリティグループ規則を確認", desc: "セキュリティグループの現在のインバウンド規則を確認してください。" },
      { title: "全開放規則を削除", desc: "0.0.0.0/0 の許可規則を即座に削除してください。" },
      { title: "HTTPS規則を追加", desc: "すべてのユーザーに対して HTTPS を許可し、SSH は事務所 IP のみに制限してください。" },
    ],
    explanation: "セキュリティグループはステートフルファイアウォールであり、許可規則のみが存在します。最小権限の原則に従って必要なポートのみを開き、管理用 SSH は常に特定の IP アドレスに制限してください。",
  },
  7: {
    title: "クロスアカウント展開パイプライン",
    scenario: "開発アカウント A の CI/CD パイプラインは、本番アカウント B の S3 バケットにビルド成果物をデプロイする必要があります。本番アカウントのアクセスキーを開発チームに提供することはできません。",
    steps: [
      { title: "クロスアカウントロールを作成", desc: "本番アカウントで開発アカウントを信頼するロールを作成してください。" },
      { title: "一時的な認証情報を発行", desc: "開発アカウントから STS assume-role を使用して一時認証情報を取得してください。" },
      { title: "本番環境の S3 にデプロイ", desc: "一時認証情報を使用して本番環境の S3 バケットにファイルをアップロードしてください。" },
    ],
    explanation: "STS AssumeRole は通常最大 12 時間の一時認証情報を発行します。クロスアカウントロールの信頼ポリシーには開発アカウント ID を明記する必要があります。これは永続的なアクセスキーの共有よりはるかに安全です。",
  },
  8: {
    title: "セキュリティインシデント - 誰が削除したのか?",
    scenario: "ある朝、本番用 DB スナップショットが削除されていました。誰もそれを削除したと主張していません。CTO は犯人を見つけるために完全な AWS API 呼び出し履歴を要求しました。",
    steps: [
      { title: "CloudTrail Trail を作成", desc: "すべてのリージョンからのAPI呼び出しをS3に記録するTrailを作成してください。" },
      { title: "Trail ログを開始", desc: "Trail のログ記録を有効にしてください。" },
      { title: "削除イベントをクエリ", desc: "DeleteDBSnapshot イベントをトリガーしたユーザーを検索してください。" },
    ],
    explanation: "CloudTrail は AWS アカウント内のすべての API 呼び出しを記録します。lookup-events コマンドを使用すると、イベント名またはユーザー名で迅速に検索でき、セキュリティインシデント調査に必須です。",
  },
  9: {
    title: "コードから DB パスワードを削除",
    scenario: "コード レビュー中に、RDS パスワードが GitHub コードに ハードコードされていることが判明しました。セキュリティチームが即座に修正を要求しました。パスワード取得をランタイムに移行してください。",
    steps: [
      { title: "Secrets Manager に認証情報を保存", desc: "DB 認証情報を Secrets Manager に保存してください。" },
      { title: "ランタイムでシークレットを読み取る", desc: "アプリケーションがランタイムで認証情報を取得することを確認してください。" },
      { title: "自動ローテーションを設定", desc: "パスワードを 90 日ごとにローテーションするよう設定してください。" },
    ],
    explanation: "Secrets Manager は認証情報を安全に保存し、アプリケーションがランタイムに SDK または CLI で取得できます。自動ローテーションはパスワードを定期的に更新し、漏えいの影響を軽減します。",
  },
  10: {
    title: "サブネットレベルでのトラフィック遮断",
    scenario: "セキュリティ監査により、セキュリティグループだけでは不十分であることが判明しました。サブネット層での追加的な防御が必要です。NACL で既知の悪意のある CIDR をブロックしてください。",
    steps: [
      { title: "カスタム NACL を作成", desc: "VPC 用の新しいカスタム NACL を作成してください。" },
      { title: "悪意のある IP ブロック規則を追加", desc: "192.168.100.0/24 範囲のインバウンド DENY 規則を追加してください。" },
      { title: "NACL をサブネットにアタッチ", desc: "新しい NACL をプライベートサブネットにアタッチしてください。" },
    ],
    explanation: "ネットワーク ACL はサブネット層のステートレスファイアウォールです。規則は順序で評価され、マッチした DENY 規則は即座にトラフィックをブロックします。セキュリティグループとの併用で多層防御を実現します。",
  },
  11: {
    title: "退職者アカウントの即時無効化",
    scenario: "マーケティングチームの従業員が突然退職しました。HR は AWS アクセスを直ちに取り消すことを緊急に要求しました。アカウントを完全にクリーンアップしてください。",
    steps: [
      { title: "アクセスキーリストを確認", desc: "lee-marketing ユーザーの現在のアクセスキーを確認してください。" },
      { title: "アクセスキーを無効化", desc: "lee-marketing のアクセスキーを Inactive に変更してください。" },
      { title: "コンソールログインを削除", desc: "lee-marketing のコンソールログインプロファイルを削除してください。" },
      { title: "グループから削除", desc: "lee-marketing を marketing-team グループから削除してください。" },
      { title: "ユーザーを削除", desc: "すべてのアクセスがブロックされた後、IAM ユーザーを削除してください。" },
    ],
    explanation: "退職者処理手順: キー確認 → 無効化 → コンソールログイン削除 → グループ削除 → ユーザー削除。直ちに削除せず、先に無効化することで監査ログの保存と誤りからの復旧を可能にします。",
  },
  12: {
    title: "IAM アカウントセキュリティの強化",
    scenario: "セキュリティ監査により、ルートアカウントに MFA がなく、パスワードポリシーが弱いという重大な脆弱性が見つかりました。認証情報レポートを確認し、パスワードポリシーを強化してください。",
    steps: [
      { title: "認証情報レポートを生成", desc: "IAM 認証情報レポートを生成してください。" },
      { title: "レポートを確認", desc: "生成された認証情報レポートを確認してください。" },
      { title: "仮想 MFA デバイスを作成", desc: "ルートアカウント用の仮想 MFA デバイスを作成してください。" },
      { title: "強力なパスワードポリシーを適用", desc: "最小 14 文字、大文字・小文字・数字・特殊文字必須、90 日有効期限のポリシーを設定してください。" },
    ],
    explanation: "IAM 認証情報レポート (CSV) はすべてのユーザーの MFA 有効化状態、パスワード最終使用日、アクセスキー状態を一度に確認できます。CIS Benchmark は最小 14 文字、90 日交換、MFA 必須を推奨しています。",
  },
  13: {
    title: "誤って削除されたファイルの復旧",
    scenario: "デプロイスクリプトのバグにより、本番 S3 バケットの設定ファイルが誤って削除されました。バージョン管理状態を確認してファイルを復旧し、MFA Delete を有効化してください。",
    steps: [
      { title: "バージョン管理状態を確認", desc: "config-bucket のバージョン管理状態を確認してください。" },
      { title: "削除されたファイルのバージョンをリスト化", desc: "app-config.json のすべてのバージョンと削除マーカーをリスト化してください。" },
      { title: "削除マーカーを削除して復旧", desc: "削除マーカーを削除してファイルを復旧してください。" },
      { title: "復旧を確認", desc: "ファイルが正常に復旧されたことを確認してください。" },
    ],
    explanation: "S3 バージョン管理での削除は実際には「削除マーカー」を追加します。マーカーの VersionId で delete-object を実行すると復旧できます。MFA Delete を有効化すると、削除マーカーの追加自体に MFA が必要となり、誤削除を防止します。",
  },
  14: {
    title: "GuardDuty による脅威検出とリアルタイムアラート",
    scenario: "疑わしいリージョンで EC2 インスタンスが突然作成されたという通知を後から受け取りました。GuardDuty を有効化し、脅威検出をリアルタイムで SNS 通知するよう設定してください。",
    steps: [
      { title: "GuardDuty を有効化", desc: "現在のリージョンで GuardDuty を有効化してください。" },
      { title: "アラート用 SNS トピックを作成", desc: "セキュリティ検出アラートを受信する SNS トピックを作成してください。" },
      { title: "検出結果リストを取得", desc: "GuardDuty によって検出された結果リストを取得してください。" },
      { title: "検出結果の詳細を確認", desc: "検出された結果の詳細情報を確認してください。" },
    ],
    explanation: "GuardDuty は CloudTrail、VPC Flow Logs、DNS クエリを機械学習で分析し、TOR アクセス、異常なリージョンアクティビティ、認証情報漏えいの兆候などを自動検出します。EventBridge + SNS でメール/Slack への即座の通知が可能です。",
  },
  15: {
    title: "Lambda 権限を最小権限に絞り込む",
    scenario: "S3 ファイルを読み込んで DynamoDB に保存する Lambda 関数の実行ロールが AdministratorAccess です。実際に必要な権限 (S3 読み込み + DynamoDB 書き込み) のみを許可するカスタムポリシーで置き換えてください。",
    steps: [
      { title: "Lambda 現在のロールを確認", desc: "data-processor Lambda の現在の実行ロールを確認してください。" },
      { title: "カスタム IAM ポリシーを作成", desc: "S3 読み込みと DynamoDB 書き込みのみを許可するカスタムポリシーを作成してください。" },
      { title: "最小権限ロールを作成", desc: "Lambda 専用の最小権限ロールを作成してください。" },
      { title: "カスタムポリシーをロールにアタッチ", desc: "新しいロールにカスタムポリシーをアタッチしてください。" },
      { title: "Lambda ロールを交換", desc: "data-processor Lambda のロールを最小権限ロールで置き換えてください。" },
    ],
    explanation: "Lambda に AdministratorAccess を使用することは厳禁です。カスタムポリシーには S3:GetObject、DynamoDB:PutItem など実際の使用 API のみを指定し、リソースも特定のバケット/テーブル ARN に限定してください。",
  },
  16: {
    title: "アクセスキーローテーション - 90 日超過キー",
    scenario: "セキュリティポリシーにより IAM アクセスキーは 90 日ごとにローテーションが必要です。dev-user のキーは作成後 120 日が経過しました。安全にキーをローテーションしてください。",
    steps: [
      { title: "現在のキーを確認", desc: "dev-user の現在のアクセスキーと作成日を確認してください。" },
      { title: "新しいアクセスキーを作成", desc: "dev-user の新しいアクセスキーを生成してください。" },
      { title: "既存キーを無効化", desc: "新しいキーへの交換が完了した後、既存キーを無効化してください。" },
      { title: "既存キーを削除", desc: "無効化を確認した後、既存キーを削除してください。" },
    ],
    explanation: "ローテーション手順: 新キー作成 → 新キーでテスト → 既存キー無効化 (Inactive) → 正常作動確認 (数日間) → 削除。直ちに削除すると誤りからの復旧ができなくなるため、Inactive で保持してから削除してください。",
  },
  17: {
    title: "ルートアカウントログインのリアルタイムアラート",
    scenario: "セキュリティチームは「ルートアカウントがいつログインするかをリアルタイムで知りたい」と言っています。CloudTrail → CloudWatch Logs → SNS アラートのチェーンを構成してください。",
    steps: [
      { title: "SNS トピックを作成", desc: "セキュリティアラートを送信する SNS トピックを作成してください。" },
      { title: "メールサブスクリプションを追加", desc: "security-alerts トピックにメールサブスクリプションを追加してください。" },
      { title: "CloudWatch メトリクスフィルターを作成", desc: "CloudTrail ログからルートログインイベントを検出するメトリクスフィルターを作成してください。" },
      { title: "CloudWatch アラームを作成", desc: "ルートログイン時に SNS 通知を送信するアラームを作成してください。" },
    ],
    explanation: "チェーンは CloudTrail → CloudWatch Logs → メトリクスフィルター → CloudWatch アラーム → SNS です。ルートログインの監視は CIS AWS Foundations Benchmark でも必須項目です。",
  },
  18: {
    title: "S3 バケットアクセスログを有効化",
    scenario: "プライバシー監査により、S3 バケットに誰がいつどのファイルにアクセスしたかの記録がないことが判明しました。ログバケットを作成し、サーバーアクセスログを有効化してください。",
    steps: [
      { title: "ログ保存用バケットを作成", desc: "アクセスログを保存する別個のバケットを作成してください。" },
      { title: "サーバーアクセスログを有効化", desc: "customer-data バケットのアクセスログをログバケットに保存するよう設定してください。" },
      { title: "ログ設定を確認", desc: "ログ設定が正しく適用されたことを確認してください。" },
      { title: "ログファイルの存在を確認", desc: "ログファイルが保存されていることを確認してください。" },
    ],
    explanation: "S3 サーバーアクセスログはバケットへのすべてのリクエストを記録します。ログバケットと元のバケットは同じリージョンにある必要があり、ログ配信には若干の遅延 (数分) があります。ログは Athena でクエリできます。",
  },
  19: {
    title: "環境変数の代わりに Parameter Store を使用",
    scenario: "Lambda 関数の環境変数に API キー、DB 接続文字列がプレーンテキストで保存されています。SSM Parameter Store に移行し、Lambda 環境変数から削除してください。",
    steps: [
      { title: "DB URL を SecureString として保存", desc: "DB 接続文字列を暗号化されたパラメータとして保存してください。" },
      { title: "API キーを SecureString として保存", desc: "API キーを暗号化されたパラメータとして保存してください。" },
      { title: "Lambda に Parameter Store 読み込み権限を付与", desc: "Lambda ロールに ssm:GetParameter 権限を追加してください。" },
      { title: "Lambda コードを修正しデプロイ", desc: "環境変数の代わりに Parameter Store から値を取得するようコードを修正してください。" },
    ],
    explanation: "Parameter Store の SecureString は KMS で暗号化されます。Lambda 実行時にエラーログやメモリダンプにプレーンテキストが露出することなく、変更時に Lambda を再デプロイする必要なくパラメータ値だけを更新できます。",
  },
  20: {
    title: "IMDSv2 の強制で SSRF を遮断",
    scenario: "本番 EC2 に SSRF (Server-Side Request Forgery) 脆弱性が発見されました。IMDSv1 は攻撃に脆弱なため、EC2 を IMDSv2 専用に変更してください。",
    steps: [
      { title: "IMDSv1 状態を確認", desc: "prod-instance のメタデータオプションを確認してください。" },
      { title: "IMDSv2 を強制", desc: "メタデータトークンを必須として要求するよう設定してください。" },
      { title: "トークン TTL を設定", desc: "メタデータトークン TTL を 1 時間に設定してください。" },
      { title: "設定変更を確認", desc: "IMDSv2 専用設定が適用されたことを確認してください。" },
    ],
    explanation: "IMDSv2 は PUT リクエストでまずトークンを取得し、そのトークンで GET リクエストを行う 2 段階方式です。SSRF 攻撃者もトークンをまず確保する必要があり、セキュリティが大幅に向上します。",
  },
  21: {
    title: "VPC Flow Logs によるトラフィック監査",
    scenario: "夜間に「特定の EC2 インスタンスから外部への大量のデータ流出」というアラートが届きました。VPC Flow Logs を有効化してネットワークトラフィックを記録してください。",
    steps: [
      { title: "VPC Flow Logs ロールを作成", desc: "CloudWatch Logs に書き込むための IAM ロールを作成してください。" },
      { title: "CloudWatch ログ グループを作成", desc: "VPC Flow Logs を保存する CloudWatch ロググループを作成してください。" },
      { title: "VPC Flow Logs を有効化", desc: "prod-vpc の VPC Flow Logs を有効化してください。" },
      { title: "ネットワークトラフィックをクエリ", desc: "疑わしいインスタンスの REJECT トラフィックを確認してください。" },
    ],
    explanation: "VPC Flow Logs は VPC、サブネット、ENI レベルで 5 タプル (送信元 IP、宛先 IP、ポート、プロトコル、Accept/Reject) を記録します。データ流出、ポートスキャン、DDoS 攻撃などのネットワーク異常を検出できます。",
  },
  22: {
    title: "すべての S3 アップロードに暗号化を強制",
    scenario: "S3 ポリシーで「暗号化なしでアップロードされたファイル」が見つかりました。デフォルトおよびポリシーレベルで暗号化を強制してください。",
    steps: [
      { title: "デフォルト暗号化を確認", desc: "secure-uploads バケットのデフォルト暗号化設定を確認してください。" },
      { title: "デフォルト暗号化を有効化", desc: "バケットのデフォルト暗号化を AES256 または KMS に設定してください。" },
      { title: "暗号化設定を確認", desc: "デフォルト暗号化が正しく設定されたことを確認してください。" },
      { title: "HTTPS 強制および暗号化ポリシーを適用", desc: "非暗号化アップロードと HTTP アクセスを拒否するバケットポリシーを適用してください。" },
    ],
    explanation: "デフォルト暗号化設定はヘッダーなしでのアップロードを自動暗号化しますが、明示的に「暗号化なし」をリクエストされたら防ぐことができません。バケットポリシーで aws:SecureTransport: false (HTTP) リクエストと暗号化条件なしのリクエストを Deny して完全に強制する必要があります。",
  },
  23: {
    title: "セキュリティグループの SSH 開放を自動検出",
    scenario: "開発者がデバッグ目的で SSH (22 番ポート) を 0.0.0.0/0 で開きました。AWS Config でこのようなミスを自動検出し、規則違反時の自動修復 (Auto Remediation) も設定してください。",
    steps: [
      { title: "AWS Config レコーダーを有効化", desc: "AWS Config でセキュリティグループの変更を記録し始めてください。" },
      { title: "デリバリーチャネルを設定", desc: "Config 結果を S3 に保存するデリバリーチャネルを設定してください。" },
      { title: "restricted-ssh Config 規則を追加", desc: "SSH 全開放を検出する管理型 Config 規則を追加してください。" },
      { title: "コンプライアンス状態を確認", desc: "restricted-ssh 規則のコンプライアンス状態を確認してください。" },
    ],
    explanation: "AWS Config はリソース構成の変更を継続的に記録し、管理型規則でコンプライアンスを自動評価します。restricted-ssh 規則は 0.0.0.0/0 ポート 22 開放時に NON_COMPLIANT を表示し、Systems Manager Automation で自動修復も可能です。",
  },
  24: {
    title: "IAM Access Analyzer - 外部公開リソースを検出",
    scenario: "「アカウント内で外部からアクセス可能なリソースをすべて見つけよ」と言われました。Access Analyzer で自動検出し、発見された脆弱性を処理してください。",
    steps: [
      { title: "Analyzer を作成", desc: "アカウント全体をスキャンする Analyzer を作成してください。" },
      { title: "外部アクセス可能リソースリストを取得", desc: "Analyzer が見つけた外部アクセス可能リソースをリスト化してください。" },
      { title: "脆弱性の詳細を確認", desc: "見つかった脆弱性の詳細情報を確認してください。" },
      { title: "脆弱性をアーカイブ処理", desc: "修復完了後、finding をアーカイブしてください。" },
    ],
    explanation: "IAM Access Analyzer は S3 バケットポリシー、IAM Role Trust Policy、KMS キーポリシーなどを分析し、外部アクセス可能なリソースを自動検出します。修復完了後、finding を ARCHIVED にすると、その finding は表示されなくなります。",
  },
  25: {
    title: "S3 バケット公開 ACL の一括点検",
    scenario: "「レガシーバケットの中に公開 ACL のものがあるかもしれない」という懸念が出ました。バケット ACL を点検し、問題バケットを修正した後、アカウントレベルで公開アクセスをブロックしてください。",
    steps: [
      { title: "アカウント全体のバケットリストを取得", desc: "現在のアカウント内のすべての S3 バケットをリスト化してください。" },
      { title: "問題バケットの ACL を確認", desc: "old-backup-2023 バケットの ACL を確認してください。" },
      { title: "バケット ACL を private に変更", desc: "old-backup-2023 バケットの ACL を private に変更してください。" },
      { title: "アカウントレベルで公開アクセスをブロック", desc: "アカウント全体に S3 公開アクセスブロックを適用してください。" },
    ],
    explanation: "アカウントレベルの S3 Block Public Access はすべてのバケットに一括適用されます。IgnorePublicAcls=true は既存の公開 ACL も無効化します。AWS は新規アカウントではデフォルト有効化を推奨しています。",
  },
  26: {
    title: "RDS 自動バックアップとスナップショット管理",
    scenario: "災害復旧訓練で「RDS 自動バックアップが無効になっており、最新のスナップショットもない」という致命的な問題が判明しました。直ちにバックアップポリシーを設定し、手動スナップショットを作成してください。",
    steps: [
      { title: "RDS インスタンスのバックアップ設定を確認", desc: "本番 DB の現在のバックアップ設定を確認してください。" },
      { title: "自動バックアップを 7 日保存で設定", desc: "自動バックアップを 7 日保存で有効化してください。" },
      { title: "バックアップウィンドウを設定", desc: "トラフィックが少ない午前 3 時にバックアップが実行されるよう設定してください。" },
      { title: "手動スナップショットを直ちに作成", desc: "設定変更前の現在の状態のスナップショットを直ちに作成してください。" },
    ],
    explanation: "RDS 自動バックアップ保存期間 0 はバックアップ無効化です。本番環境では最低 7 日以上の保存が必要です。バックアップウィンドウはトラフィックが少ない時間帯を選択し、メンテナンスウィンドウと重ならないよう注意してください。",
  },
  27: {
    title: "CloudFront + S3 OAI で直接アクセスをブロック",
    scenario: "静的ウェブサイトを S3 でホストし CloudFront で配布していますが、S3 URL での直接アクセスも可能です。CloudFront 経由でのアクセスのみ可能になるよう OAI を設定してください。",
    steps: [
      { title: "現在の S3 バケットポリシーを確認", desc: "static-web-content バケットの現在のポリシーを確認してください。" },
      { title: "OAI を作成", desc: "CloudFront 専用の Origin Access Identity を作成してください。" },
      { title: "OAI ベースのバケットポリシーを更新", desc: "OAI のみアクセス許可するバケットポリシーで置き換えてください。" },
      { title: "S3 公開アクセスを完全ブロック", desc: "S3 直接アクセスを完全にブロックしてください。" },
      { title: "設定を最終確認", desc: "バケットの公開アクセスブロックが適用されたことを確認してください。" },
    ],
    explanation: "OAI は CloudFront が S3 にアクセスする時に使用する特別な ID です。バケットポリシーでこの OAI のみを許可し、公開アクセスをブロックすると、S3 URL への直接アクセスが不可能になり、CloudFront URL でのみコンテンツを配信できます。",
  },
  28: {
    title: "Lambda ロール信頼ポリシーエラーを修正",
    scenario: "Lambda 関数が「AccessDenied: sts:AssumeRole」で失敗しています。信頼ポリシー (Trust Policy) の Principal が誤って設定されています。原因を特定し、修正してください。",
    steps: [
      { title: "Lambda 現在のロールを確認", desc: "lambda-processing 関数の現在の実行ロールを確認してください。" },
      { title: "ロール信頼ポリシーを確認", desc: "lambda-processing-role の信頼ポリシーを確認してください。" },
      { title: "信頼ポリシーを修正", desc: "Principal を lambda.amazonaws.com に修正してください。" },
      { title: "修正結果を確認", desc: "信頼ポリシーが正しく修正されたことを確認してください。" },
    ],
    explanation: "IAM ロールの信頼ポリシー (Trust Policy) は、このロールをAssumeできるユーザーまたはサービスを定義します。Lambda ロールは必ず lambda.amazonaws.com を信頼している必要があり、ec2.amazonaws.com に誤って設定されていると Lambda はロールを使用できません。",
  },
  29: {
    title: "請求アラートと予算設定",
    scenario: "先月の請求書が突然 $5,000 になりました。無許可の GPU インスタンス生成が原因でした。月 $500 超過時のアラートと AWS Budgets で予算超過を防止するよう設定してください。",
    steps: [
      { title: "アラート用 SNS トピックを作成", desc: "請求アラートを受信する SNS トピックを作成してください。" },
      { title: "メールサブスクリプションを追加", desc: "billing-alerts トピックにメールサブスクリプションを追加してください。" },
      { title: "請求 CloudWatch アラームを作成", desc: "月予想コスト $500 超過時に SNS アラーム通知を送信するアラームを作成してください。" },
      { title: "AWS Budgets 予算を作成", desc: "月 $500 予算を作成し、80% 使用時にアラーム通知が送られるよう設定してください。" },
    ],
    explanation: "CloudWatch 請求アラームは us-east-1 でのみ作成可能です。AWS Budgets はアラームより細かいコスト制御が可能で、サービス別・タグ別・リージョン別の予算を個別に設定できます。両者を併用することをお勧めします。",
  },
  30: {
    title: "Security Hub による全体セキュリティ診査",
    scenario: "新 CTO が「AWS セキュリティ現況を本日午後までに報告せよ」と言いました。Security Hub でアカウント全体のセキュリティスコアと脆弱性を把握し、主要脆弱性の対応状況を更新してください。",
    steps: [
      { title: "Security Hub を有効化", desc: "CIS Benchmark 標準を含めて Security Hub を有効化してください。" },
      { title: "Critical 脆弱性をクエリ", desc: "重大度 Critical 以上のセキュリティ結果をリスト化してください。" },
      { title: "インサイト要約をクエリ", desc: "Security Hub インサイトから脆弱なリソースを確認してください。" },
      { title: "脆弱性対応状況を更新", desc: "対応完了した脆弱性のワークフロー状態を RESOLVED に更新してください。" },
    ],
    explanation: "AWS Security Hub は GuardDuty、Inspector、Macie など複数のセキュリティサービスの結果を統合します。CIS AWS Foundations Benchmark と FSBP を自動チェックし、セキュリティスコアを定期的に確認し、RESOLVED で更新して追跡管理することが重要です。",
  },
};
