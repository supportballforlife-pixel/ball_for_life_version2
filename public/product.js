// Reusable product page for Ball For Life graphic tees.
(function () {
  const SWATCHES = {
    black: '#111111',
    'water-blue': '#a8eef0',
    apricot: '#d8c9ba',
    'light-gray': '#c9c9c9',
    'bean-green': '#7c9b80',
    'light-purple': '#a796d8',
    orange: '#df7443',
    'rose-red': '#c94f7c',
    'wine-red': '#7b3847',
    'blue-jeans': '#6f91a6',
    'light-brown': '#b68a55',
    'light-blue': '#8fb9ca',
    'dark-blue': '#263f68',
    'purple-haze': '#655ca5',
    'dark-green': '#0f755b',
    'gray-green': '#77755e',
    'pirate-gray': '#4a5254',
    'pirate-grey': '#4a5254',
    'royal-blue': '#27375e',
    'khaki-ash': '#b9ab98',
    'grass-green': '#2ead68',
    'light-pink': '#e7a1a1',
    red: '#c91f3f',
    yellow: '#ded942',
    'lake-blue': '#1f9ec5',
  };

  const LABELS = {
    black: 'Black',
    'water-blue': 'Water Blue',
    apricot: 'Apricot',
    'light-gray': 'Light Gray',
    'bean-green': 'Bean Green',
    'light-purple': 'Light Purple',
    orange: 'Orange',
    'rose-red': 'Rose Red',
    'wine-red': 'Wine Red',
    'blue-jeans': 'Blue Jeans',
    'light-brown': 'Light Brown',
    'light-blue': 'Light Blue',
    'dark-blue': 'Dark Blue',
    'purple-haze': 'Purple Haze',
    'dark-green': 'Dark Green',
    'gray-green': 'Gray Green',
    'pirate-gray': 'Pirate Gray',
    'pirate-grey': 'Pirate Grey',
    'royal-blue': 'Royal Blue',
    'khaki-ash': 'Khaki Ash',
    'grass-green': 'Grass Green',
    'light-pink': 'Light Pink',
    red: 'Red',
    yellow: 'Yellow',
    'lake-blue': 'Lake Blue',
  };

  const fullColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green', 'light-purple',
    'orange', 'rose-red', 'wine-red', 'blue-jeans', 'light-brown', 'light-blue',
    'dark-blue', 'purple-haze', 'dark-green', 'gray-green', 'pirate-gray',
    'royal-blue', 'khaki-ash', 'grass-green', 'light-pink', 'red', 'yellow',
    'lake-blue'
  ];

  const lebronColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green', 'light-purple',
    'rose-red', 'light-blue', 'light-brown', 'blue-jeans', 'dark-blue',
    'purple-haze', 'dark-green', 'gray-green', 'pirate-gray', 'royal-blue',
    'khaki-ash', 'grass-green', 'light-pink', 'lake-blue'
  ];

  const lameloColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green', 'light-purple',
    'rose-red', 'light-blue', 'light-brown', 'blue-jeans', 'dark-blue',
    'purple-haze', 'gray-green', 'pirate-gray', 'royal-blue', 'khaki-ash',
    'light-pink'
  ];

  const expandedMockupColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green', 'light-purple',
    'orange', 'rose-red', 'wine-red', 'blue-jeans', 'grass-green', 'khaki-ash',
    'dark-blue', 'pirate-gray', 'gray-green', 'dark-green', 'purple-haze',
    'royal-blue', 'light-blue', 'light-brown', 'light-pink', 'red', 'yellow',
    'lake-blue'
  ];

  const jaredMccainColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green', 'light-purple',
    'orange', 'rose-red', 'wine-red', 'blue-jeans', 'grass-green', 'khaki-ash',
    'dark-blue', 'pirate-gray', 'gray-green', 'dark-green', 'purple-haze',
    'royal-blue', 'light-blue', 'light-brown', 'lake-blue', 'yellow', 'red',
    'light-pink'
  ];

  const PRODUCTS = [
    product('ball-for-life-graphic-tee', 'Ball For Life Graphic Tee', 'Ball-For-Life-Graphic-Tee', ['black', 'water-blue', 'apricot', 'light-pink', 'pirate-grey'], 34.99),
    product('lebron-james-oversized-snowly-washed-graphic-tee', 'LeBron James Oversized Snowly Washed Graphic Tee', 'LeBron-James-Oversized-Snowly-Washed-Graphic-Tee', lebronColors, 27.99),
    product('lamelo-ball-snow-washed-oversized-cotton-t-shirt', 'LaMelo Ball Snow Washed Oversized Cotton T-Shirt', 'LaMelo-Ball-Snow-Washed-Oversized-Cotton-T-Shirt', lameloColors, 27.99),
    product('kyrie-irving-snow-washed-oversized-cotton-t-shirt', 'Kyrie Irving Snow Washed Oversized Cotton T-Shirt', 'Kyrie-Irving-Snow-Washed-Oversized-Cotton-T-Shirt', ['black', 'light-gray', 'light-blue', 'pirate-gray', 'royal-blue'], 27.99),
    product('tyrese-maxey-snow-washed-oversized-cotton-t-shirt', 'Tyrese Maxey Snow Washed Oversized Cotton T-Shirt', 'Tyrese-Maxey-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('kobe-bryant-snow-washed-oversized-cotton-t-shirt', 'Kobe Bryant Snow Washed Oversized Cotton T-Shirt', 'Kobe-Bryant-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('allen-iverson-snow-washed-oversized-cotton-t-shirt', 'Allen Iverson Snow Washed Oversized Cotton T-Shirt', 'Allen-Iverson-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('allen-iverson-variant-2-snow-washed-oversized-cotton-t-shirt', 'Allen Iverson Variant 2 Snow Washed Oversized Cotton T-Shirt', 'Allen-Iverson-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('dennis-rodman-snow-washed-oversized-cotton-t-shirt', 'Dennis Rodman Snow Washed Oversized Cotton T-Shirt', 'Dennis-Rodman-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('dennis-rodman-fck-what-they-think-snow-washed-oversized-cotton-t-shirt', 'Dennis Rodman Fck What They Think Snow Washed Oversized Cotton T-Shirt', 'Dennis-Rodman-Fck-What-They-Think-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('prove-them-wrong-snow-washed-oversized-cotton-t-shirt', 'Prove Them Wrong Snow Washed Oversized Cotton T-Shirt', 'Prove-Them-Wrong-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors.filter((color) => color !== 'black'), 27.99),
    product('no-wasted-potential-snow-washed-oversized-cotton-t-shirt', 'No Wasted Potential Snow Washed Oversized Cotton T-Shirt', 'No-Wasted-Potential-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('russell-westbrook-snow-washed-oversized-cotton-t-shirt', 'Russell Westbrook Snow Washed Oversized Cotton T-Shirt', 'Russell-Westbrook-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('russell-westbrook-variant-2-snow-washed-oversized-cotton-t-shirt', 'Russell Westbrook Variant 2 Snow Washed Oversized Cotton T-Shirt', 'Russell-Westbrook-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('ja-morant-snow-washed-oversized-cotton-t-shirt', 'Ja Morant Snow Washed Oversized Cotton T-Shirt', 'Ja-Morant-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('sga-snow-washed-oversized-cotton-t-shirt', 'SGA Snow Washed Oversized Cotton T-Shirt', 'SGA-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('j-dub-snow-washed-oversized-cotton-t-shirt', 'J-Dub Snow Washed Oversized Cotton T-Shirt', 'J-Dub-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('anthony-edwards-snow-washed-oversized-cotton-t-shirt', 'Anthony Edwards Snow Washed Oversized Cotton T-Shirt', 'Anthony-Edwards-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    product('austin-reaves-snow-washed-oversized-cotton-t-shirt', 'Austin Reaves Snow Washed Oversized Cotton T-Shirt', 'Austin-Reaves-Snow-Washed-Oversized-Cotton-T-Shirt', expandedMockupColors, 27.99),
    product('jalen-brunson-snow-washed-oversized-cotton-t-shirt', 'Jalen Brunson Snow Washed Oversized Cotton T-Shirt', 'Jalen-Brunson-Snow-Washed-Oversized-Cotton-T-Shirt', expandedMockupColors, 27.99),
    product('face-of-the-league-snow-washed-oversized-cotton-t-shirt', 'Face Of The League Snow Washed Oversized Cotton T-Shirt', 'Face-Of-The-League-Snow-Washed-Oversized-Cotton-T-Shirt', expandedMockupColors, 27.99),
    product('derrick-rose-snow-washed-oversized-cotton-t-shirt', 'Derrick Rose Snow Washed Oversized Cotton T-Shirt', 'Derrick-Rose-Snow-Washed-Oversized-Cotton-T-Shirt', expandedMockupColors, 27.99),
    product('jared-mccain-snow-washed-oversized-cotton-t-shirt', 'Jared McCain Snow Washed Oversized Cotton T-Shirt', 'Jared-McCain-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('jared-mccain-variant-2-snow-washed-oversized-cotton-t-shirt', 'Jared McCain Variant 2 Snow Washed Oversized Cotton T-Shirt', 'Jared-McCain-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('jared-mccain-variant-3-snow-washed-oversized-cotton-t-shirt', 'Jared McCain Variant 3 Snow Washed Oversized Cotton T-Shirt', 'Jared-McCain-Variant-3-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
  ];

  const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  const ALIASES = {
    'tee-01': 'ball-for-life-graphic-tee',
    'no-average-graphic-tee': 'ball-for-life-graphic-tee',
    'lebron': 'lebron-james-oversized-snowly-washed-graphic-tee',
    'lamelo': 'lamelo-ball-snow-washed-oversized-cotton-t-shirt',
    'kyrie': 'kyrie-irving-snow-washed-oversized-cotton-t-shirt',
    'kobe': 'kobe-bryant-snow-washed-oversized-cotton-t-shirt',
    'iverson': 'allen-iverson-snow-washed-oversized-cotton-t-shirt',
    'rodman': 'dennis-rodman-snow-washed-oversized-cotton-t-shirt',
    'westbrook': 'russell-westbrook-snow-washed-oversized-cotton-t-shirt',
    'ja': 'ja-morant-snow-washed-oversized-cotton-t-shirt',
    'sga': 'sga-snow-washed-oversized-cotton-t-shirt',
    'jdub': 'j-dub-snow-washed-oversized-cotton-t-shirt',
    'j-dub': 'j-dub-snow-washed-oversized-cotton-t-shirt',
    'ant': 'anthony-edwards-snow-washed-oversized-cotton-t-shirt',
    'austin': 'austin-reaves-snow-washed-oversized-cotton-t-shirt',
    'reaves': 'austin-reaves-snow-washed-oversized-cotton-t-shirt',
    'jalen': 'jalen-brunson-snow-washed-oversized-cotton-t-shirt',
    'brunson': 'jalen-brunson-snow-washed-oversized-cotton-t-shirt',
    'face-of-the-league': 'face-of-the-league-snow-washed-oversized-cotton-t-shirt',
    'fotl': 'face-of-the-league-snow-washed-oversized-cotton-t-shirt',
    'derrick': 'derrick-rose-snow-washed-oversized-cotton-t-shirt',
    'rose': 'derrick-rose-snow-washed-oversized-cotton-t-shirt',
    'jared': 'jared-mccain-snow-washed-oversized-cotton-t-shirt',
    'mccain': 'jared-mccain-snow-washed-oversized-cotton-t-shirt',
    'jared-2': 'jared-mccain-variant-2-snow-washed-oversized-cotton-t-shirt',
    'mccain-2': 'jared-mccain-variant-2-snow-washed-oversized-cotton-t-shirt',
    'jared-3': 'jared-mccain-variant-3-snow-washed-oversized-cotton-t-shirt',
    'mccain-3': 'jared-mccain-variant-3-snow-washed-oversized-cotton-t-shirt',
  };

  function product(id, name, folder, colors, price) {
    return { id, name, folder, colors, price, category: 'Graphic Tees' };
  }

  function titleFromColor(slug) {
    return LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function imagePath(item, color, side) {
    return `graphic tee/${item.folder}/${color}/${side}.png`;
  }

  function money(value) {
    return window.__bfl_money ? window.__bfl_money(value) : `£${value.toFixed(2)}`;
  }

  function byId(id) {
    return PRODUCTS.find((item) => item.id === id) || PRODUCTS.find((item) => item.id === ALIASES[id]);
  }

  function getCurrentProduct() {
    const params = new URLSearchParams(window.location.search);
    const rawId = (params.get('id') || '').trim().toLowerCase();
    return byId(rawId) || PRODUCTS[0];
  }

  function render() {
    const app = document.querySelector('#product-app');
    if (!app) return;

    const item = getCurrentProduct();
    const state = {
      color: item.colors[0],
      side: 'front',
      size: 'M',
      qty: 1,
    };

    document.title = `${item.name} - Ball For Life`;
    app.innerHTML = `
      <section class="product-hero">
        <aside class="product-info-panel">
          <div class="product-kicker">${item.category}</div>
          <h1>${escapeHtml(item.name)}</h1>
          <div class="product-price" data-product-price>${money(item.price)}</div>
          <div class="product-fabric-line">Heavyweight 250 GSM &bull; 100% cotton</div>
          <div class="product-accordion">
            <details open>
              <summary>Product Details</summary>
              <p>Snow washed oversized cotton tee with a relaxed boxy fit and heavyweight streetwear feel.</p>
              <div class="product-detail-specs">
                <div><span>Material</span><strong>100% cotton</strong></div>
                <div><span>Fabric Weight</span><strong>250 gsm (7.4 oz)</strong></div>
              </div>
            </details>
            <details>
              <summary>Care Instructions</summary>
              <ul class="product-care-list">
                <li>Machine wash at 30&deg;C (gentle cycle)</li>
                <li>Do not bleach</li>
                <li>Tumble dry low</li>
                <li>Iron at low temperature, avoid ironing on print</li>
                <li>Do not dry clean</li>
              </ul>
            </details>
            <details>
              <summary>Size Guide</summary>
              <div class="product-size-table-wrap">
                <p>1-3 cm sizing differences may occur.</p>
                <table class="product-size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Length</th>
                      <th>Shoulder</th>
                      <th>Chest</th>
                      <th>Sleeve length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>70</td><td>53</td><td>56</td><td>20.8</td></tr>
                    <tr><td>M</td><td>72</td><td>55</td><td>58</td><td>21.5</td></tr>
                    <tr><td>L</td><td>74</td><td>57</td><td>60</td><td>22.2</td></tr>
                    <tr><td>XL</td><td>76</td><td>59</td><td>62</td><td>22.9</td></tr>
                    <tr><td>2XL</td><td>78</td><td>61</td><td>64</td><td>23.6</td></tr>
                    <tr><td>3XL</td><td>79</td><td>63</td><td>67</td><td>23.6</td></tr>
                  </tbody>
                </table>
              </div>
            </details>
            <details>
              <summary>Shipping Info</summary>
              <p>Free shipping on orders over <span data-money-gbp="50">${money(50)}</span>. Standard delivery and return options are available at checkout.</p>
            </details>
            <details>
              <summary>Returns & Exchange</summary>
              <p>You can request a change-of-mind return within 14 days of receiving your order. Items must be unworn, unwashed, and in original condition. Faulty or incorrect items should be reported as soon as possible.</p>
            </details>
          </div>
        </aside>

        <section class="product-media-panel">
          <button class="product-side-nav product-side-prev" type="button" aria-label="Previous image">&lt;</button>
          <img class="product-main-image" alt="${escapeHtml(item.name)}">
          <button class="product-side-nav product-side-next" type="button" aria-label="Next image">&gt;</button>
          <div class="product-side-label">Front</div>
        </section>

        <aside class="product-buy-panel">
          <label class="product-picker-label" for="product-picker">Product</label>
          <select id="product-picker" class="product-picker">
            ${PRODUCTS.map((productItem) => `<option value="${productItem.id}" ${productItem.id === item.id ? 'selected' : ''}>${escapeHtml(productItem.name)}</option>`).join('')}
          </select>

          <div class="product-option-head">
            <span>Colour</span>
            <strong class="selected-color">${titleFromColor(state.color)}</strong>
          </div>
          <div class="product-swatches">
            ${item.colors.map((color) => `
              <button class="product-swatch ${color === state.color ? 'active' : ''}" type="button" data-color="${color}" aria-label="${titleFromColor(color)}" title="${titleFromColor(color)}">
                <span style="background:${SWATCHES[color] || '#ddd'}"></span>
              </button>
            `).join('')}
          </div>

          <div class="product-option-head product-size-head">
            <span>Size</span>
          </div>
          <div class="product-sizes">
            ${SIZES.map((size) => `<button class="product-size ${size === state.size ? 'active' : ''}" type="button" data-size="${size}">${size}</button>`).join('')}
          </div>

          <div class="product-qty">
            <button class="product-qty-minus" type="button" aria-label="Decrease quantity">-</button>
            <span class="product-qty-value">1</span>
            <button class="product-qty-plus" type="button" aria-label="Increase quantity">+</button>
          </div>

          <button class="product-add" type="button" data-product-add>Add to Cart - ${money(item.price)}</button>
          <div class="product-fabric-proof">
            <img src="fabric-close-up.png" alt="Close-up of heavyweight cotton fabric">
            <div>
              <strong>Heavyweight 250 GSM &bull; 100% cotton</strong>
              <span>Dense snow-washed cotton with a structured oversized fit.</span>
            </div>
          </div>
          <div class="product-pay-row" aria-label="Accepted payment methods">
            <img src="visa.svg" alt="Visa">
            <img src="mastercard-alt.svg" alt="Mastercard">
            <img src="apple-pay.svg" alt="Apple Pay">
            <img src="klarna.svg" alt="Klarna">
          </div>
        </aside>
      </section>
    `;

    const image = app.querySelector('.product-main-image');
    const sideLabel = app.querySelector('.product-side-label');
    const selectedColor = app.querySelector('.selected-color');
    const qtyValue = app.querySelector('.product-qty-value');

    function updatePriceText() {
      app.querySelector('[data-product-price]').textContent = money(item.price);
      app.querySelector('[data-product-add]').textContent = `Add to Cart - ${money(item.price)}`;
      app.querySelectorAll('[data-money-gbp]').forEach((el) => {
        const value = parseFloat(el.dataset.moneyGbp);
        if (!Number.isNaN(value)) el.textContent = money(value);
      });
    }

    function updateImage() {
      image.src = imagePath(item, state.color, state.side);
      image.alt = `${item.name} ${titleFromColor(state.color)} ${state.side}`;
      sideLabel.textContent = state.side === 'front' ? 'Front' : 'Back';
      selectedColor.textContent = titleFromColor(state.color);
      app.querySelectorAll('.product-swatch').forEach((button) => button.classList.toggle('active', button.dataset.color === state.color));
      app.querySelectorAll('.product-size').forEach((button) => button.classList.toggle('active', button.dataset.size === state.size));
      qtyValue.textContent = state.qty;
      updatePriceText();
    }

    app.querySelector('#product-picker').addEventListener('change', (event) => {
      window.location.href = `product.html?id=${event.target.value}`;
    });

    app.querySelectorAll('.product-swatch').forEach((button) => {
      button.addEventListener('click', () => {
        state.color = button.dataset.color;
        state.side = 'front';
        updateImage();
      });
    });

    app.querySelectorAll('.product-size').forEach((button) => {
      button.addEventListener('click', () => {
        state.size = button.dataset.size;
        updateImage();
      });
    });

    app.querySelectorAll('.product-side-nav').forEach((button) => {
      button.addEventListener('click', () => {
        state.side = state.side === 'front' ? 'back' : 'front';
        updateImage();
      });
    });

    app.querySelector('.product-qty-minus').addEventListener('click', () => {
      state.qty = Math.max(1, state.qty - 1);
      updateImage();
    });

    app.querySelector('.product-qty-plus').addEventListener('click', () => {
      state.qty += 1;
      updateImage();
    });

    app.querySelector('.product-add').addEventListener('click', () => {
      if (typeof window.__bfl_addToCart === 'function') {
        window.__bfl_addToCart({
          name: `${item.name} - ${titleFromColor(state.color)}`,
          price: item.price,
          size: state.size,
          qty: state.qty,
          mark: 'BFL',
          image: imagePath(item, state.color, 'front'),
        });
      }
    });

    updateImage();
    document.addEventListener('bfl:currency-change', updatePriceText);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));
  }

  document.addEventListener('DOMContentLoaded', render);
})();
