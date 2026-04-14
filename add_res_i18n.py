# -*- coding: utf-8 -*-
"""
1. Extend ChalStep / ChalScenario interfaces with i18n field
2. Wire useLocale into ConsolePanel
3. Inject i18n (en/ja) translations into every RES challenge
"""

import re, sys
sys.stdout.reconfigure(encoding='utf-8')

TARGET = 'src/web-app.tsx'

# ──────────────────────────────────────────────────────────────
# 1.  Interface patch
# ──────────────────────────────────────────────────────────────
OLD_IFACE = """interface ChalStep {
  title: string; desc: string; hint: string;
  answers: string[]; successOutput: string[];
}
interface ChalScenario {
  id: string; title: string; scenario: string;
  steps: ChalStep[]; explanation: string;
}"""

NEW_IFACE = """interface ChalStepI18n { title?: string; desc?: string; }
interface ChalI18n {
  title?: string; scenario?: string; explanation?: string;
  steps?: ChalStepI18n[];
}
interface ChalStep {
  title: string; desc: string; hint: string;
  answers: string[]; successOutput: string[];
}
interface ChalScenario {
  id: string; title: string; scenario: string;
  steps: ChalStep[]; explanation: string;
  i18n?: { en?: ChalI18n; ja?: ChalI18n };
}"""

# ──────────────────────────────────────────────────────────────
# 2.  ConsolePanel: add useLocale + helper (insert after useState import area)
# ──────────────────────────────────────────────────────────────
OLD_CONSOLE_FN = "function ConsolePanel({ backendUrl: _backendUrl, userEmail: _userEmail }: { backendUrl: string; userEmail: string }) {\n  const [activeCategory, setActiveCategory] = useState<'SEC' | 'RES' | 'PERF' | 'COST'>('SEC');"

NEW_CONSOLE_FN = """function ConsolePanel({ backendUrl: _backendUrl, userEmail: _userEmail }: { backendUrl: string; userEmail: string }) {
  const { locale } = useLocale();
  const chalTitle  = (s: ChalScenario) => (locale !== 'ko' && s.i18n?.[locale as 'en'|'ja']?.title)       || s.title;
  const chalScen   = (s: ChalScenario) => (locale !== 'ko' && s.i18n?.[locale as 'en'|'ja']?.scenario)    || s.scenario;
  const chalExpl   = (s: ChalScenario) => (locale !== 'ko' && s.i18n?.[locale as 'en'|'ja']?.explanation) || s.explanation;
  const stepTitle  = (s: ChalScenario, i: number) => (locale !== 'ko' && s.i18n?.[locale as 'en'|'ja']?.steps?.[i]?.title) || s.steps[i].title;
  const stepDesc   = (s: ChalScenario, i: number) => (locale !== 'ko' && s.i18n?.[locale as 'en'|'ja']?.steps?.[i]?.desc)  || s.steps[i].desc;
  const [activeCategory, setActiveCategory] = useState<'SEC' | 'RES' | 'PERF' | 'COST'>('SEC');"""

# ──────────────────────────────────────────────────────────────
# 3.  Rendering patches — swap hardcoded KO strings → helpers
# ──────────────────────────────────────────────────────────────
RENDER_PATCHES = [
    # title
    (
        "{challengeSolved ? '✅ ' : ''}{scenario.title}",
        "{challengeSolved ? '✅ ' : ''}{chalTitle(scenario)}"
    ),
    # scenario description
    (
        "            {scenario.scenario}\n",
        "            {chalScen(scenario)}\n"
    ),
    # Step title in step card
    (
        "Step {stepIdx + 1} / {scenario.steps.length} — {currentStep.title}",
        "Step {stepIdx + 1} / {scenario.steps.length} — {stepTitle(scenario, stepIdx)}"
    ),
    # Step desc
    (
        "<div style={{ color: '#e6edf3', fontSize: '12px', marginTop: '2px' }}>{currentStep.desc}</div>",
        "<div style={{ color: '#e6edf3', fontSize: '12px', marginTop: '2px' }}>{stepDesc(scenario, stepIdx)}</div>"
    ),
    # explanation
    (
        "<div style={{ color: '#8b949e', fontSize: '12px', lineHeight: 1.6 }}>{scenario.explanation}</div>",
        "<div style={{ color: '#8b949e', fontSize: '12px', lineHeight: 1.6 }}>{chalExpl(scenario)}</div>"
    ),
    # terminal step label
    (
        "── Step {line.num}/{line.total}: {line.title} ──",
        "── Step {line.num}/{line.total}: {line.title} ──"   # line.title is already locale-resolved at push time — handled separately below
    ),
]

# ──────────────────────────────────────────────────────────────
# 4.  Also fix the two places where `scenario.steps[X].title` is pushed to history
# ──────────────────────────────────────────────────────────────
OLD_HIST1 = "setHistory([{ kind: 'step', num: 1, title: scenario.steps[0].title, total: scenario.steps.length }]);"
NEW_HIST1 = "setHistory([{ kind: 'step', num: 1, title: stepTitle(scenario, 0), total: scenario.steps.length }]);"

OLD_HIST2 = "setHistory(h => [...h, { kind: 'step', num: nextIdx + 1, title: scenario.steps[nextIdx].title, total: scenario.steps.length }]);"
NEW_HIST2 = "setHistory(h => [...h, { kind: 'step', num: nextIdx + 1, title: stepTitle(scenario, nextIdx), total: scenario.steps.length }]);"

# ──────────────────────────────────────────────────────────────
# 5.  useLocale import — add to existing import from LocaleContext
# ──────────────────────────────────────────────────────────────
OLD_LOCALE_IMPORT = "import { useLocale } from './LocaleContext';"  # already there or we add it

# ──────────────────────────────────────────────────────────────
# 6.  i18n data for all 30 RES challenges
# ──────────────────────────────────────────────────────────────
RES_I18N = {
    1: {
        "en": {
            "title": "RES-01 Configure EC2 Auto Scaling Group",
            "scenario": "Your server crashes every time traffic spikes. Adding EC2 instances manually is too slow. Create an Auto Scaling Group to automatically scale instances based on traffic.",
            "steps": [
                {"title": "Create Launch Template", "desc": "Create a Launch Template to use for Auto Scaling."},
                {"title": "Create Auto Scaling Group", "desc": "Create an ASG with min 2, max 10 instances."},
                {"title": "Add CPU-based Scaling Policy", "desc": "Create a policy to add instances when CPU exceeds 70%."},
                {"title": "Check ASG Status", "desc": "Verify the Auto Scaling Group was created successfully."},
            ],
            "explanation": "An Auto Scaling Group automatically creates/terminates instances based on the Launch Template. TargetTrackingScaling maintains the target CPU utilization automatically. Deploy across multiple AZs to ensure high availability.",
        },
        "ja": {
            "title": "RES-01 EC2 Auto Scalingグループの設定",
            "scenario": "トラフィックが急増するたびにサーバーがダウンします。EC2を手動で追加するのは遅すぎます。Auto Scalingグループを作成して、トラフィックに応じてインスタンスを自動的に増減させてください。",
            "steps": [
                {"title": "Launch Templateの作成", "desc": "Auto Scalingに使用するLaunch Templateを作成してください。"},
                {"title": "Auto Scalingグループの作成", "desc": "最小2台、最大10台でASGを作成してください。"},
                {"title": "CPUベースのスケーリングポリシーの追加", "desc": "CPU使用率が70%を超えたときにインスタンスを追加するポリシーを作成してください。"},
                {"title": "ASGの状態確認", "desc": "Auto Scalingグループが正常に作成されたか確認してください。"},
            ],
            "explanation": "Auto ScalingグループはLaunch Templateに基づいてインスタンスを自動的に作成・終了します。TargetTrackingScalingポリシーは目標CPU使用率を自動的に維持します。複数のAZにデプロイすることで高可用性が確保されます。",
        },
    },
    2: {
        "en": {
            "title": "RES-02 Configure Application Load Balancer",
            "scenario": "You have 2 web servers but traffic is being sent to only one without any load balancing. Create an ALB to distribute traffic evenly and automatically exclude failed servers via health checks.",
            "steps": [
                {"title": "Create Target Group", "desc": "Create a Target Group to register EC2 instances."},
                {"title": "Create ALB", "desc": "Create a public-facing Application Load Balancer."},
                {"title": "Add Listener", "desc": "Add an HTTP port 80 listener to the ALB."},
                {"title": "Register Instances", "desc": "Register 2 EC2 instances to the Target Group."},
                {"title": "Check Target Health", "desc": "Verify the health check status of registered instances."},
            ],
            "explanation": "ALB is a Layer 7 (HTTP/HTTPS) load balancer supporting path-based and host-based routing. The /health check automatically removes unhealthy instances. You must specify subnets in at least 2 AZs.",
        },
        "ja": {
            "title": "RES-02 Application Load Balancerの設定",
            "scenario": "Webサーバーが2台あるにもかかわらず、ロードバランシングなしに一方のサーバーにのみリクエストが集中しています。ALBを作成して2台のインスタンスに均等に分散し、ヘルスチェックで障害サーバーを自動除外してください。",
            "steps": [
                {"title": "Target Groupの作成", "desc": "EC2インスタンスを登録するTarget Groupを作成してください。"},
                {"title": "ALBの作成", "desc": "パブリックなALBを作成してください。"},
                {"title": "リスナーの追加", "desc": "ALBにHTTP 80ポートのリスナーを追加してください。"},
                {"title": "インスタンスの登録", "desc": "EC2インスタンス2台をTarget Groupに登録してください。"},
                {"title": "ターゲットのヘルス確認", "desc": "登録されたインスタンスのヘルスチェック状態を確認してください。"},
            ],
            "explanation": "ALBはレイヤー7（HTTP/HTTPS）ロードバランサーで、パスベース・ホストベースのルーティングが可能です。/healthチェックで異常なインスタンスを自動除外します。必ず2つ以上のAZのサブネットを指定してください。",
        },
    },
    3: {
        "en": {
            "title": "RES-03 RDS Multi-AZ Failover",
            "scenario": "Your production RDS instance is in a single AZ. Switch to Multi-AZ for a failover drill and test an actual failover.",
            "steps": [
                {"title": "Check Current RDS Settings", "desc": "Verify the Multi-AZ configuration of the production DB."},
                {"title": "Enable Multi-AZ", "desc": "Modify the instance to enable Multi-AZ."},
                {"title": "Confirm Multi-AZ Status", "desc": "Confirm Multi-AZ is enabled."},
                {"title": "Trigger Manual Failover", "desc": "Trigger a manual failover to test the process."},
            ],
            "explanation": "RDS Multi-AZ maintains a synchronous standby replica in a different AZ. During failover the CNAME switches to the standby (typically 60–120 s). Multi-AZ improves availability but does not improve read performance — use Read Replicas for that.",
        },
        "ja": {
            "title": "RES-03 RDS Multi-AZフェイルオーバー",
            "scenario": "本番RDSインスタンスがシングルAZです。フェイルオーバー訓練のためにMulti-AZに切り替え、実際のフェイルオーバーをテストしてください。",
            "steps": [
                {"title": "現在のRDS設定確認", "desc": "本番DBのMulti-AZ設定を確認してください。"},
                {"title": "Multi-AZの有効化", "desc": "インスタンスを変更してMulti-AZを有効にしてください。"},
                {"title": "Multi-AZステータス確認", "desc": "Multi-AZが有効になったか確認してください。"},
                {"title": "手動フェイルオーバーの実行", "desc": "手動フェイルオーバーをトリガーしてプロセスをテストしてください。"},
            ],
            "explanation": "RDS Multi-AZは別のAZに同期スタンバイレプリカを維持します。フェイルオーバー時にCNAMEがスタンバイに切り替わります（通常60〜120秒）。Multi-AZは可用性を向上させますが、読み取りパフォーマンスは向上しません—それにはRead Replicaを使用してください。",
        },
    },
    4: {
        "en": {
            "title": "RES-04 S3 Cross-Region Replication (CRR)",
            "scenario": "Your S3 bucket exists only in us-east-1. To prepare for a regional disaster, set up Cross-Region Replication (CRR) to automatically copy new objects to ap-northeast-2.",
            "steps": [
                {"title": "Enable Versioning on Source Bucket", "desc": "Enable versioning on the source bucket (required for CRR)."},
                {"title": "Enable Versioning on Destination Bucket", "desc": "Enable versioning on the destination bucket as well."},
                {"title": "Create CRR Replication Rule", "desc": "Set up a replication rule to copy all objects to the destination bucket."},
                {"title": "Verify Replication Status", "desc": "Confirm that the replication rule is active."},
            ],
            "explanation": "CRR automatically replicates new objects across regions. Both source and destination buckets must have versioning enabled. Existing objects are not replicated — use S3 Batch Operations for that. Replication is asynchronous and best-effort.",
        },
        "ja": {
            "title": "RES-04 S3クロスリージョンレプリケーション（CRR）",
            "scenario": "S3バケットがus-east-1にしか存在しません。リージョン障害に備えて、新しいオブジェクトをap-northeast-2に自動的にコピーするCRRを設定してください。",
            "steps": [
                {"title": "ソースバケットのバージョニング有効化", "desc": "ソースバケットのバージョニングを有効にしてください（CRRに必要）。"},
                {"title": "宛先バケットのバージョニング有効化", "desc": "宛先バケットもバージョニングを有効にしてください。"},
                {"title": "CRRレプリケーションルールの作成", "desc": "すべてのオブジェクトを宛先バケットにコピーするレプリケーションルールを設定してください。"},
                {"title": "レプリケーションステータスの確認", "desc": "レプリケーションルールがアクティブであることを確認してください。"},
            ],
            "explanation": "CRRは新しいオブジェクトをリージョン間で自動的にレプリケートします。ソースバケットと宛先バケットの両方でバージョニングが有効である必要があります。既存のオブジェクトはレプリケートされません—S3 Batch Operationsを使用してください。レプリケーションは非同期でベストエフォートです。",
        },
    },
    5: {
        "en": {
            "title": "RES-05 Route 53 Health Check + Failover",
            "scenario": "Your primary server in us-east-1 is down and all traffic should automatically failover to the secondary server in us-west-2. Configure Route 53 health checks and failover routing.",
            "steps": [
                {"title": "Create Health Check", "desc": "Create a health check for the primary server endpoint."},
                {"title": "Create Primary Failover Record", "desc": "Create a PRIMARY failover DNS record."},
                {"title": "Create Secondary Failover Record", "desc": "Create a SECONDARY failover DNS record for us-west-2."},
                {"title": "Verify Failover", "desc": "Confirm the health check status and failover configuration."},
            ],
            "explanation": "Route 53 failover routing sends traffic to the secondary endpoint when the primary health check fails. Health checks run every 30 seconds by default. Combine with CloudWatch alarms for more complex failover conditions.",
        },
        "ja": {
            "title": "RES-05 Route 53ヘルスチェック + フェイルオーバー",
            "scenario": "us-east-1のプライマリサーバーがダウンし、すべてのトラフィックを自動的にus-west-2のセカンダリサーバーにフェイルオーバーする必要があります。Route 53ヘルスチェックとフェイルオーバールーティングを設定してください。",
            "steps": [
                {"title": "ヘルスチェックの作成", "desc": "プライマリサーバーエンドポイントのヘルスチェックを作成してください。"},
                {"title": "プライマリフェイルオーバーレコードの作成", "desc": "PRIMARYフェイルオーバーDNSレコードを作成してください。"},
                {"title": "セカンダリフェイルオーバーレコードの作成", "desc": "us-west-2用のSECONDARYフェイルオーバーDNSレコードを作成してください。"},
                {"title": "フェイルオーバーの確認", "desc": "ヘルスチェックの状態とフェイルオーバー設定を確認してください。"},
            ],
            "explanation": "Route 53フェイルオーバールーティングは、プライマリのヘルスチェックが失敗するとセカンダリエンドポイントにトラフィックを送ります。ヘルスチェックはデフォルトで30秒ごとに実行されます。より複雑なフェイルオーバー条件にはCloudWatchアラームと組み合わせてください。",
        },
    },
    6: {
        "en": {
            "title": "RES-06 Distribute Read Load with RDS Read Replica",
            "scenario": "Read queries are overloading the production RDS master. Create a Read Replica and route SELECT queries to it to reduce CPU on the master.",
            "steps": [
                {"title": "Check Master DB Status", "desc": "Check the current CPU and connection count of the master DB."},
                {"title": "Create Read Replica", "desc": "Create a read-only replica of the master instance."},
                {"title": "Verify Replica Status", "desc": "Confirm the replica is available and replicating."},
                {"title": "Monitor Replication Lag", "desc": "Check the ReplicaLag metric to monitor replication delay."},
            ],
            "explanation": "RDS Read Replicas distribute read load from the master DB. Route SELECT queries to the replica endpoint, and INSERT/UPDATE/DELETE to the master. If ReplicaLag increases, upgrade the replica spec or optimize queries.",
        },
        "ja": {
            "title": "RES-06 RDS Read Replicaによる読み取り負荷分散",
            "scenario": "本番RDSマスターに読み取りクエリが過負荷を引き起こしています。Read Replicaを作成し、SELECTクエリをそちらにルーティングしてマスターのCPUを下げてください。",
            "steps": [
                {"title": "マスターDBの状態確認", "desc": "マスターDBの現在のCPUと接続数を確認してください。"},
                {"title": "Read Replicaの作成", "desc": "マスターインスタンスの読み取り専用レプリカを作成してください。"},
                {"title": "レプリカの状態確認", "desc": "レプリカが利用可能でレプリケートされていることを確認してください。"},
                {"title": "レプリケーション遅延の監視", "desc": "ReplicaLagメトリクスでレプリケーション遅延を確認してください。"},
            ],
            "explanation": "RDS Read ReplicaはマスターDBの読み取り負荷を分散します。SELECTクエリはレプリカエンドポイントに、INSERT/UPDATE/DELETEはマスターにルーティングしてください。ReplicaLagが増加したら、レプリカのスペックを上げるかクエリを最適化してください。",
        },
    },
    7: {
        "en": {
            "title": "RES-07 Automate EC2 AMI Backups",
            "scenario": "You are creating AMI backups manually once a week, but if a failure occurs mid-week your restore point is too old. Automate daily AMI backups using AWS Backup.",
            "steps": [
                {"title": "Create Backup Vault", "desc": "Create an AWS Backup vault to store backups."},
                {"title": "Create Backup Plan", "desc": "Create a backup plan with daily AMI snapshots."},
                {"title": "Assign Backup Resources", "desc": "Select EC2 instances to include in the backup plan."},
                {"title": "Verify Backup Jobs", "desc": "Confirm that backup jobs are running."},
            ],
            "explanation": "AWS Backup centrally manages backups across EC2, RDS, EFS, DynamoDB, and more. Retention policies and cross-region copy rules can be configured per vault. Tag-based selection makes it easy to manage backups for all instances sharing the same tag.",
        },
        "ja": {
            "title": "RES-07 EC2 AMIバックアップの自動化",
            "scenario": "週1回手動でAMIバックアップを作成していますが、週の途中で障害が発生すると復元ポイントが古すぎます。AWS Backupを使用して毎日のAMIバックアップを自動化してください。",
            "steps": [
                {"title": "バックアップボールトの作成", "desc": "バックアップを保存するAWS Backupボールトを作成してください。"},
                {"title": "バックアップ計画の作成", "desc": "毎日AMIスナップショットを作成するバックアップ計画を作成してください。"},
                {"title": "バックアップリソースの割り当て", "desc": "バックアップ計画に含めるEC2インスタンスを選択してください。"},
                {"title": "バックアップジョブの確認", "desc": "バックアップジョブが実行されていることを確認してください。"},
            ],
            "explanation": "AWS BackupはEC2、RDS、EFS、DynamoDBなど複数サービスのバックアップを一元管理します。保持ポリシーとクロスリージョンコピールールをボールトごとに設定できます。タグベースの選択により、同じタグを持つすべてのインスタンスのバックアップを簡単に管理できます。",
        },
    },
    8: {
        "en": {
            "title": "RES-08 Handle Failed Messages with SQS Dead Letter Queue",
            "scenario": "Some SQS messages fail to process and keep being retried, blocking the queue. Configure a Dead Letter Queue (DLQ) to move failed messages and enable separate investigation.",
            "steps": [
                {"title": "Create DLQ", "desc": "Create a standard SQS queue to serve as the Dead Letter Queue."},
                {"title": "Configure DLQ on Main Queue", "desc": "Set the DLQ on the main queue with maxReceiveCount=3."},
                {"title": "Verify DLQ Configuration", "desc": "Confirm the DLQ is attached to the main queue."},
                {"title": "Monitor DLQ Depth", "desc": "Set a CloudWatch alarm for DLQ message count."},
            ],
            "explanation": "A DLQ receives messages that exceed the maxReceiveCount retry limit. Set maxReceiveCount to 3–5 to distinguish genuine failures from transient errors. Monitor DLQ depth with CloudWatch and investigate root causes when messages accumulate.",
        },
        "ja": {
            "title": "RES-08 SQS Dead Letter Queueによる失敗メッセージ処理",
            "scenario": "SQSメッセージの処理が失敗し、リトライが繰り返されてキューがブロックされています。Dead Letter Queue（DLQ）を設定して失敗したメッセージを移動し、別途調査できるようにしてください。",
            "steps": [
                {"title": "DLQの作成", "desc": "Dead Letter Queueとして機能する標準SQSキューを作成してください。"},
                {"title": "メインキューにDLQを設定", "desc": "maxReceiveCount=3でメインキューにDLQを設定してください。"},
                {"title": "DLQ設定の確認", "desc": "DLQがメインキューに接続されていることを確認してください。"},
                {"title": "DLQの深さを監視", "desc": "DLQのメッセージ数にCloudWatchアラームを設定してください。"},
            ],
            "explanation": "DLQはmaxReceiveCountのリトライ制限を超えたメッセージを受け取ります。一時的なエラーと真の失敗を区別するためにmaxReceiveCountを3〜5に設定してください。CloudWatchでDLQの深さを監視し、メッセージが蓄積したら根本原因を調査してください。",
        },
    },
    9: {
        "en": {
            "title": "RES-09 Set Up ElastiCache Redis Cluster",
            "scenario": "Session data is stored directly in RDS, adding unnecessary DB load. Move session storage to ElastiCache Redis to reduce latency and free up DB connections.",
            "steps": [
                {"title": "Create ElastiCache Subnet Group", "desc": "Create a subnet group for the ElastiCache cluster."},
                {"title": "Create Redis Replication Group", "desc": "Create a Redis replication group with automatic failover."},
                {"title": "Verify Cluster Status", "desc": "Confirm the cluster is available."},
                {"title": "Check Redis Connection", "desc": "Verify the endpoint and port of the Redis cluster."},
            ],
            "explanation": "ElastiCache Redis provides in-memory storage to reduce DB load and lower response times. Automatic failover in a replication group ensures high availability. Use Redis cluster mode for large datasets requiring horizontal sharding.",
        },
        "ja": {
            "title": "RES-09 ElastiCache Redisクラスターの設定",
            "scenario": "セッションデータがRDSに直接保存されており、不要なDB負荷がかかっています。セッションストレージをElastiCache Redisに移してレイテンシを下げ、DB接続を解放してください。",
            "steps": [
                {"title": "ElastiCacheサブネットグループの作成", "desc": "ElastiCacheクラスター用のサブネットグループを作成してください。"},
                {"title": "Redisレプリケーショングループの作成", "desc": "自動フェイルオーバーを持つRedisレプリケーショングループを作成してください。"},
                {"title": "クラスターの状態確認", "desc": "クラスターが利用可能であることを確認してください。"},
                {"title": "Redis接続の確認", "desc": "Redisクラスターのエンドポイントとポートを確認してください。"},
            ],
            "explanation": "ElastiCache RedisはDB負荷を軽減しレスポンス時間を短縮するインメモリストレージを提供します。レプリケーショングループの自動フェイルオーバーにより高可用性が確保されます。水平シャーディングが必要な大規模データセットにはRedisクラスターモードを使用してください。",
        },
    },
    10: {
        "en": {
            "title": "RES-10 CloudWatch Alarm-based Auto Scaling",
            "scenario": "CPU spikes above 80% but there is no alarm and no automatic response. Create CloudWatch alarms and connect them to Auto Scaling policies for automatic scale-out.",
            "steps": [
                {"title": "Create Scale-Out CloudWatch Alarm", "desc": "Create an alarm that triggers when CPU exceeds 80%."},
                {"title": "Create Scale-Out Scaling Policy", "desc": "Create a step scaling policy to add 2 instances."},
                {"title": "Create Scale-In Alarm", "desc": "Create an alarm for when CPU drops below 30%."},
                {"title": "Link Alarms to Policies", "desc": "Connect the alarms to the scaling policies."},
            ],
            "explanation": "Step Scaling policies add/remove a fixed number of instances when a CloudWatch alarm fires. Set scale-out and scale-in cooldown periods (e.g., 300 s) to avoid oscillation. Target Tracking Scaling is simpler and generally preferred.",
        },
        "ja": {
            "title": "RES-10 CloudWatchアラームベースのAuto Scaling",
            "scenario": "CPUが80%を超えてもアラームもなく自動応答もありません。CloudWatchアラームを作成し、Auto Scalingポリシーに接続して自動スケールアウトを実現してください。",
            "steps": [
                {"title": "スケールアウト用CloudWatchアラームの作成", "desc": "CPUが80%を超えたときにトリガーされるアラームを作成してください。"},
                {"title": "スケールアウトポリシーの作成", "desc": "2インスタンスを追加するステップスケーリングポリシーを作成してください。"},
                {"title": "スケールイン用アラームの作成", "desc": "CPUが30%以下に下がったときのアラームを作成してください。"},
                {"title": "アラームとポリシーの連携", "desc": "アラームをスケーリングポリシーに接続してください。"},
            ],
            "explanation": "ステップスケーリングポリシーはCloudWatchアラームが発火したときに固定数のインスタンスを追加・削除します。振動を避けるためにスケールアウトとスケールインのクールダウン期間（例：300秒）を設定してください。ターゲットトラッキングスケーリングはより簡単で一般的に推奨されます。",
        },
    },
    11: {
        "en": {
            "title": "RES-11 Mix EC2 Spot and On-Demand Instances",
            "scenario": "Batch processing only uses On-Demand instances, which is costly. Mix Spot Instances for cheaper compute while keeping On-Demand as a fallback.",
            "steps": [
                {"title": "Check Current ASG Configuration", "desc": "Verify the current instance purchase options."},
                {"title": "Add Spot Instance Mix Policy", "desc": "Configure a mixed instance policy with 70% Spot / 30% On-Demand."},
                {"title": "Verify Mixed Fleet", "desc": "Confirm both Spot and On-Demand instances are running."},
                {"title": "Monitor Spot Interruptions", "desc": "Set up an EventBridge rule to detect Spot interruption warnings."},
            ],
            "explanation": "Mixed instance policies allow you to combine Spot and On-Demand instances in an ASG. Spot instances can reduce costs by up to 90% but may be interrupted. Setting a base On-Demand count ensures minimum capacity. SpotAllocationStrategy=lowest-price or capacity-optimized controls placement.",
        },
        "ja": {
            "title": "RES-11 EC2 Spotインスタンス + On-Demand混在",
            "scenario": "バッチ処理がOn-Demandインスタンスのみを使用しており、コストが高いです。Spotインスタンスを混在させてコストを削減しながら、On-Demandをフォールバックとして維持してください。",
            "steps": [
                {"title": "現在のASG設定の確認", "desc": "現在のインスタンス購入オプションを確認してください。"},
                {"title": "Spotインスタンス混在ポリシーの追加", "desc": "Spot 70% / On-Demand 30%の混在インスタンスポリシーを設定してください。"},
                {"title": "混在フリートの確認", "desc": "SpotとOn-Demandの両方のインスタンスが実行されていることを確認してください。"},
                {"title": "Spot中断の監視", "desc": "Spot中断警告を検出するEventBridgeルールを設定してください。"},
            ],
            "explanation": "混在インスタンスポリシーを使用すると、ASGでSpotとOn-Demandインスタンスを組み合わせることができます。Spotインスタンスはコストを最大90%削減できますが、中断される可能性があります。On-Demandのベースカウントを設定することで最小容量を確保できます。",
        },
    },
    12: {
        "en": {
            "title": "RES-12 Protect DynamoDB with Lambda Concurrency Limit",
            "scenario": "A traffic surge causes thousands of Lambda functions to run simultaneously and overwhelm DynamoDB with connections. Set Reserved Concurrency on Lambda to cap the connection rate.",
            "steps": [
                {"title": "Check Current Lambda Concurrency", "desc": "Check the current concurrent execution count."},
                {"title": "Set Reserved Concurrency to 100", "desc": "Limit Lambda to 100 concurrent executions."},
                {"title": "Set DynamoDB Provisioned Throughput", "desc": "Align DynamoDB capacity with the concurrency limit."},
                {"title": "Set Provisioned Concurrency", "desc": "Pre-warm 10 Lambda instances to eliminate cold starts."},
            ],
            "explanation": "Lambda Reserved Concurrency prevents a function from exceeding a set number of simultaneous executions. This protects downstream services (DynamoDB, RDS) from connection storms. Provisioned Concurrency keeps instances initialized to eliminate cold starts.",
        },
        "ja": {
            "title": "RES-12 Lambda同時実行制限によるDynamoDB保護",
            "scenario": "トラフィックサージにより何千ものLambda関数が同時に実行され、DynamoDBが接続で圧倒されます。LambdaのReserved Concurrencyを設定して接続レートを制限してください。",
            "steps": [
                {"title": "現在のLambda同時実行数の確認", "desc": "現在の同時実行数を確認してください。"},
                {"title": "Reserved Concurrencyを100に設定", "desc": "Lambdaを100同時実行に制限してください。"},
                {"title": "DynamoDBプロビジョンドスループットの設定", "desc": "DynamoDBのキャパシティを同時実行制限に合わせてください。"},
                {"title": "Provisioned Concurrencyの設定", "desc": "コールドスタートを排除するためにLambdaインスタンスを10台事前ウォームアップしてください。"},
            ],
            "explanation": "LambdaのReserved Concurrencyは、関数が設定した同時実行数を超えるのを防ぎます。これによりダウンストリームサービス（DynamoDB、RDS）を接続ストームから保護します。Provisioned Concurrencyはインスタンスを初期化済み状態に保ちコールドスタートを排除します。",
        },
    },
    13: {
        "en": {
            "title": "RES-13 DynamoDB Global Tables (Multi-Region)",
            "scenario": "DynamoDB is only in us-east-1 and a region outage would cause a total service disruption. Set up Global Tables to replicate data to ap-northeast-2 automatically.",
            "steps": [
                {"title": "Enable DynamoDB Streams", "desc": "Enable Streams on the table (required for Global Tables)."},
                {"title": "Create Global Table Replica", "desc": "Add ap-northeast-2 as a replica region."},
                {"title": "Verify Replica Status", "desc": "Confirm the replica table is active."},
                {"title": "Test Cross-Region Write", "desc": "Write from ap-northeast-2 and verify replication to us-east-1."},
            ],
            "explanation": "DynamoDB Global Tables provides multi-region active-active replication. Any region can accept writes and changes propagate within seconds. Concurrent writes in different regions use last-writer-wins semantics. Requires DynamoDB Streams.",
        },
        "ja": {
            "title": "RES-13 DynamoDBグローバルテーブル（マルチリージョン）",
            "scenario": "DynamoDBがus-east-1にしかなく、リージョン障害でサービスが完全に停止します。グローバルテーブルを設定してap-northeast-2にデータを自動レプリケートしてください。",
            "steps": [
                {"title": "DynamoDB Streamsの有効化", "desc": "テーブルのStreamsを有効にしてください（グローバルテーブルに必要）。"},
                {"title": "グローバルテーブルレプリカの作成", "desc": "ap-northeast-2をレプリカリージョンとして追加してください。"},
                {"title": "レプリカステータスの確認", "desc": "レプリカテーブルがアクティブであることを確認してください。"},
                {"title": "クロスリージョン書き込みのテスト", "desc": "ap-northeast-2から書き込み、us-east-1へのレプリケーションを確認してください。"},
            ],
            "explanation": "DynamoDBグローバルテーブルはマルチリージョンのアクティブ-アクティブレプリケーションを提供します。どのリージョンからも書き込みを受け付け、変更は数秒以内に伝播します。異なるリージョンでの同時書き込みは最後書き込み優先のセマンティクスを使用します。DynamoDB Streamsが必要です。",
        },
    },
    14: {
        "en": {
            "title": "RES-14 Reduce S3 Costs with Lifecycle Policy",
            "scenario": "Log files are piling up in S3 Standard. Files older than 30 days are rarely accessed. Set a Lifecycle policy to automatically transition to cheaper storage classes.",
            "steps": [
                {"title": "Check Current Storage Usage", "desc": "Check the total size and object count of the bucket."},
                {"title": "Add Lifecycle Rule", "desc": "Set transitions to S3-IA at 30 days, Glacier at 90 days."},
                {"title": "Verify Lifecycle Rule", "desc": "Confirm the lifecycle rule is enabled."},
                {"title": "Enable Storage Class Analysis", "desc": "Enable access-pattern analysis for data-driven decisions."},
            ],
            "explanation": "S3 Lifecycle policies automatically move objects to cheaper storage classes or delete them. S3-IA saves ~58% vs Standard; Glacier saves ~80% vs S3-IA. Note S3-IA has a 128 KB minimum object size and 30-day minimum storage charge.",
        },
        "ja": {
            "title": "RES-14 S3ライフサイクルポリシーでコスト削減",
            "scenario": "S3 Standardにログファイルが蓄積しています。30日以上経過したファイルはほとんどアクセスされません。ライフサイクルポリシーを設定して自動的に安価なストレージクラスに移行してください。",
            "steps": [
                {"title": "現在のストレージ使用量の確認", "desc": "バケットの総サイズとオブジェクト数を確認してください。"},
                {"title": "ライフサイクルルールの追加", "desc": "30日後にS3-IA、90日後にGlacierへの移行を設定してください。"},
                {"title": "ライフサイクルルールの確認", "desc": "ライフサイクルルールが有効であることを確認してください。"},
                {"title": "ストレージクラス分析の有効化", "desc": "データに基づいた意思決定のためのアクセスパターン分析を有効にしてください。"},
            ],
            "explanation": "S3ライフサイクルポリシーはオブジェクトを自動的に安価なストレージクラスに移動または削除します。S3-IAはStandardより約58%節約でき、GlacierはS3-IAより約80%節約できます。S3-IAには128KBの最小オブジェクトサイズと30日の最小保存料金があることに注意してください。",
        },
    },
    15: {
        "en": {
            "title": "RES-15 Auto-Replace Failed EC2 Instances",
            "scenario": "When an EC2 instance fails its system status check it must be restarted manually. Set up a CloudWatch alarm to trigger an automatic reboot or recover action.",
            "steps": [
                {"title": "Create System Status Check Alarm", "desc": "Create an alarm for EC2 StatusCheckFailed_System."},
                {"title": "Add Auto-Recover Action", "desc": "Add an automatic recover action to the alarm."},
                {"title": "Test Recovery", "desc": "Verify the alarm triggers an EC2 recover action."},
                {"title": "Check Recovery History", "desc": "Review CloudWatch alarm history for past recovery events."},
            ],
            "explanation": "EC2 Recover migrates the instance to new hardware while preserving the instance ID, IP, and EBS volumes. It works for StatusCheckFailed_System (hardware failures) but not StatusCheckFailed_Instance. For ASG-managed instances, health checks handle termination and replacement automatically.",
        },
        "ja": {
            "title": "RES-15 EC2障害インスタンスの自動置換",
            "scenario": "EC2インスタンスがシステムステータスチェックに失敗したとき、手動で再起動しなければなりません。CloudWatchアラームを設定して自動的に再起動または回復アクションをトリガーしてください。",
            "steps": [
                {"title": "システムステータスチェックアラームの作成", "desc": "EC2 StatusCheckFailed_Systemのアラームを作成してください。"},
                {"title": "自動回復アクションの追加", "desc": "アラームに自動回復アクションを追加してください。"},
                {"title": "回復のテスト", "desc": "アラームがEC2回復アクションをトリガーすることを確認してください。"},
                {"title": "回復履歴の確認", "desc": "CloudWatchアラーム履歴で過去の回復イベントを確認してください。"},
            ],
            "explanation": "EC2 Recoverはインスタンスを新しいハードウェアに移行しながら、インスタンスID、IP、EBSボリュームを維持します。StatusCheckFailed_System（ハードウェア障害）には機能しますが、StatusCheckFailed_Instanceには機能しません。ASG管理インスタンスでは、ヘルスチェックが終了と置換を自動的に処理します。",
        },
    },
    16: {
        "en": {
            "title": "RES-16 Deploy ECS Fargate Service",
            "scenario": "Container deployments currently require managing EC2 instances. Move to ECS Fargate to run containers without server management, and configure an ALB for traffic distribution.",
            "steps": [
                {"title": "Create ECS Cluster", "desc": "Create an ECS cluster for Fargate workloads."},
                {"title": "Register Task Definition", "desc": "Define the container image, CPU, and memory in a task definition."},
                {"title": "Create ECS Service", "desc": "Deploy the task as a service with ALB integration."},
                {"title": "Verify Service Status", "desc": "Confirm the desired and running task counts match."},
            ],
            "explanation": "Fargate eliminates the need to manage EC2 infrastructure. Task definitions specify CPU and memory; Fargate allocates the right size automatically. ECS Service integrates with ALB and CloudWatch for load distribution and monitoring.",
        },
        "ja": {
            "title": "RES-16 ECS Fargateサービスのデプロイ",
            "scenario": "コンテナのデプロイに現在はEC2インスタンスの管理が必要です。ECS Fargateに移行してサーバー管理なしでコンテナを実行し、ALBでトラフィックを分散してください。",
            "steps": [
                {"title": "ECSクラスターの作成", "desc": "Fargateワークロード用のECSクラスターを作成してください。"},
                {"title": "タスク定義の登録", "desc": "コンテナイメージ、CPU、メモリをタスク定義で定義してください。"},
                {"title": "ECSサービスの作成", "desc": "ALB統合でタスクをサービスとしてデプロイしてください。"},
                {"title": "サービスの状態確認", "desc": "希望するタスク数と実行中のタスク数が一致することを確認してください。"},
            ],
            "explanation": "FargateはEC2インフラの管理を不要にします。タスク定義でCPUとメモリを指定すると、Fargateが適切なサイズを自動的に割り当てます。ECSサービスはALBとCloudWatchと統合し、負荷分散と監視を行います。",
        },
    },
    17: {
        "en": {
            "title": "RES-17 Enable ELB Access Logs",
            "scenario": "There is an ongoing intermittent 5xx error but no request logs to diagnose it. Enable ALB access logs stored in S3 to analyze request patterns and identify problem sources.",
            "steps": [
                {"title": "Create Log S3 Bucket", "desc": "Create an S3 bucket to store ALB access logs."},
                {"title": "Set Bucket Policy", "desc": "Grant the ALB service account permission to write logs."},
                {"title": "Enable Access Logs", "desc": "Enable access logs on the ALB pointing to the S3 bucket."},
                {"title": "Verify Log Files", "desc": "Confirm log files are being created in S3."},
            ],
            "explanation": "ALB access logs capture every request including client IP, latency, response code, and target response. Log delivery is best-effort (not guaranteed). Query logs with Athena for efficient analysis. Enable S3 lifecycle to manage log retention costs.",
        },
        "ja": {
            "title": "RES-17 ELBアクセスログの有効化",
            "scenario": "断続的な5xxエラーが発生していますが、診断するためのリクエストログがありません。S3に保存されるALBアクセスログを有効にして、リクエストパターンを分析し問題の原因を特定してください。",
            "steps": [
                {"title": "ログ用S3バケットの作成", "desc": "ALBアクセスログを保存するS3バケットを作成してください。"},
                {"title": "バケットポリシーの設定", "desc": "ALBサービスアカウントにログ書き込み権限を付与してください。"},
                {"title": "アクセスログの有効化", "desc": "ALBでS3バケットへのアクセスログを有効にしてください。"},
                {"title": "ログファイルの確認", "desc": "S3にログファイルが作成されていることを確認してください。"},
            ],
            "explanation": "ALBアクセスログはクライアントIP、レイテンシ、レスポンスコード、ターゲットレスポンスを含むすべてのリクエストをキャプチャします。ログ配信はベストエフォートです（保証されていません）。効率的な分析のためにAthenaでログをクエリしてください。",
        },
    },
    18: {
        "en": {
            "title": "RES-18 Automate Tasks with EventBridge Scheduler",
            "scenario": "A nightly DB cleanup job runs on a cron expression in a Lambda function, but the function needs to be triggered somehow. Use EventBridge Scheduler to trigger it automatically every day at midnight.",
            "steps": [
                {"title": "Create EventBridge Schedule", "desc": "Create a cron schedule that triggers Lambda at midnight daily."},
                {"title": "Grant Lambda Invoke Permission", "desc": "Grant EventBridge permission to invoke the Lambda function."},
                {"title": "Verify Schedule", "desc": "Confirm the schedule is enabled and connected to Lambda."},
                {"title": "Check CloudWatch Logs", "desc": "Verify the Lambda function executed at the scheduled time."},
            ],
            "explanation": "EventBridge Scheduler supports cron and rate expressions for scheduled invocations. Unlike CloudWatch Events (now part of EventBridge), the Scheduler is dedicated to scheduling with finer granularity. Set a DLQ on the schedule for retry and failure handling.",
        },
        "ja": {
            "title": "RES-18 EventBridgeスケジューラーによるタスク自動化",
            "scenario": "夜間のDBクリーンアップジョブはLambda関数のcron式で実行されますが、何らかの方法でトリガーする必要があります。EventBridgeスケジューラーを使用して毎日午前0時に自動的にトリガーしてください。",
            "steps": [
                {"title": "EventBridgeスケジュールの作成", "desc": "毎日深夜にLambdaをトリガーするcronスケジュールを作成してください。"},
                {"title": "Lambda呼び出し権限の付与", "desc": "EventBridgeにLambda関数を呼び出す権限を付与してください。"},
                {"title": "スケジュールの確認", "desc": "スケジュールが有効でLambdaに接続されていることを確認してください。"},
                {"title": "CloudWatchログの確認", "desc": "Lambda関数がスケジュールされた時間に実行されたことを確認してください。"},
            ],
            "explanation": "EventBridgeスケジューラーはスケジュールされた呼び出しのためのcronとrate式をサポートします。スケジュールにDLQを設定することでリトライと障害処理を行えます。",
        },
    },
    19: {
        "en": {
            "title": "RES-19 SNS Fan-Out Pattern",
            "scenario": "When an order is placed, inventory update, email notification, and analytics recording must all happen simultaneously. Use SNS fan-out to publish once and trigger multiple SQS queues in parallel.",
            "steps": [
                {"title": "Create SNS Topic", "desc": "Create an SNS topic for order events."},
                {"title": "Create Processing Queues", "desc": "Create SQS queues for inventory, email, and analytics."},
                {"title": "Subscribe Queues to Topic", "desc": "Subscribe all three SQS queues to the SNS topic."},
                {"title": "Test Fan-Out with Test Message", "desc": "Publish a test message and verify delivery to all queues."},
            ],
            "explanation": "The SNS fan-out pattern decouples publishers from subscribers. A single SNS publish triggers all subscribers simultaneously. Each SQS queue processes independently and can fail without affecting others. This pattern improves scalability and resilience.",
        },
        "ja": {
            "title": "RES-19 SNSファンアウトパターンの設定",
            "scenario": "注文が入ると、在庫更新、メール通知、分析記録をすべて同時に行う必要があります。SNSファンアウトを使用して1回のパブリッシュで複数のSQSキューを並行してトリガーしてください。",
            "steps": [
                {"title": "SNSトピックの作成", "desc": "注文イベント用のSNSトピックを作成してください。"},
                {"title": "処理キューの作成", "desc": "在庫、メール、分析用のSQSキューを作成してください。"},
                {"title": "キューをトピックにサブスクライブ", "desc": "3つのSQSキューすべてをSNSトピックにサブスクライブしてください。"},
                {"title": "テストメッセージでファンアウトをテスト", "desc": "テストメッセージをパブリッシュしてすべてのキューへの配信を確認してください。"},
            ],
            "explanation": "SNSファンアウトパターンはパブリッシャーとサブスクライバーを分離します。単一のSNSパブリッシュがすべてのサブスクライバーを同時にトリガーします。各SQSキューは独立して処理し、他に影響を与えずに失敗できます。このパターンはスケーラビリティとレジリエンスを向上させます。",
        },
    },
    20: {
        "en": {
            "title": "RES-20 CloudFront Cache Invalidation and Deployment",
            "scenario": "After deploying a new version of the website, users still see the old cached content. Invalidate the CloudFront cache to force all edge locations to fetch the latest version.",
            "steps": [
                {"title": "Check Current Distribution", "desc": "Check the current CloudFront distribution ID and status."},
                {"title": "Create Cache Invalidation", "desc": "Invalidate all cached objects (/*)."},
                {"title": "Monitor Invalidation Progress", "desc": "Track the invalidation status until it completes."},
                {"title": "Verify New Content", "desc": "Confirm the updated content is served from edge locations."},
            ],
            "explanation": "CloudFront cache invalidation removes objects from all edge caches so the next request fetches a fresh copy from origin. Wildcard invalidations (/*) count as one request. For frequent deployments, use versioned file names instead to avoid invalidation costs.",
        },
        "ja": {
            "title": "RES-20 CloudFrontキャッシュの無効化とデプロイ",
            "scenario": "新しいバージョンのWebサイトをデプロイした後も、ユーザーには古いキャッシュコンテンツが表示されます。CloudFrontキャッシュを無効化してすべてのエッジロケーションに最新バージョンを強制的に取得させてください。",
            "steps": [
                {"title": "現在のディストリビューションの確認", "desc": "現在のCloudFrontディストリビューションIDとステータスを確認してください。"},
                {"title": "キャッシュ無効化の作成", "desc": "すべてのキャッシュオブジェクト（/*）を無効化してください。"},
                {"title": "無効化の進行状況の監視", "desc": "完了するまで無効化のステータスを追跡してください。"},
                {"title": "新しいコンテンツの確認", "desc": "更新されたコンテンツがエッジロケーションから配信されていることを確認してください。"},
            ],
            "explanation": "CloudFrontキャッシュ無効化はすべてのエッジキャッシュからオブジェクトを削除し、次のリクエストでオリジンから新しいコピーを取得させます。ワイルドカード無効化（/*）は1リクエストとしてカウントされます。頻繁なデプロイには、無効化コストを避けるためにバージョン付きファイル名を使用してください。",
        },
    },
    21: {
        "en": {
            "title": "RES-21 Scale Kinesis Data Stream Throughput",
            "scenario": "WriteProvisionedThroughputExceeded errors are occurring on the Kinesis stream. Increase shards from 2 to 4 to double the write throughput.",
            "steps": [
                {"title": "Check Current Stream Status", "desc": "Verify the current shard count and stream status."},
                {"title": "Increase Shard Count", "desc": "Scale the stream from 2 to 4 shards."},
                {"title": "Verify Scale Completion", "desc": "Confirm the new shard count is active."},
                {"title": "Set Write Throttle Alarm", "desc": "Create a CloudWatch alarm for write throttling recurrence."},
            ],
            "explanation": "Each Kinesis shard supports 1 MB/s write (1000 records/s) and 2 MB/s read. Shard scaling via UNIFORM_SCALING only supports doubling. Design partition keys for even distribution across shards to avoid hot shards.",
        },
        "ja": {
            "title": "RES-21 Kinesis Data Stream処理量の拡張",
            "scenario": "KinesisストリームでWriteProvisionedThroughputExceededエラーが発生しています。シャード数を2から4に増やして書き込みスループットを2倍にしてください。",
            "steps": [
                {"title": "現在のストリーム状態の確認", "desc": "現在のシャード数とストリームステータスを確認してください。"},
                {"title": "シャード数の増加", "desc": "ストリームを2シャードから4シャードにスケールしてください。"},
                {"title": "スケール完了の確認", "desc": "新しいシャード数がアクティブであることを確認してください。"},
                {"title": "書き込みスロットルアラームの設定", "desc": "書き込みスロットリングの再発を検出するCloudWatchアラームを作成してください。"},
            ],
            "explanation": "各Kinesisシャードは1MB/s書き込み（1000レコード/秒）と2MB/s読み取りをサポートします。UNIFORM_SCALINGによるシャードスケーリングは2倍単位のみです。ホットシャードを避けるために、シャード間で均等に分散するパーティションキーを設計してください。",
        },
    },
    22: {
        "en": {
            "title": "RES-22 Point-in-Time Restore with RDS Snapshot",
            "scenario": "A developer accidentally deleted important data. Restore the RDS instance to the point just before the deletion using an automated snapshot.",
            "steps": [
                {"title": "List Available Snapshots", "desc": "Find automated snapshots from before the data deletion."},
                {"title": "Restore to New Instance", "desc": "Restore a snapshot to a new RDS instance."},
                {"title": "Verify Restored Data", "desc": "Confirm the restored instance contains the data."},
                {"title": "Update Application Endpoint", "desc": "Update the app configuration to point to the restored DB."},
            ],
            "explanation": "RDS automated snapshots enable point-in-time recovery up to 5 minutes before the current time (with transaction logs). Restore always creates a NEW instance — the original is unaffected. After verifying data, update the connection string or rename the instance.",
        },
        "ja": {
            "title": "RES-22 RDSスナップショットによる特定時点への復元",
            "scenario": "開発者が重要なデータを誤って削除しました。自動スナップショットを使用してデータ削除直前の時点にRDSインスタンスを復元してください。",
            "steps": [
                {"title": "利用可能なスナップショットの一覧", "desc": "データ削除前の自動スナップショットを探してください。"},
                {"title": "新しいインスタンスへの復元", "desc": "スナップショットを新しいRDSインスタンスに復元してください。"},
                {"title": "復元データの確認", "desc": "復元されたインスタンスにデータが含まれていることを確認してください。"},
                {"title": "アプリケーションエンドポイントの更新", "desc": "復元されたDBを指すようにアプリの設定を更新してください。"},
            ],
            "explanation": "RDS自動スナップショットは現在時刻の5分前まで（トランザクションログ付き）のポイントインタイムリカバリを可能にします。復元は常に新しいインスタンスを作成し、元のインスタンスには影響しません。データを確認後、接続文字列を更新するかインスタンスの名前を変更してください。",
        },
    },
    23: {
        "en": {
            "title": "RES-23 Lambda Error Handling and Retry Configuration",
            "scenario": "Lambda processes messages from SQS but temporary errors cause retry storms. Configure a DLQ, set retry limits, and add error monitoring.",
            "steps": [
                {"title": "Configure Lambda DLQ", "desc": "Set a DLQ on the Lambda function for failed invocations."},
                {"title": "Set Max Retry Attempts", "desc": "Set maximum retry attempts to 2 for the Lambda function."},
                {"title": "Add Error Rate Alarm", "desc": "Create a CloudWatch alarm for Lambda error rate."},
                {"title": "Verify DLQ Delivery", "desc": "Confirm failed events are routed to the DLQ."},
            ],
            "explanation": "Lambda has built-in retry with exponential backoff for asynchronous invocations. Setting a DLQ (or Dead-Letter destination) captures events that exceed the retry limit. Monitor Error / Invocations ratio with CloudWatch and alert when above 5%.",
        },
        "ja": {
            "title": "RES-23 Lambdaエラー処理とリトライ設定",
            "scenario": "LambdaがSQSからメッセージを処理していますが、一時的なエラーによりリトライストームが発生しています。DLQを設定し、リトライ制限を設けてエラー監視を追加してください。",
            "steps": [
                {"title": "Lambda DLQの設定", "desc": "失敗した呼び出し用のDLQをLambda関数に設定してください。"},
                {"title": "最大リトライ回数の設定", "desc": "Lambda関数の最大リトライ回数を2に設定してください。"},
                {"title": "エラーレートアラームの追加", "desc": "Lambdaエラーレート用のCloudWatchアラームを作成してください。"},
                {"title": "DLQ配信の確認", "desc": "失敗したイベントがDLQにルーティングされていることを確認してください。"},
            ],
            "explanation": "Lambdaは非同期呼び出しに指数バックオフを使用した組み込みリトライを持っています。DLQ（またはデッドレター宛先）を設定することで、リトライ制限を超えたイベントをキャプチャします。CloudWatchでError / Invocations比率を監視し、5%を超えたらアラートを出してください。",
        },
    },
    24: {
        "en": {
            "title": "RES-24 CodeDeploy Blue/Green Deployment",
            "scenario": "Deployments currently cause downtime. Use CodeDeploy blue/green deployment to switch traffic instantly with zero downtime and enable instant rollback.",
            "steps": [
                {"title": "Create CodeDeploy Application", "desc": "Create a CodeDeploy application for EC2/On-premises."},
                {"title": "Create Deployment Group", "desc": "Set up a blue/green deployment group with ALB."},
                {"title": "Create Deployment", "desc": "Deploy the new version using a blue/green deployment."},
                {"title": "Verify Traffic Switch", "desc": "Confirm traffic has switched to the new (green) fleet."},
            ],
            "explanation": "Blue/Green deployment spins up a new fleet (green) and switches ALB traffic instantly. If issues are detected the ALB routes back to the original fleet (blue) within seconds. The blue fleet is kept for a retention period before termination.",
        },
        "ja": {
            "title": "RES-24 CodeDeployブルー/グリーンデプロイ",
            "scenario": "デプロイ時にダウンタイムが発生しています。CodeDeployのブルー/グリーンデプロイを使用してゼロダウンタイムで即座にトラフィックを切り替え、即時ロールバックを可能にしてください。",
            "steps": [
                {"title": "CodeDeployアプリケーションの作成", "desc": "EC2/オンプレミス用のCodeDeployアプリケーションを作成してください。"},
                {"title": "デプロイグループの作成", "desc": "ALBを使用したブルー/グリーンデプロイグループを設定してください。"},
                {"title": "デプロイの作成", "desc": "ブルー/グリーンデプロイを使用して新しいバージョンをデプロイしてください。"},
                {"title": "トラフィック切り替えの確認", "desc": "トラフィックが新しい（グリーン）フリートに切り替わったことを確認してください。"},
            ],
            "explanation": "ブルー/グリーンデプロイは新しいフリート（グリーン）を起動し、ALBトラフィックを即座に切り替えます。問題が検出された場合、ALBは数秒以内に元のフリート（ブルー）にルーティングします。ブルーフリートは終了前に保持期間維持されます。",
        },
    },
    25: {
        "en": {
            "title": "RES-25 API Gateway + Lambda Throttling",
            "scenario": "A sudden API burst causes Lambda concurrency exhaustion and downstream DB overload. Configure API Gateway throttling and Lambda reserved concurrency to protect the system.",
            "steps": [
                {"title": "Check Current API Usage", "desc": "Check recent request rates and error rates."},
                {"title": "Set Stage-Level Throttle", "desc": "Set rate=1000/s and burst=2000 on the prod stage."},
                {"title": "Set Lambda Reserved Concurrency", "desc": "Limit the API Lambda to 200 concurrent executions."},
                {"title": "Verify Throttle with Usage Plan", "desc": "Check that 429 responses are returned when limits are hit."},
            ],
            "explanation": "API Gateway throttling rate limits requests at the stage or method level. Rate is the steady-state requests per second; burst is the maximum spike requests. Lambda Reserved Concurrency acts as a second layer of protection. Clients should implement exponential backoff on 429 responses.",
        },
        "ja": {
            "title": "RES-25 API Gateway + Lambdaスロットリング設定",
            "scenario": "突然のAPIバーストがLambda同時実行を使い果たし、ダウンストリームDBが過負荷になります。API Gatewayスロットリング設定とLambda予約済み同時実行数でシステムを保護してください。",
            "steps": [
                {"title": "現在のAPI使用状況の確認", "desc": "最近のリクエストレートとエラーレートを確認してください。"},
                {"title": "ステージレベルのスロットル設定", "desc": "prodステージにrate=1000/s、burst=2000を設定してください。"},
                {"title": "Lambda予約済み同時実行数の設定", "desc": "API Lambda を200同時実行に制限してください。"},
                {"title": "使用量プランでスロットルの確認", "desc": "制限に達したときに429レスポンスが返されることを確認してください。"},
            ],
            "explanation": "API Gatewayスロットリングはステージまたはメソッドレベルでリクエストをレート制限します。rateは1秒あたりの定常リクエスト数、burstは最大スパイクリクエスト数です。クライアントは429レスポンスに対して指数バックオフを実装してください。",
        },
    },
    26: {
        "en": {
            "title": "RES-26 Aurora Serverless for Variable Traffic",
            "scenario": "Database load varies wildly — near zero at night and very high during the day. Migrate to Aurora Serverless v2 to automatically scale capacity without manual intervention.",
            "steps": [
                {"title": "Check Current Aurora Config", "desc": "Check the current Aurora instance class and capacity."},
                {"title": "Create Aurora Serverless v2 Cluster", "desc": "Create a new Aurora cluster with Serverless v2 capacity."},
                {"title": "Set Scaling Configuration", "desc": "Set min=0.5 ACU, max=16 ACU for auto-scaling."},
                {"title": "Verify Auto-Scaling", "desc": "Monitor ACU consumption to confirm auto-scaling."},
            ],
            "explanation": "Aurora Serverless v2 scales in fine-grained increments (0.5 ACU) within seconds. It is cost-effective for variable traffic — you pay only for what you use. It integrates with Multi-AZ and read replicas for high availability.",
        },
        "ja": {
            "title": "RES-26 Aurora Serverlessによる可変トラフィック対応",
            "scenario": "データベース負荷が大きく変動します—夜間はほぼゼロ、日中は非常に高い。Aurora Serverless v2に移行して手動介入なしで容量を自動スケールしてください。",
            "steps": [
                {"title": "現在のAurora設定の確認", "desc": "現在のAuroraインスタンスクラスとキャパシティを確認してください。"},
                {"title": "Aurora Serverless v2クラスターの作成", "desc": "Serverless v2キャパシティで新しいAuroraクラスターを作成してください。"},
                {"title": "スケーリング設定の構成", "desc": "自動スケーリングのmin=0.5 ACU、max=16 ACUを設定してください。"},
                {"title": "自動スケーリングの確認", "desc": "ACU消費量を監視して自動スケーリングを確認してください。"},
            ],
            "explanation": "Aurora Serverless v2は数秒以内に細かい単位（0.5 ACU）でスケールします。可変トラフィックにはコスト効率が高く、使用した分だけ支払います。高可用性のためにMulti-AZとリードレプリカと統合されています。",
        },
    },
    27: {
        "en": {
            "title": "RES-27 Configure CloudWatch Dashboard",
            "scenario": "There is no single view of service health — teams check different consoles during incidents. Build a CloudWatch dashboard showing ALB latency, Lambda errors, RDS CPU, and cache hit rate.",
            "steps": [
                {"title": "Create Dashboard", "desc": "Create a new CloudWatch dashboard."},
                {"title": "Add ALB Latency Widget", "desc": "Add a metric widget for ALB TargetResponseTime."},
                {"title": "Add Lambda Error Rate Widget", "desc": "Add a widget for Lambda Errors and Invocations."},
                {"title": "Verify Dashboard", "desc": "Confirm all widgets are displaying data."},
            ],
            "explanation": "CloudWatch dashboards aggregate metrics from multiple services into one view. Use metric math to calculate rates (Errors/Invocations). Share dashboards with teams or embed in wikis using snapshot URLs. Automatic refresh intervals keep data current during incidents.",
        },
        "ja": {
            "title": "RES-27 CloudWatchダッシュボードの設定",
            "scenario": "サービスの健全性を一目で確認できる場所がなく、インシデント中にチームが異なるコンソールを確認しています。ALBレイテンシ、Lambdaエラー、RDS CPU、キャッシュヒット率を表示するCloudWatchダッシュボードを構築してください。",
            "steps": [
                {"title": "ダッシュボードの作成", "desc": "新しいCloudWatchダッシュボードを作成してください。"},
                {"title": "ALBレイテンシウィジェットの追加", "desc": "ALB TargetResponseTimeのメトリクスウィジェットを追加してください。"},
                {"title": "Lambdaエラーレートウィジェットの追加", "desc": "LambdaのErrorsとInvocationsのウィジェットを追加してください。"},
                {"title": "ダッシュボードの確認", "desc": "すべてのウィジェットにデータが表示されていることを確認してください。"},
            ],
            "explanation": "CloudWatchダッシュボードは複数サービスのメトリクスを1つのビューに集約します。メトリクス計算でレート（Errors/Invocations）を計算できます。スナップショットURLを使用してチームとダッシュボードを共有したりWikiに埋め込んだりできます。",
        },
    },
    28: {
        "en": {
            "title": "RES-28 Secure Access with Systems Manager Session Manager",
            "scenario": "SSH access uses a shared key pair and a bastion host that must be managed. Replace with SSM Session Manager for keyless, auditable, and VPN-free shell access.",
            "steps": [
                {"title": "Attach SSM IAM Role to EC2", "desc": "Attach the AmazonSSMManagedInstanceCore policy to the instance role."},
                {"title": "Verify SSM Agent Status", "desc": "Confirm the SSM agent is online for the instance."},
                {"title": "Start Session Manager Session", "desc": "Open a shell session using Session Manager."},
                {"title": "Check Session Logs in CloudWatch", "desc": "Verify session activity is logged to CloudWatch Logs."},
            ],
            "explanation": "Session Manager provides browser-based and CLI shell access without open inbound ports, bastion hosts, or SSH keys. All sessions are logged to CloudWatch Logs or S3 for audit. Requires SSM Agent (pre-installed on Amazon Linux 2023 / Ubuntu) and internet or VPC endpoint access to SSM.",
        },
        "ja": {
            "title": "RES-28 Systems Manager Session Managerによる安全なアクセス",
            "scenario": "SSHアクセスが共有キーペアと管理が必要なBastionホストを使用しています。SSM Session Managerに置き換えて、キーなし、監査可能、VPNフリーのシェルアクセスを実現してください。",
            "steps": [
                {"title": "EC2にSSM IAMロールを付与", "desc": "AmazonSSMManagedInstanceCoreポリシーをインスタンスロールに付与してください。"},
                {"title": "SSMエージェントの状態確認", "desc": "インスタンスのSSMエージェントがオンラインであることを確認してください。"},
                {"title": "Session Managerセッションの開始", "desc": "Session Managerを使用してシェルセッションを開いてください。"},
                {"title": "CloudWatchのセッションログ確認", "desc": "セッションアクティビティがCloudWatch Logsに記録されていることを確認してください。"},
            ],
            "explanation": "Session Managerは受信ポートの開放、Bastionホスト、SSHキーなしにブラウザベースおよびCLIシェルアクセスを提供します。すべてのセッションは監査のためにCloudWatch LogsまたはS3に記録されます。SSMエージェント（Amazon Linux 2023 / Ubuntuにプリインストール）とSSMへのインターネットまたはVPCエンドポイントアクセスが必要です。",
        },
    },
    29: {
        "en": {
            "title": "RES-29 Maintain IP During EC2 Replacement with Elastic IP",
            "scenario": "When an EC2 instance is replaced the public IP changes and DNS must be updated. Assign an Elastic IP to the new instance to keep the same public IP address.",
            "steps": [
                {"title": "Allocate Elastic IP", "desc": "Allocate a new Elastic IP address."},
                {"title": "Associate EIP with Instance", "desc": "Attach the EIP to the EC2 instance."},
                {"title": "Verify EIP Association", "desc": "Confirm the EIP is attached and reachable."},
                {"title": "Test Reassociation on Replacement", "desc": "Detach from the old instance and attach to the new one."},
            ],
            "explanation": "Elastic IPs are static IPv4 addresses that can be instantly remapped to any instance in the same region. This enables blue/green-style instance replacement without DNS TTL delays. Unattached EIPs incur hourly charges — always release unused ones.",
        },
        "ja": {
            "title": "RES-29 Elastic IPによるインスタンス交換時のIP維持",
            "scenario": "EC2インスタンスが置き換えられるとパブリックIPが変わり、DNSを更新しなければなりません。新しいインスタンスにElastic IPを割り当てて同じパブリックIPアドレスを維持してください。",
            "steps": [
                {"title": "Elastic IPの割り当て", "desc": "新しいElastic IPアドレスを割り当ててください。"},
                {"title": "インスタンスへのEIP関連付け", "desc": "EIPをEC2インスタンスに関連付けてください。"},
                {"title": "EIP関連付けの確認", "desc": "EIPが関連付けられてアクセス可能であることを確認してください。"},
                {"title": "交換時の再関連付けテスト", "desc": "古いインスタンスからデタッチし、新しいインスタンスに関連付けてください。"},
            ],
            "explanation": "Elastic IPは同じリージョン内の任意のインスタンスに即座に再マッピングできる静的IPv4アドレスです。これにより、DNS TTL遅延なしにブルー/グリーン方式のインスタンス置換が可能になります。未接続のEIPは時間課金が発生します—未使用のものは常に解放してください。",
        },
    },
    30: {
        "en": {
            "title": "RES-30 Disaster Recovery Simulation — Regional Failure Response",
            "scenario": "A simulated us-east-1 regional failure has occurred. Execute the DR runbook: verify backup region resources, start standby instances, switch DNS, and confirm service recovery.",
            "steps": [
                {"title": "Check Backup Region Resources", "desc": "Verify EC2, RDS, and networking in ap-northeast-2."},
                {"title": "Start Standby RDS Instance", "desc": "Start the standby DB in the backup region."},
                {"title": "Update Route 53 DNS", "desc": "Switch the DNS record to the backup region endpoint."},
                {"title": "Verify Service Recovery", "desc": "Confirm the service is healthy in the backup region."},
            ],
            "explanation": "DR procedures: verify backup region resources → start instances/DB → switch DNS → verify service. To minimize RTO, keep DR instances as warm standby and configure Route 53 automatic failover. RTO is the target recovery time; RPO is the acceptable data loss window.",
        },
        "ja": {
            "title": "RES-30 障害復旧シミュレーション — リージョン障害対応",
            "scenario": "us-east-1のリージョン障害が発生したシミュレーションです。DRランブックを実行してください：バックアップリージョンのリソース確認、スタンバイインスタンスの起動、DNS切り替え、サービス回復の確認。",
            "steps": [
                {"title": "バックアップリージョンのリソース確認", "desc": "ap-northeast-2のEC2、RDS、ネットワークを確認してください。"},
                {"title": "スタンバイRDSインスタンスの起動", "desc": "バックアップリージョンのスタンバイDBを起動してください。"},
                {"title": "Route 53 DNSの更新", "desc": "DNSレコードをバックアップリージョンのエンドポイントに切り替えてください。"},
                {"title": "サービス回復の確認", "desc": "バックアップリージョンでサービスが正常であることを確認してください。"},
            ],
            "explanation": "DR手順：バックアップリージョンのリソース確認→インスタンス/DB起動→DNS切り替え→サービス確認。RTOを最小化するには、DRインスタンスをウォームスタンバイとして維持し、Route 53の自動フェイルオーバーを設定してください。RTOは目標復旧時間、RPOは許容データ損失ウィンドウです。",
        },
    },
}


def build_i18n_block(data: dict) -> str:
    """Build the i18n TypeScript literal for one challenge."""
    lines = ["    i18n: {"]
    for lang in ("en", "ja"):
        d = data[lang]
        lines.append(f"      {lang}: {{")
        lines.append(f"        title: {repr(d['title'])},")
        lines.append(f"        scenario: {repr(d['scenario'])},")
        lines.append(f"        steps: [")
        for s in d["steps"]:
            lines.append(f"          {{ title: {repr(s['title'])}, desc: {repr(s['desc'])} }},")
        lines.append(f"        ],")
        lines.append(f"        explanation: {repr(d['explanation'])},")
        lines.append(f"      }},")
    lines.append("    },")
    return "\n".join(lines)


def inject_i18n_into_src(src: str) -> str:
    """Inject i18n blocks after each RES explanation line."""
    for num, data in RES_I18N.items():
        i18n_block = build_i18n_block(data)
        # Find the unique explanation line for this challenge
        # Pattern: look for id: 'RES-NN' section, then its explanation closing
        # We find the explanation line, then the closing },  of that entry
        # Safer: find `    id: 'RES-XX'` then find the NEXT `  },` that ends an entry
        cid = f"'RES-{num:02d}'"
        id_idx = src.find(f"    id: {cid}")
        if id_idx == -1:
            print(f"WARNING: could not find {cid}")
            continue
        # Already has i18n?
        next_entry_end = src.find("\n  },\n", id_idx)
        if next_entry_end == -1:
            next_entry_end = src.find("\n};\n", id_idx)  # last entry
        if next_entry_end == -1:
            print(f"WARNING: could not find end of entry for {cid}")
            continue
        chunk = src[id_idx:next_entry_end]
        if "i18n:" in chunk:
            print(f"  {cid} already has i18n, skipping")
            continue
        # Find explanation line within chunk
        expl_pos = chunk.rfind("    explanation: '")
        if expl_pos == -1:
            expl_pos = chunk.rfind('    explanation: "')
        if expl_pos == -1:
            print(f"WARNING: no explanation line for {cid}")
            continue
        # Find the end of that explanation line
        expl_line_end = chunk.find("\n", expl_pos) + 1
        # Insert i18n after explanation line
        new_chunk = chunk[:expl_line_end] + i18n_block + "\n" + chunk[expl_line_end:]
        src = src[:id_idx] + new_chunk + src[id_idx + len(chunk):]
        print(f"  Injected i18n for {cid}")
    return src


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────
with open(TARGET, 'r', encoding='utf-8') as f:
    src = f.read()

# 1. Interface patch
if "ChalStepI18n" not in src:
    src = src.replace(OLD_IFACE, NEW_IFACE, 1)
    print("Patched interfaces")
else:
    print("Interfaces already patched")

# 2. ConsolePanel useLocale wiring
if "chalTitle" not in src:
    src = src.replace(OLD_CONSOLE_FN, NEW_CONSOLE_FN, 1)
    print("Wired useLocale into ConsolePanel")
else:
    print("ConsolePanel already wired")

# 3. Rendering patches
for old, new in RENDER_PATCHES[:4]:
    if old in src and old != new:
        src = src.replace(old, new, 1)
        print(f"  Patched render: ...{old[:60]}...")

# 4. History step title patches
if OLD_HIST1 in src:
    src = src.replace(OLD_HIST1, NEW_HIST1, 1)
    print("Patched history step 1")
if OLD_HIST2 in src:
    src = src.replace(OLD_HIST2, NEW_HIST2, 1)
    print("Patched history step 2")

# 5. Explanation render patch
if OLD_IFACE[:10] not in src or "chalExpl" not in src:
    expl_old = "<div style={{ color: '#8b949e', fontSize: '12px', lineHeight: 1.6 }}>{scenario.explanation}</div>"
    expl_new = "<div style={{ color: '#8b949e', fontSize: '12px', lineHeight: 1.6 }}>{chalExpl(scenario)}</div>"
    if expl_old in src:
        src = src.replace(expl_old, expl_new, 1)
        print("Patched explanation render")

# 6. Inject i18n into RES challenges
print("Injecting i18n translations into RES challenges...")
src = inject_i18n_into_src(src)

# 7. Check useLocale import
if "import { useLocale }" not in src:
    # Find the LocaleContext import and add useLocale
    old_import = "import { LocaleProvider } from './LocaleContext';"
    new_import = "import { LocaleProvider, useLocale } from './LocaleContext';"
    if old_import in src:
        src = src.replace(old_import, new_import, 1)
        print("Added useLocale to import")
    else:
        # Try other patterns
        for pat in ["from './LocaleContext'", 'from "./LocaleContext"']:
            if pat in src:
                # Get the full import line
                imp_start = src.rfind("import", 0, src.find(pat))
                imp_end = src.find("\n", src.find(pat))
                old_line = src[imp_start:imp_end]
                if "useLocale" not in old_line:
                    new_line = old_line.replace(" }", ", useLocale }")
                    src = src.replace(old_line, new_line, 1)
                    print(f"Added useLocale to import line")
                break

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(src)

print("\nDone.")
