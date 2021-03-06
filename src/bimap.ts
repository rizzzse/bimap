import { equals, isObject } from "emnorst";

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
        if(this.has(key)) {
            const kval = this.get(key)!;
            if(equals(kval, val)) return this;
            mapDelete.call(this.inverse, kval);
        }
        if(this.inverse.has(val)) {
            const vkey = this.inverse.get(val)!;
            mapDelete.call(this, vkey);
        }
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
        if(!isObject(key) || !isObject(val)) {
            throw new TypeError("Invalid value used as weak map key");
        }
        const kval = this.get(key);
        if(kval === val) return this;
        if(kval !== undefined) weakDelete.call(this.inverse, kval);
        const vkey = this.inverse.get(val);
        if(vkey !== undefined) weakDelete.call(this, vkey);
        weakSet.call(this, key, val);
        weakSet.call(this.inverse, val, key);
        return this;
    }
}
