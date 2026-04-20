export default function InputFileImg({ noImg, setNoImg, setCustomImg }) {
	const handleImage = e => {
		const file = e.target.files?.[0];
		if(!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			if(reader.readyState === 2) {
				setCustomImg(reader.result);
			}
		}
		reader.readAsDataURL(file);
	}

	return (
		<div className="control-group">
			<label htmlFor="file">Upload custom image</label>		
			<input
				id="file"
				name="file"
				type="file"
				accept="image/png, image/jpeg"
				onChange={handleImage}
				disabled={noImg}
			/>

			<div className="toggle-row">
				<input
					id="noImg"
					name="noImg"
					type="checkbox"
					checked={noImg}
					onChange={() => setNoImg(!noImg)}
				/>
				<label htmlFor="noImg">Generate without center image</label>
			</div>
		</div>
	);
}