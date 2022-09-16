import { Buffer } from 'buffer/';

const w = window as any;

w.global ||= window;
w.Buffer ||= Buffer;
