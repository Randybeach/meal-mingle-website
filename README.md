# Meal Mingle Website

Website for meal-mingle.app domain with Apple Universal Links support.

## Files

- `index.html` - Landing page
- `.well-known/apple-app-site-association` - Apple Universal Links configuration

## Deployment

Upload these files to your web server at `https://meal-mingle.app/`

### Critical Requirements

1. **HTTPS Required** - Must be served over HTTPS
2. **Content-Type** - The AASA file must return `Content-Type: application/json`
3. **No Redirects** - The AASA file must be accessible without redirects

### Verify Deployment

```bash
curl -I https://meal-mingle.app/.well-known/apple-app-site-association
```

Should return:
```
HTTP/2 200
content-type: application/json
```

### Test Universal Links

Use Apple's validation tool:
https://search.developer.apple.com/appsearch-validation-tool/

## Universal Links

Once deployed, these links will open the Meal Mingle app:

- `https://meal-mingle.app/invite/{invitationId}` - Household invitations
- `https://meal-mingle.app/recipe/{recipeId}` - Recipe sharing
- `https://meal-mingle.app/cookbook/{cookbookId}` - Cookbook sharing

## Configuration

- **Team ID**: A885JFKV9F
- **Bundle ID**: com.example.recip
- **Domain**: meal-mingle.app

## Hosting Options

- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop folder
- **GitHub Pages**: Push to repo
- **AWS S3**: Upload to bucket with CloudFront
- **Firebase Hosting**: `firebase deploy`

## Notes

- If app is not installed, links open in browser
- Can redirect to App Store from landing page
- AASA file has no extension (correct)
