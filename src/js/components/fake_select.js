import '../../css/fake_select.css';

/**
* Create a 'select-like' element (allowing to use normal DOM elements)
* in the 'option' values.
*
* @param {String} selector - The CSS selector for the parent element on which adding this fake select.
* @param {Object} options - The option for this element creation.
*
*/
export default function makeFakeSelectElement(parent, options) {
  const prepareElem = (htmlElem, properties) => {
    htmlElem.setAttribute('value', properties.value);
    htmlElem.innerHTML = properties.label; // eslint-disable-line no-param-reassign
    if (properties.tags) {
      properties.tags.forEach((tag) => {
        htmlElem.innerHTML += ` <span class="badge badge-info">${tag}</span>`; // eslint-disable-line no-param-reassign
      });
    }
    if (properties.comment) {
      htmlElem.setAttribute('title', properties.comment);
    }
  };

  // Is the list of entries empty ?
  const is_empty = options.length === 0;

  // The structure of the 'fake select' element
  const container = document.createElement('div');
  container.className = 'fake-select';
  const head_elem = document.createElement('div');
  head_elem.className = 'head';
  const content_elem = document.createElement('span');
  content_elem.className = 'content';
  const list_elem = document.createElement('div');
  list_elem.className = 'list';
  const caretdown_elem = document.createElement('i');
  caretdown_elem.className = 'fa fa-caret-down';

  head_elem.appendChild(content_elem);
  head_elem.appendChild(caretdown_elem);
  container.appendChild(head_elem);
  container.appendChild(list_elem);

  // Prepare the first element (to be added in the head of the fake select)
  if (!is_empty) {
    prepareElem(content_elem, options[0]);
  }

  // Add all the entry ('option' in the vocabulary of 'select' HTML element)
  options
    .forEach((props) => {
      const p_elem = document.createElement('p');
      prepareElem(p_elem, props);
      p_elem.addEventListener('click', () => {
        list_elem.classList.remove('active');
        content_elem.innerHTML = p_elem.innerHTML;
        content_elem.setAttribute('value', p_elem.getAttribute('value'));
        content_elem.querySelectorAll('input')
          .forEach((el) => { el.disabled = false; }); // eslint-disable-line no-param-reassign
      });
      list_elem.appendChild(p_elem);
    });

  // The logic for opening the fake 'select' and displaying the fake 'options'
  caretdown_elem.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (list_elem.classList.contains('active')) {
      list_elem.classList.remove('active');
    } else {
      list_elem.classList.add('active');
    }
  });
  document.querySelector(parent).appendChild(container);
}
