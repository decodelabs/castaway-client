# Castaway

An open, reusable and simple implementation of component islands, for most major front end frameworks.

## Installation

```bash
npm install @decodelabs/castaway
```

## Usage

```javascript
import { createCastawayApp } from '@decodelabs/castaway'
import vue from '@decodelabs/castaway/vue'
import react from '@decodelabs/castaway/react'

createCastawayApp({
    // Framework integrations
    integrations: [
        vue,
        react
    ],

    // Components loadable from HTML
    components: {
        'MyComponent': () => import('./components/my-component.vue')
    },
})
```

```html
<component-island vue:src="MyComponent">
    <p>This is slot content</p>
</component-island>

<content-island src="https://example.com/my-content-fragment">
    <p>This is slot content</p>
</content-island>
```
