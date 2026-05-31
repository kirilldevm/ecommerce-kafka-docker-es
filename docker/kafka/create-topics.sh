#!/bin/bash
set -euo pipefail

BOOTSTRAP_SERVER="${KAFKA_BOOTSTRAP_SERVER:-kafka:29092}"

TOPICS=(
  "orders"
  "payments"
  "order.status.updated"
  "orders.DLQ"
  "order-stats"
)

echo "Creating Kafka topics on ${BOOTSTRAP_SERVER}..."

for topic in "${TOPICS[@]}"; do
  kafka-topics \
    --bootstrap-server "${BOOTSTRAP_SERVER}" \
    --create \
    --if-not-exists \
    --topic "${topic}" \
    --partitions 1 \
    --replication-factor 1
  echo "  ✓ ${topic}"
done

echo "Done."
