import { useEffect, useState, useRef } from "react";

interface Props {
  systemSetting: string;
}

const SystemSetting: React.ComponentType<Props> = ({ systemSetting }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [setting, setSetting] = useState(systemSetting);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset first
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
    setSetting(e.target.value);
  };

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isExpanded, setting]);

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-xl pb-8 pt-4 px-4 flex flex-col">
      <div className="flex justify-between items-center sticky top-0 bg-inherit z-10">
        <h2 className="text-lg font-semibold text-gray-800">
          {isExpanded ? "User Setting" : "System Setting"}
        </h2>
        <button
          onClick={handleToggle}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition shrink-0"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-4 border border-gray-300 rounded-md p-4">
          <label className="block text-sm font-medium text-gray-700">Profile Details</label>
          <textarea
            ref={textareaRef}
            value={setting}
            onChange={handleInputChange}
            className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none text-black overflow-hidden max-h-[300px]"
            placeholder="Enter your profile details here..."
          />
        </div>
      ) : (
        <p className="mt-2 text-gray-600 truncate border border-gray-300 rounded-md p-2">
          {systemSetting}
        </p>
      )}
    </div>
  );
};

export default SystemSetting;