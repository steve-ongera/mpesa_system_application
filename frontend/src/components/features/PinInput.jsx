import React, { useRef, useState } from 'react';

const PinInput = ({ length = 4, value, onChange, onComplete }) => {
  const inputRefs = useRef([]);
  const [pins, setPins] = useState(Array(length).fill(''));

  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;

    const newPins = [...pins];
    newPins[index] = val.slice(-1);
    setPins(newPins);
    onChange(newPins.join(''));

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all filled
    if (newPins.every(p => p) && onComplete) {
      onComplete(newPins.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={pins[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
        />
      ))}
    </div>
  );
};

export default PinInput;