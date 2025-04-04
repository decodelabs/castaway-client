# Castaway

An open, reusable and simple implementation of component islands.

## Installation

```bash
npm install @decodelabs/castaway
```

## Usage

### Component Islands

Define components in your app to be exposed as islands. These components can be either Vue or React components.

```javascript
import { createCastawayApp } from '@decodelabs/castaway'
import vue from '@decodelabs/castaway/vue'
import react from '@decodelabs/castaway/react'

createCastawayApp({
    // Components loadable from HTML
    components: {
        'MyVueComponent': () => vue(import('./components/vue-component.vue')),
        'MyReactComponent': () => react(import('./components/react-component.jsx')),
    },
})
```

```html
<component-island vue:name="MyComponent" props="{'key': 'value'}">
    <p>Fallback content</p>
</component-island>
```

### Fragment Islands

Load HTML fragments from the server asyncronously with fragment islands:

```html
<fragment-island src="https://example.com/my-content-fragment">
    <p>Fallback content</p>
</fragment-island>
```

### Page and Layout Islands

Structure your page with page-island and layout-island elements to create an SPA browsing experience while keeping routing and content generation server side.

```html
<html>
    <head>
        <title>Home</title>
    </head>
    <body>
        <layout-island name="my-layout">
            <header>
                <h1>Home</h1>
                <nav>
                    <a href="/home">Home</a>
                    <a href="/about">About</a>
                </nav>
            </header>
            <page-island>
                <h2>Welcome to the Home Page</h2>
                <p>This is the content of the home page.</p>
                <component-island vue:name="MyComponent" props="{'key': 'value'}">
                    <p>Fallback content</p>
                </component-island>
            </page-island>
            <footer>
                <p>Footer content</p>
            </footer>
        </layout-island>
    </body>
</html>
```

Navigation events are intercepted and destination pages are loaded asyncronously into either the page or layout island depending on the content returned. Title and meta tags are updated automatically, and component / fragment islands that are present across both pages are preserved without reloading.

## Licensing

Castaway is licensed under the MIT License. See [LICENSE](./LICENSE) for the full license text.
