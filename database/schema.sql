-- Career Counseling Platform Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin', 'institution_admin');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired');
CREATE TYPE assessment_type AS ENUM ('aptitude', 'personality', 'interest', 'skills');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'scale', 'text', 'boolean');
CREATE TYPE notification_type AS ENUM ('booking', 'payment', 'assessment', 'roadmap', 'system');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    oauth_providers JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 2. User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender gender,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    education_level VARCHAR(100),
    current_occupation VARCHAR(200),
    profile_picture_url TEXT,
    bio TEXT,
    interests TEXT[],
    languages TEXT[] DEFAULT ARRAY['English'],
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mentors Table
CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expertise_areas TEXT[] NOT NULL,
    years_of_experience INTEGER,
    current_company VARCHAR(200),
    current_position VARCHAR(200),
    education_background TEXT,
    certifications TEXT[],
    hourly_rate DECIMAL(10,2),
    availability JSONB, -- {"monday": ["09:00-17:00"], "tuesday": [...]}
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_sessions INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB,
    specializations TEXT[],
    languages_spoken TEXT[] DEFAULT ARRAY['English'],
    calendar_integration JSONB, -- Zoom, Google Calendar settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Assessments Table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type assessment_type NOT NULL,
    instructions TEXT,
    time_limit_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(10) DEFAULT '1.0',
    scoring_algorithm JSONB, -- Algorithm details for automatic scoring
    category VARCHAR(100),
    difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Assessment Questions Table
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB, -- For multiple choice: [{"value": "A", "text": "Option A"}, ...]
    correct_answer VARCHAR(255), -- For aptitude tests
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    metadata JSONB, -- Additional question-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Assessment Results Table
CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- {"question_id": "answer", ...}
    raw_score INTEGER,
    percentage_score DECIMAL(5,2),
    category_scores JSONB, -- {"logical": 85, "numerical": 90, ...}
    personality_traits JSONB, -- For personality assessments
    recommendations TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_minutes INTEGER,
    started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES mentors(user_id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status booking_status DEFAULT 'pending',
    meeting_url TEXT,
    meeting_id VARCHAR(100),
    meeting_password VARCHAR(50),
    notes TEXT,
    mentor_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    mentor_feedback TEXT,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    subscription_id UUID, -- Will reference subscriptions table
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50), -- 'stripe_card', 'paypal', etc.
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    transaction_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refunded_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50), -- 'monthly', 'yearly', 'lifetime'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status subscription_status DEFAULT 'active',
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    features JSONB, -- Available features for this subscription
    usage_limits JSONB, -- Monthly limits, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for payments -> subscriptions
ALTER TABLE payments ADD CONSTRAINT fk_payment_subscription 
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);

-- 10. Career Roadmaps Table
CREATE TABLE career_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_career VARCHAR(200),
    estimated_duration_months INTEGER,
    difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
    is_custom BOOLEAN DEFAULT false, -- true if personalized for user
    is_public BOOLEAN DEFAULT false, -- can be shared with other users
    tags TEXT[],
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    created_by UUID REFERENCES users(id), -- mentor or admin who created template
    based_on_assessment UUID REFERENCES assessment_results(id),
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Roadmap Steps Table
CREATE TABLE roadmap_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    step_type VARCHAR(50), -- 'skill', 'certification', 'project', 'course'
    order_index INTEGER NOT NULL,
    estimated_duration_weeks INTEGER,
    resources JSONB, -- Links to courses, articles, etc.
    requirements TEXT[],
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    notes TEXT,
    mentor_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Resources Table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    resource_type VARCHAR(50), -- 'article', 'video', 'course', 'book', 'tool'
    url TEXT,
    author VARCHAR(200),
    difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
    estimated_read_time_minutes INTEGER,
    tags TEXT[],
    category VARCHAR(100),
    is_premium BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. User Progress Table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roadmap_step_id UUID REFERENCES roadmap_steps(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    notes TEXT,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_progress_reference CHECK (
        (roadmap_step_id IS NOT NULL AND resource_id IS NULL) OR
        (roadmap_step_id IS NULL AND resource_id IS NOT NULL)
    )
);

-- 14. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Institutions Table (for bulk licensing)
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100), -- 'school', 'university', 'company'
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    admin_user_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    license_seats INTEGER,
    license_expires_at TIMESTAMP,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Institution Members Table
CREATE TABLE institution_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(institution_id, user_id)
);

-- 17. Chat Sessions Table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    context TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Chat Messages Table  
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_mentors_user_id ON mentors(user_id);
CREATE INDEX idx_mentors_expertise ON mentors USING GIN(expertise_areas);
CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_career_roadmaps_user_id ON career_roadmaps(user_id);
CREATE INDEX idx_roadmap_steps_roadmap_id ON roadmap_steps(roadmap_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_is_active ON chat_sessions(is_active);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Full-text search indexes
CREATE INDEX idx_resources_search ON resources USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_mentors_bio_search ON mentors USING GIN(to_tsvector('english', COALESCE(user_profiles.first_name, '') || ' ' || COALESCE(user_profiles.last_name, '') || ' ' || COALESCE(mentors.expertise_areas::text, ''))) 
    WHERE mentors.user_id = user_profiles.user_id;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_questions_updated_at BEFORE UPDATE ON assessment_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_roadmaps_updated_at BEFORE UPDATE ON career_roadmaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roadmap_steps_updated_at BEFORE UPDATE ON roadmap_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analytics Tables

-- User Sessions Table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    duration_seconds INTEGER DEFAULT 0,
    pages_visited TEXT[],
    actions_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Events Table
CREATE TYPE analytics_event_type AS ENUM (
    'page_view', 'button_click', 'form_submit', 'assessment_start', 
    'assessment_complete', 'chat_message', 'mentor_booking', 
    'resource_view', 'download', 'search', 'login', 'logout', 'registration'
);

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    event_type analytics_event_type NOT NULL,
    event_category VARCHAR(100),
    event_action VARCHAR(100),
    event_label VARCHAR(100),
    event_value INTEGER,
    page_url TEXT,
    page_title VARCHAR(255),
    referrer TEXT,
    properties JSONB,
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Engagement Metrics Table
CREATE TABLE user_engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 0,
    actions_taken INTEGER DEFAULT 0,
    assessments_started INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,
    chat_messages_sent INTEGER DEFAULT 0,
    mentor_sessions_booked INTEGER DEFAULT 0,
    resources_viewed INTEGER DEFAULT 0,
    downloads_made INTEGER DEFAULT 0,
    search_queries INTEGER DEFAULT 0,
    feature_usage JSONB,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    retention_indicator BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, metric_date)
);

-- Add triggers for analytics tables
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_engagement_metrics_updated_at BEFORE UPDATE ON user_engagement_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for analytics performance
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_start ON user_sessions(session_start);
CREATE INDEX idx_user_engagement_user_date ON user_engagement_metrics(user_id, metric_date);
CREATE INDEX idx_user_engagement_date ON user_engagement_metrics(metric_date);
CREATE INDEX idx_user_engagement_score ON user_engagement_metrics(engagement_score);