CREATE TABLE IF NOT EXISTS hands (
    id SERIAL PRIMARY KEY,
    uuid TEXT NOT NULL UNIQUE,
    players JSONB NOT NULL,
    stacks JSONB NOT NULL,
    dealer INTEGER NOT NULL,
    sb INTEGER NOT NULL,
    bb INTEGER NOT NULL,
    big_blind INTEGER NOT NULL,
    hole_cards JSONB DEFAULT '{}'::jsonb,
    board TEXT DEFAULT '',
    action_history JSONB DEFAULT '[]'::jsonb,
    payoffs JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hands_created_at ON hands(created_at);
