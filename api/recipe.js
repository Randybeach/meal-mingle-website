export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Recipe ID required' });
  }

  try {
    const response = await fetch(`https://your-actual-project-id-default-rtdb.firebaseio.com/recipes/${id}.json`);
    const recipe = await response.json();
    
    const title = recipe?.title || 'Delicious Recipe';
    const description = recipe?.instructions ? recipe.instructions.substring(0, 150) + '...' : 'Discover amazing recipes on Meal Mingle';
    const image = recipe?.imageUrl || 'https://meal-mingle.app/images/recipe-preview.png';
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Meal Mingle</title>
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="https://meal-mingle.app/recipe/${id}">
    <link rel="stylesheet" href="/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=GFS+Didot&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav class="container">
            <a href="/" class="logo"><span class="dot"></span> Meal Mingle</a>
            <div class="nav">
                <a href="https://apps.apple.com/app/meal-mingle/id6754255710" class="btn outline">Download App</a>
            </div>
        </nav>
    </header>
    <main class="container section">
        <div style="text-align: center; max-width: 600px; margin: 0 auto;">
            ${recipe ? `
                <img src="${image}" alt="${title}" style="width: 100%; max-width: 400px; border-radius: 16px; margin-bottom: 24px;">
                <h1>${title}</h1>
                <p class="lead">${description}</p>
            ` : `
                <h1>Recipe Not Found</h1>
                <p class="lead">This recipe might have been removed or the link is incorrect.</p>
            `}
            <div style="margin-top: 32px;">
                <a href="https://apps.apple.com/app/meal-mingle/id6754255710" class="btn btn-full">
                    Open in Meal Mingle App
                </a>
            </div>
        </div>
    </main>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
}