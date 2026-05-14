# Redis 노드 주소 - Lambda 가 연결 시 사용
# - num_cache_nodes=1 이므로 cache_nodes[0] 의 address 를 가져옴
output "redis_endpoint" {
  description = "Redis primary node address."
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

# Redis 포트 (기본 6379)
output "redis_port" {
  description = "Redis port."
  value       = aws_elasticache_cluster.main.port
}

# Redis 클러스터 식별자
output "redis_cluster_id" {
  description = "ElastiCache cluster identifier."
  value       = aws_elasticache_cluster.main.cluster_id
}
