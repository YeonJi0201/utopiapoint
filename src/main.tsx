import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './great-hall.css';
import './gothic-pages.css';
import './intro.css';

// First-load intro: plays once per page load, then gets out of the way
// (tab changes and remounts never replay it).
const root = document.documentElement;
root.dataset.intro = 'on';
const endIntro = () => {
  delete root.dataset.intro;
};
window.setTimeout(endIntro, 15000); // safety net
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    const intro = document
      .getAnimations()
      .filter((a) => a instanceof CSSAnimation && a.animationName.startsWith('in-'));
    Promise.all(intro.map((a) => a.finished)).then(endIntro, endIntro);
  }),
);

createRoot(document.getElementById('root')!).render(<App />);
