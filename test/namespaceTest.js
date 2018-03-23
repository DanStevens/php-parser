var parser = require("../src/index");

describe("Test namespace statements", function() {
  var singleNs = parser.parseEval(
    [
      "namespace foo;",
      "  use bar\\baz as barBaz;",
      "  use const bar\\baz as barBaz, baz\\boo as bazBoo;",
      "  use function bar\\baz as barBaz, baz\\boo as bazBoo;",
      "  use bar\\baz {",
      "     const FOO as BAZ_FOO,",
      "     function BOO as BAZ_BOO",
      "  };",
      "  use const azerty {",
      "     A as AZERTY_A,",
      "     B as AZERTY_B",
      "  };",
      // relative namespace
      "  $a = namespace\\barBaz;",
      // fully qualified
      "  $b = \\barBaz;",
      // qualified
      "  $c = barBaz\\foo;",
      // unqualified
      "  $d = barBaz;"
    ].join("\n"),
    {
      parser: { debug: false }
    }
  );

  var multiNs = parser.parseEval(
    ["namespace \\foo {", "  $i++;", "}", "namespace {", "  $b++;", "}"].join(
      "\n"
    ),
    {
      parser: { debug: false }
    }
  );

  var nsKeyword = parser.parseEval(
    ["namespace\\foo();", "$var = namespace\\bar;"].join("\n"),
    {
      parser: { debug: false }
    }
  );

  var nsError = parser.parseEval(["namespace $var = true;"].join("\n"), {
    parser: { debug: false, suppressErrors: true }
  });

  it("check namespace", function() {
    // @todo
  });

  it("check use", function() {
    // @todo
  });

  it("check resolution", function() {
    // @todo
  });

  it("check silent mode", function() {
    nsError.errors.length.should.be.exactly(2);
    nsError.errors[0].line.should.be.exactly(1);
    nsError.errors[1].line.should.be.exactly(1);
    nsError.children[0].kind.should.be.exactly("namespace");
    nsError.children[0].name.name.should.be.exactly("");
    nsError.children[0].children[0].kind.should.be.exactly("assign");
    nsError.children[0].children[0].left.kind.should.be.exactly("variable");
    nsError.children[0].children[0].right.kind.should.be.exactly("boolean");
  });

  it("check namespace keyword", function() {
    nsKeyword.children[0].kind.should.be.exactly("call");
    nsKeyword.children[0].what.kind.should.be.exactly("identifier");
    nsKeyword.children[0].what.resolution.should.be.exactly("rn");
    nsKeyword.children[0].what.name.should.be.exactly("foo");
    // @todo : test second child
  });

  it("should work with declare statement", function() {
    var ast = parser.parseEval(
      ["declare(strict_types=1);", "namespace foo;", "class bar {}"].join("\n"),
      {
        parser: {
          debug: false
        }
      }
    );
    // @todo : make assertions
  });

  it.only("should read usegroup location correctly", function() {
    const testCase = [
      "namespace Test\\test\\test;",
      "",
      "use Some\\other\\test;",
      "",
      "/**",
      " * @property \\Test\\test $test",
      " */",
      "class Foo extends Bar implements Baz, Buzz {",
      "  public $test;",
      "",
      "  function test() {",
      "    return true;",
      "  }",
      "",
      "  public function &passByReferenceTest() {",
      "    $a = 1;",
      "    return $a;",
      "  }",
      "}"
    ].join("\n");
    const ast = parser.parseEval(testCase, { ast: { withPositions: true } });
    const astWithDocs = parser.parseEval(testCase, {
      ast: { withPositions: true },
      parser: { extractDoc: true }
    });
    ast.children[0].children[0].loc.end.line.should.be.exactly(3);
    astWithDocs.children[0].children[0].loc.end.line.should.be.exactly(3);
  });
});
