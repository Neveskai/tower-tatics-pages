// Minimal {{VAR}} string-substitution "template engine" — intentionally no
// dependency, matching the zero-framework style of the rest of this site.
export function render(templateString, vars) {
  return templateString.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in vars)) {
      throw new Error(`Missing template variable: ${key}`);
    }
    return vars[key];
  });
}
