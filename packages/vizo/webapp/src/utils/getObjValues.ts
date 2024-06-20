type AnyObject = Record<string, any>;

export function getObjectValues(obj: AnyObject, parentKey?: any): any[] {
  const values: any[] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // If the value is a nested object, recursively get its values
        const nestedValues = getObjectValues(value, fullKey);
        values.push(...nestedValues);
      } else {
        values.push(value);
      }
    }
  }
  return values;
}
