#!/bin/bash

# Prompt the user for the value of migration
echo "[ENTER-NEW-MIGRATION-NAME]"
read migration_name

# Run the migration generate command with the provided value
echo "[GENERATE-MIGRATION-FILE-PROCESSING]"
npm run migration:generate ./libs/common/src/database/migrations/$migration_name

# Check if the generate command was successful
if [ $? -eq 0 ]; then
  echo "[GENERATE-MIGRATION-FILE-SUCCESSFUL]"

  # Run the migration
  echo ""
  echo "[EXECUTE-MIGRATION-FILE-PROCESSING]"
  npm run migration:run

  # Check if the migration run was successful
  if [ $? -eq 0 ]; then
    echo ""
    echo "[EXECUTE-MIGRATION-FILE-SUCCESSFUL]"
    echo ""
  else
    echo "[EXECUTE-MIGRATION-FILE-ERROR]"
    echo ""
  fi
else
  echo "An error occurred during migration generation."
fi
