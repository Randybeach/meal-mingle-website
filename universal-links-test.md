# Universal Links Compatibility Test

## Current AASA Configuration ✅
```json
{
  "applinks": {
    "details": [{
      "appID": "A885JFKV9F.com.meal-mingle.app",
      "paths": ["/invite/*", "/recipe/*", "/cookbook/*"]
    }]
  }
}
```

## Server Routes ✅
- GET `/invite/:id` → matches `/invite/*`
- GET `/recipe/:id` → matches `/recipe/*`  
- GET `/cookbook/:id` → matches `/cookbook/*`

## Test Flow:

### iOS with App:
1. Tap: `https://meal-mingle.app/invite/abc123`
2. iOS intercepts → App opens
3. uni_links receives: `invite/abc123`

### Browser/Crawler:
1. Request: `https://meal-mingle.app/invite/abc123`
2. Server responds with HTML + OG tags
3. Rich preview displays

## No Changes Required:
- ✅ AASA file paths match server routes
- ✅ No redirects needed
- ✅ Same canonical URLs
- ✅ Universal Links preserved