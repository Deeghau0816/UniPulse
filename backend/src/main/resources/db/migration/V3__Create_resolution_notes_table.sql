-- Create resolution_notes table
CREATE TABLE resolution_notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    notes TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_resolution_notes_ticket_id (ticket_id),
    INDEX idx_resolution_notes_created_by (created_by),
    INDEX idx_resolution_notes_created_at (created_at)
);

-- Add comments for documentation
ALTER TABLE resolution_notes COMMENT = 'Stores resolution notes for tickets, typically added by technicians when resolving tickets';
