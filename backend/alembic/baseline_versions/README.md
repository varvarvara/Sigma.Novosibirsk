# Active Alembic history

This directory contains the deployable migration history for a fresh database.
The baseline mirrors the current schema from `sigma_db.sql`, without seed or
application data.

The files in `alembic/versions` are retained as legacy history. They assume
that `sigma_db.sql` has already created the tables and therefore cannot
bootstrap an empty database.
