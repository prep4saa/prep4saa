# -------------------------------------------------------------------
# VPC 본체
# - DNS 호스트네임 활성화 (RDS 엔드포인트가 DNS 이름으로 작동하려면 필수)
# -------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = var.vpc_name
  }
}

# -------------------------------------------------------------------
# Internet Gateway
# - Public 서브넷이 인터넷과 통신할 수 있도록 함
# -------------------------------------------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.vpc_name}-igw"
  }
}

# -------------------------------------------------------------------
# Public 서브넷 (10.0.1.0/24, 10.0.2.0/24)
# - 용도: ALB, NAT Gateway (필요 시)
# - map_public_ip_on_launch=true → 자동 Public IP 할당
# -------------------------------------------------------------------
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.vpc_name}-public-${var.availability_zones[count.index]}"
    Tier = "public"
  }
}

# -------------------------------------------------------------------
# Private App 서브넷 (10.0.10.0/24, 10.0.11.0/24)
# - 용도: Lambda, ECS, EC2 같은 애플리케이션 레이어
# - 외부 인터넷 직접 접근 불가
# -------------------------------------------------------------------
resource "aws_subnet" "private_app" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.vpc_name}-private-app-${var.availability_zones[count.index]}"
    Tier = "private-app"
  }
}

# -------------------------------------------------------------------
# Private Data 서브넷 (10.0.20.0/24, 10.0.21.0/24)
# - 용도: RDS, ElastiCache 같은 데이터 레이어
# - 가장 보호 수준 높음, 외부 인터넷 접근 절대 불가
# - 멀티 AZ로 RDS 고가용성 확보
# -------------------------------------------------------------------
resource "aws_subnet" "private_data" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.vpc_name}-private-data-${var.availability_zones[count.index]}"
    Tier = "private-data"
  }
}

# -------------------------------------------------------------------
# Public 라우팅 테이블
# - 0.0.0.0/0 → Internet Gateway 로 라우팅
# -------------------------------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.vpc_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# -------------------------------------------------------------------
# Private 라우팅 테이블 (App + Data 공용)
# - 외부 인터넷 라우트 없음 → 격리됨
# - 필요 시 NAT Gateway 또는 VPC Endpoint로 외부 접근 가능
# -------------------------------------------------------------------
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.vpc_name}-private-rt"
  }
}

resource "aws_route_table_association" "private_app" {
  count = length(aws_subnet.private_app)

  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_data" {
  count = length(aws_subnet.private_data)

  subnet_id      = aws_subnet.private_data[count.index].id
  route_table_id = aws_route_table.private.id
}

# -------------------------------------------------------------------
# VPC Endpoint - S3 (Gateway 타입, 무료)
# - Lambda 가 NAT 없이 S3 접근 가능
# -------------------------------------------------------------------
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = {
    Name = "${var.vpc_name}-s3-endpoint"
  }
}

# -------------------------------------------------------------------
# VPC Endpoint - DynamoDB (Gateway 타입, 무료)
# - Lambda 가 NAT 없이 DynamoDB 접근 가능
# -------------------------------------------------------------------
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = {
    Name = "${var.vpc_name}-dynamodb-endpoint"
  }
}
