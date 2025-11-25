#!/bin/sh
source .env.local

supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/core/network/supabase/database.types.ts