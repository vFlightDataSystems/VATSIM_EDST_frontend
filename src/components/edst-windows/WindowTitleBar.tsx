import '../../css/windows/titlebar-styles.scss';

export function WindowTitleBar(props) {
  const {focused, text} = props;
  return (<div className="edst-window-title-bar no-select">
    <div className="edst-window-title-bar-left">
      <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}>
        <div className="edst-window-header-block edst-window-header-block-8-3"/>
      </button>
    </div>
    <div className={`edst-window-title-bar-middle ${focused ? 'focused' : ''}`}>
      <div className={`edst-window-header-block edst-window-header-block-flex ${focused ? 'focused' : ''}`}>
        {text.map(s => <div className="edst-window-header-text" key={s}>{s}</div>)}
      </div>
    </div>
    <div className={`edst-window-title-bar-right ${focused ? 'focused' : ''}`}>
      <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}
              onClick={props.closeWindow}
      >
        <div className="edst-window-header-block edst-window-header-block-3-3"/>
      </button>
      <button className={`edst-window-header-block ${focused ? 'focused' : ''}`}>
        <div className="edst-window-header-block-inverted edst-window-header-block-8-8"/>
      </button>
    </div>
  </div>);
}