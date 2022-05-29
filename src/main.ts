import './index.css'
import { render } from 'solid-js/web'

import App from './view'

import { Board } from './board'

export default function VChessboard(element: HTMLElement, options = {}) {

  let board = new Board()
  render(App(board), element)
}
