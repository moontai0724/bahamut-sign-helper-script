/**
 * Get a recursive proxy option for the proxy object, which will auto trigger
 * parent setter when the child setter is triggered.
 * @param parentTarget parent of this item
 * @param parentKey key of this item in the parent
 * @returns a recursive proxy option for the proxy object
 */
// eslint-disable-next-line max-lines-per-function
export function getRecursiveProxyOptions<
  T extends Record<number | string | symbol, object>,
  K extends keyof T,
>(parentTarget: T, parentKey: K): ProxyHandler<T[K]> {
  const handler: ProxyHandler<T[K]> = {
    get(itemTarget, itemKey) {
      // type the variables
      type ItemTarget = typeof itemTarget;
      type ItemKeys = keyof ItemTarget;
      const typedItemKey = itemKey as ItemKeys;

      // get current item
      const itemValue = itemTarget[typedItemKey];

      // if the item is an object, return a proxy
      if (typeof itemValue === "object" && itemValue !== null) {
        return new Proxy(
          itemValue,
          getRecursiveProxyOptions(
            new Proxy(itemTarget, handler) as Record<
              number | string | symbol,
              object
            >,
            itemKey,
          ),
        );
      }

      // return the item
      return itemValue;
    },
    set(itemTarget, itemKey, itemValue) {
      // type the variables
      type ItemTarget = typeof itemTarget;
      type ItemKeys = keyof ItemTarget;
      const typedItemKey = itemKey as ItemKeys;
      const typedItemValue = itemValue as ItemTarget[ItemKeys];

      // update current item
      itemTarget[typedItemKey] = typedItemValue;

      // trigger parent setter
      parentTarget[parentKey] = itemTarget;

      // report success
      return true;
    },
  };

  return handler;
}
