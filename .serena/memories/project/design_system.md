# FeedLink — Design System

## Colors
```
green:     #16a34a  — brand, primary buttons, active states
greenDark: #157f3d  — pressed green
amber:     #f59e0b  — pending/warning
red:       #dc2626  — destructive/error
textDark:  #1c1917  — primary text
textMid:   #78716c  — secondary text
textLight: #a8a39e  — placeholder/muted
border:    #e7e5e4  — dividers
bg:        #fafaf9  — screen background
surface:   #ffffff  — cards/modals
surface2:  #f5f4f3  — input fill background
tagGreen:  #dcfce4  — selected tag background
tagAmber:  #fef3c4  — amber tag background
blue:      #3d85dc  — links/info
```

## Typography
Font family: Inter (400, 500, 600, 700, 800)

## Card Style
- box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)
- border-radius: 18px
- No border

## Inputs
- Filled surface2 background, no border
- Green focus ring: box-shadow 0 0 0 4px rgba(22,163,74,0.1)

## Bottom Navigation
- Frosted glass: backdrop-filter blur(16px)
- box-sizing: border-box with env(safe-area-inset-bottom)

## Tags (food type chips)
Two groups:
- Audience: for_humans / for_animals / for_both
- Food State: cooked / raw_ingredients / packaged
Same chips used in Create Listing AND Create Request (must be consistent)
