import { BiMap, WeakBiMap, WeakMapConstraint } from "../src/bimap";

describe.each([
    { BiMap },
    { BiMap: WeakBiMap },
])("$BiMap.prototype.constructor.name", ({ BiMap }) => {
    test("!!bimap == bimap", () => {
        const bimap = new BiMap();
        expect(bimap.inverse.inverse).toBe(bimap);
    });
    test("extends should also be extended to 'inverse'.", () => {
        class MyBiMap<
            K extends WeakMapConstraint,
            V extends WeakMapConstraint,
        > extends BiMap<K, V> {
            declare readonly inverse: MyBiMap<V, K>;
        }
        const bimap = new MyBiMap();
        expect(bimap.inverse).toBeInstanceOf(MyBiMap);
    });
});

describe("BiMap", () => {
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
        test("enumerate in insertion order.", () => {
            const bimap = new BiMap();
            bimap.set("hoge", "value");
            bimap.set("fuga", "fugafugafuga");
            bimap.set("hoge", "value");
            bimap.set("hoge", "piyo");
            expect([...bimap]).toEqual([
                ["hoge", "piyo"],
                ["fuga", "fugafugafuga"],
            ]);
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
});

describe("WeakBiMap", () => {
    let o: (value: unknown) => { value: unknown };
    beforeEach(() => {
        const cache = new Map<unknown, { value: unknown }>();
        o = value => {
            if(!cache.has(value)) {
                cache.set(value, { value });
            }
            return cache.get(value)!;
        };
    });
    describe("delete", () => {
        test("a value should also be deleted from 'inverse'.", () => {
            const bimap = new BiMap([[o("key"), o("value")]]);
            expect(bimap.delete(o("key"))).toBe(true);
            expect(bimap.has(o("key"))).toBe(false);
            expect(bimap.inverse.has(o("value"))).toBe(false);
        });
        test("it should not be affected by non-existent keys.", () => {
            const bimap = new BiMap([[o("key"), o("value")]]);
            expect(bimap.delete(o("non-existent key"))).toBe(false);
            expect(bimap.has(o("key"))).toBe(true);
            expect(bimap.inverse.has(o("value"))).toBe(true);
        });
    });
    describe("set", () => {
        test("a value should also be set to 'inverse'.", () => {
            const bimap = new WeakBiMap();
            bimap.set(o("key"), o("value"));
            expect(bimap.get(o("key"))).toBe(o("value"));
            expect(bimap.inverse.get(o("value"))).toBe(o("key"));
        });
        test("duplicate values should be overwritten with new values.", () => {
            const bimap = new WeakBiMap();
            bimap.set(o("hoge"), o("value"));
            bimap.set(o("hogera"), o("value"));
            expect(bimap.get(o("hogera"))).toBe(o("value"));
            expect(bimap.inverse.get(o("value"))).toBe(o("hogera"));
            expect(bimap.has(o("hoge"))).toBe(false);
        });
        test("set primitive value should not change Map.", () => {
            const bimap = new WeakBiMap();
            bimap.set(o("key"), o("value"));
            expect(() => {
                bimap.set(o("key"), "primitive" as {});
            }).toThrow(TypeError);
            expect(bimap.get(o("key"))).toBe(o("value"));
            expect(bimap.inverse.get(o("value"))).toBe(o("key"));
        });
        test.each<() => Iterable<[WeakMapConstraint, WeakMapConstraint]>>([
            () => [[o(1), o(1)], [o(2), o(2)]],
            function*() {
                for(let i = 0; i < 10; i++) yield [o(i), o(i)];
            },
        ])("initialize with an iterator that returns a tuple. [%#]", getIterable => {
            const bimap = new WeakBiMap(getIterable());
            for(const [key, value] of getIterable()) {
                expect(bimap.get(key)).toBe(value);
            }
        });
    });
});
