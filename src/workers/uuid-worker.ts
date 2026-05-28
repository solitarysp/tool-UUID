import { v1, v3, v4, v5, v6, v7, v1ToV6, NIL, MAX, validate } from 'uuid';
import { ulid } from 'ulid';
import { nanoid } from 'nanoid';
import { createId as cuid2 } from '@paralleldrive/cuid2';

export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'nil' | 'max' | 'ulid' | 'nanoid' | 'cuid2' | 'snowflake';
export type NamespaceType = 'dns' | 'url' | 'oid' | 'x500' | 'custom';

export interface GeneratorOptions {
  version: UuidVersion;
  quantity: number;
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
  namespaceType: NamespaceType;
  customNamespace: string;
  nameValue: string;
}

const NS_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const NS_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
const NS_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
const NS_X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

let sfSequence = 0;
let sfLastTimestamp = -1;
function generateSnowflake(): string {
  let timestamp = Date.now();
  if (timestamp === sfLastTimestamp) {
    sfSequence = (sfSequence + 1) & 4095;
    if (sfSequence === 0) {
      while (Date.now() <= timestamp) {} // Wait to avoid collision
      timestamp = Date.now();
    }
  } else {
    sfSequence = 0;
  }
  sfLastTimestamp = timestamp;
  const epoch = 1288834974657n; // Twitter Epoch
  const time = BigInt(timestamp) - epoch;
  return ((time << 22n) | (1n << 12n) | BigInt(sfSequence)).toString();
}

self.onmessage = (e: MessageEvent<{ options: GeneratorOptions }>) => {
  const { options } = e.data;
  const { version, quantity, uppercase, hyphens, braces, namespaceType, customNamespace, nameValue } = options;
  const newItems: string[] = [];

  // Resolve namespace
  let resolvedNamespace = NS_DNS;
  if (namespaceType === 'url') resolvedNamespace = NS_URL;
  else if (namespaceType === 'oid') resolvedNamespace = NS_OID;
  else if (namespaceType === 'x500') resolvedNamespace = NS_X500;
  else if (namespaceType === 'custom') {
    if (customNamespace && validate(customNamespace)) {
      resolvedNamespace = customNamespace;
    } else {
      resolvedNamespace = NS_DNS;
    }
  }

  const safeName = nameValue || 'example';

  try {
    for (let i = 0; i < quantity; i++) {
      let id = '';
      switch (version) {
        case 'v1': id = v1(); break;
        case 'v3': id = v3(safeName, resolvedNamespace); break;
        case 'v4': id = v4(); break;
        case 'v5': id = v5(safeName, resolvedNamespace); break;
        case 'v6': id = v6 ? v6() : v1ToV6 ? v1ToV6(v1()) : v4(); break;
        case 'v7': id = v7 ? v7() : v4(); break;
        case 'nil': id = NIL; break;
        case 'max': id = MAX || 'ffffffff-ffff-ffff-ffff-ffffffffffff'; break;
        case 'ulid': id = ulid(); break;
        case 'nanoid': id = nanoid(); break;
        case 'cuid2': id = cuid2(); break;
        case 'snowflake': id = generateSnowflake(); break;
        default: id = v4();
      }

      // Apply formatting (only if it's a UUID version that has hyphens by default, but let's apply across if possible)
      if (!hyphens && ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'nil', 'max'].includes(version)) {
        id = id.replace(/-/g, '');
      }
      if (uppercase && ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'nil', 'max'].includes(version) || version === 'ulid' && uppercase) {
        id = id.toUpperCase();
      }
      if (braces && ['v1', 'v3', 'v4', 'v5', 'v6', 'v7', 'nil', 'max'].includes(version)) {
        id = `{${id}}`;
      }

      newItems.push(id);
    }
  } catch (e: any) {
    newItems.push("Error generating UUIDs with current parameters");
  }

  self.postMessage({ results: newItems });
};
