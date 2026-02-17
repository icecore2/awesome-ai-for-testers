# 🤖 Awesome AI for Testers

A curated collection of AI-powered testing resources, organized by categories with an interactive GitHub Pages website.

## 🌐 Website

Visit the interactive website: [https://icecore2.github.io/awesome-ai-for-testers/](https://icecore2.github.io/awesome-ai-for-testers/)

### Features

- **📚 Category-based Organization**: Resources organized into logical categories
- **🔍 Real-time Search**: Search across titles, tags, categories, and content
- **🎯 Category Filtering**: Filter resources by specific categories
- **📄 Pagination**: Browse resources with paginated views
- **📖 Detailed Views**: Click on any resource to view full content and instructions
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 📁 Repository Structure

```
.
├── index.html              # Main GitHub Pages entry point
├── app.js                  # JavaScript for dynamic content loading
├── styles.css              # Styling for the website
└── data/                   # Content directory
    ├── test-generation/    # Test generation resources
    │   ├── *.md           # Resource content
    │   ├── *.instructions.md  # Step-by-step instructions
    │   └── *.manifest.json    # Metadata (title, tags, difficulty, etc.)
    ├── test-automation/    # Test automation resources
    └── test-analysis/      # Test analysis resources
```

## 🚀 Adding New Resources

To add a new resource, create three files in the appropriate category directory:

### 1. Content File (`resource-name.md`)
Main content with overview, features, benefits, and tools.

### 2. Instructions File (`resource-name.instructions.md`)
Step-by-step instructions for getting started.

### 3. Manifest File (`resource-name.manifest.json`)
Metadata about the resource:

```json
{
  "title": "Resource Title",
  "category": "category-name",
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "beginner|intermediate|advanced",
  "author": "Author Name",
  "lastUpdated": "2026-02-09",
  "readTime": "5 min"
}
```

### Adding New Categories

1. Create a new directory under `data/` (e.g., `data/new-category/`)
2. Add your resources following the structure above
3. Update `app.js` to include the new category in the `fileMap` object

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request with:
- New resources
- Updates to existing resources
- New categories
- Website improvements

## 📄 License

This project is licensed under the terms specified in the LICENSE file.
