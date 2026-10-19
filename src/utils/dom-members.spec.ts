import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * In the dist-custom-elements build the component class IS the HTMLElement, so a member named like a DOM member
 * (`id`, `hidden`, `remove`, `children` …) replaces the native one there, while the lazy build hides the problem.
 */
const DOM = `accessKey after animate append appendChild assignedSlot attachInternals attachShadow attributes autocapitalize
autofocus baseURI before blur checkVisibility childElementCount childNodes children classList className click clientHeight
clientLeft clientTop clientWidth cloneNode closest compareDocumentPosition contains contentEditable dataset dir
dispatchEvent draggable enterKeyHint firstChild firstElementChild focus getAnimations getAttribute getAttributeNames
getBoundingClientRect getClientRects getElementsByClassName getElementsByTagName getRootNode hasAttribute hasAttributes
hasChildNodes hasPointerCapture hidden hidePopover id inert innerHTML innerText inputMode insertAdjacentElement
insertAdjacentHTML insertAdjacentText insertBefore isConnected isContentEditable isEqualNode isSameNode lang lastChild
lastElementChild localName matches moveBefore namespaceURI nextElementSibling nextSibling nodeName nodeType nodeValue
nonce normalize offsetHeight offsetLeft offsetParent offsetTop offsetWidth outerHTML outerText ownerDocument
parentElement parentNode part popover prefix prepend previousElementSibling previousSibling querySelector
querySelectorAll releasePointerCapture remove removeAttribute removeChild removeEventListener replaceChild
replaceChildren replaceWith requestFullscreen role scroll scrollBy scrollHeight scrollIntoView scrollLeft scrollTo
scrollTop scrollWidth setAttribute setPointerCapture shadowRoot showPopover slot spellcheck style tabIndex tagName
textContent title toggleAttribute togglePopover translate`.split(/\s+/);

/** Class members: fields, getters, methods (incl. decorated props and states), one per line at class indentation. */
function members(source: string): string[] {
  const re = /^ {2}(?:@\w+\([^)]*\)\s*)*(?:(?:private|protected|public|readonly|static|async|get|set)\s+)*([A-Za-z_$][\w$]*)\s*[(:=!?<;]/gm;
  return [...source.matchAll(re)].map((m) => m[1]);
}

describe('component members', () => {
  const dir = join(__dirname, '..', 'components');
  for (const name of readdirSync(dir)) {
    const file = join(dir, name, `${name}.tsx`);
    let source: string;
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    it(`${name} has no member named like a DOM member`, () => {
      expect(members(source).filter((m) => DOM.includes(m))).toEqual([]);
    });
  }
});
