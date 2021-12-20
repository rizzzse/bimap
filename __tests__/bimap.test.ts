import { BiMap } from "../src/bimap";

test("!!bimap == bimap", () => {
    const bimap = new BiMap();
    expect(bimap.inverse.inverse).toBe(bimap);
});

test("extends should also be extended to 'inverse'.", () => {
    class MyBiMap<K, V> extends BiMap<K, V> {
        declare readonly inverse: MyBiMap<V, K>;
    }
    const bimap = new MyBiMap();
    expect(bimap.inverse).toBeInstanceOf(MyBiMap);
});

describe("delete", () => {
    test("a value should also be deleted from 'inverse'.", () => {
        const bimap = new BiMap([["key", "value"]]);
        expect(bimap.delete("key")).toBe(true);
        expect(bimap.size).toBe(0);
        expect(bimap.inverse.size).toBe(0);
    });
    test("it should not be affected by non-existent keys.", () => {
        const bimap = new BiMap([["key", undefined]]);
        expect(bimap.delete("non-existent key")).toBe(false);
        expect(bimap.size).toBe(1);
        expect(bimap.inverse.size).toBe(1);
    });
});

describe("set", () => {
    test("a value should also be set to 'inverse'.", () => {
        const bimap = new BiMap();
        bimap.set("key", "value");
        expect(bimap.get("key")).toBe("value");
        expect(bimap.inverse.get("value")).toBe("key");
        expect(bimap.size).toBe(1);
        expect(bimap.inverse.size).toBe(1);
    });
    test("duplicate values should be overwritten with new values.", () => {
        const bimap = new BiMap();
        bimap.set("hoge", "value");
        bimap.set("hogera", "value");
        expect(bimap.get("hogera")).toBe("value");
        expect(bimap.inverse.get("value")).toBe("hogera");
        expect(bimap.size).toBe(1);
        expect(bimap.inverse.size).toBe(1);
    });
    test.each<() => Iterable<[unknown, unknown]>>([
        () => [[1, 1], [2, 2]],
        function*() {
            for(let i = 0; i < 10; i++) yield [i, i];
        },
    ])("initialize with an iterator that returns a tuple. [%#]", getIterable => {
        const bimap = new BiMap(getIterable());
        expect([...bimap]).toEqual([...getIterable()]);
    });
});
