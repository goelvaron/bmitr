CREATE TABLE IF NOT EXISTS inquiry_response_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES manufacturer_coal_inquiries(id) ON DELETE CASCADE,
  coal_provider_id UUID NOT NULL REFERENCES coal_providers(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  response_type VARCHAR(50) DEFAULT 'text_response',
  response_number INTEGER NOT NULL DEFAULT 1,
  responded_by VARCHAR(100),
  is_current_response BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_response_history_inquiry_id ON inquiry_response_history(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_response_history_coal_provider_id ON inquiry_response_history(coal_provider_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_response_history_manufacturer_id ON inquiry_response_history(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_response_history_is_current ON inquiry_response_history(is_current_response);

alter publication supabase_realtime add table inquiry_response_history;
