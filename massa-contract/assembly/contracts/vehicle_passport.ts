// Vehicle Passport NFT (Massa version)
// Implements: minting, tokenURI, metadata hash, and service records Storage.

import {
  Storage,
  generateEvent,
  Context,
} from "@massalabs/massa-as-sdk";

// ===========================
// Storage KEYS (PREFIXES)
// ===========================
const TOKEN_COUNTER = "tokenCounter";                   // uint counter
const OWNER_OF = "ownerOf:";                            // ownerOf:<tokenId>
const TOKEN_URI = "tokenURI:";                          // tokenURI:<tokenId>
const METADATA_HASH = "metadataHash:";                  // metadataHash:<tokenId>
const SERVICE_RECORDS = "serviceRecords:";              // serviceRecords:<tokenId> (JSON array string)


// ===========================
// INIT FUNCTION (REPLACES CONSTRUCTOR)
// ===========================
export function init(): void {
  if (!Storage.has(TOKEN_COUNTER)) {
    Storage.set(TOKEN_COUNTER, "0");
  }
}


// ===========================
// GET NEXT TOKEN ID
// ===========================
function nextTokenId(): u64 {
  let counter = U64.parseInt(Storage.get(TOKEN_COUNTER));
  let tokenId = counter;
  counter += 1;
  Storage.set(TOKEN_COUNTER, counter.toString());
  return tokenId;
}


// ===========================
// INTERNAL HELPERS
// ===========================
function requireTokenExists(tokenId: u64): void {
  if (!Storage.has(OWNER_OF + tokenId.toString())) {
    assert(false, "Nonexistent token");
  }
}


// ===========================
// MINT
// ===========================
export function mint(to: string, tokenURI: string): u64 {
  assert(to.length > 0, "Invalid address");

  const tokenId = nextTokenId();

  // Set owner
  Storage.set(OWNER_OF + tokenId.toString(), to);

  // Set tokenURI
  Storage.set(TOKEN_URI + tokenId.toString(), tokenURI);

  // Initialize empty service record array: "[]"
  Storage.set(SERVICE_RECORDS + tokenId.toString(), "[]");

  generateEvent(
    `Minted tokenId=${tokenId} to=${to}`
  );

  return tokenId;
}


// ===========================
// READ: tokenURI
// ===========================
export function tokenURIOf(tokenId: u64): string {
  requireTokenExists(tokenId);
  return Storage.get(TOKEN_URI + tokenId.toString());
}


// ===========================
// READ: metadata hash
// ===========================
export function metadataHashOf(tokenId: u64): string {
  requireTokenExists(tokenId);
  return Storage.get(METADATA_HASH + tokenId.toString());
}


// ===========================
// OWNER OF
// ===========================
export function ownerOf(tokenId: u64): string {
  requireTokenExists(tokenId);
  return Storage.get(OWNER_OF + tokenId.toString());
}


// ===========================
// ADD SERVICE RECORD
// ===========================
export function addServiceRecord(tokenId: u64, json: string): void {
  requireTokenExists(tokenId);
  assert(json.length > 0, "Empty JSON");

  const key = SERVICE_RECORDS + tokenId.toString();

  // Read existing JSON array
  const raw = Storage.get(key);
  let arr = decodeJsonArray(raw);

  // Append new entry
  arr.push(json);

  // Save back as JSON array
  Storage.set(key, encodeJsonArray(arr));

  generateEvent(
    `ServiceRecordAdded tokenId=${tokenId} json=${json}`
  );
}


// ===========================
// READ: service record count
// ===========================
export function getServiceRecordCount(tokenId: u64): u64 {
  requireTokenExists(tokenId);
  let arr = decodeJsonArray(Storage.get(SERVICE_RECORDS + tokenId.toString()));
  return arr.length;
}


// ===========================
// READ: service record at index
// ===========================
export function getServiceRecordAt(tokenId: u64, index: u64): string {
  requireTokenExists(tokenId);
  let arr = decodeJsonArray(Storage.get(SERVICE_RECORDS + tokenId.toString()));
;
  return arr[index as i32];
}


// ===========================
// JSON ARRAY HELPERS
// (simple Encode/Decode for string[])
//
// We store service records as: ["json1","json2",...]
// ===========================
function decodeJsonArray(raw: string): Array<string> {
  if (raw.length == 0) return new Array<string>();
  return raw
    .substring(1, raw.length - 1)
    .split('","')
    .map<string>((v: string, i: i32): string => {
      return v.replace('"', "").replace('"', "");
    });
}

function encodeJsonArray(arr: Array<string>): string {
  if (arr.length == 0) return "[]";
  return `["${arr.join('","')}"]`;
}
