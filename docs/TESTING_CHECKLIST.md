# Marketplace Testing Checklist

## Pre-Testing Setup
- [ ] Run the SQL setup from `MARKETPLACE_SETUP_GUIDE.md`
- [ ] Verify `marketplace_listings` table exists in Supabase
- [ ] Verify RLS policies are enabled
- [ ] Ensure you're logged into the app

## Test 1: View Marketplace (Mock Data)
**Before database setup, app should show mock data**

- [ ] Open the Marketplace tab
- [ ] See 8 mock listings displayed
- [ ] Verify loading states work
- [ ] Check grid layout displays correctly
- [ ] Verify images load
- [ ] Check condition badges show

**Expected Result**: Mock data displays without errors

## Test 2: Database Connection
**After running SQL setup**

- [ ] Refresh the Marketplace tab
- [ ] Console should show: `[MarketplaceService] Fetching listings`
- [ ] If database is empty, should show "No listings found"
- [ ] "Create First Listing" button should appear

**Expected Result**: App connects to database successfully

## Test 3: Create a Listing (Happy Path)

### Step 1: Open Create Form
- [ ] Click the "+" button in top right
- [ ] Form opens with all fields visible
- [ ] "Post" button is disabled

### Step 2: Add Photos
- [ ] Click "Add Photo"
- [ ] Select an image from library
- [ ] Image appears in the photos section
- [ ] Try adding up to 5 photos
- [ ] Verify you can remove photos

### Step 3: Fill Required Fields
- [ ] Enter title: "Test Listing 123"
- [ ] Enter description: "This is a test listing for marketplace"
- [ ] Enter price: "99.99"
- [ ] Select category: "Electronics"
- [ ] Select condition: "Like New"
- [ ] Enter location: "San Francisco, CA"

### Step 4: Set Delivery Options
- [ ] Enable "Local Pickup" (should be on by default)
- [ ] Enable "Shipping Available"
- [ ] Enter shipping price: "9.99"

### Step 5: Submit
- [ ] Verify "Post" button is now enabled
- [ ] Click "Post"
- [ ] Loading indicator appears
- [ ] Success alert shows
- [ ] Form redirects back to marketplace

**Expected Result**: Listing created successfully

## Test 4: View Created Listing

- [ ] Go to Marketplace tab
- [ ] See your new listing at the top
- [ ] Verify all details are correct:
  - [ ] Title matches
  - [ ] Price displays correctly ($99.99)
  - [ ] Image(s) load
  - [ ] Condition badge shows "Like New"
  - [ ] Location shows correctly
  - [ ] View count shows 0

**Expected Result**: Listing displays correctly in feed

## Test 5: Search Functionality

- [ ] Type "Test" in search bar
- [ ] Your listing should appear in results
- [ ] Type "Electronics" 
- [ ] Listing should still appear
- [ ] Type "xyz123notfound"
- [ ] Should show "No listings found"
- [ ] Clear search
- [ ] All listings should reappear

**Expected Result**: Search filters correctly

## Test 6: Form Validation

### Test Empty Fields
- [ ] Open create form
- [ ] Try clicking "Post" without filling anything
- [ ] Button should be disabled
- [ ] Add only title
- [ ] Button still disabled
- [ ] Add all required fields
- [ ] Button becomes enabled

### Test Invalid Price
- [ ] Enter price: "abc"
- [ ] Try to submit
- [ ] Should show error about valid price

### Test Image Limit
- [ ] Try adding 6th image
- [ ] Alert should show "Limit Reached"

**Expected Result**: All validations work correctly

## Test 7: Error Handling

### Test Network Error
- [ ] Turn off internet
- [ ] Try creating a listing
- [ ] Should show network error message
- [ ] Turn internet back on

### Test Permission Error
- [ ] If logged out, try creating listing
- [ ] Should show authentication error

**Expected Result**: Friendly error messages display

## Test 8: Multiple Users

### Create Second Listing
- [ ] Create another listing with different data
- [ ] Verify both listings appear
- [ ] Verify newest is at the top

### Test Different User (if possible)
- [ ] Log in as different user
- [ ] Try editing someone else's listing (shouldn't work due to RLS)
- [ ] Create a listing as this user
- [ ] Verify it appears

**Expected Result**: Multi-user functionality works

## Test 9: Categories

Test creating listings in each category:
- [ ] Electronics
- [ ] Fashion
- [ ] Gaming
- [ ] Home & Garden
- [ ] Sports
- [ ] Books
- [ ] Art
- [ ] Collectibles
- [ ] Vehicles
- [ ] Other

**Expected Result**: All categories work

## Test 10: Conditions

Test all condition types:
- [ ] New
- [ ] Like New
- [ ] Good
- [ ] Fair

**Expected Result**: All conditions save and display correctly

## Performance Tests

- [ ] Create 10+ listings
- [ ] Verify scroll performance is smooth
- [ ] Verify images load efficiently
- [ ] Check search is responsive with many listings

**Expected Result**: App performs well with multiple listings

## Mobile-Specific Tests

### iOS
- [ ] Photo picker works
- [ ] Keyboard behavior is correct
- [ ] Safe areas are respected
- [ ] Haptic feedback (if implemented)

### Android
- [ ] Photo picker works
- [ ] Back button behavior
- [ ] Keyboard doesn't cover inputs

### Web
- [ ] Grid layout responsive
- [ ] File upload works
- [ ] No console errors

**Expected Result**: Works across all platforms

## Edge Cases

- [ ] Create listing with very long title (80 chars)
- [ ] Create listing with very long description (500 chars)
- [ ] Create listing with price $0.01
- [ ] Create listing with price $999,999.99
- [ ] Create listing with only 1 image
- [ ] Create listing with 5 images
- [ ] Special characters in title/description
- [ ] Emoji in title/description

**Expected Result**: All edge cases handled gracefully

## Database Verification

In Supabase:
- [ ] Go to Table Editor → marketplace_listings
- [ ] See your listings in the table
- [ ] Verify all fields saved correctly
- [ ] Check timestamps are set
- [ ] Verify seller_id matches your user ID

**Expected Result**: Data stored correctly in database

## Console Log Verification

Check console for these logs:
- [ ] `[Marketplace] Fetching listings`
- [ ] `[MarketplaceService] Fetching listings`
- [ ] `[CreateListing] Creating listing`
- [ ] `[MarketplaceService] Listing created successfully`
- [ ] No error logs

**Expected Result**: Clean console logs with helpful debug info

## Final Checklist

- [ ] All tests passed
- [ ] No TypeScript errors
- [ ] No React Query errors
- [ ] No network errors
- [ ] Database stores data correctly
- [ ] RLS policies work
- [ ] User experience is smooth
- [ ] Loading states are clear
- [ ] Error messages are helpful

## Issues Found

Document any issues here:
1. 
2. 
3. 

## Sign-Off

- [ ] Ready for Test Pilot v2
- Tested by: _______________
- Date: _______________
- Platform: iOS / Android / Web
- Notes: _______________
