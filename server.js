const express = require('express');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

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
  try {
    const recipeDoc = await db.collection('recipes').doc(recipeId).get();
    if (!recipeDoc.exists) {
      return null;
    }
    const data = recipeDoc.data();
    return {
      name: data.title,
      imageUrl: data.imageUrl,
      cookTime: data.cookTime || '',
      difficulty: data.difficulty || ''
    };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

async function fetchInviteById(inviteId) {
  // TODO: Replace with your actual database query
  const mockInvites = {
    abc123: {
      inviterName: 'Sarah Johnson',
      householdName: "Sarah's Kitchen",
      memberCount: 4,
      imageUrl: `${DOMAIN}/assets/images/invite-preview.svg?v=5`,
    },
  };
  return mockInvites[inviteId] || null;
}

async function fetchCookbookById(cookbookId) {
  // TODO: Replace with your actual database query
  const mockCookbooks = {
    // Example from your share message
    ZJtEKEe9uM61pDzDcw4m: {
      name: 'Drinks',
      recipeCount: 2,
      imageUrl: `${DOMAIN}/assets/images/cookbook-preview.svg?v=6`,
    },
    // Default example fallback cookbook
    default: {
      name: 'Family Recipes',
      recipeCount: 25,
      imageUrl: `${DOMAIN}/assets/images/cookbook-preview.svg?v=5`,
    },
  };

  return mockCookbooks[cookbookId] || mockCookbooks.default || null;
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
        imageUrl: `${DOMAIN}/assets/images/invite-preview.svg?v=fallback`,
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
      .replace('{{contentMedia}}', '<div class="recipe-emoji">🏠</div>');

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

    const ogDescription =
      recipe.cookTime && recipe.difficulty
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
          : '<div class="recipe-emoji">👨‍🍳</div>'
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
        imageUrl: `${DOMAIN}/assets/images/cookbook-preview.svg?v=fallback`,
      };
    }

    const ogDescription = cookbook.recipeCount
      ? `${cookbook.recipeCount} delicious recipes • Shared on Meal Mingle`
      : 'Discover this cookbook on Meal Mingle';

    const contentDescription = cookbook.recipeCount
      ? `Explore ${cookbook.recipeCount} amazing recipes in this collection!`
      : 'Explore this collection of recipes on Meal Mingle!';

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
      .replace('{{contentMedia}}', '<div class="recipe-emoji">📚</div>');

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
