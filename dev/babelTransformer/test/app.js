const transform = require("../src/jsxTransform.js");

const jsxBody = `
  function Greeting() {
    console.log('Rendering component!');
    const [name, setName] = React.useState(() => {
      console.log("Initializing state!");
      return window.localStorage.getItem('name') || ''
    })
    const handleChange = event => setName(event.target.value)

    const [clickCount,setClickCount] = React.useState(0);
    const buttonClicked = () => {
      console.log("Click count updated!");
      setClickCount(clickCount+1);
    }

    React.useEffect( () => {
      console.log("Saving to local storage!");
      window.localStorage.setItem('name',name);
    },[name]);
    return (
      <>
        <div>
          <form>
            <label htmlFor="nameField">Name: </label>
            <input value={name} onChange={handleChange} id="nameField" />
          </form>
          {name ? <strong>Hello {name}</strong> : 'Please type your name'}
        </div>
        <div>
          <button onClick={buttonClicked}>{clickCount}</button>
        </div>
      </>
    )
  }

  ReactDOM.render(<Greeting />, document.getElementById('root'))
`

const newJsxTransformation = transform(jsxBody);

const newJsxBody = newJsxTransformation.code;

console.log("converted JSX: " + newJsxBody);