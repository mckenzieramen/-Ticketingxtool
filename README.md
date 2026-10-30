# Ticket Tracking System

A standalone browser-based ticket tracker.

## Features
- Ticket number + Inbound/Outbound
- Ticket creation timestamp
- Open / Pending / On Hold / Solved / Closed
- When changed to Solved, the app records the solved time and sets expected close to +24 hours
- Automatic local-browser transition from Solved to Closed when the 24-hour due time is reached while the app is open
- Stamp Time button
- Paste System / Answer Time and calculate pickup time in seconds
- Pickup target indicator (default <= 20 seconds)
- Ticket search and filters
- Dashboard statistics
- CSV export
- Browser localStorage persistence
- Responsive layout

## Run
Open index.html in a browser. For best results, use a local web server (for example VS Code Live Server).

## Important
This version stores data in the browser only. For multi-device use or reliable server-side automatic closing while the browser is not open, connect it to a backend/database such as Firebase or Supabase.
