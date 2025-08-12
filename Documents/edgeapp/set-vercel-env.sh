#!/bin/bash

# Set Vercel Environment Variables for Lucerne Edge App
# Run this script after installing Vercel CLI: npm install -g vercel

echo "🔧 Setting Vercel environment variables..."

# Critical: These variables are needed for the API routes to work
echo "Setting server-side environment variables..."

# IMPORTANT: Replace these values with actual keys from Supabase Project Settings > API
vercel env add SUPABASE_URL production <<< "https://wvggehrxhnuvlxpaghft.supabase.co"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "[REPLACE_WITH_ACTUAL_SERVICE_ROLE_KEY]"

echo "Setting client-side environment variables..."

# Client-side variables (already set, but ensuring they're there)
vercel env add REACT_APP_SUPABASE_URL production <<< "https://wvggehrxhnuvlxpaghft.supabase.co" 
vercel env add REACT_APP_SUPABASE_ANON_KEY production <<< "[REPLACE_WITH_ACTUAL_ANON_KEY]"
vercel env add REACT_APP_TENANT_ID production <<< "lucerne"
vercel env add REACT_APP_CLIENT_NAME production <<< "Lucerne International"
vercel env add REACT_APP_ENV production <<< "production"
vercel env add REACT_APP_ADMIN_EMAIL production <<< "dokonoski@lucerneintl.com"

echo "✅ Environment variables set. Deploy to activate:"
echo "   vercel --prod"
echo ""
echo "🔍 To verify variables are set:"
echo "   vercel env ls"
echo ""
echo "⚠️  IMPORTANT: You MUST replace the placeholder keys with actual values from:"
echo "   Supabase Project Settings > API > anon/public key"  
echo "   Supabase Project Settings > API > service_role key (secret)"