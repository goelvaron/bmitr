-- Create admin access logs table for security monitoring
CREATE TABLE IF NOT EXISTS admin_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'BLOCKED', 'LOGOUT')),
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration INTEGER, -- in minutes, for successful logins
    failure_reason TEXT, -- for failed attempts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_email ON admin_access_logs(email);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_timestamp ON admin_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_status ON admin_access_logs(status);

-- Enable realtime for admin monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE admin_access_logs;

-- Create admin users table for authorized administrators
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    blocked_until TIMESTAMP WITH TIME ZONE
);

-- Insert default admin users
INSERT INTO admin_users (email, name, phone, role) VALUES 
('admin@bhattamitra.com', 'System Administrator', '+918008009560', 'super_admin'),
('support@bhattamitra.com', 'Support Team', '+918008009560', 'admin'),
('tech@bhattamitra.com', 'Technical Team', '+918008009560', 'admin'),
('dev@bhattamitra.com', 'Development Team', '+918008009560', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Enable realtime for admin users
ALTER PUBLICATION supabase_realtime ADD TABLE admin_users;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_users table
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create security policies (RLS disabled by default as requested)
-- These tables should only be accessible by authenticated admin users
-- In a production environment, you might want to enable RLS and create appropriate policies

-- Create view for admin access statistics
CREATE OR REPLACE VIEW admin_access_stats AS
SELECT 
    email,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_logins,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_attempts,
    COUNT(CASE WHEN status = 'BLOCKED' THEN 1 END) as blocked_attempts,
    MAX(timestamp) as last_attempt,
    MAX(CASE WHEN status = 'SUCCESS' THEN timestamp END) as last_successful_login
FROM admin_access_logs
GROUP BY email
ORDER BY last_attempt DESC;

-- Grant necessary permissions (adjust as needed based on your setup)
-- GRANT SELECT, INSERT ON admin_access_logs TO authenticated;
-- GRANT SELECT ON admin_users TO authenticated;
-- GRANT SELECT ON admin_access_stats TO authenticated;
