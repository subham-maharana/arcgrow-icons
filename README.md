# Arcgrow Icons

A modern, open-source icon library with automatic publishing from Figma to NPM.

[![NPM Version](https://img.shields.io/npm/v/@arcgrow/icons)](https://www.npmjs.com/package/@arcgrow/icons)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Installation

```bash
npm install @arcgrow/icons
```

## 📦 Usage

### React

```jsx
import { ArrowLeft, Home, Search } from '@arcgrow/icons/react';

function App() {
  return (
    <div>
      <ArrowLeft size={24} color="#000" />
      <Home size={32} />
      <Search />
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <ArrowLeft :size="24" color="#000" />
    <Home :size="32" />
  </div>
</template>

<script>
import { ArrowLeft, Home } from '@arcgrow/icons/vue';

export default {
  components: { ArrowLeft, Home }
};
</script>
```

### Plain SVG

```javascript
import arrowLeftSVG from '@arcgrow/icons/svg/arrow-left.svg';

// Use in HTML
document.getElementById('icon').innerHTML = arrowLeftSVG;
```

## 🎨 Icon Browser

Visit our [icon showcase website](https://your-username.github.io/arcgrow-icons/) to browse all available icons.

## 🔄 How It Works

This project uses a fully automated pipeline:

1. **Designers** update icons in Figma using our plugin
2. **Plugin** pushes SVG files directly to GitHub
3. **GitHub Actions** automatically builds and publishes NPM package
4. **Website** updates instantly with new icons

## 📁 Repository Structure

```
arcgrow-icons/
├── icons/              # SVG source files (from Figma)
│   ├── arrow-left.svg
│   ├── arrow-right.svg
│   └── metadata.json
├── build/              # NPM package builder
│   └── generate-package.js
├── website/            # GitHub Pages site
│   └── index.html
└── .github/workflows/  # Automation
    └── publish.yml
```

## 👥 For Designers

See the [Figma Plugin README](../figma-plugin/README.md) for instructions on pushing icons from Figma.

## 🛠️ For Developers

### Contributing Icons

Icons are managed through Figma. If you want to contribute, please open an issue.

### Local Development

```bash
# Clone repository
git clone https://github.com/your-username/arcgrow-icons.git
cd arcgrow-icons

# Install dependencies
npm install

# Build package
npm run build

# Test locally
npm link
```

## 📄 License

MIT © Arcgrow

## 🙏 Credits

Built with ❤️ by the Arcgrow team.
