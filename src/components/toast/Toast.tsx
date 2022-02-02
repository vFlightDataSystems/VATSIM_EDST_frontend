import React, {useEffect} from "react";
import '../../css/toast.scss';

export interface ToastProps {
  id: string;
  destroy: () => void;
  title: string;
  content: string;
  duration?: number;
}

const Toast: React.FC<ToastProps> = (props) => {
  const {destroy, content, title, duration = 0, id} = props;

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      destroy();
    }, duration);

    return () => clearTimeout(timer);
  }, [destroy, duration]);

  return (
    <div>
      <div className={"toast-header"} id={id}>
        <div>{title}</div>
        <button onClick={destroy}>X</button>
      </div>
      <div className={"toast-body"}>{content}</div>
    </div>
  );
};

export default Toast;