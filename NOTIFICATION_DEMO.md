# Notification System Demo Guide

## Overview
This demo shows how notifications work across different user accounts. Notifications are stored in localStorage and can be viewed by different users in different browsers.

## How to Test

### Step 1: Create Account A (Host)
1. Open Browser 1 (e.g., Chrome)
2. Go to `/auth`
3. Register with:
   - Name: `John Doe`
   - Email: `john@student.tdtu.edu.vn`
   - Student ID: `john123`
   - Password: `password123`
4. You'll be logged in automatically

### Step 2: Create a Study Session and Invite
1. Navigate to Study Sessions
2. Click "Create session"
3. Fill in:
   - Study Topic: `Midterm Review - AI`
   - Select faculties, date, time, duration
   - In "Student Invitation" section, enter: `jane456` (Account B's student ID)
   - Click "Add" to invite
4. Click "Create Room"
5. Notification is sent to `jane456`

### Step 3: Create Account B (Invited User)
1. Open Browser 2 (e.g., Firefox/Safari)
2. Go to `/auth`
3. Register with:
   - Name: `Jane Smith`
   - Email: `jane@student.tdtu.edu.vn`
   - Student ID: `jane456` (Must match the invited ID!)
   - Password: `password123`
4. You'll be logged in automatically

### Step 4: View Notifications
1. In Browser 2 (Account B), look at the notification bell icon in the header
2. You should see a red badge with "1" indicating 1 unread notification
3. Click the bell to see the invitation notification
4. Click on the notification to navigate to the session

## Testing Join Requests

### Step 1: Account B Requests to Join
1. In Browser 2 (Account B), go to Study Sessions → Discover
2. Find a locked/private session
3. Click "Request to join"
4. Notification is sent to the session host

### Step 2: Account A Views Requests
1. In Browser 1 (Account A), go to Study Sessions → Requests tab
2. You should see the join request from Account B
3. Click "Accept" or "Reject"
4. Notification is sent back to Account B

### Step 3: Account B Sees Response
1. In Browser 2, check notifications
2. You should see "Request Accepted" or "Request Rejected" notification

## Important Notes

1. **Student IDs Must Match**: For notifications to work, the student ID used when inviting must match the student ID used when registering the other account.

2. **Cross-Browser Testing**: Notifications are stored in localStorage, which is browser-specific. To test across browsers, you need to:
   - Use different browsers OR
   - Use incognito/private windows

3. **Real-time Updates**: Notifications poll every 2 seconds and also listen for events. If you don't see notifications immediately, wait a few seconds.

4. **Demo Limitations**: 
   - This is a mock system using localStorage
   - Notifications persist across page refreshes
   - Each browser has its own localStorage
   - For true cross-browser testing, you'd need a backend

## Notification Types

- **Invitation**: When you're invited to a study session
- **Join Request**: When someone wants to join your session
- **Request Accepted**: Your join request was accepted
- **Request Rejected**: Your join request was rejected

## Troubleshooting

- **No notifications showing**: Check that student IDs match exactly
- **Notifications not updating**: Refresh the page or wait 2 seconds for polling
- **Can't see other account's notifications**: Make sure you're using different browsers or incognito windows

