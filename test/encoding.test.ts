import { describe, it, expect } from 'vitest';
import {
  encodeFunctionData,
  decodeFunctionResult,
  encodePacked,
  keccak256,
  getFunctionSelector,
  getEventTopic,
  abiEncode,
  abiDecode,
  stringToBytes32,
  bytes32ToString,
  hexToBytes,
  bytesToHex,
  toUtf8Bytes,
  toUtf8String,
} from '../src/utils/encoding';

describe('encoding', () => {
  describe('encodeFunctionData', () => {
    it('should encode simple function call', () => {
      const abi = 'function transfer(address to, uint256 amount)';
      const data = encodeFunctionData(abi, [
        '0x1234567890123456789012345678901234567890',
        1000n,
      ]);

      // Transfer function selector is 0xa9059cbb
      expect(data.startsWith('0xa9059cbb')).toBe(true);
      expect(data.length).toBe(138); // 4 bytes selector + 2 * 32 bytes params
    });

    it('should encode function with no params', () => {
      const abi = 'function totalSupply() view returns (uint256)';
      const data = encodeFunctionData(abi, []);
      expect(data).toBe('0x18160ddd');
    });

    it('should throw for invalid ABI', () => {
      expect(() => encodeFunctionData('invalid', [])).toThrow();
    });
  });

  describe('decodeFunctionResult', () => {
    it('should decode function result', () => {
      const abi = 'function balanceOf(address) view returns (uint256)';
      // Encoded uint256 value of 1000 - must be exactly 32 bytes (64 hex chars)
      const data = '0x' + '0'.repeat(60) + '03e8'; // 1000 in hex padded to 32 bytes
      const result = decodeFunctionResult(abi, data);
      expect(result[0]).toBe(1000n);
    });
  });

  describe('encodePacked', () => {
    it('should encode packed data', () => {
      const result = encodePacked(
        ['address', 'uint256'],
        ['0x1234567890123456789012345678901234567890', 1000n]
      );
      expect(result.startsWith('0x')).toBe(true);
      // Address is 20 bytes, uint256 is 32 bytes = 52 bytes = 104 hex chars + 0x
      expect(result.length).toBe(106);
    });

    it('should encode strings', () => {
      const result = encodePacked(['string'], ['hello']);
      expect(result).toBe('0x68656c6c6f'); // "hello" in hex
    });
  });

  describe('keccak256', () => {
    it('should hash hex data', () => {
      const hash = keccak256('0x1234');
      expect(hash.startsWith('0x')).toBe(true);
      expect(hash.length).toBe(66); // 32 bytes = 64 hex chars + 0x
    });

    it('should hash Uint8Array', () => {
      const hash = keccak256(new Uint8Array([1, 2, 3, 4]));
      expect(hash.startsWith('0x')).toBe(true);
      expect(hash.length).toBe(66);
    });

    it('should be deterministic', () => {
      const hash1 = keccak256('0x1234');
      const hash2 = keccak256('0x1234');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = keccak256('0x1234');
      const hash2 = keccak256('0x5678');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getFunctionSelector', () => {
    it('should get transfer function selector', () => {
      const selector = getFunctionSelector('transfer(address,uint256)');
      expect(selector).toBe('0xa9059cbb');
    });

    it('should get approve function selector', () => {
      const selector = getFunctionSelector('approve(address,uint256)');
      expect(selector).toBe('0x095ea7b3');
    });

    it('should get balanceOf function selector', () => {
      const selector = getFunctionSelector('balanceOf(address)');
      expect(selector).toBe('0x70a08231');
    });
  });

  describe('getEventTopic', () => {
    it('should get Transfer event topic', () => {
      const topic = getEventTopic('Transfer(address,address,uint256)');
      expect(topic.startsWith('0x')).toBe(true);
      expect(topic.length).toBe(66);
      expect(topic).toBe('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
    });

    it('should get Approval event topic', () => {
      const topic = getEventTopic('Approval(address,address,uint256)');
      expect(topic.startsWith('0x')).toBe(true);
      expect(topic).toBe('0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925');
    });
  });

  describe('abiEncode / abiDecode', () => {
    it('should encode and decode uint256', () => {
      const encoded = abiEncode(['uint256'], [1000n]);
      const decoded = abiDecode(['uint256'], encoded);
      expect(decoded[0]).toBe(1000n);
    });

    it('should encode and decode address', () => {
      const addr = '0x1234567890123456789012345678901234567890';
      const encoded = abiEncode(['address'], [addr]);
      const decoded = abiDecode(['address'], encoded);
      expect(decoded[0].toLowerCase()).toBe(addr.toLowerCase());
    });

    it('should encode and decode multiple values', () => {
      const values = [
        '0x1234567890123456789012345678901234567890',
        1000n,
        true,
      ];
      const encoded = abiEncode(['address', 'uint256', 'bool'], values);
      const decoded = abiDecode(['address', 'uint256', 'bool'], encoded);
      expect(decoded[0].toLowerCase()).toBe(values[0].toLowerCase());
      expect(decoded[1]).toBe(values[1]);
      expect(decoded[2]).toBe(values[2]);
    });

    it('should encode and decode strings', () => {
      const encoded = abiEncode(['string'], ['hello world']);
      const decoded = abiDecode(['string'], encoded);
      expect(decoded[0]).toBe('hello world');
    });

    it('should encode and decode arrays', () => {
      const encoded = abiEncode(['uint256[]'], [[1n, 2n, 3n]]);
      const decoded = abiDecode(['uint256[]'], encoded);
      expect(decoded[0]).toEqual([1n, 2n, 3n]);
    });
  });

  describe('stringToBytes32 / bytes32ToString', () => {
    it('should convert string to bytes32 and back', () => {
      const original = 'hello';
      const bytes32 = stringToBytes32(original);
      expect(bytes32.startsWith('0x')).toBe(true);
      expect(bytes32.length).toBe(66);

      const decoded = bytes32ToString(bytes32);
      expect(decoded).toBe(original);
    });

    it('should handle empty string', () => {
      const bytes32 = stringToBytes32('');
      expect(bytes32).toBe('0x' + '0'.repeat(64));
    });
  });

  describe('hexToBytes / bytesToHex', () => {
    it('should convert hex to bytes and back', () => {
      const hex = '0x1234abcd';
      const bytes = hexToBytes(hex);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(4);

      const backToHex = bytesToHex(bytes);
      expect(backToHex).toBe(hex);
    });

    it('should handle empty hex', () => {
      const bytes = hexToBytes('0x');
      expect(bytes.length).toBe(0);

      const hex = bytesToHex(new Uint8Array(0));
      expect(hex).toBe('0x');
    });
  });

  describe('toUtf8Bytes / toUtf8String', () => {
    it('should convert UTF-8 string to hex and back', () => {
      const original = 'Hello, World!';
      const hex = toUtf8Bytes(original);
      expect(hex.startsWith('0x')).toBe(true);

      const decoded = toUtf8String(hex);
      expect(decoded).toBe(original);
    });

    it('should handle unicode', () => {
      const original = 'Hello 世界';
      const hex = toUtf8Bytes(original);
      const decoded = toUtf8String(hex);
      expect(decoded).toBe(original);
    });
  });
});
