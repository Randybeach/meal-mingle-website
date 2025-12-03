const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Load HTML template
const template = fs.readFileSync(path.join(__dirname, 'template-simple.html'), 'utf8');

// Configuration
const DOMAIN = 'https://meal-mingle.app';
const APP_SCHEME = 'mealmingle'; // Your actual app scheme

// Mock database
const invites = {
    'abc123': {
        inviterName: 'Sarah Johnson',
        householdName: "Sarah's Kitchen",
        memberCount: 4,
        imageUrl: 'https://meal-mingle.app/api/invite-image/abc123'
    },
    'xyz789': {
        inviterName: 'Mike Chen',
        householdName: "The Chen Family",
        memberCount: 6,
        imageUrl: 'https://meal-mingle.app/api/invite-image/xyz789'
    }
};

const recipes = {
    'recipe123': {
        name: 'Chicken Tikka Masala',
        cookTime: '45 min',
        difficulty: 'Medium',
        imageUrl: 'https://meal-mingle.app/api/recipe-image/recipe123'
    },
    'recipe456': {
        name: 'Quick Pasta Carbonara',
        cookTime: '20 min',
        difficulty: 'Easy',
        imageUrl: 'https://meal-mingle.app/api/recipe-image/recipe456'
    }
};

// Invite endpoint
app.get('/invite/:id', (req, res) => {
    const inviteId = req.params.id;
    const invite = invites[inviteId];
    
    if (!invite) {
        return res.status(404).send('Invite not found');
    }
    
    const html = template
        .replace('{{pageTitle}}', `Join ${invite.householdName} - Meal Mingle`)
        .replace(/{{ogTitle}}/g, `${invite.inviterName} invited you to join ${invite.householdName}! 🏠`)
        .replace(/{{ogDescription}}/g, `Join ${invite.memberCount} family members sharing recipes, meal plans, and grocery lists on Meal Mingle.`)
        .replace(/{{ogImageUrl}}/g, invite.imageUrl)
        .replace(/{{canonicalUrl}}/g, `${DOMAIN}/invite/${inviteId}`)
        .replace('{{deepLinkUrl}}', `${APP_SCHEME}://invite/${inviteId}`)
        .replace('{{contentTitle}}', `Join ${invite.householdName}`)
        .replace('{{contentDescription}}', `${invite.inviterName} invited you to share recipes, meal plans, and grocery lists with ${invite.memberCount} family members.`)
        .replace('{{contentEmoji}}', '🏠')
        .replace('{{actionTag}}', 'Household Invite')
        .replace('{{buttonText}}', 'Join Household')
        .replace('{{contentMedia}}', '<div class="recipe-emoji">🏠</div>')

    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// Recipe endpoint
app.get('/recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const recipe = recipes[recipeId];
    
    if (!recipe) {
        return res.status(404).send('Recipe not found');
    }
    
    const html = template
        .replace('{{pageTitle}}', `${recipe.name} - Meal Mingle`)
        .replace(/{{ogTitle}}/g, `${recipe.name} 👨‍🍳`)
        .replace(/{{ogDescription}}/g, `Ready in ${recipe.cookTime} • ${recipe.difficulty} • Shared on Meal Mingle`)
        .replace(/{{ogImageUrl}}/g, recipe.imageUrl)
        .replace(/{{canonicalUrl}}/g, `${DOMAIN}/recipe/${recipeId}`)
        .replace('{{deepLinkUrl}}', `${APP_SCHEME}://recipe/${recipeId}`)
        .replace('{{contentTitle}}', recipe.name)
        .replace('{{contentDescription}}', `Ready in ${recipe.cookTime} • ${recipe.difficulty} difficulty • Open in Meal Mingle to save this recipe to your collection and start cooking!`)
        .replace('{{contentEmoji}}', '👨‍🍳')

    
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html.replace('{{actionTag}}', 'Recipe Shared').replace('{{buttonText}}', 'Open Recipe').replace('{{contentMedia}}', recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.name}" class="content-image">` : '<div class="recipe-emoji">👨🍳</div>'));
});

// Cookbook endpoint
app.get('/cookbook/:id', (req, res) => {
    const cookbookId = req.params.id;
    // Add cookbook data here
    const cookbook = { name: 'Family Recipes', recipeCount: 25 };
    
    const html = template
        .replace('{{pageTitle}}', `${cookbook.name} - Meal Mingle`)
        .replace(/{{ogTitle}}/g, `${cookbook.name} 📚`)
        .replace(/{{ogDescription}}/g, `${cookbook.recipeCount} delicious recipes • Shared on Meal Mingle`)
        .replace(/{{ogImageUrl}}/g, `${DOMAIN}/assets/images/cookbook-preview.jpg`)
        .replace(/{{canonicalUrl}}/g, `${DOMAIN}/cookbook/${cookbookId}`)
        .replace('{{deepLinkUrl}}', `${APP_SCHEME}://cookbook/${cookbookId}`)
        .replace('{{contentTitle}}', cookbook.name)
        .replace('{{contentDescription}}', `Explore ${cookbook.recipeCount} amazing recipes in this collection!`)
        .replace('{{contentEmoji}}', '📚')
        .replace('{{actionTag}}', 'Cookbook Shared')
        .replace('{{buttonText}}', 'Open Cookbook')
        .replace('{{contentMedia}}', '<div class="recipe-emoji">📚</div>');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files
app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Test URLs:');
    console.log('- http://localhost:3000/invite/abc123');
    console.log('- http://localhost:3000/invite/xyz789');
    console.log('- http://localhost:3000/recipe/recipe123');
    console.log('- http://localhost:3000/recipe/recipe456');
});

module.exports = app;