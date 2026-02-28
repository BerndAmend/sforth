/**
The MIT License (MIT)

Copyright (c) 2013-2023 Bernd Amend <bernd.amend+sforth@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import vm from "node:vm";

function replaceWholeWord(
  target: string,
  search: string,
  replacement: string,
  ch: string[] = [" ", "\t", "\n"],
): string {
  for (let i = 0; i < ch.length; ++i) {
    for (let j = 0; j < ch.length; ++j) {
      target = target.split(ch[i] + search + ch[j]).join(
        ch[i] + replacement + ch[j],
      );
    }
  }

  // handle the case where the search word is at the beginning
  if (target.slice(0, search.length) === search) {
    target = replacement + target.slice(search.length);
  }

  // or the end
  if (target.slice(target.length - search.length) === search) {
    target = target.slice(0, target.length - search.length) + replacement;
  }

  return target;
}

function isNumeric(str: string): boolean {
  if (str === "NaN") {
    return true;
  }
  if (BigInt && str.length > 1 && str.endsWith("n")) {
    try {
      BigInt(str.slice(0, str.length - 1));
      return true;
    } catch (_e) {
      return false;
    }
  }
  return !isNaN(Number(str));
}

export class SForthStack {
  // deno-lint-ignore no-explicit-any
  #stac: Array<any>;
  #pos: number;

  constructor() {
    this.#stac = new Array(5);
    this.#pos = -1;
  }

  pop() {
    if (this.#pos === -1) {
      throw new Error("Stack underflow");
    }
    return this.#stac[this.#pos--];
  }

  getTopElements(count: number) {
    const realpos = this.#pos - count + 1;
    if (realpos < 0) {
      throw new Error("Stack underflow");
    }
    this.#pos -= count;
    return this.#stac.slice(realpos, realpos + count);
  }

  remove(pos: number) {
    const realpos = this.#pos - pos;
    if (realpos < 0) {
      throw new Error("Stack underflow");
    }
    --this.#pos;
    return this.#stac.splice(realpos, 1)[0];
  }

  // deno-lint-ignore no-explicit-any
  push(item: any) {
    this.#stac[++this.#pos] = item;
  }

  // deno-lint-ignore no-explicit-any
  pushArray(items: any[]) {
    for (const e of items) {
      this.#stac[++this.#pos] = e;
    }
  }

  // deno-lint-ignore no-explicit-any
  pushIfNotUndefined(item: any) {
    if (item !== undefined) {
      this.#stac[++this.#pos] = item;
    }
  }

  isEmpty() {
    return this.#pos === -1;
  }

  size() {
    return this.#pos + 1;
  }

  get length() {
    return this.size();
  }

  top() {
    return this.get(0);
  }

  get(pos: number) {
    const realpos = this.#pos - pos;
    if (realpos < 0) {
      throw new Error("Stack underflow");
    }
    return this.#stac[realpos];
  }

  clear() {
    this.#stac = new Array(32);
    this.#pos = -1;
  }

  getArray() {
    return this.#stac.slice(0, Math.max(this.#pos + 1, 0));
  }

  toString() {
    return this.getArray().toString();
  }

  toJSON() {
    return JSON.stringify(this.getArray());
  }

  fromJSON(str: string) {
    const l = JSON.parse(str);
    this.clear();
    for (let i = 0; i < l.length; ++i) {
      this.push(l[i]);
    }
  }
}

// We don't allow . in function names
// if you use $ ensure that you don't write one of the following strings
export const ManglingCharacters: Record<string, string> = {
  "\u20ac": "$$euro",
  "=": "$$eq",
  ">": "$$greater",
  "<": "$$less",
  "+": "$$plus",
  "-": "$$minus",
  "*": "$$times",
  "/": "$$div",
  "!": "$$bang",
  "@": "$$at",
  "#": "$$hash",
  "%": "$$percent",
  "^": "$$up",
  "&": "$$amp",
  "~": "$$tilde",
  "?": "$$qmark",
  "|": "$$bar",
  "\\": "$$bslash",
  ":": "$$colon",
  ";": "$$semicolon",
  ",": "$$comma",
  "[": "$$obracket",
  "]": "$$cbracket",
  "(": "$$oparentheses",
  ")": "$$cparentheses",
  "{": "$$obraces",
  "}": "$$cbraces",
  "\u00b7": "$$middot",
  '"': "$$quotationmark",
  "'": "$$apostrophe",
  "°": "$$degree",
};

export function mangle(str: string): string {
  let result = str;

  if (isNumeric(str)) {
    throw new Error("cannot mangle a number, this should not happen");
  }

  const start = str.charAt(0);
  if (start >= "0" && start <= "9") {
    result = "$$" + result;
  }

  for (const s in ManglingCharacters) {
    if (Object.prototype.hasOwnProperty.call(ManglingCharacters, s)) {
      result = result.replaceAll(s, () => ManglingCharacters[s]);
    }
  }

  if (result[0] === ".") {
    result = "$$dot" + result.slice(1);
  }
  if (result[result.length - 1] === ".") {
    result = result.slice(0, result.length - 1) + "$$dot";
  }

  return result;
}

export function demangle(str: string): string {
  let result = str;
  for (const s in ManglingCharacters) {
    if (Object.prototype.hasOwnProperty.call(ManglingCharacters, s)) {
      result = result.replaceAll(ManglingCharacters[s], () => s);
    }
  }

  result = result.replaceAll("$$dot", ".");

  if (
    result.startsWith("$$") && result.charAt(2) >= "0" &&
    result.charAt(2) <= "9"
  ) {
    result = result.slice(2);
  }

  return result;
}

export interface CompileResult {
  code: string;
  tokens?: NodeType[];
  code_tree?: BodyType;
  optimized_code_tree?: BodyType;
  generated_code?: { code: string; dropResult: boolean }[];
}

export type SourcePosition = {
  filename?: string;
  line: number;
  column: number;
};

export type BodyType = {
  type: "Body";
  body: NodeType[];
  extendedMacro?: string;
};

export type TokenType = {
  type: "Token";
  value: string;
};

export type MacroType = {
  type: "Macro";
  name: string;
  args: string[];
  body: NodeType[];
};

export type BranchIfBody = {
  type: "BranchIfBody";
  condition: BodyType;
  body: BodyType;
};

export type BranchIf = {
  type: "BranchIf";
  if_body: BodyType;
  else_if_bodies?: BranchIfBody[];
  else_body?: BodyType;
};

export type TryCatchFinally = {
  type: "TryCatchFinally";
  body: BodyType;
  catchVar?: string;
  catchBody?: BodyType;
  finallyBody?: BodyType;
};

export type NodeType =
  | {
    type: "Empty";
  }
  | TokenType
  | BodyType
  | MacroType
  | BranchIf
  | BranchIfBody
  | TryCatchFinally
  | {
    type: "BeginAgain" | "BeginUntil";
    body: BodyType;
  }
  | {
    type: "BeginWhileRepeat" | "BranchCaseOf";
    condition: BodyType;
    body: BodyType;
  }
  | {
    type: "BranchCase";
    body: BodyType;
    defaultOf?: BodyType;
  }
  | {
    type: "Call";
    name: string;
    argument_count?: number; // specifies how many arguments should be passed to a js function
    drop_result?: boolean;
  }
  | {
    type: "CommentLine" | "CommentParentheses" | "Screen";
    comment: string;
  }
  | {
    type: "DoLoop";
    index: string;
    body: BodyType;
    compareOperation?: string;
    increment?: number;
  }
  | {
    type: "FunctionForth";
    name?: string;
    usesStackComment: boolean;
    arguments?: string[]; // if undefined the parentStack is used and no checks are performed
    returns?: string[]; // if undefined everything is returned
    body: BodyType;
  }
  | {
    type: "FunctionJs";
    name?: string;
    args: string[];
    body: BodyType;
    isAsync: boolean;
  }
  | {
    type: "JsCode" | "JsCodeDirect" | "JsCodeWithReturn";
    body: string;
  }
  | {
    type:
      | "JsCodeWithReturnToVar"
      | "JsCodeWithReturnToVarTemp"
      | "JsCodeWithReturnAssignToVar"
      | "JsCodeWithReturnAddToVar";
    body: string;
    value: string;
  }
  | {
    type: "Number";
    value: string;
  }
  | {
    type:
      | "NumberToVar"
      | "NumberToVarTemp"
      | "NumberAssignToVar"
      | "NumberAddToVar";
    value: string;
    name: string;
  }
  | {
    type: "String";
    value: string;
    interpolate?: boolean;
  }
  | {
    type:
      | "StringToVar"
      | "StringToVarTemp"
      | "StringAssignToVar"
      | "StringAddToVar";
    value: string;
    name: string;
    interpolate?: boolean; // not set means false
  }
  | {
    type: "ValueLocalLet" | "ValueLocal";
    values: string[];
    comment?: string;
  }
  | {
    type: "ValueToStack";
    name: string;
  }
  | {
    type: "Await";
    dropResult: boolean;
  };

type LoadFile = (
  filename: string,
  includeDirectories: string[],
) => { fullfilename: string; content: string };

interface CompilerOptions {
  includeDirectories: string[];
  checkStack: boolean;
  loadFile: LoadFile;
}

// Compiler
export class Compiler {
  options: CompilerOptions;
  macros: Record<string, MacroType>;
  includedFiles: string[];
  info: (msg: string) => void;

  constructor(options: CompilerOptions) {
    this.options = options || Compiler.getDefaultOptions();
    this.macros = {};
    this.includedFiles = [];
    this.info = console.log;
  }

  static getDefaultOptions(): CompilerOptions {
    return {
      includeDirectories: ["."],
      checkStack: true,
      loadFile: function () {
        throw new Error(
          "no loadFile handler was provided in the compiler options",
        );
      },
    };
  }

  tokenize(code: string, filename?: string): NodeType[] {
    code = code.replace(/\r\n/gm, "\n").replace(/\r/gm, "\n"); // unify line endings

    // tokenize code
    const tokenSourcePosition: SourcePosition[] = [];
    const tokens: string[] = [];

    {
      let startLine = 1;
      let startColumn = 0;
      let line = 1;
      let column = 0;
      let newToken = "";
      for (const c of code) {
        if (c !== "\f") {
          column += 1;
        }
        if (c === "\n") {
          column = 0;
          line += 1;
        }
        if (c === " " || c === "\n" || c === "\t" || c === "\f") {
          tokenSourcePosition.push({
            column: startColumn,
            line: startLine,
            filename,
          });
          tokens.push(newToken);
          newToken = "";
        } else {
          if (newToken === "") {
            startLine = line;
            startColumn = column;
          }
          newToken += c;
        }

        if (c === "\n" || c === "\t" || c === "\f") {
          tokenSourcePosition.push({ column, line, filename });
          tokens.push(c);
        }
      }

      if (newToken !== "") {
        tokenSourcePosition.push({ column, line, filename });
        tokens.push(newToken);
        newToken = "";
      }
    }

    //console.error(JSON.stringify(tokens, undefined, 4));

    // merge tokens
    const merged_tokens: NodeType[] = [];

    function add(something: NodeType) {
      merged_tokens.push(something);
    }

    let depth;

    for (let i = 0; i < tokens.length; i++) {
      const const_i = i;
      const t = tokens[i];
      depth = 1;

      const error = (msg: string) => {
        const sourcePosition = tokenSourcePosition[const_i];
        throw new Error(
          `${
            sourcePosition.filename ?? "unknown"
          }:${sourcePosition.line}:${sourcePosition.column}: ${msg}\nsource:\n${
            [
              ...tokens.slice(Math.max(0, const_i - 5), const_i),
              `-->${tokens[const_i]}<--`,
              ...tokens.slice(const_i + 1, const_i + 10),
            ].join(" ")
          }`,
        );
      };

      switch (t.toLowerCase()) {
        case "": // ignore empty/whitespace tokens
        case "\n":
        case "\t":
        case "\r": {
          break;
        }

        case "\f":
        case "////": { // start a new screen
          let str = "";
          while (tokens[i] !== "\n") {
            i++;

            if (i >= tokens.length) {
              break;
            }

            if (tokens[i] !== "\n") {
              str += tokens[i] + " ";
            }
          }
          add({ type: "Screen", comment: str.slice(0, str.length - 1) });
          break;
        }

        case "\\\\": { // \\ comments
          let str = "";
          i++;
          while (i < tokens.length) {
            str += tokens[i] + " ";
            i++;

            if (
              i + 1 < tokens.length &&
              (tokens[i + 1] === "////" || tokens[i + 1] === "\f")
            ) {
              break;
            }
          }
          add({
            type: "CommentParentheses",
            comment: str.slice(0, str.length - 1),
          });
          break;
        }

        case "\\": // line comments
        case "//": {
          let str = "";
          while (tokens[i] !== "\n") {
            i++;

            if (i >= tokens.length) {
              break;
            }

            if (tokens[i] !== "\n") {
              str += tokens[i] + " ";
            }
          }
          add({
            type: "CommentLine",
            comment: str.slice(0, str.length - 1),
          });
          break;
        }

        case "(": { // comment start
          let str = "";
          while (depth > 0) {
            i++;

            if (i >= tokens.length) {
              error("Couldn't find closing ')'");
            }

            if (tokens[i] === "(") {
              depth++;
            } else if (tokens[i] === ")") {
              depth--;
            }

            if (depth > 0) {
              str += tokens[i] + " ";
            }
          }
          add({
            type: "CommentParentheses",
            comment: str.slice(0, str.length - 1),
          });
          break;
        }

        case "/*": // comment start
        case "/**": {
          let str = "";
          while (depth > 0) {
            i++;

            if (i >= tokens.length) {
              error("Couldn't find closing '*/'");
            }

            if (tokens[i] === "/*" || tokens[i] === "/**") {
              depth++;
            } else if (tokens[i] === "*/") {
              depth--;
            }

            if (depth > 0) {
              str += tokens[i] + " ";
            }
          }
          add({
            type: "CommentParentheses",
            comment: str.slice(0, str.length - 1),
          });
          break;
        }

        case ":[": { // execute js code start
          let str = "";
          i++;
          while (
            tokens[i] !== "]:" && tokens[i] !== "]:d" && tokens[i] !== "];"
          ) {
            str += tokens[i] + " ";
            i++;

            if (i >= tokens.length) {
              error("Couldn't find closing ']:' or ']:d' or '];' for ':[");
            }
          }
          const localjscode = str.slice(0, str.length - 1).replace(
            / \t /gm,
            "\t",
          );
          if (tokens[i] === "]:") {
            add({
              type: "JsCodeWithReturn",
              body: localjscode,
            });
          } else if (tokens[i] === "]:d") {
            add({ type: "JsCodeDirect", body: localjscode });
          } //if(tokens[i] === "];")
          else {
            add({ type: "JsCode", body: localjscode });
          }
          break;
        }

        case "{": // local variable start
        case "let{": {
          let done = false;
          const localvars = [];
          let comment = "";
          i++;
          while (tokens[i] !== "}") {
            if (tokens[i] === "--") {
              done = true;
              i++;
              continue;
            }
            if (!done) {
              if (tokens[i] !== "") {
                localvars.push(tokens[i]);
              }
            } else {
              comment += tokens[i] + " ";
            }
            i++;

            if (i >= tokens.length) {
              error("Couldn't find closing '}' for '" + t + "'");
            }
          }
          switch (t) {
            case "{":
              add(
                {
                  type: "ValueLocal",
                  values: localvars.reverse(),
                  comment: comment.slice(0, comment.length - 1),
                },
              );
              break;
            case "let{":
              add(
                {
                  type: "ValueLocalLet",
                  values: localvars.reverse(),
                  comment: comment.slice(0, comment.length - 1),
                },
              );
              break;
          }
          break;
        }

        case "{}": {
          add({
            type: "ValueLocal",
            values: [],
            comment: "",
          });
          break;
        }
        case "await": {
          add({ type: "Await", dropResult: false });
          break;
        }
        case "await;": {
          add({ type: "Await", dropResult: true });
          break;
        }
        default: {
          const replacedcommawithperiod = t.replaceAll(",", ".");
          if (isNumeric(replacedcommawithperiod)) {
            add({
              type: "Number",
              value: replacedcommawithperiod,
            });
          } else if (t[0] === "'" && t.length === 2) {
            add({
              type: "Number",
              value: t.charCodeAt(1).toString(),
            });
          } else if (t[0] === '"') {
            let escapecounter = 0;
            let j = 0;
            let str = "";
            while (true) {
              if (tokens[i].length - 1 === j || tokens[i].length === 0) {
                j = 0;
                i++;
                if (i >= tokens.length) {
                  error("Couldn't find '\"'");
                }
                str += " ";
                if (tokens[i].length === 0) {
                  continue;
                }
              } else {
                j++;
              }

              if (tokens[i][j] === "\\") {
                escapecounter++;
              } else {
                for (let k = 0; k < escapecounter; k++) {
                  str += "\\";
                }
                if (escapecounter % 2 === 0 && tokens[i][j] === '"') {
                  break;
                }
                escapecounter = 0;
                str += tokens[i][j];
              }
            }

            add(
              {
                type: "String",
                value: str.slice(0, str.length)
                  .replace(/ \n /gm, "\\n")
                  .replace(/ \t /gm, "\\t")
                  .replace(/ \r /gm, "\\r"),
              },
            );
          } else if (t[0] === "`") {
            let escapecounter = 0;
            let j = 0;
            let str = "";
            while (true) {
              if (tokens[i].length - 1 === j || tokens[i].length === 0) {
                j = 0;
                i++;
                if (i >= tokens.length) {
                  error("Couldn't find '`'");
                }
                str += " ";
                if (tokens[i].length === 0) {
                  continue;
                }
              } else {
                j++;
              }

              if (tokens[i][j] === "\\") {
                escapecounter++;
              } else {
                for (let k = 0; k < escapecounter; k++) {
                  str += "\\";
                }
                if (escapecounter % 2 === 0 && tokens[i][j] === "`") {
                  break;
                }
                escapecounter = 0;
                str += tokens[i][j];
              }
            }

            add(
              {
                type: "String",
                value: str.slice(0, str.length)
                  .replace(/ \n /gm, "\\n")
                  .replace(/ \t /gm, "\\t")
                  .replace(/ \r /gm, "\\r"),
                interpolate: true,
              },
            );
          } else if (t[0] === "\u00bb") { // »
            let str = "";
            if (
              tokens[i].slice(tokens[i].length - 1) === "\u00ab" && // «
              tokens[i].slice(tokens[i].length - 2) !== "\\\u00ab" // «
            ) {
              str = tokens[i].slice(1, tokens[i].length);
            } else {
              str = tokens[i].slice(1) + " ";
              i++;
              while (true) {
                if (
                  tokens[i].slice(tokens[i].length - 1) === "\u00ab" && // «
                  tokens[i].slice(tokens[i].length - 2) !== "\\\u00ab" // «
                ) {
                  if (tokens[i].length === 1) {
                    str += " ";
                  } else {
                    str += tokens[i];
                  }
                  break;
                } else {
                  str += tokens[i] + " ";
                }
                i++;

                if (i >= tokens.length) {
                  error(
                    "Couldn't find closing '\u00ab' for '\u00bb'",
                  );
                }
              }
            }
            add(
              {
                type: "String",
                value: str.slice(0, str.length - 1)
                  .replace(/ \n /gm, "\\n")
                  .replace(/ \t /gm, "\\t")
                  .replace(/ \r /gm, "\\r")
                  .replaceAll("`", "\\`")
                  .replaceAll("\\\u00bb", "\u00bb")
                  .replaceAll("\\\u00ab", "\u00ab"),
                interpolate: true,
              },
            );
          } else if (t[0] === "$" && t.length >= 2) { // handle hex numbers
            if (t.slice(1, 2) === "-") {
              add({
                type: "Number",
                value: "-0x" + t.slice(2),
              });
            } else {
              add({
                type: "Number",
                value: "0x" + t.slice(1),
              });
            }
          } else if (t[0] === "%" && t.length >= 2) { // handle binary numbers
            if (t.slice(1, 2) === "-") {
              add({ type: "Number", value: "-0b" + t.slice(2) });
            } else {
              add({ type: "Number", value: "0b" + t.slice(1) });
            }
          } else {
            add({ type: "Token", value: t });
          }
        }
      }
    }

    return merged_tokens;
  }

  createFromForthTokens(tokens: NodeType[]): BodyType {
    const out: BodyType = { type: "Body", body: [] };

    function add(something: NodeType) {
      out.body.push(something);
    }

    function isFunctionStart(str: string) {
      return str === ":" || str === ":noname" ||
        str === ":js" || str === ":jsnoname" ||
        str === ":async" || str === ":asyncnoname";
    }

    function asToken(t: NodeType): TokenType {
      if (t.type !== "Token") {
        throw Error(
          `Unexpect token type found in createFromForthTokens got: ${t.type}`,
        );
      }
      return t;
    }

    for (let i = 0; i < tokens.length; i++) {
      let depth = 1;
      let current: NodeType[] = [];
      let localtree = undefined;
      let values: NodeType | undefined = undefined;

      let token_handled = false;

      const inputToken = tokens[i];
      switch (inputToken.type) {
        case "Await":
        case "CommentLine":
        case "CommentParentheses":
        case "JsCodeWithReturn":
        case "JsCodeDirect":
        case "JsCode":
        case "ValueLocal":
        case "ValueLocalLet":
        case "Number":
        case "Screen":
        case "String":
          add(inputToken);
          token_handled = true;
          break;
      }

      if (token_handled) {
        continue;
      }

      const t = asToken(inputToken);

      switch (t.value.toLowerCase()) {
        case "if": {
          const tokensIf = current;
          let tokensElseIf = undefined;
          let tokensElse: NodeType[] | undefined = undefined;

          while (depth > 0) {
            i++;

            if (i >= tokens.length) {
              throw new Error(
                "Couldn't find closing 'endif/then' for 'if' tokens=" +
                  JSON.stringify(tokens),
              );
            }

            if (tokens[i].type !== "Token") {
              current.push(tokens[i]);
              continue;
            }

            const token = asToken(tokens[i]);
            switch (token.value.toLowerCase()) {
              case "if":
                depth++;
                current.push(token);
                break;
              case "elseif":
                if (depth === 1) {
                  if (!tokensElseIf) {
                    tokensElseIf = [];
                  }

                  const elseIf = {
                    type: "BranchIfBody",
                    condition: [],
                    body: [],
                  };
                  tokensElseIf.push(elseIf);

                  current = elseIf.condition;
                  // scan for the next if
                  while (true) {
                    i++;
                    if (i >= tokens.length) {
                      throw new Error(
                        "Couldn't find closing 'if' for 'elseif' tokens=" +
                          JSON.stringify(tokens),
                      );
                    }
                    const token = tokens[i];
                    if (
                      token.type === "Token" &&
                      token.value.toLowerCase() === "if"
                    ) {
                      break;
                    }

                    current.push(tokens[i]);
                  }

                  current = elseIf.body;
                  //this.info("current=" + JSON.stringify(elseIf))
                } else {
                  current.push(tokens[i]);
                }
                break;
              case "else":
                if (depth === 1) {
                  tokensElse = [];
                  current = tokensElse;
                } else {
                  current.push(tokens[i]);
                }
                break;
              case "then":
              case "endif":
                depth--;
                if (depth > 0) {
                  current.push(tokens[i]);
                }
                break;
              default:
                current.push(tokens[i]);
            }
          }

          const newNode: BranchIf = {
            type: "BranchIf",
            if_body: tokensIf
              ? this.createFromForthTokens(tokensIf)
              : { type: "Body", body: [] },
          };

          if (tokensElseIf) {
            /*jshint loopfunc:true */
            const compiledElseIf: BranchIfBody[] = [];
            tokensElseIf.forEach((entry) => {
              const condition = this.createFromForthTokens(entry.condition);
              const body = this.createFromForthTokens(entry.body);
              if (compiledElseIf === undefined) {
                throw Error("compiledElseIf cannot be undefined");
              }
              compiledElseIf.push({
                type: "BranchIfBody",
                condition,
                body,
              });
            });
            newNode.else_if_bodies = compiledElseIf;
          }

          if (tokensElse) {
            newNode.else_body = this.createFromForthTokens(tokensElse);
          }

          add(newNode);
          break;
        }

        case "try": {
          const tokensBody = current;
          let tokensCatch: NodeType[] | undefined = undefined;
          let tokensFinally: NodeType[] | undefined = undefined;

          let catchVar = undefined;

          while (depth > 0) {
            i++;

            if (i >= tokens.length) {
              throw new Error(
                "Couldn't find 'endtry' for 'try' tokens=" +
                  JSON.stringify(tokens),
              );
            }

            if (tokens[i].type !== "Token") {
              current.push(tokens[i]);
              continue;
            }

            const token = asToken(tokens[i]);

            switch (token.value.toLowerCase()) {
              case "try":
                depth++;
                current.push(tokens[i]);
                break;
              case "catch":
                if (depth === 1) {
                  i++;
                  catchVar = asToken(tokens[i]).value;
                  tokensCatch = [];
                  current = tokensCatch;
                } else {
                  current.push(tokens[i]);
                }
                break;
              case "finally":
                if (depth === 1) {
                  tokensFinally = [];
                  current = tokensFinally;
                } else {
                  current.push(tokens[i]);
                }
                break;
              case "endtry":
                depth--;
                if (depth > 0) {
                  current.push(tokens[i]);
                }
                break;
              default:
                current.push(tokens[i]);
            }
          }

          const newNode: TryCatchFinally = {
            type: "TryCatchFinally",
            body: { type: "Body", body: [] },
            catchVar,
          };

          if (tokensBody) {
            newNode.body = this.createFromForthTokens(tokensBody);
          }

          if (tokensCatch) {
            newNode.catchBody = this.createFromForthTokens(tokensCatch);
          }

          if (tokensFinally) {
            newNode.finallyBody = this.createFromForthTokens(tokensFinally);
          }

          add(newNode);
          break;
        }

        case "begin": {
          while (depth > 0) {
            i++;

            if (i >= tokens.length) {
              throw new Error(
                "Couldn't find closing 'again/until' for 'begin'",
              );
            }

            if (tokens[i].type !== "Token") {
              current.push(tokens[i]);
              continue;
            }

            const token = asToken(tokens[i]);

            switch (token.value.toLowerCase()) {
              case "begin":
                depth++;
                current.push(token);
                break;
              case "until":
              case "again":
                depth--;
                if (depth > 0) {
                  current.push(token);
                }
                break;
              default:
                current.push(token);
            }
          }

          const token = asToken(tokens[i]);
          const ltoken = token.value.toLowerCase();
          if (ltoken.toLowerCase() === "until") {
            add({
              type: "BeginUntil",
              body: this.createFromForthTokens(current),
            });
          } else if (ltoken === "again") {
            add({
              type: "BeginAgain",
              body: this.createFromForthTokens(current),
            });
          } else {
            throw new Error(
              "Internal compiler error: last closing element in a begin loop was invalid",
            );
          }
          break;
        }

        case "case": {
          // TODO: we have to parse the of entries
          while (depth > 0) {
            i++;

            if (i >= tokens.length) {
              throw new Error("Couldn't find closing 'endcase' for 'case'");
            }

            if (tokens[i].type !== "Token") {
              current.push(tokens[i]);
              continue;
            }

            const token = asToken(tokens[i]);
            switch (token.value.toLowerCase()) {
              case "case":
                depth++;
                current.push(token);
                break;
              case "endcase":
                depth--;
                if (depth > 0) {
                  current.push(token);
                }
                break;
              default:
                current.push(token);
            }
          }

          // parse of endof

          add({
            type: "BranchCase",
            body: this.createFromForthTokens(current),
          });
          break;
        }

        case "do":
        case "+do":
        case "-do": {
          const start = asToken(tokens[i]);

          i++;

          if (i >= tokens.length) {
            throw new Error(
              "Couldn't find closing element for '" + start.value + "'",
            );
          }

          let token = asToken(tokens[i]);
          const idx = token.value;

          while (depth > 0) {
            i++;

            if (i >= tokens.length) {
              throw new Error(
                "Couldn't find closing element for '" + start.value + "'",
              );
            }

            if (tokens[i].type !== "Token") {
              current.push(tokens[i]);
              continue;
            }

            const token = asToken(tokens[i]);
            switch (token.value.toLowerCase()) {
              case "do":
              case "+do":
              case "-do":
                depth++;
                current.push(token);
                break;
              case "loop":
                depth--;
                if (depth > 0) {
                  current.push(token);
                }
                break;
              default:
                current.push(token);
            }
          }

          token = asToken(tokens[i]);
          if (token.value.toLowerCase() !== "loop") {
            throw new Error(
              "Internal compiler error: last closing element in a '" + start +
                "' loop was invalid",
            );
          }
          switch (start.value.toLowerCase()) {
            case "do":
              add(
                {
                  type: "DoLoop",
                  index: idx,
                  body: this.createFromForthTokens(current),
                },
              );
              break;
            case "+do":
              add(
                {
                  type: "DoLoop",
                  index: idx,
                  body: this.createFromForthTokens(current),
                  compareOperation: "<",
                },
              );
              break;
            case "-do":
              add(
                {
                  type: "DoLoop",
                  index: idx,
                  body: this.createFromForthTokens(current),
                  compareOperation: ">",
                },
              );
              break;
            default:
              throw new Error(
                "Internal compiler error: start element in a '" + start +
                  "' loop was invalid",
              );
          }
          break;
        }

        case "include": {
          i++;

          if (i >= tokens.length) {
            throw new Error("Couldn't find requirement argument for 'include'");
          }

          const token = tokens[i];
          if (token.type !== "String" && token.type !== "Token") {
            throw Error(
              `Unexpected token type found in createFromForthTokens got: ${t.type} expected String | Token`,
            );
          }
          const { fullfilename, content } = this.options.loadFile(
            token.value,
            this.options.includeDirectories,
          );
          add(
            this.createFromForth(content, fullfilename),
          );
          break;
        }

        case ":": // function definition
        case ":noname": {
          const functionType = asToken(tokens[i]).value;
          let function_name;
          if (functionType === ":") {
            i++;
            if (i >= tokens.length) {
              throw new Error("Couldn't find closing ';' for nameless ':'");
            }

            if (tokens[i].type !== "Token") {
              throw new Error(
                `Unexpected token type found after : (expected: Token got: ${
                  tokens[i].type
                } content: ${JSON.stringify(tokens[i])})`,
              );
            }
            function_name = asToken(tokens[i]).value;
          }

          while (depth > 0) {
            i++;
            if (i >= tokens.length) {
              throw new Error(
                `Couldn't find closing ';' for '${functionType}' in function "${function_name}"`,
              );
            }

            const token = tokens[i];
            if (token.type === "Token") {
              if (isFunctionStart(token.value)) {
                depth++;
              } else if (
                token.value === ";" || token.value === "return;"
              ) {
                depth--;
              }
            }
            if (depth > 0) {
              current.push(token);
            }
          }

          const body = this.createFromForthTokens(current);
          let args;
          let returns;

          const stackComment = body.body[0];
          if (stackComment?.type == "ValueLocal") {
            args = stackComment.values;
            if (stackComment.comment === undefined) {
              returns = [];
            } else {
              returns = stackComment.comment.trim().split(" ").filter((val) =>
                val !== ""
              );
              if (returns[0] == "returnEverything") {
                returns = undefined;
              }
            }
          } else if (stackComment?.type == "CommentParentheses") {
            const [argsStr, returnsStr, ...rest] = stackComment.comment.trim()
              .split("--");
            if (rest.length > 0) {
              throw new Error(
                `Stack comment in '${functionType}' function "${
                  function_name ?? ":noname"
                } contains more than one '--' ${stackComment.comment}`,
              );
            }

            args = argsStr.trim().split(" ").filter((val) => val !== "");
            if (args[0] === "skipCheck") {
              args = undefined;
            }

            returns = returnsStr?.trim().split(" ").filter((val) =>
              val !== ""
            ) ?? [];
            if (returns[0] == "returnEverything") {
              returns = undefined;
            }
          } else {
            throw new Error(
              `stack comment missing in "${function_name ?? ":noname"}`,
            );
          }

          add(
            {
              type: "FunctionForth",
              name: function_name,
              usesStackComment: stackComment.type === "CommentParentheses",
              arguments: args,
              returns: returns,
              body: body,
            },
          );
          break;
        }

        case ":async":
        case ":js": { // function definition
          const functionType = asToken(tokens[i]).value;
          const isAsync = functionType === ":async";
          i++;
          if (i >= tokens.length) {
            throw new Error(
              `Couldn't find closing ';/return;' for nameless '${functionType}'`,
            );
          }

          if (tokens[i].type !== "Token") {
            throw new Error(
              `Unexpected token type found after '${functionType}' nameless`,
            );
          }

          const function_name = asToken(tokens[i]).value;

          while (depth > 0) {
            i++;
            if (i >= tokens.length) {
              throw new Error(
                `Couldn't find closing ';/return;' for '${functionType}' '${function_name}'`,
              );
            }

            if (tokens[i].type === "Token") {
              if (isFunctionStart(asToken(tokens[i]).value)) {
                depth++;
              } else if (
                asToken(tokens[i]).value === ";" ||
                asToken(tokens[i]).value === "return;"
              ) {
                depth--;
              }
            }
            if (depth > 0) {
              current.push(tokens[i]);
            }
          }

          localtree = this.createFromForthTokens(current);

          let args: string[] = [];

          if (localtree.body.length > 0) {
            const values = localtree.body[0];
            if (values.type !== "ValueLocal") {
              throw new Error(
                `${functionType} '${function_name}' requires { <args> -- <comment> } after the function name`,
              );
            }

            // @ts-ignore: we change the type
            values.type = "CommentParentheses";
            args = values.values.reverse();
          }

          if (asToken(tokens[i]).value === "return;") {
            localtree.body.push({ type: "JsCode", body: "return stack.pop()" });
          }

          add(
            {
              type: "FunctionJs",
              name: function_name,
              args,
              body: localtree,
              isAsync,
            },
          );
          break;
        }

        case ":asyncnoname":
        case ":jsnoname": { // function definition
          const isAsync = asToken(tokens[i]).value === ":asyncnoname";
          while (depth > 0) {
            i++;
            if (i >= tokens.length) {
              throw new Error(
                "Couldn't find closing ';/return;' for ':jsnoname'",
              );
            }

            if (tokens[i].type === "Token") {
              const token = asToken(tokens[i]);
              if (isFunctionStart(token.value)) {
                depth++;
              } else if (
                token.value === ";" || token.value === "return;"
              ) {
                depth--;
              }
            }
            if (depth > 0) {
              current.push(tokens[i]);
            }
          }

          localtree = this.createFromForthTokens(current);

          let args: string[] = [];

          if (localtree.body.length > 0) {
            values = localtree.body[0];
            if (values.type !== "ValueLocal") {
              throw new Error(
                ":jsnoname requires { <args> -- <comment> } after :jsnoname",
              );
            }

            // @ts-ignore: we change the type
            values.type = "CommentParentheses";
            args = values.values.reverse();
          }

          if (asToken(tokens[i]).value === "return;") {
            localtree.body.push({
              type: "JsCode",
              body: "return stack.pop()",
            });
          }

          add(
            {
              type: "FunctionJs",
              args,
              body: localtree,
              isAsync,
            },
          );
          break;
        }

        case ":macro": { // macro definition
          i++;

          if (i >= tokens.length) {
            throw new Error("Couldn't find closing ';' for ':'");
          }

          if (tokens[i].type !== "Token") {
            throw new Error(
              `Unexpected token type found after :macro (expected: Token got: ${
                tokens[i].type
              } content: ${JSON.stringify(tokens[i])})`,
            );
          }

          const function_name = asToken(tokens[i]).value;

          while (depth > 0) {
            i++;
            if (i >= tokens.length) {
              throw new Error("Couldn't find closing ';' for ':'");
            }

            const token = tokens[i];
            if (token.type === "Token") {
              if (
                token.value === ":macro" || token.value === ":" ||
                token.value === ":noname" || token.value === ":js" ||
                token.value === ":jsnoname"
              ) {
                depth++;
              } else if (
                token.value === ";" || token.value === "return;"
              ) {
                depth--;
              }
            }
            if (depth > 0) {
              current.push(tokens[i]);
            }
          }

          const args = current.splice(0, 1)[0];

          if (args.type !== "ValueLocal") {
            throw new Error(
              t + " " + function_name + " requires { .. } after the macro name",
            );
          }

          if (function_name.indexOf(".") !== -1) {
            throw new Error("Macro names can not contain .");
          }

          const macro: MacroType = {
            type: "Macro",
            name: function_name,
            args: args.values,
            body: current,
          };
          add(macro);

          this.macros[mangle(function_name)] = macro;
          break;
        }

        // forbidden tokens

        case ")": // comment end
        case "]:": // execute js code end
        case "]:d": // execute js code end
        case "else":
        case "then":
        case "endif":
        case "endcase":
        case ";":
        case "return;":
        case "}": { // local variable end
          throw new Error("Unexpected token " + JSON.stringify(t) + " found");
        }

        default: {
          const mangledT = mangle(t.value);
          let dmacro = undefined;
          if (this.macros[mangledT]) {
            dmacro = structuredClone(this.macros[mangledT]);
          }

          // handle a macro replacement
          if (dmacro) {
            // macro replacement without arguments
            if (dmacro.args.length === 0) {
              const gcode = this.createFromForthTokens(dmacro.body);
              add(gcode);
            } else {
              // macro replacement with arguments
              const gcode = dmacro.body;
              for (let k = dmacro.args.length - 1; k >= 0; --k) {
                i++;
                for (let n = 0; n < gcode.length; ++n) {
                  const entry = gcode[n];
                  switch (entry.type) {
                    case "Token": {
                      const token = tokens[i];
                      if (
                        token.type !== "Token" && token.type !== "Number" &&
                        token.type !== "String"
                      ) {
                        throw Error(
                          `macro replacements only allow Token, String or Number but got ${t.type}`,
                        );
                      }
                      if (entry.value === dmacro.args[k]) {
                        gcode[n] = {
                          type: token.type,
                          value: token.value,
                        };
                      } else if (entry.value === ("#" + dmacro.args[k])) {
                        gcode[n] = {
                          type: (token.type === "Number") ? "Number" : "String",
                          value: token.value,
                        };
                      }
                      break;
                    }
                    case "JsCodeDirect":
                    case "JsCode":
                    case "JsCodeWithReturn": {
                      const token = tokens[i];
                      if (token === undefined) {
                        throw new Error(
                          `token is undefined, context "${
                            JSON.stringify(tokens[i - 1])
                          }"`,
                        );
                      }
                      switch (token.type) {
                        case "Token": {
                          // TODO: mangling should only be done in the generateJsCode function
                          entry.body = replaceWholeWord(
                            entry.body,
                            dmacro.args[k],
                            mangle(token.value),
                          ).replaceAll(
                            "#" + dmacro.args[k],
                            () => mangle(token.value),
                          );
                          break;
                        }
                        case "Number":
                          entry.body = replaceWholeWord(
                            entry.body,
                            dmacro.args[k],
                            token.value.toString(),
                          );
                          break;
                        case "String":
                          entry.body = replaceWholeWord(
                            entry.body,
                            dmacro.args[k],
                            '"' + token.value + '"',
                          );
                          break;
                        default:
                          throw new Error(
                            `I don't know what I should do with ${
                              JSON.stringify(token)
                            } as a macro argument`,
                          );
                      }
                      break;
                    }
                  }
                }
              }

              const cgcode = this.createFromForthTokens(gcode);
              cgcode.extendedMacro = t.value;
              add(cgcode);
            }
          } else {
            const match = /^(.+)\((\d*)\)(;?)$/.exec(t.value);
            if (match === null) {
              add({
                type: "Call",
                name: t.value,
              });
            } else {
              const newEntry: NodeType = {
                type: "Call",
                name: match[1],
                argument_count: 0,
              };

              if (match[2] !== "") {
                newEntry.argument_count = parseInt(match[2]);
                if (isNaN(newEntry.argument_count)) {
                  throw Error(`invalid argument passed to ${t}`);
                }
              }

              if (match[3] === ";") {
                newEntry.drop_result = true;
              }

              add(newEntry);
            }
          }
        }
      }
    }

    return out;
  }

  createFromForth(code: string, filename?: string) {
    return this.createFromForthTokens(this.tokenize(code, filename));
  }

  generateJsCode(
    code_tree: BodyType,
    splitOnTopLevelAwait: boolean,
  ): { code: string; dropResult: boolean }[] {
    const options = this.options;
    const output: { code: string; dropResult: boolean }[] = [];
    let out = '"use strict";\n';

    function nextBlock(dropResult: boolean) {
      output.push({ code: out, dropResult: dropResult });
      out = '"use strict";\n';
    }

    function append(str: string) {
      if (str && str !== "") {
        out += str + "\n";
      }
    }

    function generateCode(
      code_tree: NodeType,
      topLevel: boolean,
    ) {
      switch (code_tree.type) {
        case "Await": {
          // split the code into before and after
          if (splitOnTopLevelAwait && topLevel) {
            append("stack.pop()");
            nextBlock(code_tree.dropResult);
          } else {
            if (code_tree.dropResult) {
              append("await stack.pop();");
            } else {
              append("stack.push(await stack.pop());");
            }
          }
          break;
        }
        case "Empty": {
          break;
        }
        case "BeginAgain": {
          append("do {");
          generateCode(code_tree.body, false);
          append("} while(true);");
          break;
        }
        case "BeginUntil": {
          append("do {");
          generateCode(code_tree.body, false);
          append("} while(!stack.pop());");
          break;
        }
        case "BeginWhileRepeat": {
          append("do {");
          generateCode(code_tree.condition, false);
          append("if(!stack.pop()) break;");
          generateCode(code_tree.body, false);
          append("} while(true);");
          break;
        }
        case "BranchCase": {
          append("switch(stack.pop()) {");
          //code_tree.body.forEach(function(entry) {
          //	generateCode(entry, level+1)
          //})
          generateCode(code_tree.body, false);
          if (code_tree.defaultOf) {
            append("default:");
            generateCode(code_tree.defaultOf, false);
          }
          append("}");
          break;
        }
        case "BranchCaseOf": {
          append("case " + code_tree.condition + ":");
          generateCode(code_tree.body, false);
          append("break;");
          break;
        }
        case "BranchIf": {
          let openingBrackets = 0;
          append("if(stack.pop()) {");
          generateCode(code_tree.if_body, false);
          if (code_tree.else_if_bodies) {
            code_tree.else_if_bodies.forEach(
              function (entry: { condition: BodyType; body: BodyType }) {
                append("} else {");
                generateCode(entry.condition, false);
                append("if(stack.pop()) {");
                generateCode(entry.body, false);
                openingBrackets++;
              },
            );
          }
          if (code_tree.else_body) {
            append("} else {");
            generateCode(code_tree.else_body, false);
          }
          for (let j = 0; j < openingBrackets + 1; ++j) {
            append("}");
          }
          break;
        }
        case "Body":
          for (const entry of code_tree.body) {
            generateCode(entry, topLevel);
          }
          break;

        case "Call": {
          const name = mangle(code_tree.name);
          const splitted = name.split(".");
          let ctxt = splitted.slice(0, splitted.length - 1).join(".");
          if (ctxt === "") {
            ctxt = "this";
          }
          if (code_tree.argument_count === undefined) {
            append("if(typeof " + name + " === 'function') {");
            append(
              "if(!" + name + ".forth_function) { stack.pushIfNotUndefined(" +
                name + ".apply(" + ctxt + ", stack.getTopElements(" + name +
                ".length)));",
            );
            append("} else { " + name + "(stack); }");
            append("} else { stack.push(" + name + ");}");
          } else if (code_tree.drop_result === undefined) {
            if (code_tree.argument_count === undefined) {
              append(
                "if(!" + name + ".forth_function) { stack.pushIfNotUndefined(" +
                  name + ".apply(" + ctxt + ", stack.getTopElements(" + name +
                  ".length)));",
              );
              append("} else { " + name + "(stack); }");
            } else if (code_tree.argument_count === 0) {
              append("stack.pushIfNotUndefined(" + name + "());");
            } else {
              append(
                "stack.pushIfNotUndefined(" + name + ".apply(" + ctxt +
                  ", stack.getTopElements(" + code_tree.argument_count + ")));",
              );
            }
          } else {
            if (code_tree.argument_count === undefined) {
              append(
                "if(!" + name + ".forth_function) { " + name + ".apply(" +
                  ctxt + ", stack.getTopElements(" + name + ".length));",
              );
              append("} else { " + name + "(stack); }");
            } else if (code_tree.argument_count === 0) {
              append(name + "();");
            } else {
              append(
                name + ".apply(" + ctxt + ", stack.getTopElements(" +
                  code_tree.argument_count + "));",
              );
            }
          }

          break;
        }

        // we ignore CommentLines and CommentParentheses

        case "Screen":
        case "CommentLine":
        case "CommentParentheses": {
          break;
        }

        case "DoLoop": {
          const idx = mangle(code_tree.index);

          if (code_tree.increment === undefined) {
            if (code_tree.compareOperation === undefined) {
              throw new Error(
                "Can not deduce in which direction the loop should go either use +do, -do, or use a constant increment",
              );
            }

            append("(async () => {");
            append("let " + idx + "_increment=stack.pop();");
            append("let " + idx + "_end=stack.pop();");

            append(
              "for(let " + idx + "=stack.pop(); " + idx +
                code_tree.compareOperation + idx + "_end;" + idx + "+= " + idx +
                "_increment) {",
            );
            generateCode(code_tree.body, false);
            append("}");
            append("})();");
          } else {
            append("(async () => {");
            append("let " + idx + "_end=stack.pop();");

            if (code_tree.increment === 1) {
              append(
                "for(let " + idx + "=stack.pop(); " + idx + "<" + idx +
                  "_end; ++" + idx + ") {",
              );
            } else if (code_tree.increment === -1) {
              append(
                "for(let " + idx + "=stack.pop(); " + idx + ">" + idx +
                  "_end; --" + idx + ") {",
              );
            } else if (code_tree.increment >= 0) {
              append(
                "for(let " + idx + "=stack.pop(); " + idx + "<" + idx +
                  "_end;" + idx + "+= " + code_tree.increment + ") {",
              );
            } else {
              append(
                "for(let " + idx + "=stack.pop(); " + idx + ">" + idx +
                  "_end;" + idx + "+= " + code_tree.increment + ") {",
              );
            }
            generateCode(code_tree.body, false);
            append("}");
            append("})();");
          }

          break;
        }

        case "FunctionForth": {
          const name = code_tree.name === undefined
            ? "unnamed"
            : mangle(code_tree.name);
          if (name.indexOf(".") !== -1) {
            throw new Error(`Function names can not contain '.' ${name}`);
          }

          if (!options.checkStack || code_tree.arguments === undefined) {
            if (code_tree.name === undefined) {
              append("stack.push(function(stack) {");
            } else {
              append(`function ${name}(stack) {`);
            }

            generateCode(code_tree.body, false);
          } else {
            if (code_tree.name === undefined) {
              append("stack.push(function($parentStack) {");
            } else {
              append(`function ${name}($parentStack) {`);
            }
            append("const stack = new SForthStack();");
            append("let $_has_an_unhandled_exception = false;");
            append("try {");
            if (code_tree.arguments[0] === "n...") {
              if (code_tree.arguments.length !== 1) {
                throw new Error(
                  `Code generator doesn't support n... if other arguments are used in function "${code_tree.name}"`,
                );
              }
              append(
                `if($parentStack.length < ($parentStack.top()+1))
                        console.trace(\`parent stack state doesn't match the number of elements that were promised by using n... description expected(\${$parentStack.top()+1}): ${
                  JSON.stringify(code_tree.arguments)
                } got: \` + JSON.stringify($parentStack))`,
              );
              append(
                `stack.pushArray($parentStack.getTopElements($parentStack.top()+1))`,
              );
            } else {
              append(
                `if($parentStack.length < ${code_tree.arguments.length})
                        console.trace(\`parent stack state doesn't match description expected: ${
                  JSON.stringify(code_tree.arguments)
                } got: \` + JSON.stringify($parentStack))`,
              );
              append(
                `stack.pushArray($parentStack.getTopElements(${(code_tree
                  .arguments.length)}))`,
              );
            }

            generateCode(code_tree.body, false);

            append("} catch(e) {");
            append("$_has_an_unhandled_exception = true;");
            append("throw e;");
            append("} finally {");
            if (code_tree.returns !== undefined) {
              if (code_tree.returns[0] === "n...") {
                if (code_tree.returns.length !== 1) {
                  throw new Error(
                    `Code generator doesn't support n... if other returns are used in function "${code_tree.name}"`,
                  );
                }
                append(
                  `if(!$_has_an_unhandled_exception && stack.length !== (stack.top()+1))
                        console.trace(\`local stack state doesn't match the number of elements that were promised by using n... description expected(\${stack.top()+1}): ${
                    JSON.stringify(code_tree.returns)
                  } got: \` + JSON.stringify(stack))`,
                );
              } else {
                append(
                  `if(!$_has_an_unhandled_exception && stack.length !== ${code_tree.returns.length})
                        console.trace(\`local stack state doesn't match description expected(${code_tree.returns.length}): ${
                    JSON.stringify(code_tree.returns)
                  } got: \` + JSON.stringify(stack))`,
                );
              }
            }
            append(`$parentStack.pushArray(stack.getArray())`); // TODO: optimize this case
            append("}");
          }

          if (code_tree.name === undefined) {
            append("});\n");
            append("stack.top().forth_function=true;");
          } else {
            append("}");
            append(`${name}.forth_function=true;`);
          }
          break;
        }

        case "FunctionJs": {
          const name = code_tree.name === undefined
            ? ""
            : mangle(code_tree.name);
          if (name.indexOf(".") !== -1) {
            throw new Error("Function names can not contain .");
          }
          const args = code_tree.args.map(mangle).join(", ");
          append(
            `${code_tree.name === undefined ? "stack.push(" : ""}${
              code_tree.isAsync ? "async " : ""
            }function ${name}(${args}) {`,
          );
          append("const stack = new SForthStack();");
          generateCode(code_tree.body, false);
          if (code_tree.name === undefined) {
            append("});");
          } else {
            append("}");
          }
          break;
        }

        case "JsCode": {
          const clean = code_tree.body.replaceAll(" ", "").replaceAll("\t", "")
            .replaceAll("\n", "").replaceAll("\r", "");
          if (clean && clean !== "") {
            append(code_tree.body + ";");
          }
          break;
        }
        case "JsCodeDirect": {
          const clean = code_tree.body.replaceAll(" ", "").replaceAll("\t", "")
            .replaceAll("\n", "").replaceAll("\r", "");
          if (clean && clean !== "") {
            append(code_tree.body);
          }
          break;
        }
        case "JsCodeWithReturn": {
          append("stack.push(" + code_tree.body + ");");
          break;
        }

        case "JsCodeWithReturnToVar":
        case "JsCodeWithReturnToVarTemp": {
          append(
            "var " + mangle(code_tree.value) + " = " + code_tree.body +
              ";",
          );
          break;
        }
        case "JsCodeWithReturnAssignToVar": {
          append(
            mangle(code_tree.value) + " = " + code_tree.body + ";",
          );
          break;
        }
        case "JsCodeWithReturnAddToVar": {
          append(
            mangle(code_tree.value) + " += " + code_tree.body + ";",
          );
          break;
        }

        case "Macro": {
          // macros don't result in code
          break;
        }

        case "Number": {
          append(`stack.push(${code_tree.value});`);
          break;
        }
        case "NumberToVar":
        case "NumberToVarTemp": {
          append(
            `var ${mangle(code_tree.name)} = ${code_tree.value};`,
          );
          break;
        }
        case "NumberAssignToVar": {
          append(`${mangle(code_tree.name)} = ${code_tree.value};`);
          break;
        }
        case "NumberAddToVar": {
          append(`${mangle(code_tree.name)} += ${code_tree.value};`);
          break;
        }

        case "String": {
          const ch = code_tree.interpolate ? "`" : '"';
          append(`stack.push(${ch}${code_tree.value}${ch});`);
          break;
        }
        case "StringToVar":
        case "StringToVarTemp": {
          const ch = code_tree.interpolate ? "`" : '"';
          append(
            `var ${mangle(code_tree.name)} = ${ch}${code_tree.value}${ch};`,
          );
          break;
        }
        case "StringAssignToVar": {
          const ch = code_tree.interpolate ? "`" : '"';
          append(
            `${mangle(code_tree.name)} = ${ch}${code_tree.value}${ch};`,
          );
          break;
        }
        case "StringAddToVar": {
          const ch = code_tree.interpolate ? "`" : '"';
          append(
            `${mangle(code_tree.name)} += ${ch}${code_tree.value}${ch};`,
          );
          break;
        }

        case "TryCatchFinally": {
          append("try {");
          generateCode(code_tree.body, false);
          if (code_tree.catchVar === undefined) {
            append("} catch {");
          } else {
            append("} catch( " + code_tree.catchVar + ") {");
          }
          if (code_tree.catchBody) {
            generateCode(code_tree.catchBody, false);
          }
          if (code_tree.finallyBody) {
            append("} finally {");
            generateCode(code_tree.finallyBody, false);
          }
          append("}");
          "";
          break;
        }
        case "ValueLocal": {
          for (const entry of code_tree.values) {
            append(`var ${mangle(entry)} = stack.pop();`);
          }
          break;
        }
        case "ValueLocalLet": {
          for (const entry of code_tree.values) {
            append(`let ${mangle(entry)} = stack.pop();`);
          }
          break;
        }
        case "ValueToStack": {
          append(`stack.push(${mangle(code_tree.name)});`);
          break;
        }
        default: {
          throw new Error(
            "Unknown type=" + code_tree.type + " Unknown " +
              JSON.stringify(code_tree, null, "\t"),
          );
        }
      }
    }

    generateCode(code_tree, true);

    if (out !== "") {
      output.push({ code: out, dropResult: true });
    }

    return output;
  }

  get runtime() {
    return `"use strict";\n${SForthStack.toString()};\nvar stack = stack || new SForthStack();`;
  }

  optimizeCodeTree(org_code_tree: BodyType) {
    const code_tree: BodyType = structuredClone(org_code_tree);

    let modified;

    function visitNodes(
      func: (
        current: NodeType[],
        previous?: NodeType,
      ) => NodeType | undefined,
      current?: NodeType | NodeType[],
      previous?: NodeType,
    ): NodeType | undefined {
      if (current === undefined) {
        // ignore this case
      } else if (current instanceof Array) {
        return func(current, previous);
      } else {
        switch (current.type) {
          case "Body":
            return visitNodes(func, current.body, previous);
          case "BeginAgain":
          case "BeginUntil":
          case "BeginWhileRepeat":
          case "BranchCaseOf":
          case "BranchIfBody":
          case "DoLoop":
          case "FunctionForth":
          case "FunctionJs":
            visitNodes(func, current.body);
            break;
          case "BranchCase":
            visitNodes(func, current.body);
            visitNodes(func, current.defaultOf);
            break;
          case "BranchIf":
            visitNodes(func, current.if_body);
            visitNodes(func, current.else_if_bodies);
            visitNodes(func, current.else_body);
            break;
          case "Await":
          case "Empty":
          case "Call":
          case "CommentLine":
          case "CommentParentheses":
          case "JsCode":
          case "JsCodeDirect":
          case "JsCodeWithReturn":
          case "JsCodeWithReturnToVar":
          case "JsCodeWithReturnToVarTemp":
          case "JsCodeWithReturnAssignToVar":
          case "JsCodeWithReturnAddToVar":
          case "Macro":
          case "Number":
          case "NumberToVar":
          case "NumberToVarTemp":
          case "NumberAssignToVar":
          case "NumberAddToVar":
          case "Screen":
          case "String":
          case "StringToVar":
          case "StringToVarTemp":
          case "StringAssignToVar":
          case "StringAddToVar":
          case "ValueLocal":
          case "ValueLocalLet":
            break;
          case "TryCatchFinally":
            visitNodes(func, current.body);
            visitNodes(func, current.catchBody);
            visitNodes(func, current.finallyBody);
            break;
          default:
            console.log("Unexpected entry found: " + JSON.stringify(current));
        }
      }
      return undefined;
    }

    // rewrite do without a compare operation to do with an increment
    function fixIncompleteDoLoops(
      current: NodeType[],
      previous?: NodeType,
    ) {
      for (let i = 0; i < current.length; ++i) {
        const val = current[i];
        if (
          val.type === "DoLoop" &&
          val.compareOperation === undefined && val.increment === undefined &&
          previous !== undefined &&
          previous.type === "Number"
        ) {
          modified = true;
          val.increment = parseFloat(previous.value);
          // @ts-ignore: we change the type
          previous.type = "Empty";
          return;
        }

        if (
          val.type === "CommentLine" ||
          val.type === "CommentParentheses"
        ) {
          // nothing todo
        } else if (val.type === "Body") {
          previous = visitNodes(fixIncompleteDoLoops, val, previous);
        } else {
          visitNodes(fixIncompleteDoLoops, val);
          previous = val;
        }
      }
      return previous;
    }

    // rewrite var <something> = stack.pop() to ValueLocal
    function rewriteStackPop(current: NodeType[]) {
      for (let i = 0; i < current.length; ++i) {
        const val = current[i];
        if (val.type === "JsCode") {
          const match = /^[ ]*var[ ]+(.+)[ ]+=[ ]+stack\.pop\([ ]*\)[ ;]*$/
            .exec(val.body);
          if (match !== null) {
            modified = true;
            current[i] = {
              type: "ValueLocal",
              values: [match[1]],
            };
          }
        }
        visitNodes(rewriteStackPop, val);
      }
      return undefined;
    }

    // remove empty code tree entries
    function removeEmptyCodeTreeEntries(current: NodeType[]) {
      for (let i = 0; i < current.length; ++i) {
        const val = current[i];
        if (
          ((val.type === "ValueLocal" || val.type === "ValueLocalLet") &&
            val.values.length === 0) ||
          (val.type === "Body" && val.body.length === 0) ||
          (val.type === "Empty")
        ) {
          current.splice(i, 1);
          modified = true;
        }
        visitNodes(removeEmptyCodeTreeEntries, val);
      }
      return undefined;
    }

    function inlineValueLocal(
      current: NodeType[],
      previous?: NodeType,
    ) {
      for (let i = 0; i < current.length; ++i) {
        const val = current[i];
        if (
          previous !== undefined &&
          val.type === "ValueLocal" && val.values.length > 0
        ) {
          if (previous.type === "Number") {
            // @ts-ignore: we change the type
            previous.type = "NumberToVar";
            // @ts-ignore: we change the type
            previous.name = val.values.splice(0, 1)[0];
            modified = true;
            return;
          }
          if (previous.type === "String") {
            // @ts-ignore: we change the type
            previous.type = "StringToVar";
            // @ts-ignore: we change the type
            previous.name = val.values.splice(0, 1)[0];
            modified = true;
            return;
          }
          if (previous.type === "JsCodeWithReturn") {
            // @ts-ignore: we change the type
            previous.type = "JsCodeWithReturnToVar";
            // @ts-ignore: we change the type
            previous.value = val.values.splice(0, 1)[0];
            modified = true;
            return;
          }
        }
        if (
          val.type === "CommentLine" ||
          val.type === "CommentParentheses"
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocal" && val.values.length === 0
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocalLet" && val.values.length === 0
        ) {
          // nothing todo
        } else if (
          val.type === "NumberToVar" ||
          val.type === "StringToVar" ||
          val.type === "JsCodeWithReturnToVar" ||
          val.type === "NumberToVarTemp" ||
          val.type === "StringToVarTemp" ||
          val.type === "JsCodeWithReturnToVarTemp"
        ) {
          // nothing todo
        } else if (val.type === "Body") {
          previous = visitNodes(inlineValueLocal, val, previous);
        } else {
          visitNodes(inlineValueLocal, val);
          previous = val;
        }
      }
      return previous;
    }

    function inlineValueLocalLet(
      current: NodeType[],
      previous?: NodeType,
    ) {
      for (let i = 0; i < current.length; ++i) {
        const val = current[i];
        if (
          previous !== undefined &&
          (
            val.type === "ValueLocalLet" && val.values.length > 0
          )
        ) {
          if (previous.type === "Number") {
            // @ts-ignore: we change the type
            previous.type = "NumberToVarTemp";
            // @ts-ignore: we change the type
            previous.name = val.values.splice(0, 1)[0];
            modified = true;
            return;
          }
          if (previous.type === "String") {
            // @ts-ignore: we change the type
            previous.type = "StringToVarTemp";
            // @ts-ignore: we change the type
            previous.name = val.values.splice(0, 1)[0];
            modified = true;
            return;
          }
          if (previous.type === "JsCodeWithReturn") {
            // @ts-ignore: we change the type
            previous.type = "JsCodeWithReturnToVarTemp";
            // @ts-ignore: we change the type
            previous.value = val.values.splice(0, 1)[0];
            modified = true;
            return;
          }
        }
        if (
          val.type === "CommentLine" ||
          val.type === "CommentParentheses"
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocal" && val.values.length === 0
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocalLet" && val.values.length === 0
        ) {
          // nothing todo
        } else if (
          val.type === "NumberToVar" ||
          val.type === "StringToVar" ||
          val.type === "JsCodeWithReturnToVar" ||
          val.type === "NumberToVarTemp" ||
          val.type === "StringToVarTemp" ||
          val.type === "JsCodeWithReturnToVarTemp"
        ) {
          // nothing todo
        } else if (val.type === "Body") {
          previous = visitNodes(inlineValueLocalLet, val, previous);
        } else {
          visitNodes(inlineValueLocalLet, val);
          previous = val;
        }
      }
      return previous;
    }

    function rewriteJSCode(
      current: NodeType[],
      previous?: NodeType,
    ) {
      for (let i = 0; i < current.length; ++i) {
        const val = current[i];
        if (
          val.type === "JsCode" && previous !== undefined
        ) {
          const match = /^[ ]*(.+)[ ]+=[ ]+stack\.pop\([ ]*\)[ ;]*$/.exec(
            val.body,
          );
          if (match !== null) {
            if (previous.type === "Number") {
              // @ts-ignore: we change the type
              previous.type = "NumberAssignToVar";
              // @ts-ignore: we change the type
              previous.name = match[1];
              // @ts-ignore: we change the type
              val.type = "Empty";
              modified = true;
              return;
            }
            if (previous.type === "String") {
              // @ts-ignore: we change the type
              previous.type = "StringAssignToVar";
              // @ts-ignore: we change the type
              previous.name = match[1];
              // @ts-ignore: we change the type
              val.type = "Empty";
              modified = true;
              return;
            }
            if (previous.type === "JsCodeWithReturn") {
              // @ts-ignore: we change the type
              previous.type = "JsCodeWithReturnAssignToVar";
              // @ts-ignore: we change the type
              previous.value = match[1];
              // @ts-ignore: we change the type
              val.type = "Empty";
              modified = true;
              return;
            }
          } else {
            const match = /^[ ]*(.+)[ ]+\+=[ ]+stack\.pop\([ ]*\)[ ;]*$/.exec(
              val.body,
            );
            if (match !== null) {
              if (previous.type === "Number") {
                // @ts-ignore: we change the type
                previous.type = "NumberAddToVar";
                // @ts-ignore: we change the type
                previous.name = match[1];
                // @ts-ignore: we change the type
                val.type = "Empty";
                modified = true;
                return;
              }
              if (previous.type === "String") {
                // @ts-ignore: we change the type
                previous.type = "StringAddToVar";
                // @ts-ignore: we change the type
                previous.name = match[1];
                // @ts-ignore: we change the type
                val.type = "Empty";
                modified = true;
                return;
              }
              if (previous.type === "JsCodeWithReturn") {
                // @ts-ignore: we change the type
                previous.type = "JsCodeWithReturnAddToVar";
                // @ts-ignore: we change the type
                previous.value = match[1];
                // @ts-ignore: we change the type
                val.type = "Empty";
                modified = true;
                return;
              }
            } else {
              const match = /^[ ]*return[ ]+stack\.pop\([ ]*\)[ ]*$/.exec(
                val.body,
              );
              if (match !== null) {
                if (previous.type === "Number") {
                  // @ts-ignore: we change the type
                  previous.type = "Empty";
                  val.body = "return " + previous.value;
                  modified = true;
                  return;
                }
                if (previous.type === "String") {
                  // @ts-ignore: we change the type
                  previous.type = "Empty";
                  val.body = 'return "' + previous.value + '"';
                  modified = true;
                  return;
                }
                if (previous.type === "JsCodeWithReturn") {
                  // @ts-ignore: we change the type
                  previous.type = "Empty";
                  val.body = "return " + previous.body;
                  modified = true;
                  return;
                }
              }
            }
          }
        }
        if (
          val.type === "CommentLine" ||
          val.type === "CommentParentheses"
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocal" && val.values.length === 0
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocalLet" && val.values.length === 0
        ) {
          // nothing todo
        } else if (val.type === "Body") {
          previous = visitNodes(rewriteJSCode, val, previous);
        } else {
          visitNodes(rewriteJSCode, val);
          previous = val;
        }
      }
      return previous;
    }

    function inlineValueLocalLetIntoJsOperators(
      current: NodeType[],
      previous?: NodeType,
    ) {
      for (let i = 0; i < current.length; ++i) {
        const val = current[i];
        if (
          (val.type === "JsCodeWithReturn" ||
            val.type === "JsCodeWithReturnAddToVar" ||
            val.type === "JsCodeWithReturnToVar" ||
            val.type === "JsCodeWithReturnToVarTemp" ||
            val.type === "JsCodeWithReturnAssignToVar") &&
          previous !== undefined
        ) {
          const match = /^[ ]*(.+)[ ]+(.+)[ ]+(.+)[ ]*$/.exec(val.body);
          if (match !== null) {
            let previousUsed = false;
            switch (previous.type) {
              case "NumberToVarTemp":
                if (match[1] === previous.name) {
                  val.body = previous.value.toString();
                  previousUsed = true;
                } else {
                  val.body = match[1];
                }
                val.body += " " + match[2];
                if (match[3] === previous.name) {
                  val.body += " " + previous.value.toString();
                  previousUsed = true;
                } else {
                  val.body += " " + match[3];
                }
                break;
              case "StringToVarTemp":
                val.body = "";
                if (match[1] === previous.name) {
                  val.body += '"' + previous.value + '"';
                  previousUsed = true;
                } else {
                  val.body += match[1];
                }

                val.body += " " + match[2] + " ";

                if (match[3] === previous.name) {
                  val.body += '"' + previous.value + '"';
                  previousUsed = true;
                } else {
                  val.body += match[3];
                }
                break;
              case "JsCodeWithReturnToVarTemp":
                if (match[1] === previous.value) {
                  match[1] = previous.body;
                  previousUsed = true;
                }
                if (match[3] === previous.value) {
                  match[3] = previous.body;
                  previousUsed = true;
                }
                val.body = match[1] + " " + match[2] + " " + match[3];
                break;
            }

            if (previousUsed) {
              previous.type = "Empty";
              modified = true;
              return;
            }
          }
        }
        if (
          val.type === "CommentLine" ||
          val.type === "CommentParentheses"
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocal" && val.values.length === 0
        ) {
          // nothing todo
        } else if (
          val.type === "ValueLocalLet" && val.values.length === 0
        ) {
          // nothing todo
        } else if (val.type === "Body") {
          previous = visitNodes(
            inlineValueLocalLetIntoJsOperators,
            val,
            previous,
          );
        } else {
          visitNodes(inlineValueLocalLetIntoJsOperators, val);
          previous = val;
        }
      }
      return previous;
    }

    do {
      modified = false;

      visitNodes(fixIncompleteDoLoops, code_tree);
      visitNodes(rewriteStackPop, code_tree);
      //visitNodes(inlineValueLocal, code_tree)
      //visitNodes(inlineValueLocalLet, code_tree);
      visitNodes(rewriteJSCode, code_tree);
      visitNodes(inlineValueLocalLetIntoJsOperators, code_tree);
      visitNodes(removeEmptyCodeTreeEntries, code_tree);
    } while (modified);

    return code_tree;
  }

  compile(
    code: string,
    filename?: string,
    splitOnTopLevelAwait = true,
  ): CompileResult {
    const res: CompileResult = { code };
    try {
      res.tokens = this.tokenize(res.code, filename);
      res.code_tree = this.createFromForthTokens(res.tokens);
      res.optimized_code_tree = this.optimizeCodeTree(res.code_tree);
      res.generated_code = this.generateJsCode(
        res.optimized_code_tree,
        splitOnTopLevelAwait,
      );
    } catch (err) {
      if (err instanceof Error) {
        if (err.stack) {
          err.stack = demangle(err.stack);
        }
        (err as any).res = res;
      }
      throw err;
    }
    return res;
  }

  compileFile(filename: string) {
    const { fullfilename, content } = this.options.loadFile(
      filename,
      this.options.includeDirectories,
    );
    return this.compile(content, fullfilename);
  }

  async eval(code: string, filename?: string) {
    const compileResult = this.compile(code, filename);
    for (const g of compileResult.generated_code!) {
      const result = await vm.runInThisContext(g.code);
      if (!g.dropResult) {
        // @ts-expect-error It's only available at runtime
        globalThis.stack.push(result);
      }
    }
  }

  evalFile(filename: string): Promise<void> {
    const { fullfilename, content } = this.options.loadFile(
      filename,
      this.options.includeDirectories,
    );
    return this.eval(content, fullfilename);
  }
}
