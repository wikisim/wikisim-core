

CREATE TABLE IF NOT EXISTS users (
  id uuid references auth.users NOT NULL PRIMARY KEY,
  name text DEFAULT '' NOT NULL,
  name_lowercase text UNIQUE
  -- Do not add sensitive fields to this table, e.g. fields the user thinks are private because
  -- this is public user information that any other user can access
);
