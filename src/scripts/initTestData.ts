/**
 * Initialize Test Data
 * 
 * This file automatically runs the test data generator on app load (development only).
 * Import this in your main.tsx or App.tsx to auto-populate test data.
 */

import { generateAllTestData } from "./generateTestData"

// Only run in development and if data doesn't exist
if (import.meta.env.DEV) {
  const hasData = 
    localStorage.getItem("unicircle_resources") ||
    localStorage.getItem("unicircle_feed_posts") ||
    localStorage.getItem("unicircle_collections")
  
  if (!hasData) {
    console.log("🔧 Development mode: Auto-generating test data...")
    generateAllTestData()
  }
}

// Export for manual use
export { generateAllTestData }

