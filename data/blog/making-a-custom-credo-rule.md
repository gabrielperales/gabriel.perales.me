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

Credo is a static code analysis tool for Elixir. It's a powerful tool that can help you catch bugs and improve your code quality.

In this post, **we'll create a custom Credo rule** to enforce pattern matching by struct instead of using maps with atom keys. This is a common practice in Elixir and a good way to ensure that your code is more readable and maintainable.

In our company's codebase, we have many functions that receive a map as an argument and pattern match on it. While this isn't inherently problematic, when we know the map will always be a struct, we can make the code more readable and type-safe by pattern matching using the struct name.

This is an example of what we'd like to catch:

```elixir
# ❌ Not preferred
def get_role(%{role: role}) do
  role
end

# ✅ Preferred
def get_role(%User{role: role}) do
  role
end

# ✅ Also preferred
def get_role(%User{} = user) do
  user.role
end
```

**Disclaimer:** This Credo check could be controversial, as there are cases where we legitimately have maps with atom keys that aren't structs, such as in configuration maps or LiveView assigns. We've decided to give it a try and are disabling this rule in LiveView components and some other specific cases. This post focuses more on the process of creating a custom rule than on the rule itself.

## Start a new example project

```bash
mix new custom_credo_check
```

## Creating the Rule

First, ensure that you have Credo installed in your project. If you don't, add it to your project by adding the following to your `mix.exs` file:

```elixir
defp deps do
  [
    {:credo, "~> 1.7"}
  ]
end
```

and then run `mix deps.get` to install the dependency.

Next, use the Credo generator to create a new rule:

```bash
mix credo.gen.check lib/credo/check/readability/prefer_struct_matching.ex
```

This will create a new file in `lib/credo/check/readability/prefer_struct_matching.ex` with some starter content that we'll use as a foundation for our custom rule.

## Creating a test to check if the rule works

We'll create a test to check if the rule works. We'll create a new file in `test/credo/check/readability/prefer_struct_matching_test.ex` and add the following content:

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
  end
end
```

If we run `mix test`, we'll see that the test is failing. This is good, we haven't implemented the rule yet.

## Implementing the Rule

Our rule will be straightforward. It will check if a function is pattern matching a parameter using a map with atom keys. If so, we'll flag it as an issue.

To implement this rule, we need to:

1. **Get the function parameters**
2. **Check if any parameters are pattern matching a map with atom keys**
3. **Create an issue when we find such a pattern**

By examining the generated file, we see that we need to implement the `run/2` function, which receives the **source file** and any parameters specified in the `.credo.exs` configuration.

We'll use the `Credo.Code.prewalk/2` function to traverse the **Abstract Syntax Tree (AST)** of the source file, looking for function definitions:

```elixir
def run(%SourceFile{} = source_file, params) do
  issue_meta = IssueMeta.for(source_file, params)

  Credo.Code.prewalk(source_file, &traverse(&1, &2, issue_meta))
end
```

The `traverse/3` function will examine each node in the AST, identifying function definitions and checking their parameters. This function will return a tuple containing the AST and any issues found. Let's implement it adding some debug prints to see what's happening:

```elixir
defp traverse({:def, _meta, [{_fn_name, _meta, fn_args}, fn_body]} = ast, issues, issue_meta) do
  IO.puts("Found a function definition: #{inspect(ast)}")
  IO.puts("Function args: #{inspect(fn_args)}")
  IO.puts("Function body: #{inspect(fn_body)}")

  {ast, issues}
end

defp traverse(ast, issues, _issue_meta), do: {ast, issues}
```

With just a few lines, we already have access to the function parameters and body. Now we need a function to check if any parameters are pattern matching by a map with atom keys.

The AST pattern we're looking for is something like `{:%{}, _meta, map_fields}`, where any of the `map_fields` is an atom. Let's create a helper function for this check:

```elixir
defp check_arg_pattern({:%{}, _, fields} = _arg, meta, issue_meta) do
  if Enum.any?(fields, fn {key, _value} -> is_atom(key) end) do
    [issue_for(issue_meta, meta[:line], "direct map pattern with atom keys")]
  else
    []
  end
end

defp check_arg_pattern(_, _, _), do: []
```

Finally, we can update our `traverse/3` function to use this helper:

```elixir
defp traverse({:def, meta, [{_fn_name, _meta, fn_args}, _fn_body]} = ast, issues, issue_meta) do
  new_issues =
    fn_args
    |> Enum.flat_map(fn arg -> check_arg_pattern(arg, meta, issue_meta) end)

  {ast, issues ++ new_issues}
end

defp traverse(ast, issues, _issue_meta), do: {ast, issues}
```

With this implementation, our Credo rule will identify functions that pattern match on maps with atom keys, encouraging developers to use structs instead when appropriate.

If we run `mix test`, we'll see that the test is passing.

We can update our file `test/credo/check/readability/prefer_struct_matching_test.ex` to add a test to check if the rule works when a parameter is pattern matched with an struct:

```elixir
  test "it should not report an issue when pattern matching by a struct with atom keys" do
    """
      def get_role(%User{role: role}) do
        role
      end
    """
    |> to_source_file()
    |> run_check(PreferStructMatching)
    |> refute_issues()
  end
```

If we run `mix test`, we'll see that the test is passing. Now we can add more tests to check if the rule works in different scenarios.

There are still some edge cases that we need to handle, such as when the map is pattern matched with an assignment, or when the function has guards, but we want to keep this post focused on the process of creating a custom rule and keep the code simple.

You can find the complete code of this post in [this GitHub repository](https://github.com/gabrielperales/custom_credo_rule).
