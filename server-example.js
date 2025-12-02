// Node.js/Express Example - Server-side template rendering

const express = require('express');
const fs = require('fs');
const app = express();

// Load HTML template
const template = fs.readFileSync('./template.html', 'utf8');

// Mock metadata service
async function getInviteMetadata(inviteId) {
    // Replace with your database/API call
    return {
        title: "Join Sarah's Kitchen",
        description: "You've been invited to share recipes and meal plans together!",
        imageUrl: "https://meal-mingle.app/api/invite-image/" + inviteId,
        inviterName: "Sarah"
    };
}

// Route handler
app.get('/invite/:id', async (req, res) => {
    const inviteId = req.params.id;
    const metadata = await getInviteMetadata(inviteId);
    
    const html = template
        .replace('{{pageTitle}}', metadata.title)
        .replace(/{{ogTitle}}/g, metadata.title)
        .replace(/{{ogDescription}}/g, metadata.description)
        .replace(/{{ogImageUrl}}/g, metadata.imageUrl)
        .replace(/{{canonicalUrl}}/g, `https://meal-mingle.app/invite/${inviteId}`)
        .replace('{{deepLinkUrl}}', `mealmingle://invite/${inviteId}`);
    
    res.send(html);
});

app.listen(3000);