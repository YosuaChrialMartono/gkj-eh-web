In HTML, <li> cannot be a descendant of <li>.
This will cause a hydration error.

this is a bug on the breadcrumb item and li component, breadcrumb item is already a li so we shouldnt use another li in conjuction to it

hydration error shows up on places with breadcrumb items, also it looks like they stack vertically instead of horizontally, can you check the correct implementation from the shadcn documentation
