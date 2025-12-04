const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Load HTML template
const template = fs.readFileSync(path.join(__dirname, 'template-simple.html'), 'utf8');

// Configuration
const DOMAIN = 'https://meal-mingle.app';
const APP_SCHEME = 'meal-mingle'; // Your actual app scheme

// Serve static files with proper MIME types
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Specific route for CSS files
app.get('*.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, req.path));
});

// Database functions - Replace with your actual database calls
async function fetchRecipeById(recipeId) {
    // TODO: Replace with your actual database query
    // Example: return await db.recipes.findById(recipeId);
    
    // Mock data for now - replace this entire function
    const mockRecipes = {
        'recipe123': { name: 'Chicken Tikka Masala', cookTime: '45 min', difficulty: 'Medium', imageUrl: `${DOMAIN}/assets/images/recipe-preview.svg?v=6` },
        'test123': { name: 'Creamy Garlic Pasta', cookTime: '20 min', difficulty: 'Easy', imageUrl: `${DOMAIN}/assets/images/recipe-preview.svg?v=6` }
    };
    return mockRecipes[recipeId] || null;
}

async function fetchInviteById(inviteId) {
    // TODO: Replace with your actual database query
    const mockInvites = {
        'abc123': { inviterName: 'Sarah Johnson', householdName: "Sarah's Kitchen", memberCount: 4, imageUrl: `${DOMAIN}/assets/images/invite-preview.svg?v=5` }
    };
    return mockInvites[inviteId] || null;
}

async function fetchCookbookById(cookbookId) {
    // TODO: Replace with your actual database query
    return { name: 'Family Recipes', recipeCount: 25, imageUrl: `${DOMAIN}/assets/images/cookbook-preview.svg?v=5` };
}

// Invite endpoint
app.get('/invite/:id', async (req, res) => {
    const inviteId = req.params.id;
    
    try {
        const invite = await fetchInviteById(inviteId);
        
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
            .replace('{{contentMedia}}', '<div class="recipe-emoji">🏠</div>');
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Error fetching invite:', error);
        res.status(500).send('Server error');
    }
});

// Recipe endpoint
app.get('/recipe/:id', async (req, res) => {
    const recipeId = req.params.id;
    
    console.log(`Recipe request for ID: ${recipeId}`);
    console.log('User-Agent:', req.get('User-Agent'));
    
    try {
        const recipe = await fetchRecipeById(recipeId);
        
        if (!recipe) {
            console.log('Recipe not found:', recipeId);
            return res.status(404).send('Recipe not found');
        }
        
        console.log('Serving recipe:', recipe.name);
    
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

    
    
    // Set proper headers for social media crawlers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
        const finalHtml = html
            .replace('{{actionTag}}', 'Recipe Shared')
            .replace('{{buttonText}}', 'Open Recipe')
            .replace('{{contentMedia}}', recipe.imageUrl ? `<img src="${recipe.imageUrl}" alt="${recipe.name}" class="content-image">` : '<div class="recipe-emoji">👨🍳</div>');
        
        res.send(finalHtml);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).send('Server error');
    }
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
        .replace(/{{ogImageUrl}}/g, `${DOMAIN}/assets/images/cookbook-preview.svg?v=5`)
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

// Catch all other routes and serve index.html
app.get('*', (req, res) => {
    // If it's a static file request, let it pass through
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        return res.status(404).send('File not found');
    }
    // Otherwise serve index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Test URLs:');
    console.log('- http://localhost:3000/invite/abc123');
    console.log('- http://localhost:3000/invite/xyz789');
    console.log('- http://localhost:3000/recipe/recipe123');
    console.log('- http://localhost:3000/recipe/recipe456');
});

module.exports = app;