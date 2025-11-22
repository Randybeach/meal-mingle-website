<?php
require_once 'config.php';

$recipeId = $_GET['id'] ?? '';
$recipe = null;

if ($recipeId) {
    $firebaseUrl = FIREBASE_DATABASE_URL . "/recipes/$recipeId.json";
    $response = @file_get_contents($firebaseUrl);
    if ($response) {
        $recipe = json_decode($response, true);
    }
}

$title = $recipe ? $recipe['title'] : 'Delicious Recipe';
$description = $recipe && isset($recipe['instructions']) ? substr(strip_tags($recipe['instructions']), 0, 150) . '...' : 'Discover amazing recipes on Meal Mingle';
$image = $recipe && isset($recipe['imageUrl']) ? $recipe['imageUrl'] : DEFAULT_RECIPE_IMAGE;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title) ?> - Meal Mingle</title>
    
    <!-- Open Graph -->
    <meta property="og:title" content="<?= htmlspecialchars($title) ?>">
    <meta property="og:description" content="<?= htmlspecialchars($description) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($image) ?>">
    <meta property="og:url" content="https://meal-mingle.app/recipe/<?= htmlspecialchars($recipeId) ?>">
    <meta property="og:type" content="article">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= htmlspecialchars($title) ?>">
    <meta name="twitter:description" content="<?= htmlspecialchars($description) ?>">
    <meta name="twitter:image" content="<?= htmlspecialchars($image) ?>">
    
    <link rel="stylesheet" href="/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=GFS+Didot&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav class="container">
            <a href="/" class="logo">
                <span class="dot"></span>
                Meal Mingle
            </a>
            <div class="nav">
                <a href="<?= APP_STORE_URL ?>" class="btn outline">Download App</a>
            </div>
        </nav>
    </header>

    <main class="container section">
        <div style="text-align: center; max-width: 600px; margin: 0 auto;">
            <?php if ($recipe): ?>
                <img src="<?= htmlspecialchars($image) ?>" alt="<?= htmlspecialchars($title) ?>" style="width: 100%; max-width: 400px; border-radius: 16px; margin-bottom: 24px;">
                <h1><?= htmlspecialchars($title) ?></h1>
                <p class="lead"><?= htmlspecialchars($description) ?></p>
            <?php else: ?>
                <h1>Recipe Not Found</h1>
                <p class="lead">This recipe might have been removed or the link is incorrect.</p>
            <?php endif; ?>
            
            <div style="margin-top: 32px;">
                <a href="<?= APP_STORE_URL ?>" class="btn btn-full">
                    Open in Meal Mingle App
                </a>
            </div>
        </div>
    </main>
</body>
</html>