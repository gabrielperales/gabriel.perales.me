---
title: Import, Alias, Require, and Use in Elixir
date: '2025-04-14'
tags: ['elixir', 'import', 'alias', 'require', 'use', 'modules']
draft: false
summary: A guide to the difference between import, alias, require, and use in Elixir
images: ['/static/images/blog/import-alias-require-and-use.png']
type: 'Blog'
---

![Import, Alias, Require, and Use in Elixir](/static/images/blog/import-alias-require-and-use.png)

## Introduction

When we start learning Elixir, we quickly encounter different ways of working with modules: `alias`, `import`, `require`, and `use`. At first, they might seem similar or interchangeable, but each has a specific purpose, and understanding their differences is fundamental to writing clean and efficient Elixir code.

Modules are the basic unit of organization in Elixir. All the code we write is grouped into modules, and the way we connect and use them determines the readability and maintainability of our applications. However, many developers (even experienced ones) often confuse when to use each directive or end up using them redundantly or incorrectly.
In this article, we'll demystify these four fundamental directives:

- **alias**: Tired of writing long module names? I'll show you how to create shortcuts.
- **import**: You'll learn how to bring functions into your current context for more concise code.
- **require**: You'll discover why it's necessary for working with macros.
- **use**: We'll explore this powerful directive that extends the functionality of your modules.

For each directive, I'll explain its purpose, syntax, and ideal use cases with practical examples. By the end of this post, you'll clearly understand not only how to use each one correctly but also when to choose one over another to build more elegant and maintainable code.
Ready to master one of the most fundamental but often misunderstood parts of Elixir? Let's get started.

## Modules as fundamental building blocks

In Elixir, modules serve as containers for related functions, macros, and even other modules. They provide namespacing, which helps organize code and avoid name collisions. Every Elixir file typically defines at least one module, and the convention is to name files after their primary module.

```elixir
defmodule MyApp.StringUtils do
  def snake_case(string) do
    string
    |> String.downcase()
    |> String.replace(~r/\s+/, "_")
    |> String.replace(~r/[^\w_]/, "")
  end
end
```

When working with modules from other parts of your application or external libraries, you need to reference them by their full name, which can become verbose:

```elixir
MyApp.StringUtils.snake_case("Hello World!")
```

This is where our four directives come in—they provide different ways to work with external modules more efficiently. Let's explore each one in detail.

## Aliases

The `alias` directive creates a shortcut for a module name, making your code more concise and readable. It's especially useful for modules with long, nested namespaces.

### Basic syntax

```elixir
defmodule MyApp.Controller do
  alias MyApp.Repo.User

  def get_user(id) do
    # Now we can use User instead of MyApp.Repo.User
    User.get(id)
  end
end
```

### Aliasing multiple modules from the same namespace

```elixir
defmodule MyApp.Controller do
  # This aliases MyApp.Repo.User to User and MyApp.Repo.Post to Post
  alias MyApp.Repo.{User, Post}

  def get_recent_user_posts(user_id) do
    user = User.get(user_id)
    posts = Post.by_user(user_id)
    {user, posts}
  end
end
```

### Custom aliases

You can also specify a custom alias name using the `as` option:

```elixir
defmodule MyApp.Controller do
  alias Calendar.DateTime, as: DT

  def current_time do
    DT.now!("UTC")
  end
end
```

### When to use aliases

- When you need to reference a module multiple times in your code
- To avoid long, verbose module names
- When working with modules that have similar names but from different namespaces

### What aliases don't do

Aliases don't import functions or macros into your module. They simply provide a shorter name for the module itself.

## Imports

While `alias` gives you a shortcut for the module name, **`import` brings the functions or macros from a module directly into your current scope**, allowing you to call them without the module prefix.

### Basic syntax

```elixir
defmodule MyApp.StringUtils do
  import String, only: [upcase: 1, downcase: 1]

  def format(text, style) do
    case style do
      :upper -> upcase(text)  # Instead of String.upcase(text)
      :lower -> downcase(text)  # Instead of String.downcase(text)
    end
  end
end
```

### Importing everything

You can import all functions and macros from a module, but this is generally discouraged as **it can lead to name conflicts**:

```elixir
import Enum  # Imports all functions from Enum
```

### Selective importing

It's better to be selective about what you import:

```elixir
# Import only the map function that takes 2 arguments
import Enum, only: [map: 2]

# Or import everything except certain functions
import String, except: [split: 2]
```

### When to use imports

- When you use several functions from the same module repeatedly
- For DSL-like modules where importing makes the code more readable (like ExUnit.Case)
- In specific contexts where the imported functions make sense semantically

### What imports don't do

Imports don't create shortcuts for the module itself. If you still need to reference the module name, you'll need to use its full name or create an alias.

## Requires

The `require` directive is specifically for working with macros. It ensures that the specified module is compiled and available before your code tries to use any macros from it.

### Basic syntax

```elixir
defmodule MyApp.Logger do
  require Logger

  def log_error(message) do
    # Logger.error is a macro, not a function
    Logger.error(message)
  end
end
```

Without the `require` directive, trying to use a macro would result in a compilation error.

### Why macros need requiring

Macros in Elixir are code that generates code at compile time. When you use a macro, the code it generates needs to be integrated into your module during compilation. The `require` directive ensures this process happens correctly.

### Common modules that need requiring

- `Logger` - for logging macros
- `ExUnit.Case` - for testing macros
- Custom modules that define macros you want to use

### When to use require

- Whenever you need to use macros from another module
- When working with modules like Logger, ExUnit.Case, or other macro-heavy libraries

### What require doesn't do

Requiring a module doesn't create shortcuts or import its functions—it only makes the module's macros available for use in your code.

## Uses

The `use` directive is the most powerful and complex of the four. It allows a module to inject any code into the current module, which can include functions, macros, aliases, imports, and more.

### Basic syntax

```elixir
defmodule MyApp.Controller do
  use Phoenix.Controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
```

### What happens behind the scenes

When you `use` a module, Elixir first `require`s the module and then calls the `__using__/1` macro in that module, passing any provided options. The macro returns quoted code that gets injected into your module:

```elixir
defmodule MyBehavior do
  defmacro __using__(opts) do
    quote do
      # This code gets injected into any module that uses MyBehavior
      import MyBehavior.Helpers
      alias MyBehavior.State

      def initialize do
        IO.puts "Module initialized with options: #{inspect unquote(opts)}"
      end
    end
  end
end

defmodule MyModule do
  use MyBehavior, option: :value
  # All the code from the __using__ macro is now injected here
end
```

### Common examples of use

- `use Phoenix.Controller` - adds rendering capabilities and other controller-specific functionality
- `use GenServer` - implements the GenServer behavior and callbacks
- `use Ecto.Schema` - provides schema DSL for database models

### When to use use

- When working with frameworks that provide behaviors via this mechanism
- When you want to adopt a specific behavior or functionality set
- When creating reusable module templates or behaviors for your own application

For developers coming from object-oriented programming backgrounds, the `use` directive can be thought of as somewhat similar to inheritance. While Elixir doesn't have traditional class inheritance, `use` allows modules to "inherit" functions, macros, and behaviors from other modules by injecting code, providing a way to share and reuse functionality across modules.

### What use doesn't do

The `use` directive doesn't automatically create aliases or imports beyond what's explicitly defined in the `__using__` macro of the target module.

## Putting it all together

Let's see how these directives work together in a real-world example:

```elixir
defmodule MyApp.UserController do
  use Phoenix.Controller

  alias MyApp.Repo
  alias MyApp.{User, Account}

  import Plug.Conn

  require Logger

  def show(%Plug.Conn{} = conn, %{"id" => id}) do
    Logger.info("Showing user #{id}")

    user = Repo.get(User, id)
    account = Repo.get_by(Account, user_id: id)

    conn
    |> put_resp_header("x-user-id", id)
    |> render("show.html", user: user, account: account)
  end
end
```

In this example:

- `use Phoenix.Controller` adds controller behavior and functionality (`render/2`)
- `alias` creates shortcuts for the repository and schema modules (`Repo`, `User`, `Account`)
- `import` brings Plug.Conn functions directly into scope (`put_resp_header/2`)
- `require` enables the Logger macros (`Logger.info/2`)

## Best practices

1. **Use alias for clarity**: Prefer aliases for most module references to keep code concise.
2. **Be selective with imports**: Only import the specific functions you need to avoid namespace pollution.
3. **Remember to require for macros**: Always require modules whose macros you intend to use.
4. **Understand what use does**: Before using a module, understand what code it injects into your module.
5. **Group your directives**: Keep your module directives organized at the top of your file in a logical order.
6. **Explicit is better than implicit**: When in doubt, be more explicit about where a function comes from.

## Conclusion

Understanding the differences between `alias`, `import`, `require`, and `use` is essential for writing clean, maintainable Elixir code:

- **alias**: Creates a shortcut for module names
- **import**: Brings functions and macros into your current scope
- **require**: Makes macros available for use
- **use**: Injects code from another module into your module

Each directive has its place in your Elixir toolbox, and knowing when to use each one will help you write more elegant, readable code while avoiding common pitfalls like namespace pollution or unclear dependencies.

Next time you reach for one of these directives, take a moment to consider which one truly serves your needs best—your future self (and your team) will thank you for it.

## Further Reading

- [Elixir Documentation](https://hexdocs.pm/elixir/alias-require-and-import.html)
- [Elixir School - Modules](https://elixirschool.com/en/lessons/basics/modules)
