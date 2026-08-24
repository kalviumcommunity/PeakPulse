-- =========================================================================
-- PeakPulse Phase 8: Performance Indexing & Query Optimizations
-- =========================================================================

-- 1. Composite index for Zone + Order Time + SLA Breach filtering
-- Accelerates multi-zone breach filtering and timeline aggregations
CREATE INDEX IF NOT EXISTS idx_deliveries_zone_order_time_sla 
ON deliveries(zone, order_time, is_sla_violated);

-- 2. Composite index for Restaurant SLA Bottleneck queries
-- Accelerates merchant kitchen latency and SLA violation grouping
CREATE INDEX IF NOT EXISTS idx_deliveries_restaurant_sla 
ON deliveries(restaurant_id, is_sla_violated, order_time);

-- 3. Composite index for Rider Performance and Rating analytics
-- Accelerates courier transit times and on-time percentage calculations
CREATE INDEX IF NOT EXISTS idx_deliveries_rider_sla 
ON deliveries(rider_id, is_sla_violated, actual_delivery_time);

-- 4. Partial index for SLA Breached Deliveries only
-- High-speed index specifically indexing only late orders (skips 85%+ on-time rows)
CREATE INDEX IF NOT EXISTS idx_deliveries_breached_only 
ON deliveries(zone, order_time) 
WHERE is_sla_violated = true;

-- 5. Covering index for Zone Analytical Aggregations
-- Includes delay_minutes and order_value directly in index leaf nodes
CREATE INDEX IF NOT EXISTS idx_deliveries_zone_analytics 
ON deliveries(zone, is_sla_violated, delay_minutes, order_value);

-- 6. Composite index on Rider Assignments for dispatch latency tracking
CREATE INDEX IF NOT EXISTS idx_rider_assignments_delay_perf 
ON rider_assignments(delivery_id, rider_id, assigned_at, assignment_delay_minutes);

-- 7. Composite index on Customer Complaints by delivery, type, and severity
CREATE INDEX IF NOT EXISTS idx_complaints_composite_perf 
ON complaints(delivery_id, complaint_type, severity, filed_at);

-- 8. Composite index on Refunds by delivery and processed timestamp
CREATE INDEX IF NOT EXISTS idx_refunds_composite_perf 
ON refunds(delivery_id, approved, processed_at);

-- 9. Composite index on Users for active session authentication
CREATE INDEX IF NOT EXISTS idx_users_email_active 
ON users(email, is_active);
