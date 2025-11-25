import 'dotenv/config';
import {
  Account,
  Args,
  Mas,
  SmartContract,
  JsonRpcProvider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

const account = await Account.fromEnv();
console.log('Using account:', account);
const provider = JsonRpcProvider.buildnet(account);
console.log(account)
console.log('Deploying contract...');

const byteCodeBuffer = getScByteCode('build', 'vehicle_passport.wasm');
const byteCode = new Uint8Array(byteCodeBuffer);

const name = 'Massa';
const constructorArgs = new Args().addString(name);

const contract = await SmartContract.deploy(
  provider,
  byteCode,
  constructorArgs,
  { coins: Mas.fromString('0.01') },
);

console.log('Contract deployed at:', contract.address);

const events = await provider.getEvents({
  smartContractAddress: contract.address,
});

for (const event of events) {
  console.log('Event message:', event.data);
}
