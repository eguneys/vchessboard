
const App = board => () => {


  return (<>
    <vchessboard>
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
