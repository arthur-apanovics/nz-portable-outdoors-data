import "reflect-metadata";

const metadataKey = Symbol("display");

export function display(name: string) {
  return Reflect.metadata(metadataKey, name);
}

export function getDisplayNameMetadata(target: any, propertyKey: string) {
  return Reflect.getMetadata(metadataKey, target, propertyKey);
}
