const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Server-side rendering for recipe pages
exports.recipe = functions.https.onRequest(async (req, res) => {
  const recipeId = req.path.split('/')[1];
  
  try {
    // Fetch recipe from Firestore
    const recipeDoc = await db.collection('recipes').doc(recipeId).get();
    
    if (!recipeDoc.exists) {
      return res.status(404).send('Recipe not found');
    }
    
    const recipe = recipeDoc.data();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${recipe.title} - Meal Mingle</title>
  
  <meta property="og:title" content="${recipe.title} 👨🍳">
  <meta property="og:description" content="Shared on Meal Mingle">
  <meta property="og:image" content="${recipe.imageUrl}">
  <meta property="og:url" content="https://meal-mingle.app/recipe/${recipeId}">
  <meta property="og:type" content="article">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${recipe.title} 👨🍳">
  <meta name="twitter:description" content="Shared on Meal Mingle">
  <meta name="twitter:image" content="${recipe.imageUrl}">
  
  <script>
    setTimeout(() => {
      window.location.href = 'mealmingle://recipe/${recipeId}';
    }, 100);
    
    setTimeout(() => {
      window.location.href = 'https://apps.apple.com/app/meal-mingle';
    }, 2000);
  </script>
</head>
<body>
  <h1>${recipe.title}</h1>
  <p>Opening in Meal Mingle...</p>
</body>
</html>`;
    
    res.set('Cache-Control', 'public, max-age=300');
    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

// Server-side rendering for cookbook pages
exports.cookbook = functions.https.onRequest(async (req, res) => {
  const cookbookId = req.path.split('/')[1];
  
  try {
    const cookbookDoc = await db.collection('cookbooks').doc(cookbookId).get();
    
    if (!cookbookDoc.exists) {
      return res.status(404).send('Cookbook not found');
    }
    
    const cookbook = cookbookDoc.data();
    
    // Generate dynamic cookbook image URL (your app logic)
    const cookbookImageUrl = `https://meal-mingle.app/assets/images/cookbook-preview.svg?v=5`;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${cookbook.name} - Meal Mingle</title>
  
  <meta property="og:title" content="${cookbook.name} 📚">
  <meta property="og:description" content="Cookbook shared on Meal Mingle">
  <meta property="og:image" content="${cookbookImageUrl}">
  <meta property="og:url" content="https://meal-mingle.app/cookbook/${cookbookId}">
  <meta property="og:type" content="article">
  
  <script>
    setTimeout(() => {
      window.location.href = 'mealmingle://cookbook/${cookbookId}';
    }, 100);
    
    setTimeout(() => {
      window.location.href = 'https://apps.apple.com/app/meal-mingle';
    }, 2000);
  </script>
</head>
<body>
  <h1>${cookbook.name}</h1>
  <p>Opening in Meal Mingle...</p>
</body>
</html>`;
    
    res.set('Cache-Control', 'public, max-age=300');
    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});