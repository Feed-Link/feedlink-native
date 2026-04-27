# FeedLink — Project Overview

## Purpose
Food-sharing mobile app connecting food donors (surplus food) with recipients (shelters, individuals). Donors post listings; recipients claim them. Recipients can also post food requests that donors accept.

## Target Platform
React Native + Expo (managed workflow), targeting iOS + Android + PWA (expo web).

## Design Source
Prototyped in HTML/CSS/JS (Babel standalone + React 18). Design bundle extracted to `/tmp/feedlink/project/` (session artifact). All screens, layouts, colors, and UX behavior from prototype are the pixel-level source of truth. CLAUDE.md in project root has full screen inventory.

## Current State
Blank Expo project directory at `C:/Users/samay/Desktop/feedlink-app`. CLAUDE.md and AGENTS.md written. No scaffolding yet.

## API
- Base URL: `https://api.feedlink.tech/api`
- Auth: Laravel Passport — `Authorization: Bearer {access_token}`
- Server timezone: Asia/Kathmandu (UTC+5:45)
- Two roles: `donor` | `recipient`
