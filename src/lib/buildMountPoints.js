/**
 * Turns a name tags into divs
 * @param nameStrings Array of strings
 * @returns unefined
 */

export default nameStrings => {
  for (const name of nameStrings) {
    const tag = document.querySelector(`a[name="${name}"]`);
    if (!tag) continue;

    const el = document.createElement("div");
    el.className = name;

    insertAfter(el, tag);
  }
};

function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}
