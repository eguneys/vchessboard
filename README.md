## Chess Board Visualizer

Place chess pieces and color squares on a colorless chess board.

Install and Link locally
```
git clone https://github.com/eguneys/vchessboard
cd vchessboard
yarn install
yarn build
yarn link
```

Add dependency
```
cd yourawesomeproject
yarn link vchessboard

cp node_modules/vchessboard/dist/bundle.css assets/
```

Alternatively check out the css files in the [src/index.css](src/index.css) and [src/theme.css](src/theme.css).

```html
  <!-- Include is2d klass to pickup piece styling -->
  <div class='is2d' id='app'></div>
```

```js

import VChessboard from 'vchessboard'
// Include the css file for styling
import './assets/bundle.css'

let api = VChessboard(document.getElementById('app'), {})
// put pieces on the board at specific coordinates
api.pieses = ['wr@b4', 'bk@a1']
// color squares on the board at specific coordinates
api.squares = ['dark white@b1', 'black@c3', 'orange@h8', 'black@c3', 'black@c3', 'black@c3', 'orange@c3', 'orange@h8']
// In fact `dark white@b1`, will make b1 square have the class `dark white`.
```
