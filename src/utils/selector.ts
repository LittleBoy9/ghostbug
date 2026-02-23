export function generateSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const testId = element.getAttribute('data-testid');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }

  const parts: string[] = [];
  let current: Element | null = element;
  let depth = 0;

  while (current && current !== document.documentElement && depth < 5) {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      parts.unshift(`#${current.id}`);
      break;
    }

    const classes = Array.from(current.classList).slice(0, 2);
    if (classes.length > 0) {
      part += '.' + classes.join('.');
    }

    const parentEl: Element | null = current.parentElement;
    if (parentEl) {
      const currentTag = current.tagName;
      const siblings = Array.from(parentEl.children).filter(
        (child: Element) => child.tagName === currentTag
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        part += `:nth-child(${index})`;
      }
    }

    parts.unshift(part);
    current = parentEl;
    depth++;
  }

  return parts.join(' > ');
}
