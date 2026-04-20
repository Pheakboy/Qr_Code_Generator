import { useEffect, useState } from 'react';

export default function ThemeBtn() {
	const [theme, setTheme] = useState(true);

	useEffect(() => {
		theme ?
			document.body.classList.remove('dark') :
			document.body.classList.add('dark');
	}, [theme]);
		
	return (
		<div className="theme-wrap">
			<span className={theme ? 'sr-only' : 'theme-label'}>Light</span>

			<input
				id="toggle"
				type="checkbox"
				className="toggle-checkbox"
				checked={!theme}
				onChange={() => setTheme(!theme)}
			/>

			<label htmlFor="toggle" className="toggle-label">
				<span className="toggle-label-bg"></span>
			</label>

			<span className={!theme ? 'sr-only' : 'theme-label'}>Dark</span>
		</div>
	);
}