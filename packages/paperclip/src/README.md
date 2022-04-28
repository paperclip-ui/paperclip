Features:

- variants
- slots
- components

Example:

```html
<module xmlns:some-import="./file.pc">
  <component id="test">
    <template>
      <text ref="text-ref" />
    </template>
  </component>

  <component id="test2" extends="test">
    <remove-child="text-ref" />
  </component>
</module>
```

VM:

```typescript
import { loadEntry, evaluateEntry } from "paperclip";
const info = await loadEntry("test.pc", { openFile, graph });
const { componentPreviews } = evaluateEntry(
  await loadEntry("test.pc", { openFile })
);
```
