type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const COST_CHALLENGES_I18N: Record<number, ChalI18n> = {

  1: {
    title: "AWS Budgets アラート設定",
    scenario: "月末にAWSの請求書を受け取って初めてコスト超過に気づいています。AWS Budgetsで月$500の予算を設定し、80%到達時にメールアラートを受け取りましょう。",
    steps: [
      { title: "今月のコストを確認", desc: "Cost Explorerで今月これまでに発生したコストを確認してください。" },
      { title: "月次予算を作成", desc: "月$500のコスト予算を作成してください。" },
      { title: "80%アラートを設定", desc: "予算の80%（$400）到達時にメールアラートを追加してください。" },
      { title: "予算を確認", desc: "作成した予算と現在の使用量を確認してください。" },
    ],
    explanation: "AWS Budgetsではコスト・使用量・リザーブドインスタンス・Savings Plansの予算を設定できます。実際のコストだけでなく予測コストを基準にアラートを設定することもできます。SNSトピックに連携するとSlackなどさまざまなチャンネルへ通知を送ることができます。",
  },
  2: {
    title: "EC2 Savings Plans 購入",
    scenario: "運用中のEC2インスタンスが常時稼働しているのにOn-Demand料金を支払っています。1年間のCompute Savings Plansを購入して最大66%コストを削減しましょう。",
    steps: [
      { title: "Savings Plans推奨を確認", desc: "Cost ExplorerでSavings Plans購入の推奨を確認してください。" },
      { title: "現在のOn-Demand使用量を確認", desc: "EC2のOn-Demandコストをサービス別に照会してください。" },
      { title: "Savings Plansを購入", desc: "時間あたり$0.50のCompute Savings Plansを購入してください。" },
      { title: "Savings Plans適用状況を確認", desc: "購入したSavings Plansの利用率を確認してください。" },
    ],
    explanation: "Compute Savings PlansはEC2・Lambda・Fargateに適用される最も柔軟なプランです。1年No Upfront基準で最大66%削減できます。利用率が低いと購入金額が無駄になるため、推奨金額の80〜90%から始めて徐々に増やす戦略が有効です。",
  },
  3: {
    title: "EC2 Spotインスタンス活用",
    scenario: "バッチ分析ワークロードが1日2時間実行されます。On-Demand c5.2xlargeの代わりにSpotインスタンスに切り替えると最大90%削減できます。Spot Fleetで中断があっても安全にバッチを実行しましょう。",
    steps: [
      { title: "現在のSpot価格を確認", desc: "c5.2xlargeの現在のSpot価格を確認してください。" },
      { title: "Spot Fleetリクエストを作成", desc: "目標容量4 vCPUでSpot Fleetをリクエストしてください。" },
      { title: "Spot Fleetの状態を確認", desc: "Spot Fleetがインスタンスを確保できたか確認してください。" },
      { title: "Spot中断アラートを設定", desc: "Spotインスタンス中断2分前の通知用EventBridgeルールを作成してください。" },
    ],
    explanation: "SpotインスタンスはOn-Demand比で最大90%安くなります。中断（2分前に通知）に備えてジョブのチェックポイントを保存するか、SQSでタスクを分散させましょう。Spot Fleetで複数のインスタンスタイプとAZを組み合わせることで中断の可能性を下げられます。",
  },
  4: {
    title: "S3 Lifecycleポリシーでストレージコストを削減",
    scenario: "S3バケットにログファイルが積み重なって数百GBになっています。30日以降のファイルはほとんど参照しないのにStandard料金を支払っています。Lifecycleポリシーで自動的に安価なストレージクラスへ移行させましょう。",
    steps: [
      { title: "バケットのストレージ使用量を確認", desc: "バケットの合計サイズとオブジェクト数を確認してください。" },
      { title: "Lifecycleルールを追加", desc: "30日後にS3-IA、90日後にGlacierへ移行するルールを設定してください。" },
      { title: "Lifecycleルールを確認", desc: "設定されたLifecycleルールを確認してください。" },
      { title: "S3ストレージクラス分析を有効化", desc: "アクセスパターン分析のためにStorage Class Analysisをオンにしてください。" },
    ],
    explanation: "S3 Lifecycleポリシーはオブジェクトを自動的により安価なストレージクラスへ移動または削除します。Standard → Standard-IA: 58%削減、Standard-IA → Glacier: 80%削減。ただし、Standard-IAは128KBの最小サイズと30日の最低保管料金があるため、小さなファイルが多い場合は逆にコストが増える可能性があります。",
  },
  5: {
    title: "EBS未使用ボリュームのクリーンアップ",
    scenario: "インスタンスを終了した後もEBSボリュームが残ってコストが発生しています。アタッチされていない（available）EBSボリュームを見つけてスナップショットを撮影後、削除しましょう。",
    steps: [
      { title: "未アタッチのEBSボリューム一覧を確認", desc: "available状態のEBSボリューム一覧を確認してください。" },
      { title: "EBSスナップショットを作成", desc: "削除前にボリュームのスナップショットを作成してください。" },
      { title: "スナップショット完了を待機", desc: "スナップショットがcompleted状態になったか確認してください。" },
      { title: "EBSボリュームを削除", desc: "スナップショット完了後、未使用ボリュームを削除してください。" },
    ],
    explanation: "EBSボリュームはインスタンスにアタッチされていなくてもプロビジョニングされたサイズに応じて課金されます。定期的にavailable状態のボリュームを監査してください。AWS Trusted AdvisorとCost Explorerのリソース最適化推奨も未使用リソースを見つけるのに役立ちます。",
  },
  6: {
    title: "未使用 Elastic IPの解放",
    scenario: "EC2インスタンスを削除したのにElastic IPがアタッチされていないまま残っています。アタッチされていないEIPは時間単位で課金されます。未使用のEIPを見つけて解放しましょう。",
    steps: [
      { title: "未アタッチのElastic IPを確認", desc: "InstanceIdがないElastic IPを探してください。" },
      { title: "EIPの使用状況を再確認", desc: "Route53などの他のサービスで参照されていないか確認後、解放してください。" },
      { title: "EIPを解放", desc: "Elastic IPを解放（release）してください。" },
      { title: "残りのEIPを確認", desc: "解放後に残っているEIPの一覧を確認してください。" },
    ],
    explanation: "アタッチされていないElastic IPは時間あたり$0.005が課金されます（月約$3.60）。少額に見えますが、数十個が積み重なると無視できないコストになります。インスタンス終了時に自動でEIPも解放されるようIaCコード（Terraformなど）を更新することをお勧めします。",
  },
  7: {
    title: "CloudWatch Logsの保存期間設定",
    scenario: "CloudWatch Logsグループがデフォルトで無期限保存になっており、ストレージコストが増え続けています。適切な保存期間を設定してコストを削減しましょう。",
    steps: [
      { title: "ロググループ一覧と保存期間を確認", desc: "保存期間が設定されていないロググループを探してください。" },
      { title: "Lambdaログの保存期間を30日に設定", desc: "/aws/lambda/api-handlerロググループの保存期間を30日に設定してください。" },
      { title: "RDSログの保存期間を14日に設定", desc: "/aws/rds/cluster/prod-auroraロググループの保存期間を14日に設定してください。" },
      { title: "設定を確認", desc: "保存期間が正しく設定されているか確認してください。" },
    ],
    explanation: "CloudWatch Logsはストレージ容量に応じてGB当たり$0.03/月が課金されます。保存期間を設定すると期間を超えたログが自動削除されます。長期保管が必要なログはS3にエクスポートし、CloudWatchでは短く保持しましょう。コンプライアンス要件に応じて保存期間を決定してください。",
  },
  8: {
    title: "NAT Gatewayコストの最適化",
    scenario: "複数のAZにそれぞれNAT Gatewayがあるためコストが高くなっています。さらにS3へのトラフィックもNAT Gatewayを経由しています。VPC Endpointを追加してS3トラフィックのコストをなくしましょう。",
    steps: [
      { title: "NAT Gatewayのコストを確認", desc: "現在のNAT Gatewayコストをサービス別に照会してください。" },
      { title: "S3 Gateway VPC Endpointを作成", desc: "S3トラフィックがNAT Gatewayを経由しないようにGateway Endpointを作成してください。" },
      { title: "DynamoDB VPC Endpointを追加", desc: "DynamoDBもVPC Endpointで接続してください。" },
      { title: "VPC Endpointの一覧を確認", desc: "作成されたVPC Endpointを確認してください。" },
    ],
    explanation: "S3/DynamoDB Gateway Endpointは無料です。プライベートサブネットからS3へのトラフィックがNAT Gatewayを迂回するため、データ処理コスト（$0.045/GB）が削減されます。大容量S3操作が多い環境では月数百ドルの削減も可能です。",
  },
  9: {
    title: "RDS リザーブドインスタンス購入",
    scenario: "運用中のRDS db.r5.largeインスタンスが24/7稼働しています。1年のリザーブドインスタンスに切り替えるとOn-Demand比で最大42%削減できます。",
    steps: [
      { title: "現在のRDSインスタンスを確認", desc: "稼働中のRDSインスタンス一覧を確認してください。" },
      { title: "RDSリザーブドインスタンスのオファリングを確認", desc: "db.r5.large MySQL 1年 No Upfrontのリザーブド価格を確認してください。" },
      { title: "RDSリザーブドインスタンスを購入", desc: "db.r5.large MySQLのリザーブドインスタンスを購入してください。" },
      { title: "リザーブドインスタンスの適用を確認", desc: "購入したリザーブドインスタンスの状態を確認してください。" },
    ],
    explanation: "RDS Reserved Instanceは1年 No Upfront基準で約42%、All Upfront基準で約43%削減できます。リザーブドインスタンスは同じエンジン・クラス・リージョンのOn-Demandインスタンスに自動的に適用されます。Multi-AZのリザーブドインスタンスはMulti-AZインスタンスにのみ適用されます。",
  },
  10: {
    title: "Lambda ARM（Graviton2）移行",
    scenario: "Lambda関数がx86_64アーキテクチャで実行されています。arm64（Graviton2）に切り替えると同等のパフォーマンスで20%安くなります。アーキテクチャを変更してコスト削減を確認しましょう。",
    steps: [
      { title: "現在のLambdaアーキテクチャを確認", desc: "関数のアーキテクチャとランタイムを確認してください。" },
      { title: "ARM64にアーキテクチャを変更", desc: "関数をarm64に更新してください。" },
      { title: "関数のテスト実行", desc: "ARM64に変更後、関数が正常に動作するかテストしてください。" },
      { title: "コスト比較を確認", desc: "LambdaコストメトリクスをCloudWatchで確認してください。" },
    ],
    explanation: "Lambda ARM64（Graviton2）はx86_64比で20%安く、パフォーマンスも同等またはそれ以上です。Python・Node.js・Java・Goなどほとんどのランタイムがサポートされています。ただし、C拡張ライブラリがある場合は再コンパイルが必要です。Fargate ARM64も同様に20%安くなります。",
  },
  11: {
    title: "EC2 ライトサイジング（Right Sizing）",
    scenario: "EC2インスタンスのCPU使用率が平均5%未満です。AWS Compute Optimizerの推奨を確認し、過剰にプロビジョニングされたインスタンスを適切なサイズに縮小しましょう。",
    steps: [
      { title: "Compute Optimizerの推奨を確認", desc: "EC2インスタンスに対する最適化推奨を照会してください。" },
      { title: "CPU使用率を確認", desc: "過去30日間の平均CPU使用率を確認してください。" },
      { title: "インスタンスを停止してタイプを変更", desc: "インスタンスを停止し、t3.mediumからt3.smallに変更してください。" },
      { title: "インスタンスを再起動して確認", desc: "インスタンスを起動し、変更されたタイプを確認してください。" },
    ],
    explanation: "AWS Compute OptimizerはCloudWatchメトリクスを分析して最適なインスタンスタイプを推奨します。CPU使用率5%未満は明らかな過剰プロビジョニングです。ただし、ピーク時のトラフィックも考慮して最低でもP95使用率を基準に判断しましょう。",
  },
  12: {
    title: "S3 Intelligent-Tieringの設定",
    scenario: "アクセスパターンが不規則なS3バケットがあります。よく使うときはStandardが必要ですが、数か月間アクセスのないファイルもあります。Intelligent-Tieringで自動的に最適なストレージクラスを選択させましょう。",
    steps: [
      { title: "バケットのストレージクラス分布を確認", desc: "バケット内のストレージクラス別オブジェクト数を確認してください。" },
      { title: "Intelligent-Tiering移行のLifecycleルールを追加", desc: "全オブジェクトをIntelligent-Tieringへ移行するルールを設定してください。" },
      { title: "Intelligent-Tiering Archiveを設定", desc: "90日間未アクセスでArchiveティア、180日でDeep Archiveティアへ移動するよう設定してください。" },
      { title: "Intelligent-Tiering設定を確認", desc: "Intelligent-Tieringの構成を確認してください。" },
    ],
    explanation: "Intelligent-Tieringはアクセスパターンに応じて自動的にFrequent/Infrequent/Archiveティアを移動します。管理コスト（オブジェクトあたり$0.0025/1000）があるため、128KB以下の小さなファイルが多い場合は逆に高くなることがあります。アクセスパターンの予測が難しい大容量オブジェクトに適しています。",
  },
  13: {
    title: "AWS Cost Anomaly Detection",
    scenario: "突然AWSコストが平常時の3倍に跳ね上がったのに原因を後になって知りました。Cost Anomaly Detectionを設定して異常なコスト急増を即座に検知しましょう。",
    steps: [
      { title: "コストモニターを作成", desc: "EC2サービスのコストを監視するCost Monitorを作成してください。" },
      { title: "アラートサブスクリプションを作成", desc: "コストが$50以上急増した際にメールアラートを設定してください。" },
      { title: "異常検知の履歴を確認", desc: "検知されたコスト異常の一覧を確認してください。" },
      { title: "モニター一覧を確認", desc: "作成されたコストモニターの一覧を確認してください。" },
    ],
    explanation: "Cost Anomaly Detectionは機械学習でコストパターンを学習し、異常な支出を検知します。サービス全体・連携アカウント・コスト配分タグ・コストカテゴリを基準にモニターを作成できます。既存のアラートより誤検知が少なく、根本原因（サービス/リージョン/使用タイプ）も提供されます。",
  },
  14: {
    title: "コスト配分タグの有効化",
    scenario: "開発チーム・運用チーム・データチームのコストを分けて見たいのですが、現在は全体のコストしか見えません。Cost Allocation Tagsでチーム別コストを分離し、Cost Explorerでチーム別レポートを作成しましょう。",
    steps: [
      { title: "ユーザー定義タグを有効化", desc: "teamタグをコスト配分タグとして有効化してください。" },
      { title: "EC2インスタンスにチームタグを追加", desc: "運用チームのインスタンスにteam=opsタグを追加してください。" },
      { title: "S3バケットにチームタグを追加", desc: "データチームのバケットにteam=dataタグを追加してください。" },
      { title: "チーム別コストを確認", desc: "teamタグでグループ化してチーム別コストを確認してください。" },
    ],
    explanation: "コスト配分タグは有効化後、最大24時間経過しないとCost Explorerに反映されません。AWSが作成したタグとユーザー定義タグのどちらも使用できます。AWS OrganizationsでタグポリシーをEnforceすると、タグ漏れによるコスト未分類を防ぐことができます。",
  },
  15: {
    title: "ECRイメージのクリーンアップ",
    scenario: "ECRリポジトリに何百もの古いDockerイメージが溜まってストレージコストが増加しています。最新5件のイメージだけ残して残りを自動削除するLifecycleポリシーを設定しましょう。",
    steps: [
      { title: "現在のECRイメージ数を確認", desc: "リポジトリのイメージ数と合計サイズを確認してください。" },
      { title: "ECR Lifecycleポリシーを設定", desc: "タグなしイメージと古いイメージを自動削除するポリシーを設定してください。" },
      { title: "Lifecycleポリシーのプレビュー", desc: "ポリシー適用時に削除されるイメージを事前に確認してください。" },
      { title: "ECRストレージコストを確認", desc: "ECRのストレージ使用量メトリクスを確認してください。" },
    ],
    explanation: "ECRストレージはGB当たり$0.10/月が課金されます。Lifecycleポリシーで古いイメージを自動クリーンアップすると、CI/CDパイプラインでイメージが毎日積み重なってもコストをコントロールできます。タグなしイメージは常に即座に削除するのがベストプラクティスです。",
  },
  16: {
    title: "Auto Scalingスケジュールによる削減",
    scenario: "開発・ステージング環境のEC2 Auto Scalingグループが24時間稼働しています。業務時間（月〜金 9〜18時）のみインスタンスを維持し、それ以外の時間は0に削減してコストを60%削減しましょう。",
    steps: [
      { title: "現在のASG設定を確認", desc: "開発環境のAuto Scalingグループの現在の設定を確認してください。" },
      { title: "業務開始スケジュールを追加", desc: "月〜金の午前9時（UTC 0時）にインスタンス2台に増やすスケジュールを追加してください。" },
      { title: "業務終了スケジュールを追加", desc: "月〜金の午後9時（UTC 12時）にインスタンス0台に減らすスケジュールを追加してください。" },
      { title: "スケジュール一覧を確認", desc: "登録されたスケジュールアクションを確認してください。" },
    ],
    explanation: "開発・ステージング環境は業務時間外にインスタンスが不要です。スケジュールスケーリングで週末を含めると約76%の時間はコストを削減できます。AWS Instance Schedulerソリューションを使うとより複雑なスケジュールも管理できます。",
  },
  17: {
    title: "S3バケットのパブリックアクセスコスト分析",
    scenario: "S3から外部へのデータ転送コストが毎月数百ドル発生しています。どのバケットからどれだけデータが出ているか分析し、CloudFrontに切り替えて転送コストを削減しましょう。",
    steps: [
      { title: "S3データ転送コストを確認", desc: "Cost ExplorerでS3のデータ転送コストを照会してください。" },
      { title: "S3バケットのリクエストメトリクスを有効化", desc: "最もリクエストが多いバケットのメトリクスを有効化してください。" },
      { title: "CloudFrontのオリジンをS3に設定", desc: "S3バケットの前にCloudFrontをデプロイして転送コストを下げてください。" },
      { title: "S3バケットへの直接アクセスを遮断", desc: "CloudFront経由以外でのS3への直接アクセスを遮断してください。" },
    ],
    explanation: "S3からインターネットへのデータ転送はGB当たり$0.09が課金されます。CloudFrontを経由するとオリジン（S3）からCloudFrontへの転送は無料で、CloudFrontエッジからユーザーへの転送はS3より安くなります（$0.0085/GB）。キャッシュヒット率が高いほど削減効果が大きくなります。",
  },
  18: {
    title: "DynamoDBコストの最適化",
    scenario: "DynamoDBテーブルでスキャンクエリが多くRCUコストが高くなっています。Provisionedモードに切り替えてAuto Scalingを設定し、予測可能なコストにしましょう。",
    steps: [
      { title: "DynamoDBの消費コストを確認", desc: "DynamoDBのRCU/WCU消費量を確認してください。" },
      { title: "Provisionedモードに切り替え", desc: "テーブルをPROVISIONEDモードに切り替えてください。" },
      { title: "Auto Scalingポリシーを登録（読み取り）", desc: "DynamoDBの読み取りキャパシティのAuto Scalingを設定してください。" },
      { title: "Target Trackingポリシーを設定", desc: "目標使用率70%でAuto Scalingポリシーを設定してください。" },
    ],
    explanation: "トラフィックパターンが予測可能であればProvisioned + Auto ScalingがOn-Demandより安くなります。Auto Scalingは消費キャパシティが設定キャパシティの70%を超えるとScale Out、下回るとScale Inします。スキャンの代わりにクエリとGSIを使って消費RCUを削減することも重要です。",
  },
  19: {
    title: "Trusted Advisorのコスト削減推奨を確認",
    scenario: "AWS環境全体で無駄になっているリソースがないかTrusted Advisorでチェックしましょう。未使用のロードバランサー・アイドルRDS・低使用率EC2を見つけてクリーンアップしてください。",
    steps: [
      { title: "Trusted Advisorのコスト最適化チェックを確認", desc: "コスト最適化カテゴリのチェック一覧を確認してください。" },
      { title: "アイドルのロードバランサーを確認", desc: "Idle Load Balancersのチェック結果を確認してください。" },
      { title: "アイドルのロードバランサーを削除", desc: "アイドル状態のロードバランサーを削除してください。" },
      { title: "Trusted Advisor結果を更新", desc: "チェック結果を更新してください。" },
    ],
    explanation: "Trusted Advisorはコスト最適化・パフォーマンス・セキュリティ・耐障害性など5つのカテゴリで200以上のチェックを提供します。Business/Enterprise Supportプランで全チェックを利用できます。月1回の定期点検で無駄なリソースを継続的に排除しましょう。",
  },
  20: {
    title: "RDSスナップショットの古いものをクリーンアップ",
    scenario: "RDSの手動スナップショットが数十件積み重なってストレージコストが発生しています。90日以上経過したスナップショットをクリーンアップし、自動スナップショットの保存期間を調整しましょう。",
    steps: [
      { title: "古いスナップショットの一覧を確認", desc: "90日以上経過したRDSスナップショットを照会してください。" },
      { title: "古いスナップショットを削除", desc: "90日以上経過したスナップショットを削除してください。" },
      { title: "自動スナップショットの保存期間を短縮", desc: "自動バックアップの保存期間を35日から7日に短縮してください。" },
      { title: "スナップショットの合計サイズを確認", desc: "現在残っているスナップショットの合計ストレージを確認してください。" },
    ],
    explanation: "RDSの自動スナップショットは最大35日保存でき、無料ストレージ（DBサイズの100%）を超えると課金されます。手動スナップショットは削除するまで保存され続けます。コンプライアンス要件がなければ7日保存で十分です。",
  },
  21: {
    title: "CloudFrontコストの最適化（Price Class）",
    scenario: "CloudFrontディストリビューションで全エッジロケーションが有効になっていますが、ユーザーは米国・ヨーロッパにしかいません。Price Class 100に制限してコストを削減しましょう。",
    steps: [
      { title: "現在のCloudFrontディストリビューション設定を確認", desc: "ディストリビューションの現在のPrice Classを確認してください。" },
      { title: "Price Class 100に変更", desc: "米国・ヨーロッパのエッジのみ使用するPrice Class 100に変更してください。" },
      { title: "地域別トラフィックを確認", desc: "CloudWatchで地域別リクエスト数を確認してください。" },
      { title: "ディストリビューション完了を確認", desc: "Price Class変更が全エッジに適用されたか確認してください。" },
    ],
    explanation: "CloudFront Price Classはどのエッジロケーションを使用するかを決定します。PriceClass_All（全リージョン）・PriceClass_200（北米+ヨーロッパ+アジア一部）・PriceClass_100（北米+ヨーロッパ）に分かれます。ユーザーが特定の地域に集中している場合、不要なエッジコストを削減できます。",
  },
  22: {
    title: "Lambda同時実行制限によるコスト制御",
    scenario: "開発環境のLambda関数がバグで無限ループに陥り数千回呼び出されました。関数ごとの同時実行制限でコスト急増を防ぎましょう。",
    steps: [
      { title: "現在のLambda同時実行状況を確認", desc: "アカウント全体の同時実行制限と使用量を確認してください。" },
      { title: "開発環境の関数に同時実行制限を設定", desc: "開発環境のLambdaに同時実行10件の制限を設定してください。" },
      { title: "同時実行スロットルのアラートを設定", desc: "Lambda Throttlesが発生したらアラートが鳴るよう設定してください。" },
      { title: "Lambdaコストを確認", desc: "今月のLambdaコストを確認してください。" },
    ],
    explanation: "Reserved Concurrencyを設定すると関数がその数以上同時実行されなくなります。バグによる暴走や予算超過を防ぎます。ただし、本番環境の関数に低すぎる値を設定すると正常なトラフィックもスロットリングされる可能性があります。",
  },
  23: {
    title: "S3 Glacierへの長期アーカイブ",
    scenario: "監査ログを7年間保管しなければならない規制があります。現在S3 Standardに保存している古いログをS3 Glacier Deep Archiveに移行してコストを97%削減しましょう。",
    steps: [
      { title: "古いログオブジェクトのサイズを確認", desc: "2023年以前のログファイルの合計サイズを確認してください。" },
      { title: "Glacier Deep Archive移行ルールを設定", desc: "作成後365日が経過したらGlacier Deep Archiveへ移行するルールを設定してください。" },
      { title: "既存オブジェクトを即座にGlacierへ移行", desc: "既存の2022年ログを即座にGlacier Deep Archiveにコピーしてください。" },
      { title: "ストレージクラスの変更を確認", desc: "変更されたストレージクラスを確認してください。" },
    ],
    explanation: "S3 Glacier Deep ArchiveはGB当たり$0.00099/月でStandard（$0.023）比97%安くなります。ただし、復元時は標準で12時間、大容量復元で48時間かかります。7年のコンプライアンスログのようにほとんど取り出すことのないデータに最適です。",
  },
  24: {
    title: "Fargate Spotでバッチ処理コストを削減",
    scenario: "毎日深夜に実行するデータ処理ECSタスクがOn-Demand Fargateを使用しています。中断が許容できるバッチ処理にFargate Spotを使用して最大70%削減しましょう。",
    steps: [
      { title: "現在のECSサービスの起動タイプを確認", desc: "バッチ処理タスクの現在の設定を確認してください。" },
      { title: "Fargate Spot容量プロバイダーを作成", desc: "FARGATE_SPOT容量プロバイダーをクラスターに追加してください。" },
      { title: "Spot使用のサービスに更新", desc: "バッチサービスをFargate Spotで実行するよう更新してください。" },
      { title: "Fargateコストを確認", desc: "FargateコストがCost Explorerで減少しているか確認してください。" },
    ],
    explanation: "Fargate SpotはAWSの余剰Fargateキャパシティを使用し、On-Demand比で最大70%安くなります。中断2分前に通知が来るので、バッチ処理はチェックポイントを保存するかリトライロジックを実装してください。24/7サービスにはSpot Fallback戦略としてFARGATE_SPOT失敗時にFARGATEへフォールバックするよう設定しましょう。",
  },
  25: {
    title: "未使用ロードバランサーのクリーンアップ",
    scenario: "テスト後に削除し忘れたALBがトラフィックなしで時間単位で課金されています。接続されたターゲットがないかリクエストがないロードバランサーを見つけてクリーンアップしましょう。",
    steps: [
      { title: "全ロードバランサーの一覧を確認", desc: "現在作成されているロードバランサーの一覧を確認してください。" },
      { title: "アイドルLBのリクエスト数を確認", desc: "test-albの最近のリクエスト数を確認してください。" },
      { title: "ロードバランサーのリスナーを確認", desc: "test-albのリスナーとターゲットグループを確認してください。" },
      { title: "アイドルのロードバランサーを削除", desc: "アイドル状態のtest-albを削除してください。" },
    ],
    explanation: "ALBは時間当たり$0.008 + LCU（Load Balancer Capacity Unit）課金があります。ターゲットがなかったりリクエストがなくても基本の時間料金が課金されます。月約$6〜$16が無駄になります。タグとコスト配分で各LBのオーナーを明確にし、定期的に監査しましょう。",
  },
  26: {
    title: "データ転送コストの分析と最適化",
    scenario: "AZ間のデータ転送による隠れたコストが大きく発生しています。同じAZ内の通信に切り替えるかVPC Peeringを最適化して転送コストを削減しましょう。",
    steps: [
      { title: "AZ間データ転送コストを確認", desc: "DataTransfer-Regionalコストを照会してください。" },
      { title: "インスタンスのAZ分布を確認", desc: "現在のインスタンスのAZ分布を確認してください。" },
      { title: "VPC Flow Logsを有効化", desc: "AZ間トラフィックパターン分析のためにVPC Flow Logsを有効化してください。" },
      { title: "Flow Logs分析のAthenaクエリを実行", desc: "S3に保存されたFlow LogsをAthenaで分析してください。" },
    ],
    explanation: "AZ間のデータ転送は$0.01/GB、リージョン間転送は$0.02/GBが課金されます。Web・App・DBレイヤーを同じAZに配置すると転送コストがゼロになります。VPC Flow Logs + Athenaでどのサーバーペアが最もAZ間トラフィックを発生させているかを把握しましょう。",
  },
  27: {
    title: "AWS Organizations一括請求",
    scenario: "開発・ステージング・本番アカウントが別々に存在していて割引恩恵を受けられていません。AWS Organizationsの一括請求で全体の使用量を合算してボリューム割引を受けましょう。",
    steps: [
      { title: "Organizationsの現在の構成を確認", desc: "現在の組織構造を確認してください。" },
      { title: "アカウント一覧を確認", desc: "組織内の全アカウントを確認してください。" },
      { title: "統合コストを確認", desc: "全アカウントを合算した今月の合計コストを確認してください。" },
      { title: "SCPでコスト管理ポリシーを適用", desc: "開発アカウントで高コストなインスタンスタイプの作成を禁止するSCPを適用してください。" },
    ],
    explanation: "AWS Organizationsの一括請求は全アカウントのS3・EC2などのサービス使用量を合算してボリューム割引を適用します。RI/Savings Plansも組織内アカウントに自動共有されます。SCPで開発アカウントでのコストの高いリソース作成をブロックすることもできます。",
  },
  28: {
    title: "EC2コストタグベースの自動化",
    scenario: "タグなしで作成されたEC2インスタンスのためにコスト追跡ができません。AWS Configルールでタグのないインスタンスを検知して自動通知を送りましょう。",
    steps: [
      { title: "AWS Configの有効化を確認", desc: "AWS Configレコーダーの状態を確認してください。" },
      { title: "必須タグのConfigルールを作成", desc: "NameとteamタグがないEC2を検知するルールを作成してください。" },
      { title: "非準拠リソースを確認", desc: "required-tagsルールに違反しているEC2インスタンスを照会してください。" },
      { title: "自動タグ追加のSSMを実行", desc: "非準拠インスタンスにデフォルトタグを自動的に追加してください。" },
    ],
    explanation: "AWS Config REQUIRED_TAGSルールは指定したタグがないリソースをNON_COMPLIANTとしてマークします。Config Rules + Lambda Auto Remediationでタグ漏れ時に自動でオーナーにメールを送ったり、一定期間後に自動停止させることができます。",
  },
  29: {
    title: "CloudWatchメトリクスコストの最適化",
    scenario: "CloudWatchカスタムメトリクスとAPI呼び出しコストが予想より高くなっています。不要な高解像度メトリクスを標準解像度に下げ、保存期間を調整してコストを削減しましょう。",
    steps: [
      { title: "CloudWatchコストを確認", desc: "CloudWatch関連のコストを分析してください。" },
      { title: "カスタムメトリクス一覧を確認", desc: "現在登録されているカスタムメトリクス数を確認してください。" },
      { title: "不要なアラーム一覧を確認", desc: "INSUFFICIENT_DATA状態のアラームを確認してください。" },
      { title: "古いアラームを削除", desc: "90日以上INSUFFICIENT_DATAのアラームを削除してください。" },
    ],
    explanation: "CloudWatchの高解像度メトリクス（1秒）は標準（1分）より高コストです。不要な高解像度メトリクスは標準に下げましょう。INSUFFICIENT_DATAアラームは紐付いたリソースが削除されたことを意味します。未使用のダッシュボードやLog Insightsクエリなどもコストを発生させます。",
  },
  30: {
    title: "月次コストレポートの自動化",
    scenario: "毎月AWSコストレポートを手動で作成しています。Cost and Usage Report（CUR）をS3に自動保存し、Athenaでクエリしてチーム別・サービス別の月次コスト分析を自動化しましょう。",
    steps: [
      { title: "Cost and Usage Reportを作成", desc: "S3に自動保存されるCURレポートを設定してください。" },
      { title: "CURレポートを確認", desc: "作成されたCURレポートの定義を確認してください。" },
      { title: "Athenaテーブルを作成", desc: "CURデータ分析用のAthenaテーブルを作成してください。" },
      { title: "チーム別コストクエリを実行", desc: "Athenaでチーム別の月次コストを集計してください。" },
    ],
    explanation: "Cost and Usage Report（CUR）は最も詳細なAWSコストデータです。Parquet形式で保存するとAthenaのクエリコストも削減されます。Lambda + EventBridgeで毎月1日に自動レポート生成→SNSメール送信パイプラインを構築できます。QuickSightと連携すると視覚的なダッシュボードも作成できます。",
  }
};