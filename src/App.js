import { useRef, useState } from 'react';
import ThemeBtn from './components/ThemeBtn';
import FormQrCustom from './components/FormQrCustom';
import QrCard from './components/QrCard';

export default function App() {
	const qrRef = useRef();

	const [url, setUrl] = useState(''),
			[qrColor, setQrColor] = useState('#ffffff'),
			[qrBgColor, setQrBgColor] = useState('#2c7dfa'),
			[customImg, setCustomImg] = useState(''),
			[noImg, setNoImg] = useState(false);
			
	const handleQrReset = () => {
		setUrl('');
		setQrColor('#ffffff');
		setQrBgColor('#2c7dfa');
		setCustomImg('');
		setNoImg(false);
	}

	return (
		<div className="app-shell">
			<header className="app-header">
				<div>
					<p className="eyebrow">Modern QR Studio</p>
					<h1>Create polished QR codes in seconds</h1>
				</div>
				<ThemeBtn />
			</header>

			<main className="app-main">
				<FormQrCustom
					qrRef={qrRef}
					url={url}
					qrColor={qrColor}
					qrBgColor={qrBgColor}
					noImg={noImg}
					setUrl={setUrl}
					setQrColor={setQrColor}
					setQrBgColor={setQrBgColor}
					setCustomImg={setCustomImg}
					setNoImg={setNoImg}
					handleQrReset={handleQrReset}
				/>

				<QrCard
					qrRef={qrRef}
					url={url}
					qrColor={qrColor}
					bgColor={qrBgColor}
					customImg={customImg}
					noImg={noImg}
				/>
			</main>
		</div>
	);
}