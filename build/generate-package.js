const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

// Directories
const ICONS_DIR = path.join(__dirname, '../icons');
const DIST_DIR = path.join(__dirname, '../dist');
const SVG_DIR = path.join(__dirname, '../svg');
const REACT_DIR = path.join(__dirname, '../react');
const VUE_DIR = path.join(__dirname, '../vue');

// Clean dist directories
console.log('🧹 Cleaning output directories...');
[DIST_DIR, SVG_DIR, REACT_DIR, VUE_DIR].forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });
});

// Read all SVG files
console.log('📦 Reading SVG files...');
const svgFiles = fs.readdirSync(ICONS_DIR).filter(file => file.endsWith('.svg'));

if (svgFiles.length === 0) {
    console.warn('⚠️  No SVG files found in icons directory!');
    process.exit(1);
}

console.log(`Found ${svgFiles.length} icons`);

// SVGO configuration
const svgoConfig = {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeViewBox: false,
                },
            },
        },
        'removeDimensions',
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [
                    { width: '1em' },
                    { height: '1em' },
                    { fill: 'currentColor' }
                ],
            },
        },
    ],
};

// Helper functions
function toPascalCase(str) {
    return str
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

function optimizeSVG(svgContent) {
    const result = optimize(svgContent, svgoConfig);
    return result.data;
}

// Generate React component
function generateReactComponent(iconName, svgContent) {
    const componentName = toPascalCase(iconName);
    const optimizedSVG = optimizeSVG(svgContent);

    // Extract SVG attributes and inner content
    const svgMatch = optimizedSVG.match(/<svg([^>]*)>(.*?)<\/svg>/s);
    if (!svgMatch) return null;

    const [, attrs, inner] = svgMatch;

    return `import React from 'react';

export interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  size = 24, 
  color = 'currentColor',
  ...props 
}) => {
  return (
    <svg
      ${attrs.trim()}
      width={size}
      height={size}
      fill={color}
      {...props}
    >
      ${inner}
    </svg>
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};
`;
}

// Generate Vue component
function generateVueComponent(iconName, svgContent) {
    const componentName = toPascalCase(iconName);
    const optimizedSVG = optimizeSVG(svgContent);

    // Extract SVG attributes and inner content
    const svgMatch = optimizedSVG.match(/<svg([^>]*)>(.*?)<\/svg>/s);
    if (!svgMatch) return null;

    const [, attrs, inner] = svgMatch;

    return `<template>
  <svg
    ${attrs.trim()}
    :width="size"
    :height="size"
    :fill="color"
    v-bind="$attrs"
  >
    ${inner}
  </svg>
</template>

<script>
export default {
  name: '${componentName}',
  props: {
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  }
};
</script>
`;
}

// Process all icons
console.log('⚙️  Generating components...');
const iconMetadata = [];

svgFiles.forEach((file, index) => {
    const iconName = file.replace('.svg', '');
    const componentName = toPascalCase(iconName);
    const svgPath = path.join(ICONS_DIR, file);
    const svgContent = fs.readFileSync(svgPath, 'utf-8');

    console.log(`  [${index + 1}/${svgFiles.length}] ${iconName}`);

    // 1. Copy optimized SVG
    const optimizedSVG = optimizeSVG(svgContent);
    fs.writeFileSync(path.join(SVG_DIR, file), optimizedSVG);

    // 2. Generate React component
    const reactComponent = generateReactComponent(iconName, svgContent);
    if (reactComponent) {
        fs.writeFileSync(path.join(REACT_DIR, `${componentName}.tsx`), reactComponent);
    }

    // 3. Generate Vue component
    const vueComponent = generateVueComponent(iconName, svgContent);
    if (vueComponent) {
        fs.writeFileSync(path.join(VUE_DIR, `${componentName}.vue`), vueComponent);
    }

    iconMetadata.push({
        name: iconName,
        componentName,
        file
    });
});

// Generate React index file
console.log('📝 Generating index files...');
const reactIndexContent = iconMetadata
    .map(({ componentName }) => `export { ${componentName} } from './${componentName}';`)
    .join('\n') + '\n';

fs.writeFileSync(path.join(REACT_DIR, 'index.ts'), reactIndexContent);

// Generate Vue index file
const vueIndexContent = iconMetadata
    .map(({ componentName }) => `export { default as ${componentName} } from './${componentName}.vue';`)
    .join('\n') + '\n';

fs.writeFileSync(path.join(VUE_DIR, 'index.ts'), vueIndexContent);

// Generate main index file (CommonJS)
const mainIndexContent = `module.exports = {
  react: require('./react'),
  vue: require('./vue'),
  svg: require('./svg')
};
`;

fs.writeFileSync(path.join(DIST_DIR, 'index.js'), mainIndexContent);

// Generate ESM index file
const esmIndexContent = iconMetadata
    .map(({ componentName }) => `export { ${componentName} } from './react/${componentName}';`)
    .join('\n') + '\n';

fs.writeFileSync(path.join(DIST_DIR, 'index.esm.js'), esmIndexContent);

// Generate TypeScript definitions
const dtsContent = iconMetadata
    .map(({ componentName }) => `export { ${componentName} } from './react/${componentName}';`)
    .join('\n') + '\n';

fs.writeFileSync(path.join(DIST_DIR, 'index.d.ts'), dtsContent);

// Generate icon catalog JSON
const catalogContent = JSON.stringify(iconMetadata, null, 2);
fs.writeFileSync(path.join(DIST_DIR, 'catalog.json'), catalogContent);

// Success
console.log('✅ Build complete!');
console.log(`   Generated ${iconMetadata.length} icons`);
console.log(`   📁 SVG: ${SVG_DIR}`);
console.log(`   ⚛️  React: ${REACT_DIR}`);
console.log(`   💚 Vue: ${VUE_DIR}`);
console.log(`   📦 Dist: ${DIST_DIR}`);
