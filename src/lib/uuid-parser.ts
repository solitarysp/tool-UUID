import { validate, version as getUuidVersion } from 'uuid';

export interface ParsedIdentifier {
  valid: boolean;
  type?: string;
  version?: number | string;
  variant?: string;
  date?: Date | null;
  note?: string;
  error?: string;
}

export function parseUuid(uuidStr: string): ParsedIdentifier | null {
  const cleanUuid = uuidStr.trim();
  if (!cleanUuid) return null;

  if (cleanUuid === '00000000-0000-0000-0000-000000000000') {
    return { valid: true, type: 'nil', version: 'nil', note: 'NIL UUID (All zeros)' };
  }
  if (cleanUuid.toLowerCase() === 'ffffffff-ffff-ffff-ffff-ffffffffffff') {
    return { valid: true, type: 'max', version: 'max', note: 'MAX UUID (All ones)' };
  }

  const isUlid = /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(cleanUuid);
  const isNanoId = /^[A-Za-z0-9_-]{21}$/.test(cleanUuid);
  const isCuid2 = /^[a-z0-9]{24}$/.test(cleanUuid);
  const isSnowflake = /^[0-9]{17,20}$/.test(cleanUuid);
  
  let isStandardUuid = validate(cleanUuid);
  let withHyphens = cleanUuid;
  
  // If missing hyphens but valid length, try to insert hyphens
  if (!isStandardUuid && /^[0-9a-fA-F]{32}$/.test(cleanUuid)) {
    withHyphens = `${cleanUuid.slice(0, 8)}-${cleanUuid.slice(8, 12)}-${cleanUuid.slice(12, 16)}-${cleanUuid.slice(16, 20)}-${cleanUuid.slice(20)}`;
    if (validate(withHyphens)) {
      isStandardUuid = true;
    }
  }

  if (!isStandardUuid) {
    if (isUlid) {
       try {
         const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
         const timeStr = cleanUuid.substring(0, 10).toUpperCase();
         let time = 0;
         for (let i = 0; i < 10; i++) {
           time = time * 32 + CROCKFORD_BASE32.indexOf(timeStr[i]);
         }
         return { valid: true, type: 'ulid', version: 'ulid', date: new Date(time), note: 'This is a ULID.' };
       } catch(e) {
         return { valid: true, type: 'ulid', version: 'ulid', note: 'This is a ULID.' };
       }
    }
    if (isNanoId) {
       return { valid: true, type: 'nanoid', version: 'nanoid', note: 'This looks like a NanoID.' };
    }
    if (isCuid2) {
       return { valid: true, type: 'cuid2', version: 'cuid2', note: 'This looks like a CUID2.' };
    }
    if (isSnowflake) {
       try {
         const val = BigInt(cleanUuid);
         const ms = Number(val >> 22n) + 1288834974657; // Default twitter epoch
         return { valid: true, type: 'snowflake', version: 'snowflake', date: new Date(ms), note: 'This looks like a Snowflake ID (assuming Twitter Epoch).' };
       } catch (e) {
         return { valid: true, type: 'snowflake', version: 'snowflake', note: 'This looks like a Snowflake ID.' };
       }
    }
    return { valid: false, error: 'Invalid identifier format.' };
  }

  // Try to parse as UUID
  const normalized = withHyphens.replace(/-/g, '').toLowerCase();
  const ver = getUuidVersion(withHyphens);
  
  // Variant
  const variantChar = normalized.charAt(16);
  const variantInt = parseInt(variantChar, 16);
  let variantStr = 'Unknown';
  if (variantInt >= 0 && variantInt <= 7) variantStr = 'NCS backward compatibility (0 x x)';
  else if (variantInt >= 8 && variantInt <= 11) variantStr = 'RFC 4122 / DCE 1.1 (1 0 x)';
  else if (variantInt >= 12 && variantInt <= 13) variantStr = 'Microsoft Corporation (1 1 0)';
  else if (variantInt >= 14) variantStr = 'Reserved for Future Use (1 1 1)';

  let date: Date | null = null;

  try {
    if (ver === 1) {
        const time_low = normalized.substring(0, 8);
        const time_mid = normalized.substring(8, 12);
        const time_hi = normalized.substring(13, 16);
        const timeHex = time_hi + time_mid + time_low;
        const time100ns = BigInt('0x' + timeHex);
        const unixTimeMs = Number((time100ns - 122192928000000000n) / 10000n);
        date = new Date(unixTimeMs);
    } else if (ver === 6) {
        const time_high = normalized.substring(0, 8);
        const time_mid = normalized.substring(8, 12);
        const time_low = normalized.substring(13, 16);
        const timeHex = time_high + time_mid + time_low;
        const time100ns = BigInt('0x' + timeHex);
        const unixTimeMs = Number((time100ns - 122192928000000000n) / 10000n);
        date = new Date(unixTimeMs);
    } else if (ver === 7) {
        const timeHex = normalized.substring(0, 12);
        const unixTimeMs = Number(BigInt('0x' + timeHex));
        date = new Date(unixTimeMs);
    }
  } catch(e) {
    // Ignore timestamp parsing errors
  }

  return {
    valid: true,
    type: 'uuid',
    version: ver,
    variant: variantStr,
    date: date
  }
}
