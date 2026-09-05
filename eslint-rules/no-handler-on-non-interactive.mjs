/**
 * verdict/no-handler-on-non-interactive
 *
 * An interaction handler on an element that is not interactive is a control
 * only a mouse can reach.
 *
 * The failure is invisible to the person writing it, because the person writing
 * it is holding a mouse. A `<div onClick>` looks finished, behaves correctly in
 * every manual check, and is simply absent for anyone driving the interface
 * from the keyboard. In a review console worked at speed all day, keyboard
 * operation is not an accessibility nicety bolted on at the end; it is how the
 * product is actually used, which is why this is enforced at build rather than
 * caught in a review.
 *
 * What passes:
 *   - a native control: button, a[href], input, select, textarea, summary
 *   - a component, `<Button onClick>`: it owns its own host element and is
 *     policed where it is defined, not at every call site
 *   - a host element carrying an interactive or composite role AND a tabIndex,
 *     which is the legitimate pattern for a widget the platform has no tag for
 *     (the queue rail is `ul role="listbox" tabIndex={0} onKeyDown`, and that is
 *     correct: the list owns focus, the rows are `role="option" tabIndex={-1}`)
 *
 * What fails:
 *   - a handler on a bare div, span, li or section
 *   - a role with no way to focus it, which is a control announced to a screen
 *     reader that the keyboard can never land on, arguably worse than the
 *     unlabelled div because it promises something it does not deliver
 *   - onClick with no keyboard path on the same element
 *
 * This deliberately overlaps eslint-plugin-jsx-a11y, which is also on. That
 * plugin reasons about roles in general; this one encodes the specific contract
 * this system claims, so the claim and the check cannot drift apart.
 */

const HANDLERS = new Set([
  "onClick",
  "onDoubleClick",
  "onMouseDown",
  "onMouseUp",
  "onKeyDown",
  "onKeyUp",
  "onKeyPress",
]);

const KEYBOARD_HANDLERS = new Set(["onKeyDown", "onKeyUp", "onKeyPress"]);

/** Elements that are focusable and operable without help. */
const NATIVE_INTERACTIVE = new Set([
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "summary",
  "option",
  "label",
  "audio",
  "video",
  "iframe",
]);

/** Roles that describe something a user operates. */
const INTERACTIVE_ROLES = new Set([
  "button",
  "checkbox",
  "combobox",
  "grid",
  "gridcell",
  "link",
  "listbox",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "radiogroup",
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "tablist",
  "textbox",
  "tree",
  "treegrid",
  "treeitem",
]);

function attrName(attr) {
  return attr.type === "JSXAttribute" && attr.name?.type === "JSXIdentifier"
    ? attr.name.name
    : null;
}

/** Static string value of an attribute, or null when it is dynamic. */
function staticValue(attr) {
  const v = attr.value;
  if (!v) return null;
  if (v.type === "Literal") return typeof v.value === "string" ? v.value : null;
  if (v.type === "JSXExpressionContainer" && v.expression.type === "Literal") {
    return typeof v.expression.value === "string" ? v.expression.value : null;
  }
  return null;
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow interaction handlers on elements the keyboard cannot reach.",
    },
    schema: [],
    messages: {
      nonInteractive:
        "<{{el}}> has {{handler}} but is not an interactive element. Use a <button>, or give it an interactive role and a tabIndex so the keyboard can reach it.",
      notFocusable:
        '<{{el}} role="{{role}}"> has {{handler}} but no tabIndex, so it is announced as a control the keyboard can never focus. Add tabIndex={0}, or tabIndex={-1} if a parent widget manages focus.',
      noKeyboardPath:
        "<{{el}}> handles onClick but has no keyboard handler. A pointer-only control is missing for anyone working this screen from the keyboard.",
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // A component owns its own host element; police it where it is defined.
        if (node.name.type !== "JSXIdentifier") return;
        const el = node.name.name;
        if (!/^[a-z]/.test(el)) return;

        const attrs = node.attributes.filter((a) => a.type === "JSXAttribute");
        const names = new Set(attrs.map(attrName).filter(Boolean));

        const handlers = [...names].filter((n) => HANDLERS.has(n));
        if (handlers.length === 0) return;

        const roleAttr = attrs.find((a) => attrName(a) === "role");
        const role = roleAttr ? staticValue(roleAttr) : null;
        const hasTabIndex = names.has("tabIndex");
        const hasHref = names.has("href");

        const nativelyInteractive =
          NATIVE_INTERACTIVE.has(el) && (el !== "a" || hasHref);

        if (!nativelyInteractive) {
          if (!role) {
            context.report({
              node,
              messageId: "nonInteractive",
              data: { el, handler: handlers[0] },
            });
            return;
          }
          if (!INTERACTIVE_ROLES.has(role)) {
            context.report({
              node,
              messageId: "nonInteractive",
              data: { el, handler: handlers[0] },
            });
            return;
          }
          if (!hasTabIndex) {
            context.report({
              node,
              messageId: "notFocusable",
              data: { el, role, handler: handlers[0] },
            });
            return;
          }
        }

        // A click with no keyboard equivalent, on anything a pointer alone can
        // currently operate.
        if (
          names.has("onClick") &&
          !nativelyInteractive &&
          ![...names].some((n) => KEYBOARD_HANDLERS.has(n))
        ) {
          context.report({ node, messageId: "noKeyboardPath", data: { el } });
        }
      },
    };
  },
};
