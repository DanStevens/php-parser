/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */
"use strict";

const ArrayExpr = "array";
const ArrayEntry = "entry";

module.exports = {
  /**
   * Parse an array
   * ```ebnf
   * array ::= T_ARRAY '(' array_pair_list ')' |
   *   '[' array_pair_list ']'
   * ```
   */
  read_array: function() {
    let expect = null;
    let shortForm = false;
    const result = this.node(ArrayExpr);

    if (this.token === this.tok.T_ARRAY) {
      this.next().expect("(");
      expect = ")";
    } else {
      shortForm = true;
      expect = "]";
    }
    let items = [];
    if (this.next().token !== expect) {
      items = this.read_array_pair_list(shortForm);
    }
    this.expect(expect);
    this.next();
    return result(shortForm, items);
  },
  /**
   * Reads an array of items
   * ```ebnf
   * array_pair_list ::= array_pair (',' array_pair?)*
   * ```
   */
  read_array_pair_list: function(shortForm) {
    const self = this;
    return this.read_list(
      function() {
        return self.read_array_pair(shortForm);
      },
      ",",
      true
    );
  },
  /**
   * Reads an entry
   * array_pair:
   *  expr T_DOUBLE_ARROW expr
   *  | expr
   *  | expr T_DOUBLE_ARROW '&' variable
   *  | '&' variable
   *  | expr T_DOUBLE_ARROW T_LIST '(' array_pair_list ')'
   *  | T_LIST '(' array_pair_list ')'
   */
  read_array_pair: function(shortForm) {
    if (
      this.token === "," ||
      (!shortForm && this.token === ")") ||
      (shortForm && this.token === "]")
    ) {
      return this.node("noop")();
    }
    if (this.token === "&") {
      return this.node("byref")(this.next().read_variable(true, false));
    } else {
      const entry = this.node(ArrayEntry);
      const expr = this.read_expr();
      if (this.token === this.tok.T_DOUBLE_ARROW) {
        if (this.next().token === "&") {
          return entry(
            expr,
            this.node("byref")(this.next().read_variable(true, false))
          );
        } else {
          return entry(expr, this.read_expr());
        }
      } else {
        entry.destroy();
      }
      return expr;
    }
  }
};
