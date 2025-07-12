import { LoaderIcon } from "lucide-react";

function ChatLoader() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <LoaderIcon className="animate-spin size-8 lg:size-10 text-primary" />
      <p className="mt-4 text-center text-base lg:text-lg font-mono">Connecting to chat...</p>
    </div>
  );
}

export default ChatLoader;
