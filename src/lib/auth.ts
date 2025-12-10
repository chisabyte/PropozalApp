import { auth, clerkClient } from '@clerk/nextjs/server'
import { createServerClient, getSupabaseAdmin } from './db'

export async function getCurrentUser() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    // Use admin client to bypass RLS since we're using Clerk auth, not Supabase auth
    const supabaseAdmin = getSupabaseAdmin()

    // Get user from Supabase (use maybeSingle to avoid error if not found)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching current user:', error)
      // If it's a table not found error, return null (will redirect to onboarding)
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.error('Database tables not found. User needs to complete onboarding.')
        return null
      }
      // For other errors, log and return null
      return null
    }

    return user || null
  } catch (error: any) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function getOrCreateUser(clerkUserId: string) {
  try {
    // Use admin client to bypass RLS since we're using Clerk auth, not Supabase auth
    const supabaseAdmin = getSupabaseAdmin()

    // Check if user exists (use maybeSingle to avoid error if not found)
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      // Check if it's a "relation does not exist" error
      if (fetchError.message?.includes('relation') || fetchError.message?.includes('does not exist')) {
        throw new Error('Database tables not found. Please run database/schema.sql in Supabase SQL Editor.')
      }
      throw new Error(`Database error: ${fetchError.message || JSON.stringify(fetchError)}`)
    }

    if (user) {
      return user
    }

    // User doesn't exist, create it
    // Get user info from Clerk
    let clerkUser
    try {
      clerkUser = await clerkClient().users.getUser(clerkUserId)
    } catch (clerkError: any) {
      console.error('Error fetching Clerk user:', clerkError)
      throw new Error(`Failed to fetch user from Clerk: ${clerkError.message || 'Unknown error'}`)
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress

    if (!email) {
      throw new Error('User email not found in Clerk. Please ensure your Clerk account has a verified email.')
    }

    // Create user in Supabase using admin client (bypasses RLS)
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_user_id: clerkUserId,
        email: email,
        full_name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user in database:', insertError)
      
      // Provide helpful error messages
      if (insertError.message?.includes('relation') || insertError.message?.includes('does not exist')) {
        throw new Error('Database tables not found. Please run database/schema.sql in Supabase SQL Editor.')
      }
      
      if (insertError.message?.includes('permission denied') || insertError.message?.includes('policy')) {
        throw new Error('Database permission error. Please check Row Level Security (RLS) policies in Supabase.')
      }
      
      if (insertError.code === '23505' || insertError.message?.includes('duplicate key value violates unique constraint')) {
        // User might have been created by another request, try to fetch again
        console.log('Duplicate user detected, fetching existing user...')
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .maybeSingle()

        if (existingUser) {
          console.log('Returning existing user:', existingUser.id)
          return existingUser
        }
      }

      throw new Error(`Failed to create user: ${insertError.message || JSON.stringify(insertError)}`)
    }

    if (!newUser) {
      throw new Error('User creation succeeded but no user data returned')
    }

    return newUser
  } catch (error: any) {
    console.error('getOrCreateUser error:', error)
    // Re-throw with the error message
    throw error
  }
}

