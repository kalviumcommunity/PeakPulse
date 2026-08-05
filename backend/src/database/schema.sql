-- PeakPulse Database Schema

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'analyst',
    avatar VARCHAR(500),
    age INTEGER,
    gender VARCHAR(20),
    height DECIMAL(5, 2),
    weight DECIMAL(5, 2),
    fitness_goal VARCHAR(50),
    activity_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    zone VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    average_prep_time INTEGER DEFAULT 20,
    rating DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Riders table
CREATE TABLE IF NOT EXISTS riders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    vehicle_type VARCHAR(50),
    zone VARCHAR(100),
    rating DECIMAL(3, 2),
    status VARCHAR(50) DEFAULT 'active',
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    restaurant_id INTEGER REFERENCES restaurants(id),
    rider_id INTEGER REFERENCES riders(id),
    order_time TIMESTAMP NOT NULL,
    promised_delivery_time TIMESTAMP NOT NULL,
    actual_delivery_time TIMESTAMP,
    order_value DECIMAL(10, 2),
    delivery_distance DECIMAL(6, 2),
    status VARCHAR(50) DEFAULT 'pending',
    is_sla_violated BOOLEAN DEFAULT false,
    delay_minutes INTEGER DEFAULT 0,
    zone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rider assignments table
CREATE TABLE IF NOT EXISTS rider_assignments (
    id SERIAL PRIMARY KEY,
    delivery_id INTEGER REFERENCES deliveries(id) ON DELETE CASCADE,
    rider_id INTEGER REFERENCES riders(id),
    assigned_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    reached_restaurant_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    assignment_delay_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    delivery_id INTEGER REFERENCES deliveries(id),
    customer_id INTEGER REFERENCES customers(id),
    complaint_type VARCHAR(100),
    complaint_text TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    filed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id SERIAL PRIMARY KEY,
    delivery_id INTEGER REFERENCES deliveries(id),
    customer_id INTEGER REFERENCES customers(id),
    refund_amount DECIMAL(10, 2),
    refund_reason VARCHAR(255),
    refund_type VARCHAR(50),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_time ON deliveries(order_time);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_zone ON deliveries(zone);
CREATE INDEX IF NOT EXISTS idx_deliveries_sla_violated ON deliveries(is_sla_violated);
CREATE INDEX IF NOT EXISTS idx_rider_assignments_delivery ON rider_assignments(delivery_id);
CREATE INDEX IF NOT EXISTS idx_complaints_delivery ON complaints(delivery_id);
CREATE INDEX IF NOT EXISTS idx_refunds_delivery ON refunds(delivery_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add check constraints for user profile fields
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_age_positive') THEN
    ALTER TABLE users ADD CONSTRAINT check_age_positive CHECK (age IS NULL OR age > 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_height_positive') THEN
    ALTER TABLE users ADD CONSTRAINT check_height_positive CHECK (height IS NULL OR height > 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_weight_positive') THEN
    ALTER TABLE users ADD CONSTRAINT check_weight_positive CHECK (weight IS NULL OR weight > 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_gender_valid') THEN
    ALTER TABLE users ADD CONSTRAINT check_gender_valid 
    CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_fitness_goal_valid') THEN
    ALTER TABLE users ADD CONSTRAINT check_fitness_goal_valid 
    CHECK (fitness_goal IS NULL OR fitness_goal IN ('weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'general_fitness'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_activity_level_valid') THEN
    ALTER TABLE users ADD CONSTRAINT check_activity_level_valid 
    CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'));
  END IF;
END $$;
