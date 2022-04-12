import '../../css/InputAutocomplete.css';

/**
 * Transform an input string to its lowercase counterpart,
 * taking care to replace some accentuated characters by their non-accentuated version.
 *
 * @param {string} string
 * @return {string}
 */
const simplifyInputString = (string) => string
  .toLowerCase()
  .replace('à', 'a')
  .replace('é', 'e')
  .replace('è', 'e');

/**
 *
 * @param {String }parent - The CSS selector for the parent element.
 * @param {Array} listItem - The list of item to be added.
 */
export const makeInputAutocomplete = (parent, listItem, onNewChoice) => {
  const items = JSON.parse(JSON.stringify(listItem));
  const containerElem = document.createElement('div');
  containerElem.classList.add('autocomplete-input-container');
  containerElem.innerHTML = `
    <input type="text" class="searchTwo" placeholder="Choix d'une relation de localisation"/>
    <input type="text" class="autocomplete" disabled="disabled" />
    <div class="container-suggestion">
      <ul class="list-suggestion">
      </ul>
    </div>
  `;

  //
  const _onNewChoice = typeof onNewChoice === 'function'
    ? onNewChoice
    : () => {};

  // Prepare the representation of each item with its badges
  items.forEach((el) => {
    const badges = el.tags
      .map((tag) => `<span class="badge badge-info">${tag}</span>`)
      .join(' ');
    el.formatted = `${el.label} ${badges}`; // eslint-disable-line no-param-reassign
  });

  // Names to search, in lowercase
  const namesToSearch = items
    .map((elem) => simplifyInputString(elem.label));

  // Tags to search, in lowercase
  const tagsToSearch = items
    .map((elem) => simplifyInputString(elem.tags.join(' ')));

  // Get reference to the HTML elements we are gonna use frequently...
  const suggestionList = containerElem.querySelector('.list-suggestion');
  const searchInput = containerElem.querySelector('.searchTwo');
  const autocompleteInput = containerElem.querySelector('.autocomplete');

  // Some helpers function
  const cleanSuggestionList = () => {
    suggestionList.innerHTML = '';
  };

  searchInput.addEventListener('keydown', function inputautocompletekeydown(ev) {
    if (ev && ev.key === 'Tab' && suggestionList.childElementCount > 0) {
      ev.stopPropagation();
      ev.preventDefault();
      const newEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
      });
      searchInput.dispatchEvent(newEvent);
    }
  });

  // The logic for when a keyup happens on this element:
  searchInput.addEventListener('keyup', function inputautocompletekeyup(ev) {
    cleanSuggestionList();
    const value = this.value;
    if (!value || value === '') {
      searchInput.setAttribute('uri', null);
      autocompleteInput.value = '';
      _onNewChoice.bind(this)(ev);
      return;
    }
    const new_value = simplifyInputString(value);
    autocompleteInput.value = '';
    let hasFoundTheDesiredOne = false;
    for (let i = 0; i < namesToSearch.length; i++) {
      if (namesToSearch[i].lastIndexOf(new_value, 0) === 0) {
        if (ev && (ev.key === 'Tab' || ev.key === 'Enter')) {
          // const t = value + namesToSearch[i].substr(new_value.length, namesToSearch[i].length);
          const item = items[i];
          searchInput.setAttribute('uri', item.uri);
          searchInput.value = item.label;
          autocompleteInput.value = item.label;
          suggestionList.innerHTML = '';
          hasFoundTheDesiredOne = true;
          _onNewChoice.bind(this)(ev);
        } else {
          const str_after = namesToSearch[i].substr(new_value.length, namesToSearch[i].length);
          const new_str = value + str_after;
          autocompleteInput.value = new_str;
        }
      }
    }
    if (!hasFoundTheDesiredOne) {
      const values = new_value.split(' ');
      let hitsTags = [];
      let hitsNames = [];
      const displayed = new Set();
      // Test all the tags...
      for (let i = 0; i < tagsToSearch.length; i++) {
        for (let j = 0; j < values.length; j++) {
          if (tagsToSearch[i].indexOf(values[j]) > -1) {
            hitsTags.push(true);
          } else {
            hitsTags.push(false);
          }
        }
        if (hitsTags.every((el) => el === true)) {
          const targetElem = items[i];
          if (!(displayed.has(targetElem.uri))) {
            const el = document.createElement('li');
            el.innerHTML = targetElem.formatted;
            suggestionList.appendChild(el);
            el.addEventListener('click', (ev) => {
              searchInput.setAttribute('uri', targetElem.uri);
              searchInput.value = targetElem.label;
              autocompleteInput.value = targetElem.label;
              suggestionList.innerHTML = '';
              _onNewChoice.bind(this)(ev);
            });
            displayed.add(targetElem.uri);
          }
        }
        hitsTags = [];
      }
      // Test all the words from the label
      for (let i = 0; i < namesToSearch.length; i++) {
        for (let j = 0; j < values.length; j++) {
          if (namesToSearch[i].indexOf(values[j]) > -1) {
            hitsNames.push(true);
          } else {
            hitsNames.push(false);
          }
        }
        if (hitsNames.every((el) => el === true)) {
          const targetElem = items[i];
          if (!displayed.has(targetElem.uri)) {
            const el = document.createElement('li');
            el.innerHTML = targetElem.formatted;
            el.addEventListener('click', (ev) => {
              searchInput.setAttribute('uri', targetElem.uri);
              searchInput.value = targetElem.label;
              autocompleteInput.value = targetElem.label;
              suggestionList.innerHTML = '';
              _onNewChoice.bind(this)(ev);
            });
            suggestionList.appendChild(el);
            displayed.add(targetElem.uri);
          }
        }
        hitsNames = [];
      }
    }
  });

  // Add it to the parent element
  const parentElem = document.querySelector(parent);
  parentElem.appendChild(containerElem);
  return containerElem;
};
