const { clear, delete: $delete, set } = Map.prototype;

export class BiMap<K, V> extends Map<K, V> {
    readonly inverse: BiMap<V, K>;
    constructor(iterable?: Iterable<readonly [K, V]> | null) {
        super();
        if(iterable instanceof BiMap && !iterable.inverse) {
            this.inverse = iterable;
        } else {
            this.inverse = new BiMap(this as unknown as []);
            if(iterable != null) {
                for(const { 0: key, 1: value } of iterable) {
                    this.set(key, value);
                }
            }
        }
    }
    override clear(): void {
        clear.call(this);
        clear.call(this.inverse);
    }
    override delete(key: K): boolean {
        const val = this.get(key);
        return $delete.call(this, key)
            && $delete.call(this.inverse, val);
    }
    override set(key: K, val: V): this {
        this.delete(key);
        this.inverse.delete(val);
        set.call(this, key, val);
        set.call(this.inverse, val, key);
        return this;
    }
}
