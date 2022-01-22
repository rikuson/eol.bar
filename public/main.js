window.onload = () => {
  const [terminalElm] = document.getElementsByClassName('terminal');
  setTimeout(() => {
    const [innerElm] = document.getElementsByClassName('typing');
    innerElm.className = '';
    const [response] = document.getElementsByClassName('hidden');
    response.className = '';
  }, 4500);

  const tabs = document.querySelectorAll('.tab-item');
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach((t) => t.classList.remove('active'));
      e.target.classList.add('active');
      const contents = (document.querySelector('.tab-content')).childNodes;
      contents.forEach((c) => c.classList.remove('active'));
      const id = e.target.getAttribute('href');
      const content = document.querySelector(id);
      content.classList.add('active');
    });
  });

  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  fromInput.addEventListener('change', onChangeFromInput);
  toInput.addEventListener('change', onChangeToInput);

  const htmlTextarea = document.getElementById('html');
  const markdownTextarea = document.getElementById('markdown');
  const curlTextarea = document.getElementById('curl');
  htmlTextarea.addEventListener('focus', onFocusTextarea);
  markdownTextarea.addEventListener('focus', onFocusTextarea);
  curlTextarea.addEventListener('focus', onFocusTextarea);

  const [expressionElm] = document.getElementsByClassName('expression');
  initExpressionElm(expressionElm);
  generateUrls();
};

function initExpressionElm(elm) {
  const [productInput] = elm.getElementsByClassName('product');
  productInput.addEventListener('change', onChangeProduct);

  const [operatorSelect] = elm.getElementsByClassName('operator');
  operatorSelect.addEventListener('change', onChangeOperator);

  const [cycleInput] = elm.getElementsByClassName('cycle');
  const [cycleDataList] = elm.getElementsByTagName('datalist');
  const id = Math.floor(Math.random() * 1000000000);
  cycleInput.setAttribute('list', `cycle-${id}`);
  cycleInput.value = '';
  cycleDataList.setAttribute('id', `cycle-${id}`);
  cycleDataList.innerHTML = cycleOptions(products[0].name);
  cycleInput.addEventListener('change', onChangeCycle);

  const [addBtn] = elm.getElementsByClassName('add');
  addBtn.addEventListener('click', onClickAddBtn);

  const [removeBtn] = elm.getElementsByClassName('remove');
  removeBtn.addEventListener('click', onClickRemoveBtn);
}

function generateUrls() {
  const expressionElms = document.getElementsByClassName('expression');
  const expression = genExpressionFromElements(expressionElms);

  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const fields = [];
  if (fromInput.value) {
    fields.push(`from=${fromInput.value}`);
  }
  if (toInput.value) {
    fields.push(`to=${fromInput.value}`);
  }
  const query = fields.length ? '?' + fields.join('&') : '';

  const htmlTextarea = document.getElementById('html');
  const markdownTextarea = document.getElementById('markdown');
  const curlTextarea = document.getElementById('curl');
  const previewImg = document.getElementById('preview');
  htmlTextarea.value = `<img src="https://eol.bar/${expression}.svg${query}" alt="eol schedule" />`;
  markdownTextarea.value = `![eol schedule](https://eol.bar/${expression}.svg${query})`;
  curlTextarea.value = `curl eol.bar/${expression}${query}`;
  previewImg.src = `/${expression}.svg${query}`;
}

function onClickAddBtn() {
  const expressionElm = this.closest('.expression');
  const clone = expressionElm.cloneNode(true);
  initExpressionElm(clone);
  const [productInput] = clone.getElementsByClassName('product');
  productInput.value = '';
  expressionElm.after(clone);

  const removeBtns = document.querySelectorAll('.remove');
  removeBtns.forEach((btn) => btn.disabled = false);

  generateUrls();
}

function onClickRemoveBtn() {
  const expressionElm = this.closest('.expression');
  expressionElm.remove();

  const removeBtns = document.querySelectorAll('.remove');
  if (removeBtns.length === 1) {
    removeBtns[0].disabled = true;
  }

  generateUrls();
}

function onChangeProduct() {
  const parent = this.parentNode;
  const [productInput] = parent.getElementsByClassName('product');
  const [cycleDataList] = parent.getElementsByTagName('datalist');
  cycleDataList.innerHTML = cycleOptions(productInput.value);
  const [cycleInput] = parent.getElementsByClassName('cycle');
  cycleInput.value = '';

  generateUrls();
}

function onChangeOperator() {
  const cycleInput = this.nextElementSibling;
  if (this.value === '') {
    cycleInput.disabled = true;
    cycleInput.value = '';
  } else {
    cycleInput.disabled = false;
  }

  generateUrls();
}

function onChangeCycle() {
  generateUrls();
}

function onFocusTextarea(e) {
  this.addEventListener('mouseup', (e) => e.preventDefault()); // For Safari
  e.preventDefault();
  this.select();
}

function onChangeFromInput() {
  generateUrls();
}

function onChangeToInput() {
  generateUrls();
}

function cycleOptions(product) {
  const { data } = products.find(({ name }) => product === name);
  return data
    .map(({ cycle }) => `<option value="${cycle}">${cycle}</option>`)
    .join('');
}

function genExpressionFromElements(expressionElms) {
  return Array.from(expressionElms).map((expressionElm) => {
    const [{ value: product }] = expressionElm.getElementsByClassName('product');
    const [{ value: operator }] = expressionElm.getElementsByClassName('operator');
    const [{ value: cycle }] = expressionElm.getElementsByClassName('cycle');
    return product + operator + cycle;
  }).filter((e) => e).join('+');
}
