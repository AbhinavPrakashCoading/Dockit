// Dev Tools - Shelved Components
// 
// This directory contains components that have been shelved (temporarily removed)
// for future development or reference.
//
// Contents:
// - EnhancedSchemaManager.tsx.backup - Beautiful schema management interface
// - schema-management-page.tsx.backup - Route page for schema management
//
// These were removed from the main application as they are dev tools
// and not needed in the primary user workflow.
//
// To restore: rename .backup files and move back to appropriate directories

export const SHELVED_INFO = {
  items: [
    {
      name: 'EnhancedSchemaManager',
      description: 'Beautiful schema management interface with modern UI',
      originalPath: 'src/components/EnhancedSchemaManager.tsx',
      reason: 'Dev tool - not needed in main dashboard'
    },
    {
      name: 'schema-management-page',
      description: 'Route page for schema management',
      originalPath: 'src/app/schema-management/page.tsx',
      reason: 'Dev tool route - cleaned up for main app'
    }
  ],
  shelvedDate: new Date().toISOString(),
  instructions: 'To restore any component, rename the .backup file and move to original location'
};