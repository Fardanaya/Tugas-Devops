-- Remove quantity column from carts table since each item is unique
-- Each catalog or accessory represents a single entity that can only be added once

ALTER TABLE carts DROP COLUMN quantity;

-- Update any existing indexes or add new ones if needed
-- The item_type_item_id index should still work efficiently
