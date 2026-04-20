import { useState } from 'react';
import { SketchPicker } from 'react-color';

export default function InputPicker({ id, label, customColor, handleQrCustom }) {
	const [showPicker, setShowPicker] = useState(false),
			handleShowPicker = ()=> setShowPicker(!showPicker);

	return(
		<div className="control-group">
			<label htmlFor={id}>Customize {label}</label>
			<button
				id={id}
				name={id}
				aria-label={id}
				type="button"
				className="color-swatch-btn"
				style={{ background: customColor }}
				onClick={handleShowPicker}
			>
				{customColor}
			</button>

			{showPicker &&
				<SketchPicker
					presetColors={['#000000', '#FFFFFF']}
					color={customColor}
					onChange={handleQrCustom}
				/>
			}
		</div>
	);
}