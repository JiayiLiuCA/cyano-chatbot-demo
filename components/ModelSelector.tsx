'use client';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const models = [
    { value: 'gpt-5', label: 'GPT-5', description: 'Latest flagship model' },
    { value: 'o3', label: 'O3', description: 'Advanced reasoning' },
  ];

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <label htmlFor="model-select" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
        Model:
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {models.map((model) => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
    </div>
  );
}
