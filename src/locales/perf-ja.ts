type ChalI18n = {
  title: string;
  scenario: string;
  steps: Array<{ title: string; desc: string }>;
  explanation: string;
};

export const PERF_CHALLENGES_I18N: Record<number, ChalI18n> = {
  1: {
    title: "ElastiCache Redisキャッシュの設定",
    scenario: "RDSに直接クエリするAPIの応答時間が500msを超えています。頻繁に参照されるデータをElastiCache Redisにキャッシュし、応答時間を10ms以下に短縮してください。",
    steps: [
      { title: "ElastiCacheサブネットグループの作成", desc: "ElastiCacheクラスターを配置するサブネットグループを作成してください。" },
      { title: "Redisクラスターの作成", desc: "cache.r6g.largeタイプでRedis 6.xクラスターを作成してください。" },
      { title: "クラスターエンドポイントの確認", desc: "アプリケーションで使用するRedisエンドポイントを確認してください。" },
      { title: "CloudWatchキャッシュヒット率の確認", desc: "ElastiCacheのCacheHits / CacheMissesメトリクスを参照してキャッシュ効率を確認してください。" },
    ],
    explanation: "ElastiCache Redisはインメモリキャッシュとして、RDSの負荷を軽減し応答時間を大幅に短縮します。CacheHits/CacheMissesの比率でキャッシュ効率をモニタリングしてください。cache.r6g系はGraviton2ベースでコストパフォーマンスに優れています。",
  },
  2: {
    title: "CloudFrontディストリビューションとTTL最適化",
    scenario: "静的ファイル（画像・JS・CSS）をS3から直接配信しているため、世界中のユーザーへの応答が遅くなっています。CloudFrontを前段に配置してTTLを最適化し、エッジキャッシュを活用してください。",
    steps: [
      { title: "Origin Access Controlの作成", desc: "S3バケットにCloudFrontからのみアクセスできるようOACを作成してください。" },
      { title: "CloudFrontディストリビューションの作成", desc: "S3バケットをオリジンとするCloudFrontディストリビューションを作成してください。" },
      { title: "キャッシュポリシーの作成（長期TTL）", desc: "静的アセット向けに24時間（86400秒）TTLのキャッシュポリシーを作成してください。" },
      { title: "ディストリビューション状態の確認", desc: "CloudFrontディストリビューションのデプロイが完了したか確認してください。" },
      { title: "キャッシュヒット率の確認", desc: "CloudFront CacheHitRateメトリクスでキャッシュ効率を確認してください。" },
    ],
    explanation: "CloudFrontは世界中のエッジロケーションで静的ファイルをキャッシュし、オリジンサーバーの負荷を軽減して応答時間を短縮します。静的アセットには長いTTL（24時間以上）を設定し、ファイル名にハッシュを含めてキャッシュ無効化を管理してください。",
  },
  3: {
    title: "RDS リードレプリカによる読み取り分散",
    scenario: "本番RDSインスタンスへの読み取りクエリが過負荷を引き起こしています。リードレプリカを作成してSELECTクエリを分散し、マスターDBのCPUを低下させてください。",
    steps: [
      { title: "現在のRDSインスタンスの確認", desc: "マスターDBのスペックと現在の読み取り負荷を確認してください。" },
      { title: "リードレプリカの作成", desc: "同一AZに読み取り専用レプリカを作成してください。" },
      { title: "レプリカ状態の確認", desc: "リードレプリカがavailable状態になったか確認してください。" },
      { title: "CloudWatchレプリケーション遅延のモニタリング", desc: "ReplicaLagメトリクスでレプリケーション遅延をモニタリングしてください。" },
    ],
    explanation: "RDSリードレプリカはマスターDBの読み取り負荷を分散します。アプリケーションでSELECTはレプリカエンドポイント、INSERT/UPDATE/DELETEはマスターエンドポイントにルーティングしてください。ReplicaLagが増加した場合はレプリカのスペックを上げるかクエリを最適化してください。",
  },
  4: {
    title: "DynamoDB DAXクラスターの設定",
    scenario: "DynamoDBテーブルの参照応答がシングルデジットmsであっても、高頻度の読み取りによってRCUコストが急増しています。DAXクラスターを前段に配置し、キャッシュで応答時間とコストの両方を削減してください。",
    steps: [
      { title: "DAXサブネットグループの作成", desc: "DAXクラスター用のサブネットグループを作成してください。" },
      { title: "DAXクラスターの作成", desc: "dax.r5.largeノード3台でDAXクラスターを作成してください。" },
      { title: "DAXクラスター状態の確認", desc: "DAXクラスターがavailable状態かどうか確認してください。" },
      { title: "DAXキャッシュヒット率の確認", desc: "DAX ItemCacheHitsメトリクスでキャッシュ効率を確認してください。" },
    ],
    explanation: "DAXはDynamoDBと完全互換のインメモリキャッシュで、読み取り応答をマイクロ秒レベルに短縮します。DAX SDKに置き換えるだけでコード変更を最小限に抑えられます。書き込み操作はDAXを通じてDynamoDBに直接反映されます。",
  },
  5: {
    title: "Lambdaメモリの最適化",
    scenario: "Lambda関数がタイムアウト（3秒）に頻繁に引っかかります。現在128MBに設定されていますが、メモリを増やすとCPUも比例して増加します。最適なメモリを見つけて実行時間とコストを同時に削減してください。",
    steps: [
      { title: "現在のLambda設定の確認", desc: "関数のメモリ・タイムアウト・最近の実行時間を確認してください。" },
      { title: "Lambdaメモリを1024MBに増設", desc: "メモリを1024MB、タイムアウトを10秒に更新してください。" },
      { title: "CloudWatch Durationメトリクスの確認", desc: "メモリ増設後の平均実行時間の変化を確認してください。" },
      { title: "Throttlesアラームの作成", desc: "Lambdaのスロットリング発生時にアラームが鳴るよう設定してください。" },
      { title: "同時実行数制限の設定", desc: "この関数にReserved Concurrency 50を設定してください。" },
    ],
    explanation: "Lambdaはメモリを増やすとCPUとネットワーク帯域幅も比例して増加します。128MB → 1024MBに8倍増やすと実行時間が大幅に短縮され、トータルコストがむしろ減少するケースが多くあります。AWS Lambda Power Tuningツールで最適なメモリを自動的に見つけることができます。",
  },
  6: {
    title: "S3 Transfer Acceleration",
    scenario: "海外拠点（ヨーロッパ・アジア）からS3バケット（us-east-1）への大容量ファイルアップロードが非常に遅い状態です。S3 Transfer Accelerationを有効にして、CloudFrontエッジを経由した高速アップロードパスを提供してください。",
    steps: [
      { title: "Transfer Accelerationの有効化", desc: "対象S3バケットにTransfer Accelerationを有効にしてください。" },
      { title: "Acceleration設定の確認", desc: "Transfer Accelerationが有効になったか確認してください。" },
      { title: "速度比較テスト", desc: "Accelerationエンドポイントでアップロード速度をテストしてください。" },
      { title: "S3バケットメトリクスの有効化", desc: "アップロードパフォーマンス追跡のためS3リクエストメトリクスを有効にしてください。" },
    ],
    explanation: "S3 Transfer AccelerationはCloudFrontエッジネットワークを通じてアップロードを最適化します。Accelerationエンドポイントは[bucket].s3-accelerate.amazonaws.com形式です。海外からAWSリージョンまでのインターネット区間をAWSグローバルネットワークに置き換え、50〜500%の速度向上が期待できます。",
  },
  7: {
    title: "EBS gp2 → gp3ボリュームへのアップグレード",
    scenario: "本番EC2サーバーのディスクI/Oがボトルネックになっています。現在gp2 500GBボリュームを使用していますが、gp3にアップグレードするとIOPSを独立して設定でき、より良いパフォーマンスをより安く実現できます。",
    steps: [
      { title: "現在のEBSボリュームの確認", desc: "インスタンスにアタッチされているEBSボリュームの現在の設定を確認してください。" },
      { title: "gp2 → gp3ボリュームへの変更", desc: "gp3に変更しながらIOPS 6000、スループット250MB/sに設定してください。" },
      { title: "ボリューム変更状態の確認", desc: "ボリュームの変更が完了したか確認してください。" },
      { title: "VolumeReadOps / VolumeWriteOpsの確認", desc: "CloudWatchでIOPSの向上を確認してください。" },
    ],
    explanation: "gp3はgp2比で20%安価でありながら、基本3000 IOPSと125MB/sのスループットを提供します。gp2はボリュームサイズにIOPSが連動（3 IOPS/GB）しますが、gp3は独立して設定可能です。EC2の再起動なしにオンラインで変更できます。",
  },
  8: {
    title: "API Gatewayレスポンスキャッシュ",
    scenario: "API Gateway + Lambda構成で運用中ですが、同一のGETリクエストが繰り返され、Lambdaが過剰に呼び出されています。API Gatewayステージにキャッシュを有効にして、重複するLambda呼び出しを削減してください。",
    steps: [
      { title: "API Gatewayキャッシュの有効化", desc: "ステージにキャッシュ容量0.5GB、TTL 300秒で有効にしてください。" },
      { title: "メソッドキャッシュTTLの設定", desc: "GET /productsメソッドにキャッシュTTL 300秒を設定してください。" },
      { title: "キャッシュヒット率メトリクスの確認", desc: "API Gateway CacheHitCountメトリクスを参照してください。" },
      { title: "キャッシュの無効化", desc: "データ変更時にキャッシュを即時無効化してください。" },
    ],
    explanation: "API Gatewayのキャッシュは同一リクエストに対してLambdaを再呼び出しせず、キャッシュされたレスポンスを返します。GETメソッドの場合、クエリストリング・ヘッダーをキャッシュキーに含めることができます。キャッシュTTLは最大3600秒（1時間）で、データ変更時はflush-stage-cacheで無効化してください。",
  },
  9: {
    title: "RDS Proxy接続プーリング",
    scenario: "Lambda関数がRDSに直接接続していますが、同時実行数が増えると接続数が爆発的に増加します。RDS Proxyで接続をプーリングし、DB接続数を管理してください。",
    steps: [
      { title: "現在のDB接続数の確認", desc: "RDS DatabaseConnectionsメトリクスで現在の接続数を確認してください。" },
      { title: "RDS Proxyの作成", desc: "MySQLプロトコルでRDS Proxyを作成してください。" },
      { title: "Proxyターゲットの登録", desc: "RDSインスタンスをProxyのターゲットとして登録してください。" },
      { title: "Proxyエンドポイントの確認", desc: "Proxyの状態と接続エンドポイントを確認してください。" },
      { title: "接続数減少の確認", desc: "Proxy適用後にRDSへの直接接続数が減ったか確認してください。" },
    ],
    explanation: "RDS ProxyはLambdaやコンテナのように接続が頻繁に生成・切断される環境でDB接続をプーリングします。数千のLambda実行がProxyの数十個の接続を共有します。IAM認証とSecrets Managerによってセキュリティも強化されます。",
  },
  10: {
    title: "EC2インスタンスタイプの最適化",
    scenario: "バッチ処理サーバーがt3.mediumですが、CPUクレジットが枯渇すると処理速度が急落します。CPU集約型ワークロードに適したc5系にマイグレーションしてパフォーマンスを比較してください。",
    steps: [
      { title: "現在のインスタンスタイプとクレジットの確認", desc: "T3インスタンスのCPUクレジット残量を確認してください。" },
      { title: "インスタンスの停止", desc: "タイプ変更のためにインスタンスを停止してください。" },
      { title: "インスタンスタイプの変更", desc: "t3.mediumからc5.xlargeにインスタンスタイプを変更してください。" },
      { title: "インスタンスの再起動", desc: "インスタンスを再起動してください。" },
      { title: "CPU使用率の比較", desc: "c5.xlargeで同一ワークロードのCPU使用率を確認してください。" },
    ],
    explanation: "T系（t2・t3・t4g）はバーストインスタンスで、クレジットが枯渇すると基準パフォーマンス（CPUの20〜40%）に制限されます。CPU集約型ワークロードはC系（c5・c6i・c6g）、メモリ集約型はR系、汎用はM系が適しています。c5.xlargeは4vCPU / 8GBメモリでt3.medium比4倍のvCPUを提供します。",
  },
  11: {
    title: "Global Acceleratorの設定",
    scenario: "ソウルリージョンのAPIサーバーに米国・ヨーロッパのユーザーがアクセスする際のレイテンシーが200msを超えています。Global AcceleratorでAWSグローバルネットワークを活用してレイテンシーを50ms以下に削減してください。",
    steps: [
      { title: "Global Acceleratorの作成", desc: "Acceleratorを作成してください。" },
      { title: "リスナーの作成", desc: "TCP 443ポートのリスナーを追加してください。" },
      { title: "Endpoint Groupの追加", desc: "ap-northeast-2リージョンのALBをEndpoint Groupとして追加してください。" },
      { title: "レイテンシー改善の確認", desc: "Global Acceleratorエンドポイントでレイテンシーをモニタリングしてください。" },
    ],
    explanation: "Global Acceleratorはユーザーのトラフィックを最寄りのAWSエッジロケーションで受け取り、AWSグローバルネットワーク経由で配信します。パブリックインターネット経路を削減し、レイテンシーとパケットロスを低減します。Anycast IPによりDDoS攻撃への耐性も高まります。",
  },
  12: {
    title: "DynamoDB GSIの作成とクエリ最適化",
    scenario: "DynamoDBテーブルをuserId（PK）で参照していますが、emailでもユーザーを検索する要件が生まれました。フルテーブルスキャンなしにemailで高速に検索できるGSIを追加してください。",
    steps: [
      { title: "現在のテーブルキー構造の確認", desc: "既存テーブルのキースキーマとインデックスを確認してください。" },
      { title: "GSIの追加（email-index）", desc: "email属性をパーティションキーとするGSIを追加してください。" },
      { title: "GSIビルド完了の確認", desc: "GSIの状態がACTIVEに変わるまで確認してください。" },
      { title: "GSIでemailクエリ", desc: "GSIを使用してemailでユーザーを検索してください。" },
    ],
    explanation: "DynamoDB GSIは元のテーブルと異なるパーティションキー・ソートキーでクエリできるようにします。ScanではなくQuery + GSIを使用するとコストとパフォーマンスが大幅に改善されます。GSI作成後、データのレプリケーションが完了するまで時間がかかります。ProjectionTypeはクエリ時に必要な属性のみ含めてRCUを削減してください。",
  },
  13: {
    title: "SQS + Lambdaバッチ処理の最適化",
    scenario: "SQSメッセージをLambdaが1件ずつ処理しているためLambda呼び出し数が多すぎて処理速度も遅くなっています。バッチサイズを増やしてSQSトリガーを最適化し、スループットを向上させてください。",
    steps: [
      { title: "現在のイベントソースマッピングの確認", desc: "LambdaのSQSイベントソースマッピングを確認してください。" },
      { title: "バッチサイズを10に増加", desc: "一度に10件のメッセージを処理するようバッチサイズを変更してください。" },
      { title: "SQSキュー属性の確認", desc: "キューのVisibility Timeoutとメッセージ数を確認してください。" },
      { title: "Visibility Timeoutの調整", desc: "Lambda処理時間の6倍にあたる180秒にVisibility Timeoutを設定してください。" },
      { title: "Lambda呼び出し数の減少確認", desc: "InvocationsメトリクスでLambda呼び出し数が減ったか確認してください。" },
    ],
    explanation: "SQS + Lambdaのバッチ処理でBatchSizeを増やすとLambda呼び出し数が減りコストが削減されます。MaximumBatchingWindowInSecondsでメッセージをまとめてより大きなバッチを作れます。Visibility TimeoutはLambdaの最大実行時間の6倍に設定することがAWSの推奨事項です。",
  },
  14: {
    title: "Kinesis Data Streamsシャードの拡張",
    scenario: "リアルタイムログ収集にKinesis Data Streamsを使用していますが、WriteProvisionedThroughputExceededエラーが発生しています。現在2つのシャードを4つに増やしてスループットを確保してください。",
    steps: [
      { title: "現在のストリーム状態の確認", desc: "ストリームのシャード数と状態を確認してください。" },
      { title: "ストリームのシャード数を増加", desc: "シャードを2つから4つに拡張してください。" },
      { title: "拡張完了の確認", desc: "シャードが4つに増えたか確認してください。" },
      { title: "WriteProvisionedThroughputExceededアラーム", desc: "書き込みボトルネック再発検知のアラームを作成してください。" },
    ],
    explanation: "Kinesisシャード1つは書き込み1MB/s（1000 records/s）、読み取り2MB/sをサポートします。シャードの拡張はUNIFORM_SCALINGで2倍単位のみ可能です。パーティションキーを多様に設計するとシャード間の均等分散が保証されます。",
  },
  15: {
    title: "AWS X-Ray分散トレースの有効化",
    scenario: "MSA環境で特定のAPIが遅いのですが、どのサービスでボトルネックが発生しているか分かりません。X-Rayを有効にしてリクエストフローと各区間のレイテンシーを追跡してください。",
    steps: [
      { title: "Lambda X-Rayアクティブトレースの有効化", desc: "Lambda関数にX-Rayアクティブトレースを有効にしてください。" },
      { title: "API Gateway X-Rayトレースの有効化", desc: "API GatewayステージにX-Rayトレースを有効にしてください。" },
      { title: "X-Rayサービスマップの確認", desc: "X-Rayサービスグラフを参照してサービス間の呼び出し関係を確認してください。" },
      { title: "遅いトレースの参照", desc: "応答時間の遅い上位5件のトレースを参照してください。" },
    ],
    explanation: "X-Rayは分散リクエストを追跡してサービス間のレイテンシーとエラーを可視化します。LambdaとAPI Gatewayの両方で有効にするとエンドツーエンドのトレースが可能になります。filter-expressionで遅いリクエストだけをフィルタリングしてボトルネックを素早く特定できます。",
  },
  16: {
    title: "RDS Performance Insightsの有効化",
    scenario: "RDSインスタンスのCPUが継続的に高い状態ですが、どのクエリが原因か分かりません。Performance Insightsを有効にして上位SQLクエリを特定し、DB負荷を分析してください。",
    steps: [
      { title: "Performance Insightsの有効化", desc: "本番RDSインスタンスにPerformance Insightsを有効にしてください。" },
      { title: "上位SQLクエリの参照", desc: "db.sql.statementディメンションで最も負荷の高いクエリを参照してください。" },
      { title: "DB負荷メトリクスの確認", desc: "DBLoadメトリクスでDB負荷の推移を確認してください。" },
      { title: "RDS Enhanced Monitoringの有効化", desc: "1秒間隔のOSレベルモニタリングを有効にしてください。" },
    ],
    explanation: "Performance InsightsはDBエンジンレベルのWaitイベントと上位SQLを可視化します。db.load.avgがvCPU数を超えている場合はボトルネックです。Enhanced MonitoringはOSレベル（CPU・メモリ・I/O）を1秒単位で計測し、Performance Insightsと組み合わせることで完全なDB性能分析が可能です。",
  },
  17: {
    title: "Lambda Provisioned Concurrency",
    scenario: "Lambda関数がコールドスタートにより最初のリクエスト応答に2〜3秒かかっています。決済APIのように常に素早い応答が必要な関数にProvisioned Concurrencyを設定してコールドスタートをなくしてください。",
    steps: [
      { title: "現在のコールドスタート頻度の確認", desc: "InitDurationメトリクスでコールドスタートの発生回数を確認してください。" },
      { title: "関数バージョンの発行", desc: "Provisioned Concurrency適用のために関数バージョンを発行してください。" },
      { title: "Provisioned Concurrency 10個の設定", desc: "バージョン5に10個のProvisioned Concurrencyを設定してください。" },
      { title: "Provisioned Concurrency準備完了の確認", desc: "設定の準備が完了したか確認してください。" },
      { title: "コールドスタート除去の確認", desc: "InitDurationメトリクスが0に近づいたか確認してください。" },
    ],
    explanation: "Provisioned Concurrencyは指定した数だけLambdaインスタンスを常に初期化された状態に維持します。バージョンまたはAliasにのみ設定可能で、$LATESTには適用できません。Application Auto Scalingで時間帯別のプロビジョニング数を自動調整できます。",
  },
  18: {
    title: "S3マルチパートアップロードの最適化",
    scenario: "10GB以上の大容量ファイルをS3に単一PUTでアップロードしていますが、ネットワークエラーが発生すると最初からやり直しになります。マルチパートアップロードを活用して並列転送と再試行効率を高めてください。",
    steps: [
      { title: "マルチパートアップロードの開始", desc: "マルチパートアップロードを初期化してUploadIdを取得してください。" },
      { title: "パートのアップロード", desc: "最初のパート（100MB）をアップロードしてください。" },
      { title: "マルチパートアップロードの完了", desc: "全パートのアップロード後にマルチパートを完了してください。" },
      { title: "不完全なマルチパートの自動削除ルール", desc: "中断されたアップロードが蓄積されないよう7日後に自動削除するルールを設定してください。" },
    ],
    explanation: "マルチパートアップロードはファイルを複数パートに分割して並列転送します。5MB以上のパートに適用され、最大10,000パートまで対応しています。中断時は該当パートから再開できるため、大容量ファイルには必須です。AbortIncompleteMultipartUploadライフサイクルルールで未完成アップロードの課金を防いでください。",
  },
  19: {
    title: "EC2 Enhanced Networking（ENA）の確認",
    scenario: "大容量データを処理するEC2インスタンス間のネットワークスループットが遅い状態です。ENA（Elastic Network Adapter）が有効になっているか確認し、インスタンスタイプがネットワーク最適化をサポートしているかチェックしてください。",
    steps: [
      { title: "ENAサポートの確認", desc: "現在のインスタンスのENA属性を確認してください。" },
      { title: "ネットワークインターフェース詳細の確認", desc: "ENIのネットワーク性能設定を確認してください。" },
      { title: "インスタンスのネットワークスループットメトリクス", desc: "NetworkIn/NetworkOutのスループットを確認してください。" },
      { title: "ネットワーク最適化インスタンスへの変更", desc: "インスタンスを停止してc5n.4xlarge（25Gbps）に変更してください。" },
    ],
    explanation: "ENAは高性能ネットワーキングのためのネットワークインターフェースで、最大100Gbpsをサポートします。c5n・m5n・r5nのようなネットワーク最適化インスタンスファミリーはより高いネットワーク帯域幅を提供します。インスタンス間の大容量データ転送にはPlacement Group（Cluster）と組み合わせると効果的です。",
  },
  20: {
    title: "ECS Fargate CPU/メモリのチューニング",
    scenario: "FargateタスクがCPU 512 / メモリ1GBで実行されていますが処理遅延が発生しています。CloudWatchメトリクスでリソース使用状況を分析してタスク定義を最適化してください。",
    steps: [
      { title: "現在のタスク定義の確認", desc: "現在のタスク定義のCPU/メモリ設定を確認してください。" },
      { title: "Fargateリソース使用率の確認", desc: "ECSサービスのCPU/メモリ使用率を確認してください。" },
      { title: "新しいタスク定義の登録（CPU 2倍）", desc: "CPU 1024、メモリ2048にアップグレードしたタスク定義を登録してください。" },
      { title: "ECSサービスの更新", desc: "新しいタスク定義でサービスを更新してください。" },
    ],
    explanation: "Fargate CPUは256〜16384 vCPU単位で設定し、メモリとの有効な組み合わせがあります。CPUUtilizationが継続的に80%以上の場合はCPUボトルネックです。ECS Service Auto Scalingを合わせて設定することで、負荷に応じてタスク数を自動調整できます。",
  },
  21: {
    title: "CloudFrontパス別キャッシュ動作の設定",
    scenario: "CloudFrontディストリビューションで静的ファイル（/static/*）のTTLを24時間、APIレスポンス（/api/*）はキャッシュしないよう、パス別に異なるキャッシュ動作を設定してください。",
    steps: [
      { title: "現在のディストリビューションキャッシュ動作の確認", desc: "既存のCloudFrontディストリビューションのキャッシュ動作を確認してください。" },
      { title: "API非キャッシュポリシーの作成", desc: "/api/*パスに使用するキャッシュ無効化ポリシーを作成してください。" },
      { title: "ディストリビューションへのパス別動作の追加", desc: "/api/*パスに非キャッシュ、/static/*パスに長期キャッシュを設定してください。" },
      { title: "キャッシュ動作適用の確認", desc: "デプロイが完了したか確認してください。" },
    ],
    explanation: "CloudFrontのパスパターン優先順位は特定パス（/api/*）がデフォルト動作（*）より先に評価されます。APIレスポンスはTTL=0に設定して常にオリジンから取得し、静的アセットは長いTTLでキャッシュします。CacheBehaviorsの順序が重要で、より具体的なパスを先に配置してください。",
  },
  22: {
    title: "ElastiCache Redisクラスターモードの有効化",
    scenario: "単一のRedisノードがメモリ不足と単一障害点の問題を抱えています。Redisクラスターモードを有効にしてデータを複数シャードに分散し、高可用性を確保してください。",
    steps: [
      { title: "クラスターモード有効レプリケーショングループの作成", desc: "3シャード、各1レプリカでRedisクラスターを作成してください。" },
      { title: "クラスター状態の確認", desc: "レプリケーショングループがavailable状態か確認してください。" },
      { title: "クラスター設定エンドポイントの確認", desc: "クラスターモードではConfiguration Endpointを使用する必要があります。" },
      { title: "メモリ使用率のモニタリング", desc: "各シャードのDatabaseMemoryUsagePercentageを確認してください。" },
    ],
    explanation: "Redisクラスターモードはデータを最大500シャードに分散します。クライアントはConfiguration Endpointを使用する必要があります。automatic-failover-enabledを設定するとプライマリノード障害時にレプリカが自動的にプライマリに昇格します。",
  },
  23: {
    title: "Aurora リードレプリカ Auto Scaling",
    scenario: "Auroraクラスターの読み取り負荷が昼と夜で大きく異なります。昼はリードレプリカが5台必要で、夜は1台で十分です。Aurora Auto Scalingを設定してレプリカ数を自動調整してください。",
    steps: [
      { title: "現在のAuroraクラスターの確認", desc: "クラスターの現在のメンバーと状態を確認してください。" },
      { title: "Aurora Auto Scalingポリシーの登録", desc: "AuroraクラスターにAuto Scalingポリシーを登録してください。" },
      { title: "CPUベーススケーリングポリシーの作成", desc: "CPU 70%を基準にレプリカを自動調整するポリシーを作成してください。" },
      { title: "Auto Scalingポリシーの確認", desc: "登録されたポリシーを確認してください。" },
    ],
    explanation: "Aurora Auto ScalingはApplication Auto Scalingを通じてReaderインスタンス数を自動調整します。ScaleIn/ScaleOutクールダウンを設定して頻繁なスケーリングを防いでください。Aurora Serverless v2を使用すると個別インスタンスのスケーリングではなく、ACU（Aurora Capacity Unit）単位でより細かく自動調整できます。",
  },
  24: {
    title: "DynamoDB キャパシティモードの切り替え（オンデマンド）",
    scenario: "イベント期間中だけDynamoDBのトラフィックが爆発的に増加します。通常はProvisionedモードが安価ですが、イベント時は常にProvisionedThroughputExceededエラーが発生します。オンデマンドモードに切り替えて自動スケーリングを活用してください。",
    steps: [
      { title: "現在のキャパシティモードと設定の確認", desc: "テーブルの現在のキャパシティ設定を確認してください。" },
      { title: "オンデマンドモードへの切り替え", desc: "テーブルをPAY_PER_REQUESTモードに変更してください。" },
      { title: "切り替え完了の確認", desc: "テーブルの状態がACTIVEに戻ったか確認してください。" },
      { title: "ConsumedReadCapacityUnitsのモニタリング", desc: "イベント中に実際に消費されたRCU/WCUを確認してください。" },
    ],
    explanation: "オンデマンドモードはトラフィックに合わせて自動スケーリングされるため、ProvisionedThroughputExceededエラーが発生しません。ただしコストはリクエスト単位課金のため、予測可能で安定したトラフィックにはProvisioned + Auto Scalingの方が安価です。モード切り替えは24時間に1度のみ可能です。",
  },
  25: {
    title: "EventBridge + Lambda非同期処理",
    scenario: "ユーザーの注文完了後に在庫更新・メール送信・統計記録を同期処理しているためAPI応答に3秒以上かかっています。EventBridgeでイベントを発行して各処理を非同期に分離してください。",
    steps: [
      { title: "EventBridgeイベントバスの作成", desc: "カスタムイベントバスを作成してください。" },
      { title: "イベントルールの作成", desc: "OrderCompletedイベントを処理するルールを作成してください。" },
      { title: "Lambdaターゲットの登録", desc: "在庫更新・メール送信LambdaをターゲットとしてMessage。" },
      { title: "テストイベントの発行", desc: "テスト用注文完了イベントを発行してください。" },
    ],
    explanation: "EventBridgeを通じたイベント駆動アーキテクチャはサービス間の結合度を低下させます。注文APIはEventBridgeにイベントを発行するだけで即座にレスポンスを返せるため、API応答時間が50ms以下に短縮されます。各コンシューマー（Lambda）は独立して障害が発生し、DLQ（Dead Letter Queue）で失敗イベントを管理してください。",
  },
  26: {
    title: "SQSメッセージの優先度処理",
    scenario: "1つのSQSキューにVIP注文と通常注文が混在して処理されています。VIP注文をより早く処理する必要がありますが、現在の構成では不可能です。別キュー戦略で優先度処理を実装してください。",
    steps: [
      { title: "VIP専用SQSキューの作成", desc: "VIP注文専用キューを作成してください。" },
      { title: "通常注文キューの作成", desc: "通常注文用キューを作成してください。" },
      { title: "LambdaへのVIPキューイベントソースの接続", desc: "VIPキュー処理LambdaをバッチサイズRSを1に設定してください。" },
      { title: "VIPキューのメッセージ数確認", desc: "VIPキューのメッセージ数と処理状態を確認してください。" },
    ],
    explanation: "SQSは基本的に優先度キューをサポートしていません。別のキューを作成し、VIP処理Lambdaにより多くの同時実行数を付与するか、先にポーリングするよう実装します。FIFOキューはメッセージの順序を保証し、重複防止機能も提供します。",
  },
  27: {
    title: "Kinesis Enhanced Fan-Outコンシューマー",
    scenario: "Kinesisストリームのコンシューマーが複数ありますが、全コンシューマーが毎秒2MBの共有読み取りスループットを分け合っているため遅延が発生しています。Enhanced Fan-Outで各コンシューマーに専用2MB/sの帯域幅を提供してください。",
    steps: [
      { title: "現在のストリームコンシューマーの確認", desc: "ストリームに登録されているコンシューマー一覧を確認してください。" },
      { title: "Enhanced Fan-Outコンシューマーの登録", desc: "通知サービス用コンシューマーをEnhanced Fan-Outで登録してください。" },
      { title: "コンシューマーのアクティブ化確認", desc: "コンシューマーの状態がACTIVEになったか確認してください。" },
      { title: "LambdaのKinesisトリガーへのコンシューマーARN接続", desc: "LambdaのイベントソースをEnhanced Fan-Outコンシューマーに設定してください。" },
    ],
    explanation: "Enhanced Fan-Outは各コンシューマーにシャードあたり2MB/sの専用読み取りスループットを提供します。標準のGetRecords方式は全コンシューマーでスループットを共有しますが、Enhanced Fan-Outはサーバー側Pushでレイテンシーも200msから70msに短縮されます。ただし、コンシューマーごとに追加コストが発生します。",
  },
  28: {
    title: "EC2 Cluster Placement Group",
    scenario: "HPC（高性能コンピューティング）ワークロードでEC2インスタンス間のネットワーク遅延が問題になっています。Cluster Placement Groupでインスタンスを物理的に近接配置して最低レイテンシーを実現してください。",
    steps: [
      { title: "Cluster Placement Groupの作成", desc: "clusterストラテジーでPlacement Groupを作成してください。" },
      { title: "Placement Groupへのインスタンス起動", desc: "c5n.xlargeインスタンス4台をPlacement Group内で起動してください。" },
      { title: "インスタンスの配置確認", desc: "Placement Groupに属するインスタンスを確認してください。" },
      { title: "ネットワークレイテンシーの確認", desc: "Placement Group内インスタンス間のNetworkInメトリクスを比較してください。" },
    ],
    explanation: "Cluster Placement Groupはインスタンスを同一AZの物理サーバー近傍に配置して10Gbps以上の低レイテンシーネットワークを提供します。HPC・ビッグデータ・ML学習に適しています。ただし単一AZに限定されるため可用性が低く、インスタンス起動失敗（insufficient capacity）の可能性が高まります。",
  },
  29: {
    title: "Network Load Balancer高スループット設定",
    scenario: "TCP接続が毎秒数万件発生するゲームサーバーにALBがレイテンシーを引き起こしています。NLBに置き換えてレイヤー4処理と固定IPを提供し、レイテンシーを最小化してください。",
    steps: [
      { title: "NLBの作成", desc: "TCP処理のためのNetwork Load Balancerを作成してください。" },
      { title: "TCPターゲットグループの作成", desc: "TCP 7777ポートのターゲットグループを作成してください。" },
      { title: "NLBリスナーの作成", desc: "TCP 7777リスナーを追加してください。" },
      { title: "NLBスループットメトリクスの確認", desc: "ActiveFlowCountとProcessedBytesメトリクスを確認してください。" },
    ],
    explanation: "NLBはLayer 4（TCP/UDP）ロードバランサーでALBよりはるかに低いレイテンシー（100マイクロ秒レベル）を提供します。静的IPとElastic IPをサポートし、毎秒数百万リクエストを処理します。ゲームサーバー・IoT・金融取引のようにレイテンシーが重要でHTTPヘッダー処理が不要なケースに適しています。",
  },
  30: {
    title: "CloudWatch パフォーマンスダッシュボードの構成",
    scenario: "複数サービスのパフォーマンス指標を一目で確認できるダッシュボードがなく、障害時の原因特定が遅れています。CloudWatchダッシュボードを作成してALB遅延・Lambdaエラー・RDS CPU・ElastiCacheヒット率を1画面に表示してください。",
    steps: [
      { title: "ダッシュボードの作成", desc: "production-performanceダッシュボードを作成してください。" },
      { title: "ALB遅延アラームの作成", desc: "ALB TargetResponseTimeが1秒を超えたときにアラームが鳴るよう設定してください。" },
      { title: "Lambdaエラー率アラームの作成", desc: "Lambda Errorsが10を超えたときにアラームを設定してください。" },
      { title: "Composite Alarmの作成", desc: "ALB遅延またはLambdaエラーが両方ともアラーム状態のときのみ鳴る複合アラームを作成してください。" },
      { title: "ダッシュボードの参照", desc: "作成されたダッシュボードを参照してください。" },
    ],
    explanation: "CloudWatchダッシュボードは複数サービスのメトリクスを1画面でモニタリングします。Composite Alarmは複数のアラームを組み合わせてアラームノイズを低減します。put-dashboardのdashboard-body JSONにメトリクスウィジェット・アラームウィジェット・テキストウィジェットなどを含めることができます。CloudWatch Container Insights・Lambda Insightsも合わせて活用してください。",
  },
};