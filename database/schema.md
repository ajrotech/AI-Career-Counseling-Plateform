# Database Schema Design

## Overview
The Career Counseling Platform uses PostgreSQL as the primary database. The schema is designed to support:
- User management with role-based access
- Career assessments with flexible question types
- Mentor-student booking system
- Payment and subscription management
- Personalized career roadmaps
- Learning resources and progress tracking

## Core Tables

### 1. Users Table
Stores all platform users (students, mentors, admins)

### 2. User Profiles Table
Extended profile information for users

### 3. Mentors Table
Additional information specific to mentors

### 4. Assessments Table
Career assessment definitions

### 5. Assessment Questions Table
Questions for each assessment type

### 6. Assessment Results Table
User assessment responses and scores

### 7. Bookings Table
Mentor-student session bookings

### 8. Payments Table
Payment transactions and billing

### 9. Subscriptions Table
User subscription management

### 10. Career Roadmaps Table
Personalized career paths

### 11. Roadmap Steps Table
Individual steps in career roadmaps

### 12. Resources Table
Learning materials and articles

### 13. User Progress Table
Tracking user progress through roadmaps

### 14. Notifications Table
System notifications and messages

## Relationships

```
Users (1) --> (1) UserProfiles
Users (1) --> (0..1) Mentors
Users (1) --> (0..*) AssessmentResults
Users (1) --> (0..*) Bookings (as student)
Mentors (1) --> (0..*) Bookings (as mentor)
Users (1) --> (0..*) Payments
Users (1) --> (0..1) Subscriptions
Users (1) --> (0..*) CareerRoadmaps
Users (1) --> (0..*) UserProgress
Assessments (1) --> (0..*) AssessmentQuestions
Assessments (1) --> (0..*) AssessmentResults
CareerRoadmaps (1) --> (0..*) RoadmapSteps
Resources (1) --> (0..*) UserProgress
```

## Indexes and Constraints

### Primary Indexes
- All tables have UUID primary keys
- Unique constraints on email, username
- Foreign key constraints for referential integrity

### Performance Indexes
- Users: email, username, role, created_at
- Bookings: mentor_id, student_id, status, scheduled_at
- Payments: user_id, status, created_at
- AssessmentResults: user_id, assessment_id, created_at

### Full-Text Search
- Resources: title, description, content
- Mentors: bio, expertise_areas
- Users: first_name, last_name

## Data Types and Constraints

### Common Patterns
- UUIDs for all primary keys
- Timestamps (created_at, updated_at) on all tables
- Soft delete support with deleted_at
- JSON columns for flexible metadata
- Enum types for status fields

### Security Considerations
- Password hashing (bcrypt)
- Sensitive data encryption
- Audit trails for critical operations
- Row-level security for multi-tenancy