// VehiclePassport.ts
import { 
  Storage, 
  Context, 
  generateEvent, 
} from "@massalabs/massa-as-sdk";
import { 
  Args, 
  stringToBytes,
  bytesToString,
  u64ToBytes,
  bytesToU64,
} from '@massalabs/as-types';

// ========================================================
// CONSTANTS (keys are stored as bytes)
// ========================================================
const KEY_NAME = "NAME";
const KEY_SYMBOL = "SYMBOL";
const KEY_TOKEN_COUNTER = "TOKEN_COUNTER";

const PREFIX_TOKEN_URI = "URI_";
const PREFIX_OWNER = "OWNER_";
const PREFIX_RECORD_COUNT = "REC_COUNT_";
const PREFIX_RECORD_DATA = "REC_DATA_";

// ========================================================
// CONSTRUCTOR
// ========================================================
export function constructor(binaryArgs: StaticArray<u8>): void {
  // initialize contract metadata and token counter = 0
  Storage.set(stringToBytes(KEY_NAME), stringToBytes("Vehicle Passport"));
  Storage.set(stringToBytes(KEY_SYMBOL), stringToBytes("VPASS"));
  Storage.set(stringToBytes(KEY_TOKEN_COUNTER), u64ToBytes(0));
}

// ========================================================
// WRITE FUNCTIONS
// ========================================================

/**
 * mint(to: string, tokenUri: string) -> returns tokenId (u64 as bytes)
 * Args: (toAddress: string, tokenUri: string)
 */
export function mint(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  
  const toAddress = args.nextString().expect("Address argument missing");
  const tokenUri = args.nextString().expect("URI argument missing");

  // 1. Get current Token ID (u64)
  const keyCounter = stringToBytes(KEY_TOKEN_COUNTER);
  let currentTokenId: u64 = 0;
  if (Storage.has(keyCounter)) {
    currentTokenId = bytesToU64(Storage.get(keyCounter));
  }

  // 2. Set Ownership
  const ownerKey = stringToBytes(PREFIX_OWNER + currentTokenId.toString());
  Storage.set(ownerKey, stringToBytes(toAddress));

  // 3. Set URI
  const uriKey = stringToBytes(PREFIX_TOKEN_URI + currentTokenId.toString());
  Storage.set(uriKey, stringToBytes(tokenUri));

  // 4. Increment Counter
  const nextTokenId = currentTokenId + 1;
  Storage.set(keyCounter, u64ToBytes(nextTokenId));

  // Return tokenId (as bytes)
  return u64ToBytes(currentTokenId);
}

/**
 * addServiceRecord(tokenId: u64, json: string)
 * Only owner may add a service record.
 */
export function addServiceRecord(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  
  const tokenId = args.nextU64().expect("TokenId argument missing");
  const json = args.nextString().expect("JSON argument missing");

  const ownerKey = stringToBytes(PREFIX_OWNER + tokenId.toString());
  
  assert(Storage.has(ownerKey), "Nonexistent token");
  
  // Verify Caller is Owner
  const storedOwnerBytes = Storage.get(ownerKey);
  const storedOwnerString = bytesToString(storedOwnerBytes);
  const callerString = Context.caller().toString();
  
  assert(storedOwnerString == callerString, "Caller is not token owner");
  assert(json.length > 0, "Empty JSON");

  // Manage "array" length
  const countKey = stringToBytes(PREFIX_RECORD_COUNT + tokenId.toString());
  let currentCount: u64 = 0;
  
  if (Storage.has(countKey)) {
    currentCount = bytesToU64(Storage.get(countKey));
  }

  // Store new record at index = currentCount
  const dataKey = stringToBytes(PREFIX_RECORD_DATA + tokenId.toString() + "_" + currentCount.toString());
  Storage.set(dataKey, stringToBytes(json));

  // Update length
  const nextCount = currentCount + 1;
  Storage.set(countKey, u64ToBytes(nextCount));

  // Emit event with useful info (tokenId and index)
  generateEvent("ServiceRecordAdded tokenId=" + tokenId.toString() + " index=" + currentCount.toString());
}

// ========================================================
// READ FUNCTIONS
// All exported read functions accept binaryArgs and return bytes
// ========================================================

/**
 * tokenURI(tokenId: u64) -> string (bytes)
 * Args: (tokenId: u64)
 */
export function tokenURI(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args.nextU64().expect("TokenId argument missing");

  const ownerKey = stringToBytes(PREFIX_OWNER + tokenId.toString());
  assert(Storage.has(ownerKey), "Nonexistent token");

  const uriKey = stringToBytes(PREFIX_TOKEN_URI + tokenId.toString());
  
  if (!Storage.has(uriKey)) {
      return stringToBytes("");
  }
  return Storage.get(uriKey);
}

/**
 * ownerOf(tokenId: u64) -> string (bytes)
 * Args: (tokenId: u64)
 */
export function ownerOf(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args.nextU64().expect("TokenId argument missing");

  const ownerKey = stringToBytes(PREFIX_OWNER + tokenId.toString());
  assert(Storage.has(ownerKey), "Nonexistent token");

  return Storage.get(ownerKey);
}

/**
 * getServiceRecordCount(tokenId: u64) -> u64 (bytes)
 * Args: (tokenId: u64)
 */
export function getServiceRecordCount(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args.nextU64().expect("TokenId argument missing");

  const ownerKey = stringToBytes(PREFIX_OWNER + tokenId.toString());
  assert(Storage.has(ownerKey), "Nonexistent token");

  const countKey = stringToBytes(PREFIX_RECORD_COUNT + tokenId.toString());
  if (!Storage.has(countKey)) {
    return u64ToBytes(0);
  }
  return Storage.get(countKey);
}

/**
 * getServiceRecordAt(tokenId: u64, index: u64) -> string (bytes)
 * Args: (tokenId: u64, index: u64)
 */
export function getServiceRecordAt(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const tokenId = args.nextU64().expect("TokenId argument missing");
  const index = args.nextU64().expect("Index argument missing");

  const ownerKey = stringToBytes(PREFIX_OWNER + tokenId.toString());
  assert(Storage.has(ownerKey), "Nonexistent token");

  // read count and bounds-check
  const countKey = stringToBytes(PREFIX_RECORD_COUNT + tokenId.toString());
  let currentCount: u64 = 0;
  if (Storage.has(countKey)) {
    currentCount = bytesToU64(Storage.get(countKey));
  }
  assert(index < currentCount, "Index out of bounds");

  const dataKey = stringToBytes(PREFIX_RECORD_DATA + tokenId.toString() + "_" + index.toString());
  return Storage.get(dataKey);
}
