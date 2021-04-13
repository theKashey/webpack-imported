import { importAssets } from './imported';
import { ImportedStat } from './types';

describe('imported', () => {
  it('works', () => {
    const stats: ImportedStat = {
      config: {
        publicPath: 'publicPath',
        outputPath: 'outputPath',
        aliases: {},
      },
      chunks: {
        main: {
          load: [4],
          prefetch: [],
          preload: [],
        },
        a: {
          load: [1, 2, 4],
          prefetch: [],
          preload: [],
        },
        b: {
          load: [2, 3, 4],
          prefetch: [],
          preload: [],
        },
      },
      chunkMap: {
        1: { js: ['1.js'] },
        2: { js: ['2.js'], css: ['2.css'] },
        3: { js: ['3.js'] },
        4: { js: ['4.js'], css: ['3.css', '4.css'] },
      },
      assets: [],
      moduleMap: {},
    };
    expect(importAssets(stats, ['main'])).toMatchInlineSnapshot(`
      Object {
        "raw": Object {
          "load": Object {
            "css": Array [
              "3.css",
              "4.css",
            ],
            "js": Array [
              "4.js",
            ],
          },
          "prefetch": Object {},
          "preload": Object {},
        },
        "scripts": Object {
          "load": Array [
            "4.js",
          ],
          "prefetch": Array [],
          "preload": Array [],
        },
        "styles": Object {
          "load": Array [
            "3.css",
            "4.css",
          ],
          "prefetch": Array [],
          "preload": Array [],
        },
      }
    `);
    expect(importAssets(stats, ['main', 'a', 'b'])).toMatchInlineSnapshot(`
      Object {
        "raw": Object {
          "load": Object {
            "css": Array [
              "2.css",
              "3.css",
              "4.css",
            ],
            "js": Array [
              "1.js",
              "2.js",
              "3.js",
              "4.js",
            ],
          },
          "prefetch": Object {},
          "preload": Object {},
        },
        "scripts": Object {
          "load": Array [
            "1.js",
            "2.js",
            "3.js",
            "4.js",
          ],
          "prefetch": Array [],
          "preload": Array [],
        },
        "styles": Object {
          "load": Array [
            "2.css",
            "3.css",
            "4.css",
          ],
          "prefetch": Array [],
          "preload": Array [],
        },
      }
    `);
  });
});
