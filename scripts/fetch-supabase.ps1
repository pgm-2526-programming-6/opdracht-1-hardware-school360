# Load environment variables from .env.local
if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*?)\s*=\s*(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id $env:SUPABASE_PROJECT_ID > src/core/network/supabase/database.types.ts
