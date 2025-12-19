const express = require('express');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON 
        ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
        : undefined;
    
    admin.initializeApp({
        credential: credentials ? admin.credential.cert(credentials) : admin.credential.applicationDefault()
    });
}

// Explicitly set project for Firestore
const db = admin.firestore();
db.settings({ projectId: 'recip-c4b96' });
const app = express();

// Load HTML template
const template = fs.readFileSync(
  path.join(__dirname, 'template-simple.html'),
  'utf8'
);

// Configuration
const DOMAIN = 'https://meal-mingle.app';
const APP_SCHEME = 'meal-mingle'; // Your actual app scheme

// Serve static files with proper MIME types (mainly for local dev)
app.use(
  express.static('.', {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    },
  })
);

// Extra safety for CSS responses
app.get('*.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, req.path));
});

//
// "Database" functions — replace with real DB calls later
//
async function fetchRecipeById(recipeId) {
  console.log('Fetching recipe:', recipeId);
  try {
    const recipeDoc = await db.collection('recipes').doc(recipeId).get();
    console.log('Recipe exists:', recipeDoc.exists);
    if (!recipeDoc.exists) {
      console.log('Recipe not found in Firestore');
      return null;
    }
    const data = recipeDoc.data();
    console.log('Recipe data:', JSON.stringify(data, null, 2));
    
    // Fetch cookbook name if recipe has cookbookId
    let cookbookName = null;
    if (data.cookbookId) {
      try {
        const cookbookDoc = await db.collection('cookbooks').doc(data.cookbookId).get();
        if (cookbookDoc.exists) {
          cookbookName = cookbookDoc.data().name;
        }
      } catch (error) {
        console.log('Could not fetch cookbook name:', error.message);
      }
    }
    
    return {
      name: data.title,
      imageUrl: data.imageUrl,
      cookTime: data.cookTime || '',
      difficulty: data.difficulty || '',
      cookbookName: cookbookName
    };
  } catch (error) {
    console.error('Firebase error:', error.message);
    return null;
  }
}

async function fetchInviteById(inviteId) {
  console.log('Fetching invitation:', inviteId);
  try {
    const invitationDoc = await db.collection('invitations').doc(inviteId).get();
    if (!invitationDoc.exists) {
      console.log('Invitation not found in Firestore');
      return null;
    }
    const data = invitationDoc.data();
    console.log('Invitation data:', JSON.stringify(data, null, 2));
    
    return {
      inviterName: data.inviterName || 'Someone',
      householdName: data.householdName || 'Meal Mingle Household',
      memberCount: data.memberCount || 1,
      imageUrl: `${DOMAIN}/assets/images/household-preview.png?v=6`,
    };
  } catch (error) {
    console.error('Firebase invitation error:', error.message);
    return null;
  }
}

async function fetchCookbookById(cookbookId) {
  console.log('Fetching cookbook:', cookbookId);
  try {
    const cookbookDoc = await db.collection('cookbooks').doc(cookbookId).get();
    if (!cookbookDoc.exists) {
      console.log('Cookbook not found in Firestore');
      return null;
    }
    const data = cookbookDoc.data();
    return {
      name: data.name || data.title,
      recipeCount: data.recipeCount || data.recipes?.length || 0,
      imageUrl: data.imageUrl || `${DOMAIN}/assets/images/cookbook-preview.png?v=6`
    };
  } catch (error) {
    console.error('Firebase cookbook error:', error.message);
    return null;
  }
}

//
// Invite endpoint
//
app.get('/invite/:id', async (req, res) => {
  const inviteId = req.params.id;

  try {
    let invite = await fetchInviteById(inviteId);

    if (!invite) {
      // Fallback so sharers still get a reasonable card instead of 404
      console.warn(
        'Invite not found in DB, using generic fallback for previews:',
        inviteId
      );
      invite = {
        inviterName: 'Someone',
        householdName: 'Meal Mingle Household',
        memberCount: 1,
        imageUrl: `${DOMAIN}/assets/images/household-preview.png?v=fallback`,
      };
    }

    const html = template
      .replace('{{pageTitle}}', `Join ${invite.householdName} - Meal Mingle`)
      .replace(
        /{{ogTitle}}/g,
        `${invite.inviterName} invited you to join ${invite.householdName}! 🏠`
      )
      .replace(
        /{{ogDescription}}/g,
        `Join ${invite.memberCount} family members sharing recipes, meal plans, and grocery lists on Meal Mingle.`
      )
      .replace(/{{ogImageUrl}}/g, invite.imageUrl)
      .replace(/{{canonicalUrl}}/g, `${DOMAIN}/invite/${inviteId}`)
      .replace('{{deepLinkUrl}}', `${APP_SCHEME}://invite/${inviteId}`)
      .replace('{{contentTitle}}', `Join ${invite.householdName}`)
      .replace(
        '{{contentDescription}}',
        `${invite.inviterName} invited you to share recipes, meal plans, and grocery lists with ${invite.memberCount} family members.`
      )
      .replace('{{contentEmoji}}', '🏠') // not used in template but harmless
      .replace('{{actionTag}}', 'Household Invite')
      .replace('{{buttonText}}', 'Join Household')
      .replace('{{contentMedia}}', '<div class="recipe-emoji"><span class="material-symbols-outlined" style="font-size: 120px; color: rgba(34, 69, 65, 0.05);">family_home</span></div>');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching invite:', error);
    res.status(500).send('Server error');
  }
});

//
// Recipe endpoint
//
app.get('/recipe/:id', async (req, res) => {
  const recipeId = req.params.id;

  console.log(`Recipe request for ID: ${recipeId}`);
  console.log('User-Agent:', req.get('User-Agent'));

  try {
    let recipe = await fetchRecipeById(recipeId);

    if (!recipe) {
      // IMPORTANT: Fallback generic recipe instead of 404
      console.warn(
        'Recipe not found in DB, using generic fallback for previews:',
        recipeId
      );
      recipe = {
        name: 'Recipe on Meal Mingle',
        cookTime: '',
        difficulty: '',
        imageUrl: `${DOMAIN}/assets/images/recipe-preview.svg?v=fallback`,
      };
    }

    console.log('Serving recipe:', recipe.name);

    const ogDescription = recipe.cookbookName
      ? `From ${recipe.cookbookName} cookbook • Shared on Meal Mingle`
      : recipe.cookTime && recipe.difficulty
        ? `Ready in ${recipe.cookTime} • ${recipe.difficulty} • Shared on Meal Mingle`
        : 'View this recipe on Meal Mingle';

    const contentDescription =
      recipe.cookTime && recipe.difficulty
        ? `Ready in ${recipe.cookTime} • ${recipe.difficulty} difficulty • Open in Meal Mingle to save this recipe to your collection and start cooking!`
        : 'Open this recipe in Meal Mingle to save it to your collection and start cooking!';

    const html = template
      .replace('{{pageTitle}}', `${recipe.name} - Meal Mingle`)
      .replace(/{{ogTitle}}/g, `${recipe.name} 👨‍🍳`)
      .replace(/{{ogDescription}}/g, ogDescription)
      .replace(/{{ogImageUrl}}/g, recipe.imageUrl)
      .replace(/{{canonicalUrl}}/g, `${DOMAIN}/recipe/${recipeId}`)
      .replace('{{deepLinkUrl}}', `${APP_SCHEME}://recipe/${recipeId}`)
      .replace('{{contentTitle}}', recipe.name)
      .replace('{{contentDescription}}', contentDescription)
      .replace('{{contentEmoji}}', '👨‍🍳')
      .replace('{{actionTag}}', 'Recipe Shared')
      .replace('{{buttonText}}', 'Open Recipe')
      .replace(
        '{{contentMedia}}',
        recipe.imageUrl
          ? `<img src="${recipe.imageUrl}" alt="${recipe.name}" class="content-image">`
          : '<div class="recipe-emoji" style="margin-bottom: 20px;font-size: 60px;">👨‍🍳</div>'
      );

    // Headers for social media crawlers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache

    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).send('Server error');
  }
});

//
// Cookbook endpoint
//
app.get('/cookbook/:id', async (req, res) => {
  const cookbookId = req.params.id;

  try {
    let cookbook = await fetchCookbookById(cookbookId);

    if (!cookbook) {
      console.warn(
        'Cookbook not found in DB, using generic fallback for previews:',
        cookbookId
      );
      cookbook = {
        name: 'Cookbook on Meal Mingle',
        recipeCount: null,
        imageUrl: `${DOMAIN}/assets/images/cookbook-preview.png?v=fallback`,
      };
    }

    const ogDescription = cookbook.recipeCount
      ? `${cookbook.recipeCount} delicious recipes • Shared on Meal Mingle`
      : 'Discover this cookbook on Meal Mingle';

    const contentDescription = cookbook.recipeCount
      ? `Explore ${cookbook.recipeCount} amazing recipes in this collection! Open in Meal Mingle to save these recipes to your collection and start cooking!`
      : 'Explore this collection of recipes on Meal Mingle! Open in Meal Mingle to save these recipes to your collection and start cooking!';

    const html = template
      .replace('{{pageTitle}}', `${cookbook.name} - Meal Mingle`)
      .replace(/{{ogTitle}}/g, `${cookbook.name} 📚`)
      .replace(/{{ogDescription}}/g, ogDescription)
      .replace(/{{ogImageUrl}}/g, cookbook.imageUrl)
      .replace(/{{canonicalUrl}}/g, `${DOMAIN}/cookbook/${cookbookId}`)
      .replace('{{deepLinkUrl}}', `${APP_SCHEME}://cookbook/${cookbookId}`)
      .replace('{{contentTitle}}', cookbook.name)
      .replace('{{contentDescription}}', contentDescription)
      .replace('{{contentEmoji}}', '📚')
      .replace('{{actionTag}}', 'Cookbook Shared')
      .replace('{{buttonText}}', 'Open Cookbook')
      .replace(
        '{{contentMedia}}',
        '<div class="recipe-emoji"><span class="material-symbols-outlined" style="font-size: 150px; color: rgba(34, 69, 65, 0.1);">menu_book</span></div>'
      );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching cookbook:', error);
    res.status(500).send('Server error');
  }
});

//
// Home route
//
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

//
// Catch-all for non-static routes (mainly local dev / SPA support)
//
app.get('*', (req, res) => {
  // If it's a static file request, let Vercel/static handle it in production.
  if (
    req.path.match(
      /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
    )
  ) {
    return res.status(404).send('File not found');
  }

  res.sendFile(path.join(__dirname, 'index.html'));
});

//
// Local server vs Vercel export
//
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Test URLs:');
    console.log('- http://localhost:8000/invite/abc123');
    console.log('- http://localhost:8000/recipe/recipe123');
    console.log('- http://localhost:8000/recipe/vzbpRMUtpxFxMVKRWgbf');
    console.log('- http://localhost:8000/cookbook/ZJtEKEe9uM61pDzDcw4m');
  });
}

// For Vercel (serverless)
module.exports = app;
