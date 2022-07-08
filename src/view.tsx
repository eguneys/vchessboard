
const App = board => () => {


  return (<>
    <vchessboard>
      <files>
        <Index each={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']}>{ (file, i) =>
          <file>{file()}</file>
        }</Index>
      </files>
      <ranks>
        <Index each={board.ranks}>{ (rank, i) =>
          <rank>{rank()}</rank>
        }</Index>
      </ranks>
      <squares>
       <For each={board.squares}>{ (square, i) =>
         <square class={square.klass} style={square.style}/>
       }</For>
      </squares>
      <pieses>
        <For each={board.pieses}>{ (piese, i) =>
          <piese class={piese.klass} style={piese.style}/>
        }</For>
      </pieses>
     </vchessboard>
     </>)
}

export default App
