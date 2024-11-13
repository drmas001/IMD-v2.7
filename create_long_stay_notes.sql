-- Create long_stay_notes table with proper relationships
CREATE TABLE IF NOT EXISTS long_stay_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_patient_id ON long_stay_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_created_by ON long_stay_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_created_at ON long_stay_notes(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_long_stay_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_long_stay_notes_updated_at
    BEFORE UPDATE ON long_stay_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_long_stay_notes_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON long_stay_notes TO authenticated;
GRANT USAGE ON SEQUENCE long_stay_notes_id_seq TO authenticated;