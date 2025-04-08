---
title: Structs vs Embedded Schemas in Elixir
date: '2025-04-08'
tags: ['elixir', 'structs', 'embedded', 'schemas', 'ecto', 'validation']
draft: false
summary: A comprehensive guide to choosing between structs and embedded schemas in Elixir, with practical examples and best practices
images: ['/static/images/blog/structs-vs-embedded-schemas.png']
type: 'Blog'
---

![Structs vs Embedded Schemas in Elixir](/static/images/blog/structs-vs-embedded-schemas.png)

## Introduction

When working with Elixir, one of the most common misconceptions I've encountered is that Ecto is simply a database ORM (Object-Relational Mapping) tool. However, Elixir is not an object-oriented language, and this fundamental difference means we need to approach data modeling differently than in languages like Ruby or Python.

In Elixir, when developers need to group related data together, they often default to using structs, which is indeed the idiomatic way in Elixir. However, in a dynamic language like Elixir where field types aren't enforced at compile time, this can lead to code that's difficult to maintain and prone to runtime errors. This is where validation becomes crucial, and you might find yourself writing a lot of manual validation code.

Enter Ecto's [embedded schemas](https://hexdocs.pm/ecto/embedded-schemas.html) - a powerful feature that provides a structured way to group and validate data without the need for database persistence. Whether you're working with JSON APIs, form submissions, or complex data transformations, embedded schemas offer a robust solution for data validation and manipulation.

In this post, we'll dive deep into both approaches, explore their use cases, and help you make informed decisions about when to use each.

## Understanding Structs in Elixir

Structs in Elixir are lightweight data structures that provide a way to create new types with predefined fields. Think of them as enhanced maps with compile-time guarantees and default values. They're perfect for simple data grouping when you don't need complex validation or database interactions.

### Key Features of Structs

1. **Compile-time Safety**: Fields are guaranteed to exist at compile time, preventing accidental access to undefined fields
2. **Default Values**: Easy initialization with predefined default values
3. **Required Fields**: Use `@enforce_keys` to ensure critical fields are always present
4. **Pattern Matching**: Seamless integration with Elixir's pattern matching capabilities
5. **Lightweight**: No runtime overhead compared to more complex solutions

### Practical Example: User Struct

```elixir
defmodule User do
  @enforce_keys [:name]
  defstruct [:name, age: 0, email: nil]
end

# Creating a user
user = %User{name: "Alice", age: 30, email: "alice@example.com"}

# Pattern matching
case user do
  %User{age: age} when age >= 18 -> :adult
  _ -> :minor
end
```

## Exploring Embedded Schemas

Embedded schemas are part of Ecto's powerful toolkit for data mapping and validation. They're particularly useful when you need to:
- Validate data from external sources (APIs, forms)
- Transform data between different formats
- Ensure data consistency without database persistence
- Work with complex nested data structures

### Key Features of Embedded Schemas

1. **Built-in Validation**: Comprehensive validation rules out of the box
2. **Type Casting**: Automatic conversion between different data types
3. **Schema Composition**: Create complex data structures by composing simpler ones
4. **Ecto Integration**: Seamless work with Ecto's query interface when needed
5. **Flexible Persistence**: Can be used with or without database storage

### Practical Example: User Schema with Validation

```elixir
defmodule User do
  use Ecto.Schema
  import Ecto.Changeset

  @fields [:name, :age, :email]
  @required_fields [:name, :email]

  embedded_schema do
    field :name, :string
    field :age, :integer, default: 0
    field :email, :string
  end

  def new(attrs) do
    %__MODULE__{}
    |> cast(attrs, @fields)
    |> validate_required(@required_fields)
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/)
    |> validate_number(:age, greater_than_or_equal_to: 0)
  end
end

# Usage example
{:ok, user} = User.new(%{
  name: "Alice",
  age: 30,
  email: "alice@example.com"
})
```

## Making the Right Choice

### Choose Structs When:

- You need simple data grouping without validation
- Performance is critical (structs have less overhead)
- You're working with internal data that you control
- You need compile-time guarantees
- You're building simple data transfer objects (DTOs)

### Choose Embedded Schemas When:

- You need robust data validation
- You're working with external data sources
- You need to transform data between formats
- You want to leverage Ecto's powerful features
- You're building complex nested data structures

## Real-world Example: API Integration

Let's see how both approaches work in a real-world scenario - handling API responses:

### Using Structs (Simple Case)

```elixir
defmodule APIResponse do
  defstruct [:status, :data, :message]
end

# Simple parsing
response = %APIResponse{
  status: 200,
  data: %{"user" => %{"name" => "Alice"}},
  message: "Success"
}
```

### Using Embedded Schema (Complex Case)

```elixir
defmodule APIResponse do
  use Ecto.Schema
  import Ecto.Changeset

  embedded_schema do
    field :status, :integer
    field :message, :string
    embeds_one :data, Data do
      embedded_schema do
        embeds_one :user, User do
          embedded_schema do
            field :name, :string
            field :email, :string
          end
        end
      end
    end
  end

  def parse(json) do
    %__MODULE__{}
    |> cast(json, [:status, :message, :data])
    |> validate_required([:status])
    |> validate_number(:status, greater_than_or_equal_to: 100, less_than: 600)
  end
end
```

## Conclusion

While structs and embedded schemas might seem similar at first glance, they serve different purposes in Elixir applications. Structs are perfect for simple, internal data structures where you need compile-time guarantees and minimal overhead. Embedded schemas, on the other hand, provide a robust solution for data validation, transformation, and complex data structures.

The key to making the right choice lies in understanding your specific needs:
- Do you need validation? → Embedded Schema
- Is performance critical? → Struct
- Are you working with external data? → Embedded Schema
- Do you need simple data grouping? → Struct

Remember, Ecto is not just a database ORM - it's a powerful toolkit for data mapping and validation. By choosing the right tool for your specific use case, you can write more maintainable and reliable Elixir code.

## Further Reading

- [Ecto Documentation](https://hexdocs.pm/ecto/Ecto.html)
- [Embedded Schemas Guide](https://hexdocs.pm/ecto/embedded-schemas.html)
- [Elixir Structs Guide](https://elixir-lang.org/getting-started/structs.html)
