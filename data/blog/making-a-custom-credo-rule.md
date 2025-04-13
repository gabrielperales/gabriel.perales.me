---
title: Making a Custom Credo Rule
date: '2025-03-29'
tags: ['elixir', 'credo', 'custom', 'rule']
draft: false
summary: A guide to making a custom Credo rule
images: ['/static/images/blog/making-a-custom-credo-rule.png']
type: 'Blog'
---

![Making a Custom Credo Rule](/static/images/blog/making-a-custom-credo-rule.png)

# Making a Custom Credo Rule

Credo is a powerful static code analysis tool for Elixir that helps developers catch bugs and maintain high code quality standards. While Credo comes with many built-in rules, sometimes you need to create custom rules that align with your team's specific coding practices.

In this tutorial, we'll walk through creating a custom Credo rule that enforces a specific pattern matching style. Our rule will encourage using struct-based pattern matching instead of generic maps with atom keys, promoting more type-safe and readable code.

## The Problem

In many Elixir codebases, you might encounter functions that pattern match on maps using atom keys:

```elixir
# ❌ Current approach: Generic map pattern matching
def get_role(%{role: role}) do
  role
end
```

When we know these maps are actually structs, we can make our code more explicit and type-safe:

```elixir
# ✅ Better approach: Explicit struct pattern matching
def get_role(%User{role: role}) do
  role
end

# ✅ Alternative approach: Using struct assignment
def get_role(%User{} = user) do
  user.role
end
```

**Note:** While this rule might not fit every scenario (like LiveView assigns or configuration maps), it can be valuable for large codebases where explicit struct matching improves code clarity and maintainability. You can always disable the rule in specific contexts where it doesn't make sense.

## Setting Up the Project

Let's create a new project to implement our custom Credo rule:

```bash
mix new custom_credo_check
```

### Adding Credo as a Dependency

First, add Credo to your project's dependencies in `mix.exs`:

```elixir
defp deps do
  [
    {:credo, "~> 1.7"}
  ]
end
```

Run `mix deps.get` to install the dependency.

## Creating the Custom Rule

Credo provides a generator to create new rules. Let's use it to create our struct matching rule:

```bash
mix credo.gen.check lib/credo/check/readability/prefer_struct_matching.ex
```

## Test-Driven Development

Before implementing the rule, let's write some tests. Create a new test file at `test/credo/check/readability/prefer_struct_matching_test.ex`:

```elixir
defmodule Credo.Check.Readability.PreferStructMatchingTest do
  use Credo.Test.Case

  alias Credo.Check.Readability.PreferStructMatching

  describe "PreferStructMatching" do
    test "it should report an issue when pattern matching a parameter using a map with atom keys" do
      """
        def get_role(%{role: role}) do
          role
        end
      """
      |> to_source_file()
      |> run_check(PreferStructMatching)
      |> assert_issue()
    end

    test "it should not report an issue when pattern matching by a struct" do
      """
        def get_role(%User{role: role}) do
          role
        end
      """
      |> to_source_file()
      |> run_check(PreferStructMatching)
      |> refute_issues()
    end
  end
end
```

## Implementing the Rule

Our implementation will traverse the Abstract Syntax Tree (AST) of Elixir code, looking for function definitions that pattern match on maps with atom keys. Here's how we'll build it:

1. First, we'll implement the main entry point:

```elixir
def run(%SourceFile{} = source_file, params) do
  issue_meta = IssueMeta.for(source_file, params)
  Credo.Code.prewalk(source_file, &traverse(&1, &2, issue_meta))
end
```

2. Then, we'll add the traversal logic:

```elixir
defp traverse({:def, meta, [{_fn_name, _meta, fn_args}, _fn_body]} = ast, issues, issue_meta) do
  new_issues =
    fn_args
    |> Enum.flat_map(fn arg -> check_arg_pattern(arg, meta, issue_meta) end)

  {ast, issues ++ new_issues}
end

defp traverse(ast, issues, _issue_meta), do: {ast, issues}
```

3. Finally, we'll implement the pattern matching check:

```elixir
defp check_arg_pattern({:%{}, _, fields} = _arg, meta, issue_meta) do
  if Enum.any?(fields, fn {key, _value} -> is_atom(key) end) do
    [issue_for(issue_meta, meta[:line], "Consider using struct pattern matching instead of map patterns with atom keys")]
  else
    []
  end
end

defp check_arg_pattern(_, _, _), do: []
```

## Future Improvements

While our implementation covers the basic use case, there are several areas where it could be enhanced:

- Handle pattern matching with assignments (e.g., `%{role: role} = user`)
- Support function definitions with guards
- Add configuration options for excluding certain modules or contexts
- Handle nested pattern matching

## Conclusion

Creating custom Credo rules is a powerful way to enforce team-specific coding standards. While this example focused on struct pattern matching, the same principles can be applied to create rules for any coding pattern you want to encourage or discourage in your codebase.

You can find the complete implementation in [this GitHub repository](https://github.com/gabrielperales/custom_credo_rule).
