# bimap

A simple and tiny bi-directional map that extends ES2015's Map.
BiMap can be operated with the same interface as Map, and you can get an inverted BiMap with `inverse`.

```ts
// cjs
const { BiMap, WeakBiMap } = require("@rizzzse/bimap");
// esm
import { BiMap, WeakBiMap } from "@rizzzse/bimap";

const bimap = new BiMap([["key", "value"]]);
bimap.get("key");           // === "value"
bimap.inverse.get("value"); // === "key"

bimap.set("key2", "value");
bimap.has("key");           // === false
bimap.get("key2");          // === "value"
bimap.inverse.get("value"); // === "key2"
```

```ts
class MyBiMap<K, V> extends BiMap<K, V> {
    declare readonly inverse: MyBiMap<V, K>;
    myMethod() {
        // ...
    }
}
```
