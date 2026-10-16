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

  const lameloVariant2Colors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green',
    'light-purple', 'orange', 'rose-red', 'wine-red', 'blue-jeans',
    'grass-green', 'khaki-ash', 'dark-blue', 'pirate-gray', 'gray-green',
    'dark-green', 'purple-haze', 'light-blue', 'light-brown', 'royal-blue',
    'light-pink', 'red', 'yellow', 'lake-blue'
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

  const sharifeCooperColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green', 'light-purple',
    'orange', 'wine-red', 'rose-red', 'blue-jeans', 'grass-green', 'khaki-ash',
    'dark-blue', 'pirate-gray', 'gray-green', 'dark-green', 'purple-haze',
    'royal-blue', 'light-blue', 'light-brown', 'lake-blue', 'yellow', 'red',
    'light-pink'
  ];

  const iSeeGodColors = [
    'black', 'apricot', 'dark-blue', 'water-blue', 'light-gray', 'bean-green',
    'light-purple', 'orange', 'rose-red', 'wine-red', 'blue-jeans',
    'grass-green', 'khaki-ash', 'pirate-gray', 'gray-green', 'dark-green',
    'purple-haze', 'royal-blue', 'light-blue', 'light-brown', 'lake-blue',
    'yellow', 'red', 'light-pink'
  ];

  const goatGodColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green',
    'light-purple', 'orange', 'rose-red', 'wine-red', 'blue-jeans',
    'grass-green', 'khaki-ash', 'dark-blue', 'pirate-gray', 'gray-green',
    'dark-green', 'purple-haze', 'royal-blue', 'light-blue', 'light-brown',
    'light-pink', 'red', 'yellow', 'lake-blue'
  ];

  const travisScottColors = [
    'black', 'water-blue', 'apricot', 'light-gray', 'bean-green',
    'light-purple', 'orange', 'rose-red', 'wine-red', 'blue-jeans',
    'grass-green', 'khaki-ash', 'dark-blue', 'pirate-gray', 'gray-green',
    'dark-green', 'purple-haze', 'royal-blue', 'light-brown', 'light-blue',
    'light-pink', 'red', 'yellow', 'lake-blue'
  ];

  function currentProductPrice(normalPrice, saleEligible = true) {
    if (!saleEligible) return normalPrice;
    if (window.__bfl_getSalePrice) return window.__bfl_getSalePrice(normalPrice);
    return normalPrice;
  }

  const PRODUCTS = [
    product('ball-for-life-graphic-tee', 'Ball For Life Graphic Tee', 'Ball-For-Life-Graphic-Tee', ['black', 'water-blue', 'apricot', 'light-pink', 'pirate-grey'], 34.99),
    product('lebron-james-oversized-snowly-washed-graphic-tee', 'LeBron James Oversized Snowly Washed Graphic Tee', 'LeBron-James-Oversized-Snowly-Washed-Graphic-Tee', lebronColors, 27.99),
    product('lamelo-ball-snow-washed-oversized-cotton-t-shirt', 'LaMelo Ball Snow Washed Oversized Cotton T-Shirt', 'LaMelo-Ball-Snow-Washed-Oversized-Cotton-T-Shirt', lameloColors, 27.99),
    product('lamelo-ball-variant-2-snow-washed-oversized-cotton-t-shirt', 'LaMelo Ball Variant 2 Snow Washed Oversized Cotton T-Shirt', 'LaMelo-Ball-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', lameloVariant2Colors, 27.99),
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
    product('stephen-curry-snow-washed-oversized-cotton-t-shirt', 'Stephen Curry Snow Washed Oversized Cotton T-Shirt', 'Stephen-Curry-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('stephen-curry-variant-2-snow-washed-oversized-cotton-t-shirt', 'Stephen Curry Variant 2 Snow Washed Oversized Cotton T-Shirt', 'Stephen-Curry-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('kyrie-irving-variant-2-snow-washed-oversized-cotton-t-shirt', 'Kyrie Irving Variant 2 Snow Washed Oversized Cotton T-Shirt', 'Kyrie-Irving-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('kyrie-irving-variant-3-snow-washed-oversized-cotton-t-shirt', 'Kyrie Irving Variant 3 Snow Washed Oversized Cotton T-Shirt', 'Kyrie-Irving-Variant-3-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('kyrie-irving-variant-4-snow-washed-oversized-cotton-t-shirt', 'Kyrie Irving Variant 4 Snow Washed Oversized Cotton T-Shirt', 'Kyrie-Irving-Variant-4-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('kyrie-irving-variant-5-snow-washed-oversized-cotton-t-shirt', 'Kyrie Irving Variant 5 Snow Washed Oversized Cotton T-Shirt', 'Kyrie-Irving-Variant-5-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('sharife-cooper-snow-washed-oversized-cotton-t-shirt', 'Sharife Cooper Snow Washed Oversized Cotton T-Shirt', 'Sharife-Cooper-Snow-Washed-Oversized-Cotton-T-Shirt', sharifeCooperColors, 27.99),
    product('sharife-cooper-variant-2-snow-washed-oversized-cotton-t-shirt', 'Sharife Cooper Variant 2 Snow Washed Oversized Cotton T-Shirt', 'Sharife-Cooper-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', sharifeCooperColors, 27.99),
    product('sharife-cooper-variant-3-snow-washed-oversized-cotton-t-shirt', 'Sharife Cooper Variant 3 Snow Washed Oversized Cotton T-Shirt', 'Sharife-Cooper-Variant-3-Snow-Washed-Oversized-Cotton-T-Shirt', sharifeCooperColors, 27.99),
    product('sharife-cooper-variant-4-snow-washed-oversized-cotton-t-shirt', 'Sharife Cooper Variant 4 Snow Washed Oversized Cotton T-Shirt', 'Sharife-Cooper-Variant-4-Snow-Washed-Oversized-Cotton-T-Shirt', expandedMockupColors, 27.99),
    product('i-see-god-everywhere-snow-washed-oversized-cotton-t-shirt', 'I See God Everywhere Snow Washed Oversized Cotton T-Shirt', 'I-See-God-Everywhere-Snow-Washed-Oversized-Cotton-T-Shirt', iSeeGodColors, 29.99),
    product('goat-x-god-snow-washed-oversized-cotton-t-shirt', 'G.O.A.T x GOD Snow Washed Oversized Cotton T-Shirt', 'GOAT-x-GOD-Snow-Washed-Oversized-Cotton-T-Shirt', goatGodColors, 29.99),
    product('travis-scott-snow-washed-oversized-cotton-t-shirt', 'Travis Scott Snow Washed Oversized Cotton T-Shirt', 'Travis-Scott-Snow-Washed-Oversized-Cotton-T-Shirt', travisScottColors, 27.99),
    product('kobe-bryant-variant-2-snow-washed-oversized-cotton-t-shirt', 'Kobe Bryant Variant 2 Snow Washed Oversized Cotton T-Shirt', 'Kobe-Bryant-Variant-2-Snow-Washed-Oversized-Cotton-T-Shirt', travisScottColors, 27.99),
    product('mask-on-snow-washed-oversized-cotton-t-shirt', 'Mask On Snow Washed Oversized Cotton T-Shirt', 'Mask-On-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('la-snow-washed-oversized-cotton-t-shirt', 'LA Snow Washed Oversized Cotton T-Shirt', 'LA-Snow-Washed-Oversized-Cotton-T-Shirt', jaredMccainColors, 27.99),
    product('confidence-snow-washed-oversized-cotton-t-shirt', 'Confidence Snow Washed Oversized Cotton T-Shirt', 'Confidence-Snow-Washed-Oversized-Cotton-T-Shirt', expandedMockupColors, 27.99),
    product('goat-kobe-x-jordan-snow-washed-oversized-cotton-t-shirt', 'GOAT Kobe x Jordan Snow Washed Oversized Cotton T-Shirt', 'GOAT-Kobe-x-Jordan-Snow-Washed-Oversized-Cotton-T-Shirt', fullColors, 27.99),
    {
      id: 'cant-rush-greatness-sleeveless-hoodie', name: "Can't Rush Greatness Sleeveless Hoodie",
      category: 'Tracksuits', kind: 'hoodie', colors: ['black'], sizes: ['S', 'M', 'L', 'XL'],
      price: 44.99, normalPrice: 44.99, saleEligible: false,
      imageBase: 'assets/images/tracksuits/cant-rush-greatness-sleeveless-hoodie/black',
      summary: 'Sleeveless cut. Front statement print. BFL back graphic.',
      description: "Black sleeveless hoodie with a Can't Rush Greatness front print and a distressed BFL graphic on the back. Part of the Hooper Set, also available separately.",
      details: [['Colour', 'Black'], ['Cut', 'Sleeveless hooded top'], ['Sizes', 'S, M, L, XL']],
    },
    {
      id: 'hooper-sweatpants', name: 'Ball For Life Un-Guardable Hooper Sweatpants',
      category: 'Tracksuits', kind: 'bottoms', colors: ['black'], sizes: ['S', 'M', 'L', 'XL'],
      price: 49.99, normalPrice: 49.99, saleEligible: false,
      imageBase: 'assets/images/tracksuits/hooper-sweatpants/black',
      summary: 'Knee-length fit. Layered waistband. Ball For Life graphics.',
      description: 'Ball For Life Un-Guardable Hooper Sweatpants sit around the knee, with a layered waistband, drawstring, pockets and Ball For Life graphics. These are not full-length trousers.',
      details: [['Colour', 'Black'], ['Length', 'Around the knee'], ['Sizes', 'S, M, L, XL']],
    },
    {
      id: 'cant-rush-greatness-hooper-set', name: "Can't Rush Greatness Hooper Set",
      category: 'Tracksuits', kind: 'set', colors: ['black'], sizes: ['S', 'M', 'L', 'XL'],
      price: 84.99, normalPrice: 84.99, saleEligible: false,
      imageBase: 'assets/images/tracksuits/cant-rush-greatness-sleeveless-hoodie/black',
      secondaryImageBase: 'assets/images/tracksuits/hooper-sweatpants/black',
      summary: 'Sleeveless hoodie + knee-length Hooper Sweatpants.',
      description: "The complete black Hooper Set: Can't Rush Greatness Sleeveless Hoodie and knee-length Hooper Sweatpants. Choose a separate size for each piece.",
      details: [['Includes', 'Sleeveless hoodie + Hooper Sweatpants'], ['Colour', 'Black'], ['Sizes', 'S, M, L, XL for each piece']],
    },
  ];

  const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const TEE_MEASUREMENTS = [
    ['S', 70, 53, 56, 20.8], ['M', 72, 55, 58, 21.5],
    ['L', 74, 57, 60, 22.2], ['XL', 76, 59, 62, 22.9],
    ['2XL', 78, 61, 64, 23.6], ['3XL', 79, 63, 67, 23.6],
  ];

  const ALIASES = {
    'tee-01': 'ball-for-life-graphic-tee',
    'no-average-graphic-tee': 'ball-for-life-graphic-tee',
    'lebron': 'lebron-james-oversized-snowly-washed-graphic-tee',
    'lamelo': 'lamelo-ball-snow-washed-oversized-cotton-t-shirt',
    'lamelo-2': 'lamelo-ball-variant-2-snow-washed-oversized-cotton-t-shirt',
    'kyrie': 'kyrie-irving-snow-washed-oversized-cotton-t-shirt',
    'kyrie-2': 'kyrie-irving-variant-2-snow-washed-oversized-cotton-t-shirt',
    'irving-2': 'kyrie-irving-variant-2-snow-washed-oversized-cotton-t-shirt',
    'kyrie-3': 'kyrie-irving-variant-3-snow-washed-oversized-cotton-t-shirt',
    'irving-3': 'kyrie-irving-variant-3-snow-washed-oversized-cotton-t-shirt',
    'kyrie-4': 'kyrie-irving-variant-4-snow-washed-oversized-cotton-t-shirt',
    'irving-4': 'kyrie-irving-variant-4-snow-washed-oversized-cotton-t-shirt',
    'kyrie-5': 'kyrie-irving-variant-5-snow-washed-oversized-cotton-t-shirt',
    'irving-5': 'kyrie-irving-variant-5-snow-washed-oversized-cotton-t-shirt',
    'sharife': 'sharife-cooper-snow-washed-oversized-cotton-t-shirt',
    'cooper': 'sharife-cooper-snow-washed-oversized-cotton-t-shirt',
    'sharife-2': 'sharife-cooper-variant-2-snow-washed-oversized-cotton-t-shirt',
    'cooper-2': 'sharife-cooper-variant-2-snow-washed-oversized-cotton-t-shirt',
    'sharife-3': 'sharife-cooper-variant-3-snow-washed-oversized-cotton-t-shirt',
    'cooper-3': 'sharife-cooper-variant-3-snow-washed-oversized-cotton-t-shirt',
    'sharife-4': 'sharife-cooper-variant-4-snow-washed-oversized-cotton-t-shirt',
    'cooper-4': 'sharife-cooper-variant-4-snow-washed-oversized-cotton-t-shirt',
    'kobe': 'kobe-bryant-snow-washed-oversized-cotton-t-shirt',
    'kobe-2': 'kobe-bryant-variant-2-snow-washed-oversized-cotton-t-shirt',
    'bryant-2': 'kobe-bryant-variant-2-snow-washed-oversized-cotton-t-shirt',
    'mask-on': 'mask-on-snow-washed-oversized-cotton-t-shirt',
    'la': 'la-snow-washed-oversized-cotton-t-shirt',
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
    'curry': 'stephen-curry-snow-washed-oversized-cotton-t-shirt',
    'stephen': 'stephen-curry-snow-washed-oversized-cotton-t-shirt',
    'steph': 'stephen-curry-snow-washed-oversized-cotton-t-shirt',
    'curry-2': 'stephen-curry-variant-2-snow-washed-oversized-cotton-t-shirt',
    'stephen-2': 'stephen-curry-variant-2-snow-washed-oversized-cotton-t-shirt',
    'steph-2': 'stephen-curry-variant-2-snow-washed-oversized-cotton-t-shirt',
    'i-see-god-everywhere': 'i-see-god-everywhere-snow-washed-oversized-cotton-t-shirt',
    'i-see-god': 'i-see-god-everywhere-snow-washed-oversized-cotton-t-shirt',
    'goat-god': 'goat-x-god-snow-washed-oversized-cotton-t-shirt',
    'goat-x-god': 'goat-x-god-snow-washed-oversized-cotton-t-shirt',
    'travis': 'travis-scott-snow-washed-oversized-cotton-t-shirt',
    'travis-scott': 'travis-scott-snow-washed-oversized-cotton-t-shirt',
    'confidence': 'confidence-snow-washed-oversized-cotton-t-shirt',
    'goat-kobe-jordan': 'goat-kobe-x-jordan-snow-washed-oversized-cotton-t-shirt',
    'kobe-jordan': 'goat-kobe-x-jordan-snow-washed-oversized-cotton-t-shirt',
    'goat-tee': 'goat-kobe-x-jordan-snow-washed-oversized-cotton-t-shirt',
  };

  function product(id, name, folder, colors, price) {
    const activePrice = currentProductPrice(price);
    return {
      id,
      name,
      folder,
      colors,
      price: activePrice,
      originalPrice: activePrice < price ? price : null,
      normalPrice: price,
      category: 'Graphic Tees'
    };
  }

  function titleFromColor(slug) {
    return LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function imagePath(item, color, side) {
    if (item.imageBase) return `${item.imageBase}/${side}.webp`;
    return `graphic tee/${item.folder}/${color}/${side}.png`;
  }

  function money(value) {
    return window.__bfl_money ? window.__bfl_money(value) : `£${value.toFixed(2)}`;
  }

  function priceMarkup(item) {
    if (item.originalPrice && item.originalPrice > item.price) {
      return `<span class="sale-price-pair"><s data-money-gbp="${item.originalPrice}">${money(item.originalPrice)}</s><b data-money-gbp="${item.price}">${money(item.price)}</b><em>1 week only</em></span>`;
    }
    return `<b data-money-gbp="${item.price}">${money(item.price)}</b>`;
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
    const normalPrice = item.normalPrice || item.originalPrice || item.price;
    item.price = currentProductPrice(normalPrice, item.saleEligible !== false);
    item.originalPrice = item.price < normalPrice ? normalPrice : null;
    item.normalPrice = normalPrice;
    const isTee = item.category === 'Graphic Tees';
    const isSet = item.kind === 'set';
    const sizes = item.sizes || SIZES;
    const galleryViews = [
      { side: 'front', label: 'Front' },
      { side: 'back', label: 'Back' },
      ...(item.id === 'stephen-curry-variant-2-snow-washed-oversized-cotton-t-shirt' ? [
        { src: 'assets/community/tjay-reading-fit.webp', thumb: 'assets/community/tjay-reading-fit-thumb.webp', label: 'Customer fit', alt: 'T-jay from Reading wearing the black Stephen Curry Variant 2 Tee on court' },
        { src: 'assets/community/tjay-reading-sleeve.webp', thumb: 'assets/community/tjay-reading-sleeve-thumb.webp', label: 'Sleeve detail', alt: 'The BFL sleeve logo on T-jay\'s black Stephen Curry Variant 2 Tee' },
        { src: 'assets/community/tjay-reading-graphic.webp', thumb: 'assets/community/tjay-reading-graphic-thumb.webp', label: 'Print detail', alt: 'A close-up of the Stephen Curry graphic on T-jay\'s black tee' },
      ] : []),
    ];
    const state = {
      color: item.colors[0],
      view: 0,
      size: null,
      hoodieSize: null,
      bottomsSize: null,
      qty: 1,
    };

    document.title = `${item.name} - Ball For Life`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', item.description || `${item.name}. Heavyweight cotton graphic tee from Ball For Life. Choose your colour and size.`);
    app.innerHTML = `
      <div class="product-breadcrumb wrap breadcrumb"><a href="index.html">Home</a> / <a href="shop.html?cat=${isTee ? 'tees' : 'tracksuits'}">${item.category}</a> / ${escapeHtml(item.name.replace(/ Snow Washed Oversized Cotton T-Shirt| Oversized Snowly Washed Graphic Tee/g, ' Tee'))}</div>
      <section class="product-hero">
        <aside class="product-info-panel">
          <div class="product-kicker">${item.category}</div>
          <h1>${escapeHtml(item.name.replace(/ Snow Washed Oversized Cotton T-Shirt| Oversized Snowly Washed Graphic Tee/g, ' Tee'))}</h1>
          <div class="product-price" data-product-price>${priceMarkup(item)}</div>
          <div class="product-fabric-line">${isTee ? 'Heavyweight 250 GSM &bull; 100% cotton' : escapeHtml(item.summary)}</div>
          ${isSet ? `<div class="bundle-includes"><a href="product.html?id=cant-rush-greatness-sleeveless-hoodie"><span>Sleeveless Hoodie</span><span data-money-gbp="44.99">${money(44.99)}</span></a><a href="product.html?id=hooper-sweatpants"><span>Ball For Life Un-Guardable Hooper Sweatpants</span><span data-money-gbp="49.99">${money(49.99)}</span></a><p>Save <strong data-money-gbp="9.99">${money(9.99)}</strong> when you buy the set.</p></div>` : `<div class="product-matching-set" ${isTee ? 'hidden' : ''}><a href="product.html?id=cant-rush-greatness-hooper-set">Shop the matching set <img src="assets/ui/arrow-right.svg" alt="" width="16" height="16"></a></div>`}
          <div class="product-accordion">
            <details open>
              <summary>Product Details</summary>
              <p>${escapeHtml(item.description || 'Snow washed oversized cotton tee with a relaxed boxy fit and heavyweight streetwear feel.')}</p>
              <div class="product-detail-specs">
                ${(item.details || [['Material', '100% cotton'], ['Fabric Weight', '250 gsm (7.4 oz)']]).map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
              </div>
            </details>
            ${isTee ? `<details>
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
                    ${TEE_MEASUREMENTS.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </details>` : ''}
            <details>
              <summary>Shipping Info</summary>
              <p>Free UK shipping on orders over <span data-money-gbp="65">${money(65)}</span> after discount. International delivery is calculated at checkout. <a href="shipping-returns.html">Delivery information</a></p>
            </details>
            <details>
              <summary>Returns & Exchange</summary>
              <p>You can request a change-of-mind return within 14 days of receiving your order. Items must be unworn, unwashed, and in original condition. Faulty or incorrect items should be reported as soon as possible.</p>
            </details>
          </div>
        </aside>

        <section class="product-media-panel ${isSet ? 'is-set' : ''}">
          <button class="product-side-nav product-side-prev" type="button" aria-label="Previous image"><img src="assets/ui/chevron-left.svg" alt="" width="20" height="20"></button>
          <img class="product-main-image" alt="${escapeHtml(item.name)}">
          ${isSet ? '<img class="product-secondary-image" alt="Hooper Sweatpants included in the set">' : ''}
          <button class="product-side-nav product-side-next" type="button" aria-label="Next image"><img src="assets/ui/chevron-right.svg" alt="" width="20" height="20"></button>
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
          <div class="product-swatches" id="product-colours">
            ${item.colors.map((color) => `
              <button class="product-swatch ${color === state.color ? 'active' : ''}" type="button" data-color="${color}" aria-label="${titleFromColor(color)}" title="${titleFromColor(color)}">
                <span style="background:${SWATCHES[color] || '#ddd'}"></span>
              </button>
            `).join('')}
            ${item.colors.length > 5 ? `<button class="product-colours-toggle" type="button" aria-expanded="false" aria-controls="product-colours" aria-label="Show all ${item.colors.length} colours" title="Show all colours"><span>+${item.colors.length - 5}</span><img src="assets/ui/minus.svg" alt="" hidden></button>` : ''}
          </div>

          <div class="product-option-head product-size-head">
            <span>${isSet ? 'Sleeveless hoodie size' : 'Size'}</span>
            ${isTee ? '<button type="button" class="size-guide-link" data-size-guide-link>Size Guide</button>' : ''}
          </div>
          <div class="product-sizes" role="group" aria-label="${isSet ? 'Sleeveless hoodie size' : 'Size'}" style="--size-count:${sizes.length}">
            ${sizes.map((size) => `<button class="product-size" type="button" data-size="${size}" ${isSet ? 'data-size-part="hoodie"' : ''}>${size}</button>`).join('')}
          </div>
          ${isSet ? `<div class="product-option-head product-size-head"><span>Hooper Sweatpants size</span></div><div class="product-sizes" role="group" aria-label="Hooper Sweatpants size" style="--size-count:4">${sizes.map(size => `<button class="product-size" type="button" data-size="${size}" data-size-part="bottoms">${size}</button>`).join('')}</div>` : ''}

          <div class="product-qty">
            <button class="product-qty-minus" type="button" aria-label="Decrease quantity"><img src="assets/ui/minus.svg" alt="" width="14" height="14"></button>
            <span class="product-qty-value">1</span>
            <button class="product-qty-plus" type="button" aria-label="Increase quantity"><img src="assets/ui/plus.svg" alt="" width="14" height="14"></button>
          </div>

          <button class="product-add" type="button" data-product-add>Select a size</button>
          <p class="product-selection-message" role="status" data-selection-message></p>
          <div class="product-delivery-note">
            <span>Estimated delivery <strong data-delivery-estimate>5-9 days</strong></span>
            <a href="shipping-returns.html#cancellation">14-day returns <img src="assets/ui/arrow-right.svg" alt="" width="14" height="14"></a>
            <span class="product-delivery-countdown" data-delivery-countdown>Order today to keep this estimate</span>
          </div>
          <a class="product-help" href="https://wa.me/447356218992?text=Hi%20Ball%20For%20Life%2C%20can%20you%20help%20me%20choose%20my%20size%3F" target="_blank" rel="noopener"><img src="assets/ui/message-circle.svg" alt="" width="16" height="16">Questions about fit? Talk to us.</a>
          ${isTee ? `<div class="product-fabric-proof">
            <img src="assets/ui/fabric.webp" alt="Close-up of heavyweight cotton fabric" loading="lazy">
            <div>
              <strong>Heavyweight 250 GSM &bull; 100% cotton</strong>
              <span>Dense snow-washed cotton with a structured oversized fit.</span>
            </div>
          </div>` : ''}
          <div class="product-pay-row" aria-label="Accepted payment methods">
            <img src="visa.svg" alt="Visa">
            <img src="mastercard-alt.svg" alt="Mastercard">
            <img src="apple-pay.svg" alt="Apple Pay">
            <img src="klarna.svg" alt="Klarna">
          </div>
        </aside>

        <div class="product-mobile-buy" data-product-mobile-buy>
          <div>
            <span data-mobile-buy-size>Select a size / ${titleFromColor(state.color)}</span>
            <strong data-mobile-buy-price>${money(item.price)}</strong>
          </div>
          <button type="button" data-product-mobile-add>Select a size</button>
        </div>
      </section>
    `;

    const hero = app.querySelector('.product-hero');
    const info = app.querySelector('.product-info-panel');
    const buy = app.querySelector('.product-buy-panel');
    const accordion = app.querySelector('.product-accordion');
    const purchase = document.createElement('div');
    purchase.className = 'product-purchase';
    const gallery = document.createElement('div');
    gallery.className = 'product-gallery';
    gallery.appendChild(app.querySelector('.product-media-panel'));
    gallery.insertAdjacentHTML('beforeend', `<div class="product-thumbs" role="group" aria-label="Product images">${galleryViews.map((view, index) => `<button type="button" class="product-thumb ${isSet ? 'is-set' : ''} ${view.src ? 'is-customer-photo' : ''}" data-gallery-index="${index}" ${view.side ? `data-product-side="${view.side}"` : ''} aria-label="View ${view.label.toLowerCase()}${view.src ? ' - T-jay wearing Black' : ''}"><img alt="" loading="lazy">${isSet ? '<img data-secondary-thumb alt="" loading="lazy">' : ''}</button>`).join('')}</div>`);
    const wornBy = {
      'ball-for-life-graphic-tee': ['RST', 'Essex', 'assets/ui/rst-poster.jpg', 'review-rst-name'],
      'stephen-curry-variant-2-snow-washed-oversized-cotton-t-shirt': ['T-jay', 'Reading', 'assets/community/tjay-reading-fit-thumb.webp', 'review-tjay-name'],
      'dennis-rodman-fck-what-they-think-snow-washed-oversized-cotton-t-shirt': ['KadenBruney', 'Preston', 'assets/ui/kaden-poster.jpg', 'review-kaden-name'],
    }[item.id];
    hero.prepend(gallery);
    purchase.append(info, buy);
    if (wornBy) purchase.insertAdjacentHTML('beforeend', `<a class="product-worn-link" href="index.html#${wornBy[3]}"><img src="${wornBy[2]}" alt="" width="42" height="52" loading="lazy"><span>Worn by ${wornBy[0]}<small>${wornBy[1]} &middot; See it on court</small></span><img class="worn-arrow" src="assets/ui/arrow-right.svg" alt="" width="18" height="18"></a>`);
    purchase.append(accordion);
    hero.append(purchase);
    const browse = document.createElement('details');
    browse.className = 'product-browse';
    browse.innerHTML = '<summary>Browse other pieces</summary>';
    browse.append(app.querySelector('.product-picker-label'), app.querySelector('.product-picker'));
    purchase.append(browse);
    const sizeGuide = [...accordion.querySelectorAll('details')].find(detail => detail.querySelector('summary').textContent === 'Size Guide');
    if (sizeGuide) sizeGuide.querySelector('p').textContent = 'Measurements in centimetres. 1-3 cm sizing differences may occur.';
    app.querySelector('[data-size-guide-link]')?.addEventListener('click', () => {
      sizeGuide.open = true;
      sizeGuide.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      sizeGuide.querySelector('summary').focus();
    });
    const image = app.querySelector('.product-main-image');
    const zoomButton = document.createElement('button');
    zoomButton.className = 'product-zoom-trigger icon-btn';
    zoomButton.type = 'button';
    zoomButton.setAttribute('aria-label', 'Zoom product image');
    zoomButton.innerHTML = '<img src="assets/ui/zoom-in.svg" alt="" width="20" height="20">';
    app.querySelector('.product-media-panel').append(zoomButton);
    const zoom = document.createElement('dialog');
    zoom.className = `product-zoom ${isSet ? 'is-set' : ''}`;
    zoom.setAttribute('aria-label', 'Product image zoom');
    zoom.innerHTML = '<button class="icon-btn" type="button" aria-label="Close zoom"><img src="assets/ui/x.svg" alt="" width="20" height="20"></button><img data-zoom-image alt="">' + (isSet ? '<img data-zoom-secondary alt="Hooper Sweatpants included in the set">' : '');
    app.append(zoom);
    const openZoom = () => { zoom.querySelector('[data-zoom-image]').src = image.src; zoom.querySelector('[data-zoom-image]').alt = image.alt; if (isSet) zoom.querySelector('[data-zoom-secondary]').src = app.querySelector('.product-secondary-image').src; zoom.showModal(); };
    image.addEventListener('click', openZoom);
    app.querySelector('.product-secondary-image')?.addEventListener('click', openZoom);
    zoomButton.addEventListener('click', openZoom);
    zoom.querySelector('button').addEventListener('click', () => zoom.close());
    app.querySelectorAll('[data-gallery-index]').forEach(button => button.addEventListener('click', () => { state.view = Number(button.dataset.galleryIndex); updateImage(); }));
    let touchStart = null;
    const media = app.querySelector('.product-media-panel');
    media.addEventListener('touchstart', event => { touchStart = event.changedTouches[0]; }, { passive: true });
    media.addEventListener('touchend', event => {
      if (!touchStart) return;
      const end = event.changedTouches[0];
      const dx = end.clientX - touchStart.clientX;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(end.clientY - touchStart.clientY)) {
        state.view = (state.view + (dx < 0 ? 1 : -1) + galleryViews.length) % galleryViews.length;
        updateImage();
      }
      touchStart = null;
    }, { passive: true });
    const sideLabel = app.querySelector('.product-side-label');
    const selectedColor = app.querySelector('.selected-color');
    const qtyValue = app.querySelector('.product-qty-value');

    function updatePriceText() {
      app.querySelector('[data-product-price]').innerHTML = priceMarkup(item);
      app.querySelector('[data-product-add]').textContent = state.size ? `Add to Bag - ${money(item.price)}` : isSet ? 'Choose both sizes' : 'Select a size';
      app.querySelector('[data-product-mobile-add]').textContent = state.size ? 'Add to Bag' : isSet ? 'Choose sizes' : 'Select a size';
      app.querySelector('[data-mobile-buy-price]').textContent = money(item.price);
      app.querySelectorAll('[data-money-gbp]').forEach((el) => {
        const value = parseFloat(el.dataset.moneyGbp);
        if (!Number.isNaN(value)) el.textContent = money(value);
      });
    }

    function updateImage() {
      const view = galleryViews[state.view];
      image.src = view.src || imagePath(item, state.color, view.side);
      image.classList.toggle('is-customer-photo', Boolean(view.src));
      media.classList.toggle('is-customer-photo', Boolean(view.src));
      if (isSet) app.querySelector('.product-secondary-image').src = `${item.secondaryImageBase}/${view.side}.webp`;
      image.alt = view.alt || `${item.name} ${titleFromColor(state.color)} ${view.side}`;
      sideLabel.textContent = view.src ? `${view.label} - T-jay, Black` : view.label;
      selectedColor.textContent = titleFromColor(state.color);
      const visibleColours = item.colors.slice(0, 5);
      if (!visibleColours.includes(state.color)) visibleColours[4] = state.color;
      app.querySelectorAll('.product-swatch').forEach((button) => {
        button.classList.toggle('active', button.dataset.color === state.color);
        button.classList.toggle('is-secondary', !visibleColours.includes(button.dataset.color));
        button.setAttribute('aria-pressed', String(button.dataset.color === state.color));
      });
      app.querySelectorAll('.product-size').forEach((button) => { const chosen = isSet ? state[`${button.dataset.sizePart}Size`] : state.size; button.classList.toggle('active', button.dataset.size === chosen); button.setAttribute('aria-pressed', String(button.dataset.size === chosen)); });
      app.querySelectorAll('[data-gallery-index]').forEach(button => {
        const index = Number(button.dataset.galleryIndex);
        const thumbnail = galleryViews[index];
        button.classList.toggle('active', index === state.view);
        button.setAttribute('aria-pressed', String(index === state.view));
        button.querySelector('img').src = thumbnail.thumb || thumbnail.src || imagePath(item, state.color, thumbnail.side);
        if (isSet) button.querySelector('[data-secondary-thumb]').src = `${item.secondaryImageBase}/${thumbnail.side}.webp`;
      });
      qtyValue.textContent = state.qty;
      app.querySelector('[data-mobile-buy-size]').textContent = isSet ? `Hoodie ${state.hoodieSize || '-'} / Bottoms ${state.bottomsSize || '-'}` : `${state.size || 'Select a size'} / ${titleFromColor(state.color)}`;
      updatePriceText();
    }

    function addSelectedToCart() {
      if (!state.size) {
        const needed = isSet ? `[data-size-part="${state.hoodieSize ? 'bottoms' : 'hoodie'}"]` : '.product-size';
        app.querySelector('[data-selection-message]').textContent = isSet ? 'Choose a size for both the hoodie and Hooper Sweatpants.' : 'Choose your size to add this item to your bag.';
        app.querySelector(needed).scrollIntoView({ block: 'center' });
        app.querySelector(needed).focus();
        return;
      }
      if (typeof window.__bfl_addToCart === 'function') {
        const addButton = app.querySelector('[data-product-add]');
        const mobileButton = app.querySelector('[data-product-mobile-add]');
        const defaultText = addButton?.textContent || 'Add to Cart';
        if (addButton) addButton.textContent = 'Added to Bag';
        if (mobileButton) mobileButton.textContent = 'Added';
        window.setTimeout(() => {
          if (addButton) addButton.textContent = defaultText;
          if (mobileButton) mobileButton.textContent = 'Add to Bag';
        }, 1200);
        window.__bfl_addToCart({
          name: `${item.name} - ${titleFromColor(state.color)}`,
          price: item.price,
          originalPrice: item.normalPrice || item.originalPrice || item.price,
          size: state.size,
          qty: state.qty,
          mark: 'BFL',
          image: imagePath(item, state.color, 'front'),
          secondaryImage: isSet ? `${item.secondaryImageBase}/front.webp` : null,
          productId: item.id,
          kind: item.kind || 'tee',
          saleEligible: item.saleEligible !== false,
        });
      }
    }

    app.querySelector('#product-picker').addEventListener('change', (event) => {
      window.location.href = `product.html?id=${event.target.value}`;
    });

    app.querySelectorAll('.product-swatch').forEach((button) => {
      button.addEventListener('click', () => {
        state.color = button.dataset.color;
        state.view = 0;
        updateImage();
      });
    });

    app.querySelector('.product-colours-toggle')?.addEventListener('click', event => {
      const button = event.currentTarget;
      const expanded = app.querySelector('.product-swatches').classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded ? 'Show fewer colours' : `Show all ${item.colors.length} colours`);
      button.title = expanded ? 'Show fewer colours' : 'Show all colours';
      button.querySelector('span').hidden = expanded;
      button.querySelector('img').hidden = !expanded;
    });

    app.querySelectorAll('.product-size').forEach((button) => {
      button.addEventListener('click', () => {
        if (isSet) {
          state[`${button.dataset.sizePart}Size`] = button.dataset.size;
          state.size = state.hoodieSize && state.bottomsSize ? `Hoodie ${state.hoodieSize} / Hooper Sweatpants ${state.bottomsSize}` : null;
        } else state.size = button.dataset.size;
        app.querySelector('[data-selection-message]').textContent = '';
        updateImage();
      });
    });

    app.querySelectorAll('.product-side-nav').forEach((button) => {
      button.addEventListener('click', () => {
        const direction = button.classList.contains('product-side-next') ? 1 : -1;
        state.view = (state.view + direction + galleryViews.length) % galleryViews.length;
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

    app.querySelector('.product-add').addEventListener('click', addSelectedToCart);
    app.querySelector('[data-product-mobile-add]').addEventListener('click', addSelectedToCart);

    updateImage();
    window.__bfl_updateDeliveryEstimateLabels?.();
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

  window.__bfl_catalog = PRODUCTS.map(item => ({ id: item.id, name: item.name, category: item.category, kind: item.kind || 'tee', sizes: item.sizes || SIZES, summary: item.summary || 'Oversized fit - 100% cotton', saleEligible: item.saleEligible !== false, colorCount: item.colors.length, colors: item.colors.slice(0, 4).map(color => ({ name: color, label: titleFromColor(color), swatch: SWATCHES[color] || '#ddd' })) }));
  window.__bfl_tee_measurements = TEE_MEASUREMENTS;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
  document.addEventListener('bfl:sale-change', render);
})();
