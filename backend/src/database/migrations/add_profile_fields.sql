-- Migration to add profile fields to users table
-- Run this if your database already exists

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS height DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS fitness_goal VARCHAR(50),
ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add check constraints for data validation
ALTER TABLE users
ADD CONSTRAINT check_age_positive CHECK (age IS NULL OR age > 0),
ADD CONSTRAINT check_height_positive CHECK (height IS NULL OR height > 0),
ADD CONSTRAINT check_weight_positive CHECK (weight IS NULL OR weight > 0),
ADD CONSTRAINT check_gender_valid CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD CONSTRAINT check_fitness_goal_valid CHECK (fitness_goal IS NULL OR fitness_goal IN ('weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'general_fitness')),
ADD CONSTRAINT check_activity_level_valid CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'));
