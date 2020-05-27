import { Context } from '../../../src/common';
import { pass, fail } from '../../test-utils';
import * as t from 'assert';
import { parseSource } from '../../../src/parser';

describe('Miscellaneous - ASI', () => {
  for (const arg of [
    '{ 1 2 } 3',
    '{} * 1',
    '({};) * 1',
    'if (false) x = 1 else x = -1',
    `var x = 0;
    if (false) {x = 1};
    else x = -1`,
    `var a=1,b=2,c=3,d;
    if(a>b)
    else c=d`,
    `{} * 1`,
    `for(
      ;) {
        break;
      }`,
    `for(
        false
    ) {
      break;
    }`,
    `for(
        false
        false
        false
    ) {
      break;
    }`,
    `do
      while (false)`,
    `do {};
      while (false)`,
    `
      var x=0, y=0;
      var z=
      x
      ++
      ++
      y`,
    `var x = 0;
      if (false) x = 1 else x = -1`
  ]) {
    it(`${arg}`, () => {
      t.throws(() => {
        parseSource(`${arg}`, undefined, Context.None);
      });
    });

    it(`${arg}`, () => {
      t.throws(() => {
        parseSource(`${arg}`, undefined, Context.Strict | Context.Module);
      });
    });
  }

  fail('Expressions - ASI (fail)', [
    [`var x=0, y=0;\nvar z=\nx\n++\n++\ny`, Context.None],
    [`for(\nfalse\n) {\nbreak;\n}`, Context.None],
    [`for(false;false;;false) { break; }`, Context.None],
    [`\n while(false)`, Context.None],
    [`do {}; \n while(false)`, Context.None],
    [`for header is (false \n false \n)`, Context.None],
    ['{} * 1', Context.None],
    ['if (false) x = 1 else x = -1', Context.None],
    [
      `try {
      throw
      1;
    } catch(e) {
    }`,
      Context.None
    ],
    [
      `var x = 0;
    x
    ++;`,
      Context.None
    ],
    [
      `var x = 1;
    x
    --;`,
      Context.None
    ],
    [
      `for(;
      ) {
        break;
      }`,
      Context.None
    ],
    [
      `for(
      false
  ;) {
    break;
  }`,
      Context.None
    ],
    [
      `for(
      ;
  ) {
    break;
  }`,
      Context.None
    ],
    [
      `for(
      ) {
        break;
      }`,
      Context.None
    ],
    [
      `for(false
      false
  ) {
    break;
  }`,
      Context.None
    ],
    [
      `do
    while (false)`,
      Context.None
    ]
  ]);

  pass('Miscellaneous - ASI', [
    // Acorn issue: https://github.com/acornjs/acorn/issues/775
    [
      `;;1;;1;;1`,
      Context.OptionsDirectives | Context.OptionsRanges,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'EmptyStatement',
            start: 0,
            end: 1,
            range: [0, 1]
          },
          {
            type: 'EmptyStatement',
            start: 1,
            end: 2,
            range: [1, 2]
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Literal',
              value: 1,
              start: 2,
              end: 3,
              range: [2, 3]
            },
            start: 2,
            end: 4,
            range: [2, 4]
          },
          {
            type: 'EmptyStatement',
            start: 4,
            end: 5,
            range: [4, 5]
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Literal',
              value: 1,
              start: 5,
              end: 6,
              range: [5, 6]
            },
            start: 5,
            end: 7,
            range: [5, 7]
          },
          {
            type: 'EmptyStatement',
            start: 7,
            end: 8,
            range: [7, 8]
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Literal',
              value: 1,
              start: 8,
              end: 9,
              range: [8, 9]
            },
            start: 8,
            end: 9,
            range: [8, 9]
          }
        ],
        start: 0,
        end: 9,
        range: [0, 9]
      }
    ],
    [
      '"foo"\nx',
      Context.OptionsDirectives | Context.OptionsRaw | Context.OptionsRanges,

      {
        body: [
          {
            directive: 'foo',
            end: 5,
            expression: {
              end: 5,
              raw: '"foo"',
              start: 0,
              type: 'Literal',
              value: 'foo'
            },
            start: 0,
            type: 'ExpressionStatement'
          },
          {
            end: 7,
            expression: {
              end: 7,
              name: 'x',
              start: 6,
              type: 'Identifier'
            },
            start: 6,
            type: 'ExpressionStatement'
          }
        ],
        end: 7,
        sourceType: 'script',
        start: 0,
        type: 'Program'
      }
    ],
    [
      `function f(){\n'foo';\n}`,
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        body: [
          {
            async: false,
            body: {
              body: [
                {
                  directive: 'foo',
                  expression: {
                    type: 'Literal',
                    raw: "'foo'",
                    value: 'foo'
                  },
                  type: 'ExpressionStatement'
                }
              ],
              type: 'BlockStatement'
            },
            generator: false,
            id: {
              name: 'f',

              type: 'Identifier'
            },
            params: [],
            type: 'FunctionDeclaration'
          }
        ],
        sourceType: 'script',
        type: 'Program'
      }
    ],
    [
      'function f(){\n"foo"\n}',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        body: [
          {
            async: false,
            body: {
              body: [
                {
                  directive: 'foo',
                  expression: {
                    type: 'Literal',
                    raw: '"foo"',
                    value: 'foo'
                  },
                  type: 'ExpressionStatement'
                }
              ],
              type: 'BlockStatement'
            },
            generator: false,
            id: {
              name: 'f',

              type: 'Identifier'
            },
            params: [],
            type: 'FunctionDeclaration'
          }
        ],
        sourceType: 'script',
        type: 'Program'
      }
    ],
    [
      '"ignore me"\n++x',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        body: [
          {
            directive: 'ignore me',
            expression: {
              type: 'Literal',
              raw: '"ignore me"',
              value: 'ignore me'
            },
            type: 'ExpressionStatement'
          },
          {
            expression: {
              argument: {
                name: 'x',
                type: 'Identifier'
              },
              operator: '++',
              prefix: true,
              type: 'UpdateExpression'
            },
            type: 'ExpressionStatement'
          }
        ],
        sourceType: 'script',
        type: 'Program'
      }
    ],
    [
      '("use strict"); foo = 42;',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Literal',
              raw: '"use strict"',
              value: 'use strict'
            }
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              left: {
                type: 'Identifier',
                name: 'foo'
              },
              operator: '=',
              right: {
                type: 'Literal',
                raw: '42',
                value: 42
              }
            }
          }
        ]
      }
    ],
    [
      '("use strict"); eval = 42;',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Literal',
              raw: '"use strict"',
              value: 'use strict'
            }
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              left: {
                type: 'Identifier',
                name: 'eval'
              },
              operator: '=',
              right: {
                type: 'Literal',
                raw: '42',
                value: 42
              }
            }
          }
        ]
      }
    ],
    [
      '"USE STRICT";  var public = 1;',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Literal',
              raw: '"USE STRICT"',
              value: 'USE STRICT'
            },
            directive: 'USE STRICT'
          },
          {
            type: 'VariableDeclaration',
            kind: 'var',
            declarations: [
              {
                type: 'VariableDeclarator',
                init: {
                  type: 'Literal',
                  raw: '1',
                  value: 1
                },
                id: {
                  type: 'Identifier',
                  name: 'public'
                }
              }
            ]
          }
        ]
      }
    ],
    [
      '() => { "use strict"; }',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        body: [
          {
            expression: {
              async: false,
              body: {
                body: [
                  {
                    directive: 'use strict',
                    expression: {
                      type: 'Literal',
                      raw: '"use strict"',
                      value: 'use strict'
                    },
                    type: 'ExpressionStatement'
                  }
                ],
                type: 'BlockStatement'
              },
              expression: false,
              params: [],
              type: 'ArrowFunctionExpression'
            },
            type: 'ExpressionStatement'
          }
        ],
        sourceType: 'script',
        type: 'Program'
      }
    ],
    [
      'function wrap() { "use asm"; "use strict"; foo }',
      Context.OptionsDirectives | Context.OptionsRaw | Context.OptionsRanges,
      {
        body: [
          {
            async: false,
            body: {
              body: [
                {
                  directive: 'use asm',
                  end: 28,
                  expression: {
                    end: 27,
                    raw: '"use asm"',
                    start: 18,
                    type: 'Literal',
                    value: 'use asm'
                  },
                  start: 18,
                  type: 'ExpressionStatement'
                },
                {
                  directive: 'use strict',
                  end: 42,
                  expression: {
                    end: 41,
                    raw: '"use strict"',
                    start: 29,
                    type: 'Literal',
                    value: 'use strict'
                  },
                  start: 29,
                  type: 'ExpressionStatement'
                },
                {
                  end: 46,
                  expression: {
                    end: 46,
                    name: 'foo',
                    start: 43,
                    type: 'Identifier'
                  },
                  start: 43,
                  type: 'ExpressionStatement'
                }
              ],
              end: 48,
              start: 16,
              type: 'BlockStatement'
            },
            end: 48,
            generator: false,
            id: {
              end: 13,
              name: 'wrap',
              start: 9,
              type: 'Identifier'
            },
            params: [],
            start: 0,
            type: 'FunctionDeclaration'
          }
        ],
        end: 48,
        sourceType: 'script',
        start: 0,
        type: 'Program'
      }
    ],
    [
      '{ "use strict"; }',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'Literal',
                  raw: '"use strict"',
                  value: 'use strict'
                }
              }
            ]
          }
        ]
      }
    ],
    [
      'function a() { "use strict" } "use strict"; foo;',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'FunctionDeclaration',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    raw: '"use strict"',
                    value: 'use strict'
                  },
                  directive: 'use strict'
                }
              ]
            },
            async: false,
            generator: false,
            id: {
              type: 'Identifier',
              name: 'a'
            }
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Literal',
              raw: '"use strict"',
              value: 'use strict'
            }
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'Identifier',
              name: 'foo'
            }
          }
        ]
      }
    ],
    [
      'function f(){ "Esprima uses directives"; "use strict";}',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'FunctionDeclaration',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    raw: '"Esprima uses directives"',
                    value: 'Esprima uses directives'
                  },
                  directive: 'Esprima uses directives'
                },
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    raw: '"use strict"',
                    value: 'use strict'
                  },
                  directive: 'use strict'
                }
              ]
            },
            async: false,
            generator: false,
            id: {
              type: 'Identifier',

              name: 'f'
            }
          }
        ]
      }
    ],
    [
      'function f(){ 123; "use strict";}',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'FunctionDeclaration',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    value: 123,
                    raw: '123'
                  }
                },
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    raw: '"use strict"',
                    value: 'use strict'
                  }
                }
              ]
            },
            async: false,
            generator: false,
            id: {
              type: 'Identifier',

              name: 'f'
            }
          }
        ]
      }
    ],
    [
      'function f(){"use strict";}',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'FunctionDeclaration',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    raw: '"use strict"',
                    value: 'use strict'
                  },
                  directive: 'use strict'
                }
              ]
            },
            async: false,
            generator: false,
            id: {
              type: 'Identifier',

              name: 'f'
            }
          }
        ]
      }
    ],
    [
      '+function f(){"use strict";}',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'UnaryExpression',
              operator: '+',
              argument: {
                type: 'FunctionExpression',
                params: [],
                body: {
                  type: 'BlockStatement',
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'Literal',
                        raw: '"use strict"',
                        value: 'use strict'
                      },
                      directive: 'use strict'
                    }
                  ]
                },
                async: false,
                generator: false,
                id: {
                  type: 'Identifier',
                  name: 'f'
                }
              },
              prefix: true
            }
          }
        ]
      }
    ],
    [
      '({x:function(){"use strict";}})',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'ObjectExpression',
              properties: [
                {
                  type: 'Property',
                  key: {
                    type: 'Identifier',
                    name: 'x'
                  },
                  value: {
                    type: 'FunctionExpression',
                    params: [],
                    body: {
                      type: 'BlockStatement',
                      body: [
                        {
                          type: 'ExpressionStatement',
                          expression: {
                            type: 'Literal',
                            raw: '"use strict"',
                            value: 'use strict'
                          },
                          directive: 'use strict'
                        }
                      ]
                    },
                    async: false,
                    generator: false,
                    id: null
                  },
                  kind: 'init',
                  computed: false,
                  method: false,
                  shorthand: false
                }
              ]
            }
          }
        ]
      }
    ],
    [
      'function f(x){"use strict";}',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'FunctionDeclaration',
            params: [
              {
                type: 'Identifier',
                name: 'x'
              }
            ],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    value: 'use strict',
                    raw: '"use strict"'
                  },
                  directive: 'use strict'
                }
              ]
            },
            async: false,
            generator: false,
            id: {
              type: 'Identifier',
              name: 'f'
            }
          }
        ]
      }
    ],
    [
      'function f(x, y){"use strict";}',
      Context.OptionsDirectives | Context.OptionsRaw,
      {
        type: 'Program',
        sourceType: 'script',
        body: [
          {
            type: 'FunctionDeclaration',
            params: [
              {
                type: 'Identifier',
                name: 'x'
              },
              {
                type: 'Identifier',
                name: 'y'
              }
            ],
            body: {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    raw: '"use strict"',
                    value: 'use strict'
                  },

                  directive: 'use strict'
                }
              ]
            },
            async: false,
            generator: false,
            id: {
              type: 'Identifier',
              name: 'f'
            }
          }
        ]
      }
    ]
  ]);
});
