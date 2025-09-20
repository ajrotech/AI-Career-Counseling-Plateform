-- Seed data for Career Counseling Platform
-- This file contains initial data for development and testing

-- Insert sample assessments
INSERT INTO assessments (id, title, description, type, instructions, time_limit_minutes, scoring_algorithm, category) VALUES
(uuid_generate_v4(), 'Logical Reasoning Assessment', 'Test your logical and analytical thinking skills', 'aptitude', 'Answer all questions to the best of your ability. Each question has only one correct answer.', 45, '{"total_questions": 20, "scoring_method": "weighted", "categories": ["logical", "analytical"]}', 'reasoning'),
(uuid_generate_v4(), 'Numerical Aptitude Test', 'Evaluate your mathematical and numerical problem-solving abilities', 'aptitude', 'Solve mathematical problems and data interpretation questions.', 60, '{"total_questions": 25, "scoring_method": "simple", "categories": ["numerical", "data_analysis"]}', 'mathematics'),
(uuid_generate_v4(), 'Big Five Personality Assessment', 'Discover your personality traits based on the Big Five model', 'personality', 'Rate each statement based on how accurately it describes you.', 30, '{"dimensions": ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"], "scoring_method": "likert_scale"}', 'personality'),
(uuid_generate_v4(), 'Career Interest Inventory', 'Identify your career interests and preferences', 'interest', 'Indicate your level of interest in various activities and career fields.', 25, '{"categories": ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"], "scoring_method": "holland_codes"}', 'interests');

-- Insert sample resources
INSERT INTO resources (id, title, description, content, resource_type, url, author, difficulty_level, estimated_read_time_minutes, tags, category, is_premium) VALUES
(uuid_generate_v4(), 'Introduction to Software Engineering', 'A comprehensive guide to software engineering principles and practices', 'Software engineering is a systematic approach to the design, development, and maintenance of software systems...', 'article', 'https://example.com/software-engineering-intro', 'Tech Expert', 2, 15, ARRAY['software', 'engineering', 'programming'], 'Technology', false),
(uuid_generate_v4(), 'Data Science Career Path', 'Complete roadmap for becoming a data scientist', 'Data science combines statistics, programming, and domain expertise to extract insights from data...', 'article', 'https://example.com/data-science-path', 'Data Guru', 3, 20, ARRAY['data science', 'analytics', 'career'], 'Data Science', false),
(uuid_generate_v4(), 'Resume Writing Masterclass', 'Learn how to create compelling resumes that get noticed', 'Your resume is often the first impression you make on potential employers...', 'video', 'https://example.com/resume-masterclass', 'Career Coach', 1, 45, ARRAY['resume', 'job search', 'career'], 'Career Development', true),
(uuid_generate_v4(), 'Interview Preparation Guide', 'Comprehensive guide to acing your job interviews', 'Successful interviewing requires preparation, practice, and confidence...', 'article', 'https://example.com/interview-guide', 'HR Professional', 2, 25, ARRAY['interview', 'job search', 'skills'], 'Career Development', false);

-- Insert sample admin user
INSERT INTO users (id, email, username, password_hash, role, is_active, email_verified) VALUES
(uuid_generate_v4(), 'admin@careercounseling.com', 'admin', '$2b$10$CwTycUXWue0Thq9StjUM0uBYz7Dp.P3vy3VN1t9.TpL/w0s0w0s0w', 'admin', true, true);

-- Get the admin user ID for profile creation
DO $$
DECLARE 
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@careercounseling.com';
    
    -- Insert admin profile
    INSERT INTO user_profiles (user_id, first_name, last_name, bio, languages) VALUES
    (admin_user_id, 'System', 'Administrator', 'Platform administrator responsible for managing the career counseling platform.', ARRAY['English', 'Urdu']);
END $$;

-- Insert sample subscription plans data (this would typically be managed through Stripe)
INSERT INTO subscriptions (id, user_id, plan_name, plan_type, amount, status, features, usage_limits) 
SELECT 
    uuid_generate_v4(),
    id,
    'Free Plan',
    'monthly',
    0.00,
    'active',
    '{"assessments": true, "basic_roadmaps": true, "mentor_sessions": false, "premium_content": false}',
    '{"assessments_per_month": 3, "mentor_sessions_per_month": 0}'
FROM users 
WHERE role = 'student';

-- Insert sample career roadmap templates
INSERT INTO career_roadmaps (id, title, description, target_career, estimated_duration_months, difficulty_level, is_public, tags, prerequisites, learning_outcomes) VALUES
(uuid_generate_v4(), 'Full-Stack Web Developer', 'Complete roadmap to become a full-stack web developer', 'Full-Stack Developer', 12, 3, true, 
 ARRAY['web development', 'programming', 'frontend', 'backend'], 
 ARRAY['Basic computer skills', 'Problem-solving mindset'], 
 ARRAY['Master HTML, CSS, JavaScript', 'Learn React/Vue.js', 'Understand backend development', 'Database management', 'Deploy applications']),
(uuid_generate_v4(), 'Data Scientist', 'Path to becoming a professional data scientist', 'Data Scientist', 18, 4, true, 
 ARRAY['data science', 'machine learning', 'statistics', 'python'], 
 ARRAY['Mathematics background', 'Basic programming knowledge'], 
 ARRAY['Statistical analysis', 'Machine learning algorithms', 'Data visualization', 'Big data tools', 'Business intelligence']),
(uuid_generate_v4(), 'Digital Marketing Specialist', 'Career path in digital marketing', 'Digital Marketing Specialist', 8, 2, true, 
 ARRAY['marketing', 'digital', 'social media', 'analytics'], 
 ARRAY['Basic marketing understanding', 'Communication skills'], 
 ARRAY['SEO/SEM mastery', 'Social media marketing', 'Content marketing', 'Analytics and reporting', 'Marketing automation']);

-- Insert sample institutions
INSERT INTO institutions (id, name, type, contact_email, license_seats, license_expires_at) VALUES
(uuid_generate_v4(), 'Punjab Engineering College', 'university', 'admin@pec.edu.pk', 1000, '2025-12-31'),
(uuid_generate_v4(), 'Tech High School', 'school', 'principal@techhs.edu', 500, '2025-06-30'),
(uuid_generate_v4(), 'Innovation Corp', 'company', 'hr@innovationcorp.com', 200, '2025-12-31');

-- Create some sample assessment questions for the logical reasoning test
DO $$
DECLARE 
    assessment_id UUID;
BEGIN
    SELECT id INTO assessment_id FROM assessments WHERE title = 'Logical Reasoning Assessment';
    
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
    (assessment_id, 'If all roses are flowers and some flowers are red, which statement must be true?', 'multiple_choice', 
     '[{"value": "A", "text": "All roses are red"}, {"value": "B", "text": "Some roses might be red"}, {"value": "C", "text": "No roses are red"}, {"value": "D", "text": "All red things are roses"}]', 
     'B', 2, 1),
    (assessment_id, 'Complete the sequence: 2, 6, 12, 20, 30, ?', 'multiple_choice', 
     '[{"value": "A", "text": "40"}, {"value": "B", "text": "42"}, {"value": "C", "text": "44"}, {"value": "D", "text": "46"}]', 
     'B', 2, 2),
    (assessment_id, 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?', 'multiple_choice', 
     '[{"value": "A", "text": "5 minutes"}, {"value": "B", "text": "20 minutes"}, {"value": "C", "text": "100 minutes"}, {"value": "D", "text": "500 minutes"}]', 
     'A', 3, 3);
END $$;

-- Create sample personality assessment questions
DO $$
DECLARE 
    assessment_id UUID;
BEGIN
    SELECT id INTO assessment_id FROM assessments WHERE title = 'Big Five Personality Assessment';
    
    INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, order_index) VALUES
    (assessment_id, 'I am outgoing and sociable', 'scale', 
     '[{"value": "1", "text": "Strongly Disagree"}, {"value": "2", "text": "Disagree"}, {"value": "3", "text": "Neutral"}, {"value": "4", "text": "Agree"}, {"value": "5", "text": "Strongly Agree"}]', 1),
    (assessment_id, 'I am systematic and organized', 'scale', 
     '[{"value": "1", "text": "Strongly Disagree"}, {"value": "2", "text": "Disagree"}, {"value": "3", "text": "Neutral"}, {"value": "4", "text": "Agree"}, {"value": "5", "text": "Strongly Agree"}]', 2),
    (assessment_id, 'I am open to new experiences', 'scale', 
     '[{"value": "1", "text": "Strongly Disagree"}, {"value": "2", "text": "Disagree"}, {"value": "3", "text": "Neutral"}, {"value": "4", "text": "Agree"}, {"value": "5", "text": "Strongly Agree"}]', 3);
END $$;