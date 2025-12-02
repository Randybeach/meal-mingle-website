// Dynamic Open Graph Image Generator for SMS Previews
class PreviewGenerator {
    static generateInvitePreview(inviterName = "Someone") {
        return {
            title: `${inviterName} invited you to join their household! 🏠`,
            description: "Share recipes, meal plans, and grocery lists together on Meal Mingle",
            image: "https://meal-mingle.app/assets/images/invite-preview.jpg"
        };
    }
    
    static generateRecipePreview(recipeName = "Amazing Recipe", cookTime = "30 min") {
        return {
            title: `${recipeName} 👨🍳`,
            description: `Ready in ${cookTime} • Shared on Meal Mingle`,
            image: "https://meal-mingle.app/assets/images/recipe-preview.jpg"
        };
    }
    
    static generateCookbookPreview(cookbookName = "Recipe Collection", recipeCount = "12") {
        return {
            title: `${cookbookName} 📚`,
            description: `${recipeCount} delicious recipes • Shared on Meal Mingle`,
            image: "https://meal-mingle.app/assets/images/cookbook-preview.jpg"
        };
    }
}

// SMS Link Optimizer
class SMSLinkOptimizer {
    static createShareableLink(type, id, metadata = {}) {
        const baseUrl = "https://meal-mingle.app";
        const params = new URLSearchParams();
        
        // Add metadata for better previews
        if (metadata.name) params.set('name', metadata.name);
        if (metadata.time) params.set('time', metadata.time);
        if (metadata.count) params.set('count', metadata.count);
        
        const queryString = params.toString();
        const suffix = queryString ? `?id=${id}&${queryString}` : `?id=${id}`;
        
        return `${baseUrl}/${type}/${suffix}`;
    }
    
    static generateSMSText(type, link, customMessage = "") {
        const messages = {
            invite: `Hey! I'd love to share recipes and meal planning with you on Meal Mingle 🏠 ${customMessage}\n\n${link}`,
            recipe: `Found this amazing recipe and thought you'd love it! 👨🍳 ${customMessage}\n\n${link}`,
            cookbook: `Check out this collection of recipes I put together! 📚 ${customMessage}\n\n${link}`
        };
        
        return messages[type] || `Check this out on Meal Mingle! ${link}`;
    }
}

// Export for use in app
if (typeof module !== 'undefined') {
    module.exports = { PreviewGenerator, SMSLinkOptimizer };
}