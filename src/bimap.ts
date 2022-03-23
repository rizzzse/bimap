const { clear: mapClear, delete: mapDelete, set: mapSet } = Map.prototype;

export class BiMap<K, V> extends Map<K, V> {
    readonly inverse: BiMap<V, K>;
    constructor(iterable?: Iterable<readonly [K, V]> | null) {
        super();
        if(iterable instanceof BiMap && !iterable.inverse) {
            this.inverse = iterable;
        } else {
            this.inverse = new new.target(this as unknown as []);
            if(iterable != null) {
                for(const { 0: key, 1: value } of iterable) {
                    this.set(key, value);
                }
            }
        }
    }
    override clear(): void {
        mapClear.call(this);
        mapClear.call(this.inverse);
    }
    override delete(key: K): boolean {
        const val = this.get(key);
        return mapDelete.call(this, key)
            && mapDelete.call(this.inverse, val);
    }
    override set(key: K, val: V): this {
        this.delete(key);
        this.inverse.delete(val);
        mapSet.call(this, key, val);
        mapSet.call(this.inverse, val, key);
        return this;
    }
}

const { delete: weakDelete, set: weakSet } = WeakMap.prototype;

export type WeakMapConstraint = any extends WeakMap<infer T, any> ? T : never;

export class WeakBiMap<
    K extends WeakMapConstraint,
    V extends WeakMapConstraint,
> extends WeakMap<K, V> {
    readonly inverse: WeakBiMap<V, K>;
    constructor(iterable?: Iterable<readonly [K, V]> | null) {
        super();
        if(iterable instanceof WeakBiMap && !iterable.inverse) {
            this.inverse = iterable;
        } else {
            this.inverse = new new.target(this as unknown as []);
            if(iterable != null) {
                for(const { 0: key, 1: value } of iterable) {
                    this.set(key, value);
                }
            }
        }
    }
    override delete(key: K): boolean {
        const val = this.get(key);
        return weakDelete.call(this, key)
            && weakDelete.call(this.inverse, val!);
    }
    override set(key: K, val: V): this {
        this.delete(key);
        this.inverse.delete(val);
        weakSet.call(this, key, val);
        weakSet.call(this.inverse, val, key);
        return this;
    }
}
