import { customAlphabet } from 'nanoid';

const alphabet = ['0123456789', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'].join('');

export const generateId = customAlphabet(alphabet, 16);
export const generateToken = customAlphabet(alphabet, 24);
