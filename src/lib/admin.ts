/**
 * Admin Access Verification
 * 
 * Helper functions to verify admin access for protected admin routes
 */

import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Check if a user has admin access
 * Supports multiple verification methods:
 * 1. Environment variable (ADMIN_USER_IDS)
 * 2. Clerk public metadata (role === 'admin')
 * 3. Database check (if admin_users table exists)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false

  // Option 1: Check environment variable for admin user IDs
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || []
  if (adminIds.includes(userId)) {
    return true
  }

  // Option 2: Check Clerk metadata
  try {
    const user = await clerkClient().users.getUser(userId)
    if (user.publicMetadata?.role === 'admin') {
      return true
    }
  } catch (error) {
    console.warn('Failed to check Clerk metadata for admin:', error)
  }

  // Option 3: Check database (if admin_users table exists)
  // Uncomment if you have an admin_users table:
  /*
  try {
    const { getSupabaseAdmin } = await import('./db')
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle()
    return !!data
  } catch (error) {
    // Table doesn't exist or other error
    return false
  }
  */

  return false
}

/**
 * Verify admin access and throw error if not admin
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const hasAdminAccess = await isAdmin(userId)
  
  if (!hasAdminAccess) {
    throw new Error('Forbidden - Admin access required')
  }

  return userId
}

