'use client';
import { useProduct, useUpdateURL } from 'components/product/product-context';
import { useState } from 'react';

// Example ProductVariantsSelector component
const ProductVariantsSelector = ({ variants, options }) => {
    const { state, updateOption } = useProduct();
    const updateURL = useUpdateURL();
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleSelectOption = (variantUuid, optionUuid) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [variantUuid]: optionUuid,
    }));
    

    // 根据variantUuid获取variant的name

    const variant = variants.find((variant) => variant.uuid === variantUuid);
    // 根据optionUuid获取option的name
    const option = options.find((option) => option.uuid === optionUuid);


      // Update the option and URL
      const newState = updateOption(variant.name, option.name);
      updateURL(newState);

  };

  return (
    <div>
      {variants.map((variant) => (
        <div key={variant.uuid}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{variant.name}</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {options
              .filter((option) => option.product_variants_uuid === variant.uuid)
              .map((option) => (
                <button
                  key={option.uuid}
                  onClick={() => handleSelectOption(variant.uuid, option.uuid)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ccc',
                    borderRadius: '16px',
                    backgroundColor:
                      selectedOptions[variant.uuid] === option.uuid ? '#007bff' : '#f8f9fa',
                    color: selectedOptions[variant.uuid] === option.uuid ? '#fff' : '#000',
                    cursor: 'pointer',
                  }}
                >
                  {option.name}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariantsSelector;
