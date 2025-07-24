CREATE TABLE IF NOT EXISTS website_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_website_content_updated_at ON website_content;
CREATE TRIGGER update_website_content_updated_at BEFORE UPDATE
    ON website_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO website_content (key, value, category) VALUES
('heroTitle', 'Bhatta Mitra™ - Digital Platform for Brick Kiln Industry', 'landing'),
('heroSubtitle', 'A professional landing page for Bhatta Mitra™, a free digital platform connecting brick kiln owners with stakeholders', 'landing'),
('countdownTitle', 'Platform Unlocked', 'landing'),
('countdownDescription', 'We are excited to announce that Bhatta Mitra™ will be launching on April 30, 2025. Join our waitlist to be among the first to access our platform.', 'landing'),
('countdownLaunchMessage', 'LAUNCHED ON 30TH APRIL 2025, BRICK KILN OWNERS (BKOs) CAN FILL UP THE ONBOARDING FORM TO JOIN OUR MEMBERSHIP WAITINGLIST', 'landing'),
('countdownPlatformUnlocked', 'UNLOCKED OUR DIGITAL PLATFORM SERVICES FOR ALL STAKEHOLDERS. PLEASE CONTACT US TO JOIN OUR UNIQUE PLATFORM.', 'landing'),
('servicesTitle', 'Our Services', 'services'),
('servicesDescription', 'Comprehensive solutions for the brick kiln industry', 'services'),
('freeServicesTitle', 'Free Services', 'services'),
('freeServicesDescription', 'Available to all registered users', 'services'),
('exclusiveServicesTitle', 'Exclusive Services', 'services'),
('exclusiveServicesDescription', 'Limited availability premium services', 'services'),
('freeServiceItem1', 'Buy e-ENT dashboard for Red Brick Buyers', 'services'),
('freeServiceItem2', 'List of certified Coal/Fuel and Transport providers', 'services'),
('freeServiceItem3', 'Labor recruitment reports and forms and real-time fraud alerts', 'services'),
('freeServiceItem4', 'Digital resource management', 'services'),
('freeServiceItem5', 'Basic stakeholder communication tools', 'services'),
('freeServiceItem6', 'Industry updates and news', 'services'),
('freeServiceItem7', 'Blogs and resources for innovative and new technologies', 'services'),
('exclusiveServiceItem1', 'Free services plus', 'services'),
('exclusiveServiceItem2', 'Access to bulk sales orders', 'services'),
('exclusiveServiceItem3', 'Advanced analytics and reporting', 'services'),
('exclusiveServiceItem4', 'Priority access to new features', 'services'),
('exclusiveServiceItem5', 'Dedicated support team', 'services'),
('exclusiveServiceItem6', 'Customized solutions for your business', 'services'),
('exclusiveServiceItem7', 'Marketing and brand building', 'services'),
('exclusiveServiceNote', 'Fill up our Questionnaire- Join the waitlist now!', 'services'),
('aboutTitle', 'About Bhatta Mitra™', 'about'),
('aboutDescription1', 'Bhatta Mitra™, a friend in your need - a free digital platform to connect Pan India brick kiln owners with end customers of red bricks, fuel and transport and other service providers and to prevent labor fraud as well as to bring innovation.', 'about'),
('aboutDescription2', 'Bhatta Mitra™, a friend in your need - a free digital platform to connect Pan India brick kiln owners with end customers of red bricks, fuel and transport and other service providers, to prevent labor fraud and for innovation in the industry', 'about'),
('blogTitle', 'Blogs & Resources', 'blog'),
('blogSubtitle', 'Latest news and updates from Bhatta Mitra™', 'blog'),
('blogAboutTitle', 'About Our Blog', 'blog'),
('blogAboutDescription', 'Stay updated with the latest news, innovations, and insights from the brick kiln industry.', 'blog'),
('waitlistTitle', 'Join Our Waitlist', 'waitlist'),
('waitlistDescription', 'Fill out the onboarding form below to be among the first to access Bhatta Mitra™ - a friend in your need when we launch on April 30, 2025.', 'waitlist'),
('reachUsTitle', 'Reach Us', 'reach-us'),
('reachUsSubtitle', 'Get in touch with us. We are here to help and answer any questions you might have.', 'reach-us'),
('reachUsContactInfo', 'Contact Information', 'reach-us'),
('reachUsEmail', 'Email', 'reach-us'),
('reachUsPhone', 'Phone', 'reach-us'),
('reachUsAddress', 'Address', 'reach-us'),
('reachUsHours', 'Business Hours', 'reach-us'),
('reachUsFollowUs', 'Follow Us', 'reach-us'),
('reachUsSendMessage', 'Send us a Message', 'reach-us'),
('reachUsFirstName', 'First Name', 'reach-us'),
('reachUsLastName', 'Last Name', 'reach-us'),
('reachUsSubject', 'Subject', 'reach-us'),
('reachUsMessage', 'Message', 'reach-us'),
('contactEmail', 'BHATTAMITRA@PROTONMAIL.COM', 'contact'),
('contactPhone', '+918008009560', 'contact'),
('contactAddress', 'SAHARANPUR, UTTAR PRADESH (UP), INDIA 247232', 'contact'),
('businessHours', 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed', 'contact'),
('navAboutUs', 'About Us', 'navigation'),
('navEentMarket', 'e-ENT BAZAAR', 'navigation'),
('navServices', 'Services', 'navigation'),
('navJoinWaitlist', 'Join Waitlist', 'navigation'),
('navBlog', 'Blogs & Resources', 'navigation'),
('navReachUs', 'Reach Us', 'navigation'),
('headerLoginDashboard', 'Login Dashboard', 'navigation'),
('headerDashboardBrickKilnOwners', 'Brick Kiln Owners', 'navigation'),
('headerDashboardCoalProviders', 'Coal/Fuel Providers', 'navigation'),
('headerDashboardTransportProviders', 'Transport Providers', 'navigation'),
('headerDashboardServiceProviders', 'Service/Product Providers', 'navigation'),
('headerDashboardLabour', 'Labour', 'navigation'),
('footerDescription', 'A free digital platform for brick kiln owners and stakeholders. A friend in your need.', 'footer'),
('footerQuickLinks', 'Quick Links', 'footer'),
('footerContact', 'Contact', 'footer'),
('footerFollowUs', 'Follow Us', 'footer'),
('footerCopyright', 'All rights reserved.', 'footer')
ON CONFLICT (key) DO NOTHING;

alter publication supabase_realtime add table website_content;